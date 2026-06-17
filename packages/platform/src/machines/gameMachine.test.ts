import * as DB from '@prisma/client'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getNextSnapshot } from 'xstate'
import {
  GAME_EVENTS,
  gameMachine,
  type GameEvent,
  type GameMachineContext,
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
  return gameMachine.resolveState({ value, context })
}

function next(
  status: DB.GameStatus,
  event: GameEvent,
  context: GameMachineContext
) {
  return getNextSnapshot(
    gameMachine,
    snapshotAt(status, context),
    { type: event }
  )
}

test('machine state nodes are exactly the GameStatus enum values', () => {
  const machineStates = Object.keys(gameMachine.config.states ?? {}).sort()
  assert.deepEqual(machineStates, [...ALL_STATUSES].sort())
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
    getNextSnapshot(
      gameMachine,
      snapshot,
      { type: 'ACTIVATE_NEXT_PERIOD' }
    ).value,
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
    getNextSnapshot(
      gameMachine,
      intermediate,
      { type: 'ACTIVATE_NEXT_PERIOD' }
    ).value,
    DB.GameStatus.PREPARATION
  )

  const final = snapshotAt(
    DB.GameStatus.RESULTS,
    ctx({ activePeriodIx: 2, totalPeriods: 2 })
  )
  assert.equal(final.can({ type: 'ACTIVATE_NEXT_PERIOD' }), false)
  assert.equal(final.can({ type: 'FINISH_GAME' }), true)
  assert.equal(
    getNextSnapshot(gameMachine, final, { type: 'FINISH_GAME' }).value,
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
