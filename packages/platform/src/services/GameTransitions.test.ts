import * as DB from '@prisma/client'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  GAME_TRANSITIONS,
  canTransition,
  getGameLifecycleState,
  nextStatus,
  type GameRowForLifecycle,
  type GameTransitionContext,
} from './GameTransitions.js'

const ALL_STATUSES = Object.values(DB.GameStatus)

function ctx(
  overrides: Partial<GameTransitionContext> = {}
): GameTransitionContext {
  return {
    activePeriodIx: 0,
    totalPeriods: 2,
    segmentCount: 2,
    hasActiveSegment: true,
    hasNextSegment: true,
    ...overrides,
  }
}

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
): GameRowForLifecycle {
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

test('nextStatus walks the full happy-path lifecycle', () => {
  const c = ctx()
  assert.equal(
    nextStatus(DB.GameStatus.SCHEDULED, 'ACTIVATE_NEXT_PERIOD', c),
    DB.GameStatus.PREPARATION
  )
  assert.equal(
    nextStatus(DB.GameStatus.PREPARATION, 'ACTIVATE_NEXT_SEGMENT', c),
    DB.GameStatus.RUNNING
  )
  assert.equal(
    nextStatus(DB.GameStatus.RUNNING, 'ACTIVATE_NEXT_SEGMENT', c),
    DB.GameStatus.PAUSED
  )
  assert.equal(
    nextStatus(DB.GameStatus.PAUSED, 'ACTIVATE_NEXT_SEGMENT', c),
    DB.GameStatus.RUNNING
  )
  assert.equal(
    nextStatus(DB.GameStatus.RUNNING, 'ACTIVATE_NEXT_PERIOD', c),
    DB.GameStatus.CONSOLIDATION
  )
  assert.equal(
    nextStatus(DB.GameStatus.CONSOLIDATION, 'ACTIVATE_NEXT_PERIOD', c),
    DB.GameStatus.RESULTS
  )
})

test('PREPARATION requires at least one prepared segment to start', () => {
  assert.equal(
    canTransition(
      DB.GameStatus.PREPARATION,
      'ACTIVATE_NEXT_SEGMENT',
      ctx({ segmentCount: 0 })
    ),
    false
  )
  assert.equal(
    canTransition(
      DB.GameStatus.PREPARATION,
      'ACTIVATE_NEXT_SEGMENT',
      ctx({ segmentCount: 1 })
    ),
    true
  )
})

test('RUNNING -> PAUSED requires a next segment', () => {
  assert.equal(
    canTransition(
      DB.GameStatus.RUNNING,
      'ACTIVATE_NEXT_SEGMENT',
      ctx({ hasNextSegment: false })
    ),
    false
  )
})

test('a running first segment (segmentIx 0) can still be consolidated', () => {
  // Regression guard: the old switch used `!currentSegmentIx`, falsy at index 0,
  // wrongly blocking consolidation. The table guards only on an active segment.
  assert.equal(
    canTransition(
      DB.GameStatus.RUNNING,
      'ACTIVATE_NEXT_PERIOD',
      ctx({
        activePeriodIx: 0,
        totalPeriods: 1,
        segmentCount: 1,
        hasActiveSegment: true,
        hasNextSegment: false,
      })
    ),
    true
  )
})

test('FINISH_GAME completes the game only after the final period', () => {
  // intermediate RESULTS: next period still queued -> ACTIVATE_NEXT_PERIOD, no FINISH
  const intermediate = ctx({ activePeriodIx: 1, totalPeriods: 2 })
  assert.equal(
    canTransition(DB.GameStatus.RESULTS, 'FINISH_GAME', intermediate),
    false
  )
  assert.equal(
    canTransition(DB.GameStatus.RESULTS, 'ACTIVATE_NEXT_PERIOD', intermediate),
    true
  )

  // final RESULTS: activePeriodIx advanced to totalPeriods -> only FINISH_GAME
  const final = ctx({ activePeriodIx: 2, totalPeriods: 2 })
  assert.equal(
    canTransition(DB.GameStatus.RESULTS, 'ACTIVATE_NEXT_PERIOD', final),
    false
  )
  assert.equal(
    nextStatus(DB.GameStatus.RESULTS, 'FINISH_GAME', final),
    DB.GameStatus.COMPLETED
  )
})

test('COMPLETED is terminal', () => {
  assert.equal(
    nextStatus(DB.GameStatus.COMPLETED, 'ACTIVATE_NEXT_PERIOD', ctx()),
    null
  )
  assert.equal(nextStatus(DB.GameStatus.COMPLETED, 'FINISH_GAME', ctx()), null)
})

test('every transition target is a known GameStatus', () => {
  for (const byEvent of Object.values(GAME_TRANSITIONS)) {
    for (const transition of Object.values(byEvent) as Array<
      { to: DB.GameStatus } | undefined
    >) {
      if (!transition) continue
      assert.ok(
        ALL_STATUSES.includes(transition.to),
        `target ${transition.to} is a valid GameStatus`
      )
    }
  }
})

test('getGameLifecycleState reports the available events for a DB row', () => {
  assert.deepEqual(getGameLifecycleState(gameRow(DB.GameStatus.SCHEDULED)), {
    status: DB.GameStatus.SCHEDULED,
    availableEvents: ['ACTIVATE_NEXT_PERIOD'],
    canActivateNextPeriod: true,
    canActivateNextSegment: false,
  })

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
    getGameLifecycleState(gameRow(DB.GameStatus.PREPARATION, { segmentCount: 0 })),
    {
      status: DB.GameStatus.PREPARATION,
      availableEvents: [],
      canActivateNextPeriod: false,
      canActivateNextSegment: false,
    }
  )

  // RESULTS entering the final period (advanced early to 1 of 2): can prepare it
  assert.deepEqual(
    getGameLifecycleState(
      gameRow(DB.GameStatus.RESULTS, { activePeriodIx: 1, periodCount: 2 })
    ),
    {
      status: DB.GameStatus.RESULTS,
      availableEvents: ['ACTIVATE_NEXT_PERIOD'],
      canActivateNextPeriod: true,
      canActivateNextSegment: false,
    }
  )

  // RESULTS past the final period: the only move is FINISH_GAME -> COMPLETED
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
