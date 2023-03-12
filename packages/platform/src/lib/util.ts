import { integer, MersenneTwister19937 } from 'random-js'
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
