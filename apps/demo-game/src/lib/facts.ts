/** Accept persisted objects and legacy single/double-encoded JSON facts. */
export function parseFacts(raw: unknown): Record<string, unknown> {
  try {
    let value = raw
    for (let i = 0; i < 2 && typeof value === 'string'; i++)
      value = JSON.parse(value)
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}
