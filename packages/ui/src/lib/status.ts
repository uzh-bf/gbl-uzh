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
  if (
    typeof game.activePeriodIx === 'number' &&
    game.status === 'RESULTS'
      ? game.activePeriodIx - 1 === periodIndex
      : game.activePeriodIx === periodIndex
  ) {
    if (game.status === 'PAUSED') return STATUS.PAUSED
    if (game.status === 'RESULTS') return STATUS.RESULTS
    return STATUS.ACTIVE
  }

  if (
    typeof game.activePeriodIx === 'number' &&
    game.activePeriodIx <= periodIndex
  )
    return STATUS.SCHEDULED

  return STATUS.COMPLETED
}

export function computeSegmentStatus(
  game: { status: string },
  period: { activeSegmentIx?: number | null },
  segmentIndex: number
): string {
  if (
    !['PAUSED', 'PREPARATION', 'CONSOLIDATION', 'RESULTS'].includes(
      game.status
    ) &&
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
