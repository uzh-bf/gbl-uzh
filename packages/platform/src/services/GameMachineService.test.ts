import * as DB from '@prisma/client'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  getGameLifecycleState,
  getGameMachineSnapshot,
  hydrateGameActor,
  type GameRowForMachine,
} from './GameMachineService.js'

/** A loosely-typed game row (mirrors the relevant Prisma include shape). */
function gameRow(
  status: DB.GameStatus,
  opts: {
    activePeriodIx?: number
    periodCount?: number
    segmentCount?: number
    hasActiveSegment?: boolean
    hasNextSegment?: boolean
  } = {}
): GameRowForMachine {
  const {
    activePeriodIx = 0,
    periodCount = 2,
    segmentCount = 2,
    hasActiveSegment = true,
    hasNextSegment = true,
  } = opts
  return {
    status,
    activePeriodIx,
    periods: Array.from({ length: periodCount }, (_, i) => ({ id: i })),
    activePeriod: {
      segmentCount,
      segments: Array.from({ length: segmentCount }, (_, i) => ({ id: i })),
      activeSegment: hasActiveSegment
        ? { nextSegment: hasNextSegment ? { id: 99 } : null }
        : null,
    },
  }
}

test('snapshot value equals game.status', () => {
  for (const status of Object.values(DB.GameStatus)) {
    const snapshot = getGameMachineSnapshot(gameRow(status))
    assert.equal(snapshot.value, status)
  }
})

test('hydrated actor reflects the DB state and valid transitions', () => {
  const actor = hydrateGameActor(
    gameRow(DB.GameStatus.RUNNING, { hasNextSegment: true })
  )
  const snapshot = actor.getSnapshot()
  assert.equal(snapshot.value, DB.GameStatus.RUNNING)
  assert.equal(snapshot.can({ type: 'ACTIVATE_NEXT_SEGMENT' }), true)
  assert.equal(snapshot.can({ type: 'ACTIVATE_NEXT_PERIOD' }), true)
  actor.stop()
})

test('getGameLifecycleState reports available events', () => {
  assert.deepEqual(
    getGameLifecycleState(gameRow(DB.GameStatus.SCHEDULED)),
    {
      status: DB.GameStatus.SCHEDULED,
      availableEvents: ['ACTIVATE_NEXT_PERIOD'],
      canActivateNextPeriod: true,
      canActivateNextSegment: false,
    }
  )

  // RUNNING on the last period, with another segment available
  assert.deepEqual(
    getGameLifecycleState(
      gameRow(DB.GameStatus.RUNNING, {
        activePeriodIx: 1,
        periodCount: 2,
        hasNextSegment: true,
        hasActiveSegment: true,
      })
    ),
    {
      status: DB.GameStatus.RUNNING,
      availableEvents: ['ACTIVATE_NEXT_PERIOD', 'ACTIVATE_NEXT_SEGMENT'],
      canActivateNextPeriod: true,
      canActivateNextSegment: true,
    }
  )

  // PREPARATION with no prepared segments: nothing can be activated
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

  // RESULTS on the last period: cannot advance (would be COMPLETED once wired)
  assert.deepEqual(
    getGameLifecycleState(
      gameRow(DB.GameStatus.RESULTS, { activePeriodIx: 1, periodCount: 2 })
    ),
    {
      status: DB.GameStatus.RESULTS,
      availableEvents: [],
      canActivateNextPeriod: false,
      canActivateNextSegment: false,
    }
  )
})
