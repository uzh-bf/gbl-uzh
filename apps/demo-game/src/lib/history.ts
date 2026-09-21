import type { ResultQuery } from '../graphql/generated/ops'
import { isAllocationValid, type Allocation } from './allocation'
import { parseMarketFacts, readMarketRoll, revealedIndices } from './market'

const finite = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

export type HistoryMonth = {
  index: number
  bank: number | null
  bonds: number | null
  stocks: number | null
  gain: number | null
  dice: { bonds: number; stocks: number } | null
  revealed: boolean
}

export type HistoryQuarter = {
  id: string
  year: number
  quarter: number
  label: string
  allocation: Allocation | null
  value: number | null
  gain: number | null
  bonds: number | null
  stocks: number | null
  months: HistoryMonth[]
}

const difference = (end: number | null, start: number | null) =>
  end !== null && start !== null ? finite(end - start) : null

function compounded(months: HistoryMonth[], asset: 'bonds' | 'stocks') {
  if (!months.length || months.some((month) => month[asset] === null))
    return null
  return finite(
    months.reduce((total, month) => total * (1 + month[asset]), 1) - 1
  )
}

/** SEGMENT_END is also the live decision record; lifecycle state proves settlement. */
export function buildHistory(data: ResultQuery) {
  const game = data.result?.currentGame
  const results = (data.result?.previousResults ?? [])
    .map((row) => ({ ...row, facts: parseMarketFacts(row.facts) }))
    .sort(
      (a, b) =>
        a.period.index - b.period.index ||
        (a.segment?.index ?? -1) - (b.segment?.index ?? -1)
    )
  const endedPeriods = new Set(
    results
      .filter((row) => row.type === 'PERIOD_END')
      .map((row) => row.period.id)
  )
  const active = game?.activePeriod
  const inPeriod = [
    'PREPARATION',
    'RUNNING',
    'PAUSED',
    'CONSOLIDATION',
  ].includes(game?.status)
  const activeIndex = active?.activeSegmentIx ?? -1
  const lastClosedIndex = ['PAUSED', 'CONSOLIDATION'].includes(game?.status)
    ? activeIndex
    : activeIndex - 1
  const settled = (row: (typeof results)[number]) =>
    endedPeriods.has(row.period.id) ||
    (inPeriod &&
      row.period.id === active?.id &&
      row.segment.index <= lastClosedIndex)

  const quarters: HistoryQuarter[] = results
    .filter((row) => row.type === 'SEGMENT_END' && row.segment && settled(row))
    .map((row) => {
      const { facts } = row
      const segment = game?.periods
        .find((period) => period.id === row.period.id)
        ?.segments.find((segment) => segment.id === row.segment.id)
      const revealed = revealedIndices(segment?.facts)
      const samples = Array.isArray(facts.assetsWithReturns)
        ? facts.assetsWithReturns.map(parseMarketFacts)
        : []
      // Require contiguous monthly samples starting at the pre-return balance.
      const validSamples =
        samples.length > 1 && samples.every((sample, ix) => sample.ix === ix)
      const months: HistoryMonth[] = validSamples
        ? samples.slice(1).map((sample, index) => {
            const isRevealed = revealed.includes(index)
            return {
              index,
              bank: finite(sample.bankReturn),
              bonds: finite(sample.bondsReturn),
              stocks: finite(sample.stocksReturn),
              gain: difference(
                finite(sample.totalAssets),
                finite(samples[index].totalAssets)
              ),
              dice: isRevealed
                ? (readMarketRoll(segment?.facts, index)?.dice ?? null)
                : null,
              revealed: isRevealed,
            }
          })
        : []
      const value = validSamples ? finite(samples.at(-1)?.totalAssets) : null
      const decisions = parseMarketFacts(facts.decisions)
      const allocation = {
        bank: finite(decisions.bank),
        bonds: finite(decisions.bonds),
        stocks: finite(decisions.stocks),
      }
      return {
        id: row.id,
        year: 2026 + row.period.index,
        quarter: row.segment.index + 1,
        label: `${String(2026 + row.period.index).slice(-2)} Q${row.segment.index + 1}`,
        allocation: isAllocationValid(allocation) ? allocation : null,
        value,
        gain: difference(value, finite(samples[0]?.totalAssets)),
        bonds: compounded(months, 'bonds'),
        stocks: compounded(months, 'stocks'),
        months,
      }
    })
  const years = [
    ...new Set([
      ...results
        .filter(
          (row) => row.type === 'PERIOD_START' || row.type === 'PERIOD_END'
        )
        .map((row) => 2026 + row.period.index),
      ...quarters.map((quarter) => quarter.year),
      ...(inPeriod && active ? [2026 + active.index] : []),
    ]),
  ].sort((a, b) => a - b)
  const initialFacts =
    results
      .map((row) => row.facts)
      .find((facts) => finite(facts.initialCapital) !== null) ??
    parseMarketFacts(data.result?.playerResult?.facts)
  const initialCapital = finite(initialFacts.initialCapital)
  const value = quarters.length ? quarters.at(-1).value : initialCapital
  const gain = difference(value, initialCapital)
  return {
    years,
    quarters,
    value,
    gain,
    gainRate:
      gain !== null && initialCapital !== null && initialCapital > 0
        ? finite(gain / initialCapital)
        : null,
  }
}

const amountFormat = new Intl.NumberFormat('de-CH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function historyAmount(value: number | null, signed = false) {
  if (value === null) return '—'
  const formatted = amountFormat.format(value).replaceAll('’', "'")
  if (formatted === '-0.00' || formatted === '0.00') return '0.00'
  return `${signed && value > 0 ? '+' : ''}${formatted}`
}

export function historyPercent(value: number | null) {
  return value === null ? '—' : `${historyAmount(value * 100, true)}%`
}
