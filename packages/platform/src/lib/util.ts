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

export function computeScenarioOutcome(
  trend: number,
  gap: number,
  diceRoll: number
) {
  return trend + (diceRoll - 7) * gap
}

export function standardDeviation(arr: number[]) {
  const num = arr.length
  const mean = arr.reduce((acc, value) => acc + value, 0) / num
  const variance =
    arr.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) / (num - 1)
  return Math.sqrt(variance)
}

export function computePercentChange(newValue: number, oldValue: number) {
  return (newValue - oldValue) / oldValue
}

export function withPercentChange(value: number, percentChange: number) {
  return value * (1 + percentChange)
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3
): Promise<T> {
  let lastError
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err: any) {
      console.error('Retrying due to error:', err)
      if (
        err.message?.includes('Transaction failed') ||
        err.code === 'P2034' // Deadlock
        // err.message === 'ORDER_ALREADY_TAKEN'
      ) {
        lastError = err
        await new Promise((r) => setTimeout(r, 50 * (i + 1)))
        continue
      }
      throw err
    }
  }
  throw lastError
}
