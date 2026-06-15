import * as DB from '@prisma/client'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { filterVisiblePeriods } from './PlayService.js'

/**
 * The player-visibility rule as a PURE function: plain arrays in, plain data
 * out, no Prisma and no mutation. Pins what a player may see at their current
 * period/segment and the result-type / `-1` sentinel decision that was
 * previously fused into getPlayerResult via in-place mutation.
 */

const periods = [{ index: 0 }, { index: 1 }, { index: 2 }]
const segments = [{ index: 0 }, { index: 1 }, { index: 2 }]

test('filterVisiblePeriods: hides future periods (index > activePeriodIx)', () => {
  const { filteredPeriods } = filterVisiblePeriods(
    periods,
    { segments },
    1,
    0
  )
  assert.deepEqual(
    filteredPeriods.map((p) => p.index),
    [0, 1]
  )
})

test('filterVisiblePeriods: hides future segments of the active period (index > activeSegmentIx)', () => {
  const { filteredActiveSegments } = filterVisiblePeriods(
    periods,
    { segments },
    0,
    1
  )
  assert.deepEqual(
    filteredActiveSegments.map((s) => s.index),
    [0, 1]
  )
})

test('filterVisiblePeriods: before the first segment of the first period -> PERIOD_START', () => {
  const { resultType } = filterVisiblePeriods(periods, { segments }, 0, -1)
  assert.equal(resultType, DB.PlayerResultType.PERIOD_START)
})

test('filterVisiblePeriods: -1 sentinel only applies at the first period', () => {
  // activeSegmentIx -1 but a later period -> still SEGMENT_END (not PERIOD_START)
  const { resultType } = filterVisiblePeriods(periods, { segments }, 1, -1)
  assert.equal(resultType, DB.PlayerResultType.SEGMENT_END)
})

test('filterVisiblePeriods: any running segment -> SEGMENT_END', () => {
  assert.equal(
    filterVisiblePeriods(periods, { segments }, 0, 0).resultType,
    DB.PlayerResultType.SEGMENT_END
  )
  assert.equal(
    filterVisiblePeriods(periods, { segments }, 2, 2).resultType,
    DB.PlayerResultType.SEGMENT_END
  )
})

test('filterVisiblePeriods: does not mutate its inputs', () => {
  const inPeriods = [{ index: 0 }, { index: 1 }]
  const inSegments = [{ index: 0 }, { index: 1 }]
  filterVisiblePeriods(inPeriods, { segments: inSegments }, 0, 0)
  assert.equal(inPeriods.length, 2)
  assert.equal(inSegments.length, 2)
})
