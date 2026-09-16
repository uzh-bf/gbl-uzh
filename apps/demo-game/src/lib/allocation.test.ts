import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  allocationBoundaries,
  allocationSchema,
  formatCHF,
  fromBoundaries,
  isAllocationValid,
  moveBoundary,
  parseAllocation,
} from './allocation'

test('decimal allocations validate and round-trip without truncation', () => {
  const value = parseAllocation({ bank: '33.3', bonds: '33.3', stocks: '33.4' })
  assert.deepEqual(
    allocationSchema.validateSync(value, { strict: true }),
    value
  )
  assert.deepEqual(fromBoundaries(allocationBoundaries(value)), value)
  assert.equal(formatCHF(10070.37 * 0.55), "5'538.70 CHF")
  for (let left = 0; left <= 1000; left += 7) {
    for (let right = left; right <= 1000; right += 11) {
      assert.ok(isAllocationValid(fromBoundaries([left, right])))
    }
  }
})

test('server validation rejects invalid payloads rather than coercing them', () => {
  for (const value of [
    { bank: 33.3, bonds: 33.3, stocks: 33.3 },
    { bank: 33.3, bonds: 33.3, stocks: 33.5 },
    { bank: -1, bonds: 1, stocks: 100 },
    { bank: 101, bonds: 0, stocks: -1 },
    { bank: 33.33, bonds: 33.33, stocks: 33.34 },
    { bank: 33.30000000001, bonds: 33.3, stocks: 33.39999999999 },
    { bank: NaN, bonds: 0, stocks: 100 },
    { bank: Infinity, bonds: 0, stocks: 0 },
    { bank: '100', bonds: 0, stocks: 0 },
    { bank: null, bonds: 0, stocks: 100 },
    { bank: 100, bonds: 0 },
    undefined,
  ])
    assert.throws(() => allocationSchema.validateSync(value, { strict: true }))
  assert.equal(
    isAllocationValid(parseAllocation({ bank: '', bonds: '0', stocks: '100' })),
    false
  )
})

test('handles push each other in either direction and can separate again', () => {
  assert.deepEqual(moveBoundary([550, 900], 0, 950), [950, 950])
  assert.deepEqual(moveBoundary([550, 900], 1, 200), [200, 200])
  assert.deepEqual(moveBoundary([950, 950], 0, 333), [333, 950])
  assert.deepEqual(moveBoundary([200, 200], 1, 666), [200, 666])
  assert.deepEqual(moveBoundary([550, 900], 0, 1100), [1000, 1000])
  assert.deepEqual(moveBoundary([550, 900], 1, -10), [0, 0])
  for (const value of [
    { bank: 100, bonds: 0, stocks: 0 },
    { bank: 0, bonds: 100, stocks: 0 },
    { bank: 0, bonds: 0, stocks: 100 },
  ]) {
    assert.ok(isAllocationValid(value))
    assert.deepEqual(fromBoundaries(allocationBoundaries(value)), value)
  }
})
