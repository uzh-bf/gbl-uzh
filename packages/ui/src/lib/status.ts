export enum STATUS {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  RESULTS = 'RESULTS',
}

export function computePeriodStatus(
  game: { status: string; activePeriodIx?: number | null },
  periodIndex: number
): string {
  const { status, activePeriodIx } = game
  if (typeof activePeriodIx !== 'number') return STATUS.COMPLETED
  if (status === 'RESULTS' && periodIndex === activePeriodIx - 1)
    return STATUS.RESULTS
  if (
    periodIndex === activePeriodIx &&
    status !== 'RESULTS' &&
    status !== 'COMPLETED'
  )
    return status === 'PAUSED' ? STATUS.PAUSED : STATUS.ACTIVE
  return periodIndex < activePeriodIx ? STATUS.COMPLETED : STATUS.SCHEDULED
}

export function computeSegmentStatus(
  game: { status: string },
  period: { activeSegmentIx?: number | null },
  segmentIndex: number
): string {
  if (
    ![
      'PAUSED',
      'PREPARATION',
      'CONSOLIDATION',
      'RESULTS',
      'COMPLETED',
    ].includes(game.status) &&
    period.activeSegmentIx === segmentIndex
  )
    return STATUS.ACTIVE

  if (
    typeof period.activeSegmentIx === 'number' &&
    period.activeSegmentIx > -2 &&
    period.activeSegmentIx < segmentIndex
  )
    return STATUS.SCHEDULED

  return STATUS.COMPLETED
}
