const RESULT_REFRESH_EVENT_TYPES = new Set([
  'COUNTDOWN_UPDATED',
  'PERIOD_ACTIVATED',
  'SEGMENT_ACTIVATED',
])

export function shouldRefetchGameResult(
  event:
    | { type?: string | null; facts?: { gameId?: number } | null }
    | null
    | undefined,
  gameId: number
): boolean {
  return (
    event?.facts?.gameId === gameId &&
    RESULT_REFRESH_EVENT_TYPES.has(event.type ?? '')
  )
}
