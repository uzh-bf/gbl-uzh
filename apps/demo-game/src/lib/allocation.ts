import * as yup from 'yup'

export const ALLOCATION_KEYS = ['bank', 'bonds', 'stocks'] as const
export type Allocation = Record<(typeof ALLOCATION_KEYS)[number], number>
export type AllocationDraft = Record<keyof Allocation, string>
export type Boundaries = [number, number]

export function toTenths(value: number): number | null {
  if (!Number.isFinite(value) || value < 0 || value > 100) return null
  const tenths = Math.round(value * 10)
  return value === tenths / 10 ? tenths : null
}

const percentage = () =>
  yup
    .number()
    .typeError('Enter a percentage.')
    .required('Enter a percentage.')
    .min(0, 'Use a value from 0 to 100%.')
    .max(100, 'Use a value from 0 to 100%.')
    .test('tenths', 'Use steps of 0.1%.', (value) => toTenths(value) !== null)

// Browser drafts are strings; server validation uses strict mode to reject
// coerced strings, nulls, and other non-numeric mutation payloads.
export const allocationSchema = yup
  .object({ bank: percentage(), bonds: percentage(), stocks: percentage() })
  .required()
  .test('total', 'Allocations must total 100%.', (value) =>
    isAllocationValid(value)
  )

export function isAllocationValid(
  value: Partial<Allocation> | undefined
): boolean {
  const tenths = ALLOCATION_KEYS.map((key) => toTenths(value?.[key]))
  return (
    tenths.every((n) => n !== null) &&
    tenths.reduce((a, b) => a + b, 0) === 1000
  )
}

export function parseAllocation(draft: AllocationDraft): Allocation {
  return Object.fromEntries(
    ALLOCATION_KEYS.map((key) => [
      key,
      draft[key].trim() === '' ? NaN : Number(draft[key]),
    ])
  ) as Allocation
}

export function allocationDraft(value: Allocation): AllocationDraft {
  return Object.fromEntries(
    ALLOCATION_KEYS.map((key) => [key, String(value[key])])
  ) as AllocationDraft
}

export function allocationBoundaries(value: Allocation): Boundaries {
  const left = toTenths(value.bank)
  return [left, left + toTenths(value.bonds)]
}

export function fromBoundaries([left, right]: Boundaries): Allocation {
  return {
    bank: left / 10,
    bonds: (right - left) / 10,
    stocks: (1000 - right) / 10,
  }
}

export function moveBoundary(
  bounds: Boundaries,
  handle: 0 | 1,
  target: number
): Boundaries {
  const value = Math.max(0, Math.min(1000, Math.round(target)))
  return handle === 0
    ? [value, Math.max(value, bounds[1])]
    : [Math.min(bounds[0], value), value]
}

export function formatCHF(value: number): string {
  return `${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'")} CHF`
}
