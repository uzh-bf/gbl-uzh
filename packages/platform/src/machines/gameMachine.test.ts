import * as DB from '@prisma/client'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { transition } from 'xstate'
import {
  GAME_EVENTS,
  GAME_STATUS_VALUES,
  gameMachine,
  toLifecycleWorkOrders,
  type GameEvent,
  type GameMachineContext,
  type GameStatusValue,
} from './gameMachine.js'

const ALL_STATUSES = Object.values(DB.GameStatus)

function ctx(
  overrides: Partial<GameMachineContext> = {}
): GameMachineContext {
  return {
    activePeriodIx: 0,
    totalPeriods: 2,
    segmentCount: 2,
    hasActiveSegment: true,
    hasNextSegment: true,
    ...overrides,
  }
}

function snapshotAt(value: DB.GameStatus, context: GameMachineContext) {
  return gameMachine.resolveState({ value: value as GameStatusValue, context })
}

function next(
  status: DB.GameStatus,
  event: GameEvent,
  context: GameMachineContext
) {
  return transition(
    gameMachine,
    snapshotAt(status, context),
    { type: event }
  )[0]
}

function workOrderTypes(
  status: DB.GameStatus,
  event: GameEvent,
  context: GameMachineContext
) {
  return toLifecycleWorkOrders(
    transition(gameMachine, snapshotAt(status, context), { type: event })[1]
  ).map((order) => order.type)
}

test('machine state nodes are exactly the GameStatus enum values', () => {
  const machineStates = Object.keys(gameMachine.config.states ?? {}).sort()
  assert.deepEqual([...GAME_STATUS_VALUES].sort(), [...ALL_STATUSES].sort())
  assert.deepEqual(machineStates, [...ALL_STATUSES].sort())
})

