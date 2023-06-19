import * as DB from '@prisma/client'
import { MersenneTwister19937, integer } from 'random-js'
import util from 'util'

export function setDifference(a, b, filterNoId = false) {
  if (!b) return a
  const A = a || []
  const B = new Set(b.map((item) => item.id))
  return A.filter((item) => !B.has(item.id) || (filterNoId && !item.id))
}

export function setIntersection(a, b) {
  if (!a || !b) return []
  const B = new Set(b.map((item) => item.id))
  return a.filter((item) => B.has(item.id) && item.id)
}

export function debugLog(...args) {
  if (process.env.NODE_ENV === 'development') {
    console.log(util.inspect(args, { showHidden: false, depth: null }))
  }
}

export function diceRoll(seeds: number[] = []) {
  const rng = MersenneTwister19937.seedWithArray(seeds)
  return integer(1, 6)(rng)
}

export function computeScenarioOutcome(trend, gap, diceRoll) {
  return trend + (diceRoll - 7) * gap
}

export function computePercentChange(newValue, oldValue) {
  return (newValue - oldValue) / oldValue
}

export function withPercentChange(value, percentChange) {
  return value * (1 + percentChange)
}

export enum STATUS {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  RESULTS = 'RESULTS',
}

export function computePeriodStatus(
  game: DB.Game,
  periodIndex: number
): string {
  if (
    typeof game.activePeriodIx === 'number' &&
    game.status === DB.GameStatus.RESULTS
      ? game.activePeriodIx - 1 === periodIndex
      : game.activePeriodIx === periodIndex
  ) {
    if (game.status === DB.GameStatus.PAUSED) return STATUS.PAUSED
    if (game.status === DB.GameStatus.RESULTS) return STATUS.RESULTS
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
  game: DB.Game,
  period: DB.Period,
  segmentIndex: number
): string {
  if (
    ![
      DB.GameStatus.PAUSED,
      DB.GameStatus.PREPARATION,
      DB.GameStatus.CONSOLIDATION,
      DB.GameStatus.RESULTS,
    ].includes(game.status as any) &&
    period.activeSegmentIx === segmentIndex
  )
    return STATUS.ACTIVE

  if (period.activeSegmentIx && period.activeSegmentIx < segmentIndex)
    return STATUS.SCHEDULED

  return STATUS.COMPLETED
}
