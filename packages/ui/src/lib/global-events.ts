const RESULT_REFRESH_EVENT_TYPES = new Set([
  'COUNTDOWN_UPDATED',
  'PERIOD_ACTIVATED',
  'SEGMENT_ACTIVATED',
])

const COUNTDOWN_NOTIFICATION_THRESHOLDS = [60, 180]

export function getCountdownNotification(
  secondsLeft: number,
  previousSecondsLeft: number,
  notifications: Readonly<Record<string, boolean>>
): { secondsKey: string; friendlyMinutes: number } | null {
  const secondsThreshold = COUNTDOWN_NOTIFICATION_THRESHOLDS.find(
    (threshold) =>
      previousSecondsLeft > threshold &&
      secondsLeft <= threshold &&
      !notifications[String(threshold)]
  )

  return secondsThreshold === undefined
    ? null
    : {
        secondsKey: String(secondsThreshold),
        friendlyMinutes: secondsThreshold / 60,
      }
}

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
