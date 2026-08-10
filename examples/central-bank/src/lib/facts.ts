export type FactMap = Record<string, unknown>

export function getFacts(value: unknown): FactMap {
  if (value === null || value === undefined || typeof value !== 'object') {
    return {}
  }
  if (Array.isArray(value)) return {}
  return value as FactMap
}

export function getFactsArray(value: unknown): FactMap[] {
  return Array.isArray(value) ? (value as FactMap[]) : []
}

export function getNumber(value: unknown, fallback = 0): number {
  const parsed =
    typeof value === 'number' && Number.isFinite(value)
      ? value
      : typeof value === 'string'
        ? Number(value)
        : fallback
  return Number.isFinite(parsed) ? parsed : fallback
}
