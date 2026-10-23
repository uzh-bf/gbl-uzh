import { expect, test } from 'vitest'
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
  expect(allocationSchema.validateSync(value, { strict: true })).toStrictEqual(
    value
  )
  expect(fromBoundaries(allocationBoundaries(value))).toStrictEqual(value)
  expect(formatCHF(10070.37 * 0.55)).toBe("5'538.70 CHF")
  for (let left = 0; left <= 1000; left += 7) {
    for (let right = left; right <= 1000; right += 11) {
      expect(isAllocationValid(fromBoundaries([left, right]))).toBeTruthy()
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
    expect(() =>
      allocationSchema.validateSync(value, { strict: true })
    ).toThrow()
  expect(
    isAllocationValid(parseAllocation({ bank: '', bonds: '0', stocks: '100' }))
  ).toBe(false)
})

test('handles push each other in either direction and can separate again', () => {
  expect(moveBoundary([550, 900], 0, 950)).toStrictEqual([950, 950])
  expect(moveBoundary([550, 900], 1, 200)).toStrictEqual([200, 200])
  expect(moveBoundary([950, 950], 0, 333)).toStrictEqual([333, 950])
  expect(moveBoundary([200, 200], 1, 666)).toStrictEqual([200, 666])
  expect(moveBoundary([550, 900], 0, 1100)).toStrictEqual([1000, 1000])
  expect(moveBoundary([550, 900], 1, -10)).toStrictEqual([0, 0])
  for (const value of [
    { bank: 100, bonds: 0, stocks: 0 },
    { bank: 0, bonds: 100, stocks: 0 },
    { bank: 0, bonds: 0, stocks: 100 },
  ]) {
    expect(isAllocationValid(value)).toBeTruthy()
    expect(fromBoundaries(allocationBoundaries(value))).toStrictEqual(value)
  }
})
