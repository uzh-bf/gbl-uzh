import * as DB from '@prisma/client'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  availableEvents,
  buildGameMachineContext,
  canTransition,
  getGameLifecycleState,
  getGameMachineSnapshot,
  nextStatus,
  type GameRowForMachine,
} from './GameMachineService.js'

function gameRow(
  status: DB.GameStatus,
  opts: {
    activePeriodIx?: number
    periodCount?: number
    segmentCount?: number
    hasActiveSegment?: boolean
    hasNextSegment?: boolean
    includeSegments?: boolean
  } = {}
): GameRowForMachine {
  const {
    activePeriodIx = 0,
    periodCount = 2,
    segmentCount = 2,
    hasActiveSegment = true,
    hasNextSegment = true,
    includeSegments = true,
  } = opts
  return {
    status,
    activePeriodIx,
    periods: Array.from({ length: periodCount }, (_, i) => ({ id: i })),
    activePeriod: {
      segmentCount,
      ...(includeSegments
        ? { segments: Array.from({ length: segmentCount }, (_, i) => ({ id: i })) }
        : {}),
      activeSegment: hasActiveSegment
        ? { nextSegment: hasNextSegment ? { id: 99 } : null }
        : null,
    },
  }
}

test('buildGameMachineContext derives guard context from a game row', () => {
  assert.deepEqual(
    buildGameMachineContext(
      gameRow(DB.GameStatus.RUNNING, {
        activePeriodIx: 1,
        periodCount: 3,
        segmentCount: 4,
        hasActiveSegment: true,
        hasNextSegment: false,
      })
    ),
    {
      activePeriodIx: 1,
      totalPeriods: 3,
      segmentCount: 4,
      hasActiveSegment: true,
      hasNextSegment: false,
    }
  )
})

test('buildGameMachineContext falls back to activePeriod.segmentCount', () => {
  assert.equal(
    buildGameMachineContext(
      gameRow(DB.GameStatus.PREPARATION, {
        segmentCount: 3,
        includeSegments: false,
      })
    ).segmentCount,
    3
  )
})

test('snapshot value is rebuilt from game.status', () => {
  for (const status of Object.values(DB.GameStatus)) {
    assert.equal(getGameMachineSnapshot(gameRow(status)).value, status)
  }
})

test('nextStatus returns the XState target or null', () => {
  assert.equal(
    nextStatus(gameRow(DB.GameStatus.SCHEDULED), 'ACTIVATE_NEXT_PERIOD'),
    DB.GameStatus.PREPARATION
  )
  assert.equal(
    nextStatus(
      gameRow(DB.GameStatus.PREPARATION, { segmentCount: 0 }),
      'ACTIVATE_NEXT_SEGMENT'
    ),
    null
  )
  assert.equal(
    nextStatus(
      gameRow(DB.GameStatus.RESULTS, { activePeriodIx: 1, periodCount: 2 }),
      'ACTIVATE_NEXT_PERIOD'
    ),
    DB.GameStatus.PREPARATION
  )
  assert.equal(
    nextStatus(
      gameRow(DB.GameStatus.RESULTS, { activePeriodIx: 2, periodCount: 2 }),
      'FINISH_GAME'
    ),
    DB.GameStatus.COMPLETED
  )
})

test('availableEvents and canTransition read the machine guards', () => {
  const running = gameRow(DB.GameStatus.RUNNING, {
    hasActiveSegment: true,
    hasNextSegment: true,
  })
  assert.equal(canTransition(running, 'ACTIVATE_NEXT_PERIOD'), true)
  assert.equal(canTransition(running, 'ACTIVATE_NEXT_SEGMENT'), true)
  assert.deepEqual(availableEvents(running), [
    'ACTIVATE_NEXT_PERIOD',
    'ACTIVATE_NEXT_SEGMENT',
  ])
})

test('getGameLifecycleState reports admin controls from XState', () => {
  assert.deepEqual(getGameLifecycleState(gameRow(DB.GameStatus.SCHEDULED)), {
    status: DB.GameStatus.SCHEDULED,
    availableEvents: ['ACTIVATE_NEXT_PERIOD'],
    canActivateNextPeriod: true,
    canActivateNextSegment: false,
  })

  assert.deepEqual(
    getGameLifecycleState(
      gameRow(DB.GameStatus.PREPARATION, { segmentCount: 0 })
    ),
    {
      status: DB.GameStatus.PREPARATION,
      availableEvents: [],
      canActivateNextPeriod: false,
      canActivateNextSegment: false,
    }
  )

  assert.deepEqual(
    getGameLifecycleState(
      gameRow(DB.GameStatus.RUNNING, {
        hasActiveSegment: true,
        hasNextSegment: true,
      })
    ),
    {
      status: DB.GameStatus.RUNNING,
      availableEvents: ['ACTIVATE_NEXT_PERIOD', 'ACTIVATE_NEXT_SEGMENT'],
      canActivateNextPeriod: true,
      canActivateNextSegment: true,
    }
  )

  assert.deepEqual(
    getGameLifecycleState(
      gameRow(DB.GameStatus.RESULTS, { activePeriodIx: 2, periodCount: 2 })
    ),
    {
      status: DB.GameStatus.RESULTS,
      availableEvents: ['FINISH_GAME'],
      canActivateNextPeriod: false,
      canActivateNextSegment: false,
    }
  )
})
