import { MersenneTwister19937, integer } from 'random-js'
import util from 'util'
import { Game, GameStatus, Period } from '../generated/ops'

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

export function computePeriodStatus(game: Game, periodIndex: number): string {
  if (
    game.activePeriodIx && game.status === GameStatus.Results
      ? game.activePeriodIx - 1 === periodIndex
      : game.activePeriodIx === periodIndex
  ) {
    if (game.status === GameStatus.Paused) return STATUS.PAUSED
    if (game.status === GameStatus.Results) return STATUS.RESULTS
    return STATUS.ACTIVE
  }

  if (game.activePeriodIx && game.activePeriodIx <= periodIndex)
    return STATUS.SCHEDULED

  return STATUS.COMPLETED
}

export function computeSegmentStatus(
  game: Game,
  period: Period,
  segmentIndex: number
): string {
  if (
    ![
      GameStatus.Paused,
      GameStatus.Preparation,
      GameStatus.Consolidation,
      GameStatus.Results,
    ].includes(game.status) &&
    period.activeSegmentIx === segmentIndex
  )
    return STATUS.ACTIVE

  if (period.activeSegmentIx && period.activeSegmentIx < segmentIndex)
    return STATUS.SCHEDULED

  return STATUS.COMPLETED
}