test('machine module does not import the Prisma client', () => {
  const source = readFileSync(new URL('./gameMachine.ts', import.meta.url), 'utf8')
  assert.equal(/from ['"]@prisma\/client['"]/.test(source), false)
})

test('happy path walks the lifecycle through RESULTS', () => {
  const context = ctx()
  assert.equal(
    next(DB.GameStatus.SCHEDULED, 'ACTIVATE_NEXT_PERIOD', context).value,
    DB.GameStatus.PREPARATION
  )
  assert.equal(
    next(DB.GameStatus.PREPARATION, 'ACTIVATE_NEXT_SEGMENT', context).value,
    DB.GameStatus.RUNNING
  )
  assert.equal(
    next(DB.GameStatus.RUNNING, 'ACTIVATE_NEXT_SEGMENT', context).value,
    DB.GameStatus.PAUSED
  )
  assert.equal(
    next(DB.GameStatus.PAUSED, 'ACTIVATE_NEXT_SEGMENT', context).value,
    DB.GameStatus.RUNNING
  )
  assert.equal(
    next(DB.GameStatus.RUNNING, 'ACTIVATE_NEXT_PERIOD', context).value,
    DB.GameStatus.CONSOLIDATION
  )
  assert.equal(
    next(DB.GameStatus.CONSOLIDATION, 'ACTIVATE_NEXT_PERIOD', context).value,
    DB.GameStatus.RESULTS
  )
})

test('guards block invalid segment and period activation', () => {
  assert.equal(
    snapshotAt(
      DB.GameStatus.PREPARATION,
      ctx({ segmentCount: 0 })
    ).can({ type: 'ACTIVATE_NEXT_SEGMENT' }),
    false
  )
  assert.equal(
    snapshotAt(
      DB.GameStatus.RUNNING,
      ctx({ hasNextSegment: false })
    ).can({ type: 'ACTIVATE_NEXT_SEGMENT' }),
    false
  )
  assert.equal(
    snapshotAt(
      DB.GameStatus.RUNNING,
      ctx({ hasActiveSegment: false })
    ).can({ type: 'ACTIVATE_NEXT_PERIOD' }),
    false
  )
  assert.equal(
    snapshotAt(
      DB.GameStatus.CONSOLIDATION,
      ctx({ hasActiveSegment: false })
    ).can({ type: 'ACTIVATE_NEXT_PERIOD' }),
    false
  )
})

test('state tags and metadata expose lifecycle insight', () => {
  const running = snapshotAt(DB.GameStatus.RUNNING, ctx())
  assert.equal(running.hasTag('players-can-act'), true)
  assert.equal(running.hasTag('segment-workflow'), true)
  assert.equal(running.hasTag('terminal'), false)
  assert.deepEqual(Object.values(running.getMeta())[0], {
    phase: 'segment-running',
    label: 'Segment running',
  })

  const completed = snapshotAt(DB.GameStatus.COMPLETED, ctx())
  assert.equal(completed.hasTag('terminal'), true)
  assert.deepEqual(Object.values(completed.getMeta())[0], {
    phase: 'completed',
    label: 'Completed',
  })
})

test('transitions return plain lifecycle work orders', () => {
  const cases: Array<{
    status: DB.GameStatus
    event: GameEvent
    context: GameMachineContext
    expected: string[]
  }> = [
    {
      status: DB.GameStatus.SCHEDULED,
      event: 'ACTIVATE_NEXT_PERIOD',
      context: ctx(),
      expected: [
        'startNextPeriod',
        'createPeriodStartResults',
        'createPlayerActions',
        'publishAfterActivateNextPeriod',
      ],
    },
    {
      status: DB.GameStatus.PREPARATION,
      event: 'ACTIVATE_NEXT_SEGMENT',
      context: ctx(),
      expected: [
        'startNextSegment',
        'createSegmentStartResults',
        'createPlayerActions',
        'resetPlayerReadiness',
        'publishAfterActivateNextSegment',
      ],
    },
    {
      status: DB.GameStatus.PAUSED,
      event: 'ACTIVATE_NEXT_SEGMENT',
      context: ctx(),
      expected: [
        'startNextSegment',
        'createSegmentStartResults',
        'createPlayerActions',
        'resetPlayerReadiness',
        'publishAfterActivateNextSegment',
      ],
    },
    {
      status: DB.GameStatus.RUNNING,
      event: 'ACTIVATE_NEXT_SEGMENT',
      context: ctx(),
      expected: [
        'finishCurrentSegment',
        'createSegmentEndResults',
        'createPlayerActions',
        'resetPlayerReadiness',
        'publishAfterActivateNextSegment',
      ],
    },
    {
      status: DB.GameStatus.RUNNING,
      event: 'ACTIVATE_NEXT_PERIOD',
      context: ctx(),
      expected: [
        'runSegmentBeforeActivationHook',
        'finishCurrentSegment',
        'consolidateCurrentPeriod',
        'createSegmentEndResults',
        'createPlayerActions',
        'resetPlayerReadiness',
        'publishAfterActivateNextPeriod',
      ],
    },
    {
      status: DB.GameStatus.CONSOLIDATION,
      event: 'ACTIVATE_NEXT_PERIOD',
      context: ctx(),
      expected: [
        'createPeriodEndResults',
        'createPlayerActions',
        'createPostCommitPlayerEvents',
        'resetPlayerReadiness',
        'publishAfterActivateNextPeriod',
      ],
    },
    {
      status: DB.GameStatus.RESULTS,
      event: 'ACTIVATE_NEXT_PERIOD',
      context: ctx({ activePeriodIx: 1, totalPeriods: 2 }),
      expected: [
        'createPeriodStartResults',
        'createPlayerActions',
        'resetPlayerReadiness',
        'publishAfterActivateNextPeriod',
      ],
    },
    {
      status: DB.GameStatus.RESULTS,
      event: 'FINISH_GAME',
      context: ctx({ activePeriodIx: 2, totalPeriods: 2 }),
      expected: ['finishGame', 'publishAfterFinishGame'],
    },
  ]

  for (const item of cases) {
    assert.deepEqual(
      workOrderTypes(item.status, item.event, item.context),
      item.expected,
      `${item.status} ${item.event}`
    )
  }
})

test('blocked transitions return no lifecycle work orders', () => {
  assert.deepEqual(
    workOrderTypes(
      DB.GameStatus.PREPARATION,
      'ACTIVATE_NEXT_SEGMENT',
      ctx({ segmentCount: 0 })
    ),
    []
  )
  assert.deepEqual(
    workOrderTypes(
      DB.GameStatus.RUNNING,
      'ACTIVATE_NEXT_SEGMENT',
      ctx({ hasNextSegment: false })
    ),
    []
  )
  assert.deepEqual(
    workOrderTypes(
      DB.GameStatus.RUNNING,
      'ACTIVATE_NEXT_PERIOD',
      ctx({ hasActiveSegment: false })
    ),
    []
  )
})

test('active period 0 can still be consolidated', () => {
  const context = ctx({
    activePeriodIx: 0,
    totalPeriods: 1,
    segmentCount: 1,
    hasActiveSegment: true,
    hasNextSegment: false,
  })
  const snapshot = snapshotAt(DB.GameStatus.RUNNING, context)
  assert.equal(snapshot.can({ type: 'ACTIVATE_NEXT_PERIOD' }), true)
  assert.equal(
    transition(
      gameMachine,
      snapshot,
      { type: 'ACTIVATE_NEXT_PERIOD' }
    )[0].value,
    DB.GameStatus.CONSOLIDATION
  )
})

test('FINISH_GAME completes only after the final period', () => {
  const intermediate = snapshotAt(
    DB.GameStatus.RESULTS,
    ctx({ activePeriodIx: 1, totalPeriods: 2 })
  )
  assert.equal(intermediate.can({ type: 'FINISH_GAME' }), false)
  assert.equal(intermediate.can({ type: 'ACTIVATE_NEXT_PERIOD' }), true)
  assert.equal(
    transition(
      gameMachine,
      intermediate,
      { type: 'ACTIVATE_NEXT_PERIOD' }
    )[0].value,
    DB.GameStatus.PREPARATION
  )

  const final = snapshotAt(
    DB.GameStatus.RESULTS,
    ctx({ activePeriodIx: 2, totalPeriods: 2 })
  )
  assert.equal(final.can({ type: 'ACTIVATE_NEXT_PERIOD' }), false)
  assert.equal(final.can({ type: 'FINISH_GAME' }), true)
  assert.equal(
    transition(gameMachine, final, { type: 'FINISH_GAME' })[0].value,
    DB.GameStatus.COMPLETED
  )
})

test('COMPLETED is terminal', () => {
  const snapshot = snapshotAt(DB.GameStatus.COMPLETED, ctx())
  assert.equal(snapshot.status, 'done')
  for (const event of GAME_EVENTS) {
    assert.equal(snapshot.can({ type: event }), false)
  }
})
