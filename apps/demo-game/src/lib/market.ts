import type { ResultQuery } from '../graphql/generated/ops'
import { FIRST_GAME_YEAR } from './constants'
import { parseFacts } from './facts'

export type MarketScenario = {
  trendBonds: number
  gapBonds: number
  trendStocks: number
  gapStocks: number
  interestBank: number
}
export type MarketRoll = { shared: number; bonds: number; stocks: number }
export type MarketReturns = { bank: number; bonds: number; stocks: number }

const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

export function readScenario(raw: unknown): MarketScenario | null {
  const scenario = parseFacts(parseFacts(raw).scenario)
  return [
    'trendBonds',
    'gapBonds',
    'trendStocks',
    'gapStocks',
    'interestBank',
  ].every((key) => finite(scenario[key])) &&
    Number(scenario.gapBonds) >= 0 &&
    Number(scenario.gapStocks) >= 0
    ? (scenario as MarketScenario)
    : null
}

export function readMarketRoll(
  raw: unknown,
  index: number
): { dice: MarketRoll; returns: MarketReturns } | null {
  const facts = parseFacts(raw)
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    !Array.isArray(facts.diceRolls) ||
    !Array.isArray(facts.returns)
  )
    return null
  const dice = parseFacts(facts.diceRolls[index])
  const returns = parseFacts(facts.returns[index])
  const die = (value: unknown) =>
    finite(value) && Number.isInteger(value) && value >= 1 && value <= 6
  if (
    !die(dice.shared) ||
    !finite(dice.bonds) ||
    !finite(dice.stocks) ||
    !die(dice.bonds - Number(dice.shared)) ||
    !die(dice.stocks - Number(dice.shared))
  )
    return null
  if (!['bank', 'bonds', 'stocks'].every((key) => finite(returns[key])))
    return null
  return { dice: dice as MarketRoll, returns: returns as MarketReturns }
}

export function revealedIndices(raw: unknown): number[] {
  const indices = parseFacts(raw).revealedRollIndices
  return Array.isArray(indices)
    ? [
        ...new Set(
          indices.filter(
            (index): index is number =>
              Number.isInteger(index) && Number(index) >= 0
          )
        ),
      ].sort((a, b) => a - b)
    : []
}

export function marketTimeLabel(
  periodIndex: number,
  segmentIndex: number,
  rollIndex: number
) {
  return `${FIRST_GAME_YEAR + periodIndex} · Quarter ${segmentIndex + 1} · Month ${rollIndex + 1}`
}

export function marketPeriod(game: ResultQuery['result']['currentGame']) {
  // At final RESULTS, self.game has a null activePeriod and Apollo normalizes
  // it over result.currentGame's server-side fallback. Period history remains.
  return (
    game?.activePeriod ??
    (game?.status === 'RESULTS'
      ? [...game.periods].sort((a, b) => b.index - a.index)[0]
      : null)
  )
}

export function latestRevealedRoll(game: ResultQuery['result']['currentGame']) {
  if (!game) return null
  const activePeriod = marketPeriod(game)
  const periods = [...game.periods].sort((a, b) => b.index - a.index)
  for (const period of periods) {
    if (!activePeriod || period.index > activePeriod.index) continue
    for (const segment of [...period.segments].sort(
      (a, b) => b.index - a.index
    )) {
      if (
        period.index === activePeriod.index &&
        segment.index > (activePeriod.activeSegmentIx ?? -1)
      )
        continue
      const indices = revealedIndices(segment.facts)
      if (!indices.length) continue
      const index = indices[indices.length - 1]
      const roll = readMarketRoll(segment.facts, index)
      return {
        segmentId: segment.id,
        periodIndex: period.index,
        segmentIndex: segment.index,
        index,
        label: marketTimeLabel(period.index, segment.index, index),
        roll,
      }
    }
  }
  return null
}
