import type { ResultQuery } from '../graphql/generated/ops'
import {
  ALLOCATION_KEYS,
  isAllocationValid,
  type Allocation,
} from './allocation'
import { readBalanceSamples, readResultHistory } from './history'
import { parseMarketFacts } from './market'

export const RESULT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
type Asset = keyof Allocation
export type ResultBalance = Record<Asset, number | null> & {
  totalAssets: number | null
}
export type ResultSample = ResultBalance & {
  month: number
  label: string
  bankBenchmark: number | null
  bondsBenchmark: number | null
  stocksBenchmark: number | null
  accumulatedReturn: number | null
}
const finite = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null
const difference = (end: number | null, start: number | null) =>
  end !== null && start !== null ? finite(end - start) : null
const rate = (end: number | null, start: number | null) =>
  end !== null && start !== null && start > 0 ? finite(end / start - 1) : null

function balance(raw: unknown): ResultBalance {
  const facts = parseMarketFacts(raw)
  return {
    bank: finite(facts.bank),
    bonds: finite(facts.bonds),
    stocks: finite(facts.stocks),
    totalAssets: finite(facts.totalAssets),
  }
}

export function balanceMix(value: ResultBalance): Allocation | null {
  const { bank, bonds, stocks } = value
  if ([bank, bonds, stocks].some((v) => v === null || v < 0)) return null
  const total = bank + bonds + stocks
  if (total <= 0) return null
  return {
    bank: (bank / total) * 100,
    bonds: (bonds / total) * 100,
    stocks: (stocks / total) * 100,
  }
}

/** Only settled rows enter these views; PERIOD_END identifies the displayed year. */
export function buildResultView(data: ResultQuery) {
  const game = data.result?.currentGame
  if (!game || !['PAUSED', 'CONSOLIDATION', 'RESULTS'].includes(game.status))
    return null
  const { results: rows, settled } = readResultHistory(data)
  const ended = rows.filter((row) => row.type === 'PERIOD_END')
  const period =
    game.status === 'RESULTS' ? ended.at(-1)?.period : game.activePeriod
  if (!period) return null
  const year = 2026 + period.index
  const periodConfig = game.periods.find((item) => item.id === period.id)
  const quarterRows = settled
    .filter((row) => row.period.id === period.id)
    .map((row) => ({ ...row, samples: readBalanceSamples(row.facts) }))
  const quarterIndex =
    game.status === 'RESULTS'
      ? (periodConfig?.activeSegmentIx ??
        quarterRows.at(-1)?.segment?.index ??
        0)
      : (game.activePeriod?.activeSegmentIx ?? 0)
  const lastQuarter = quarterRows.find(
    (row) => row.segment.index === quarterIndex
  )
  const quarter = quarterIndex + 1
  const rolls = finite(parseMarketFacts(periodConfig?.facts).rollsPerSegment)
  const monthsPerQuarter =
    rolls !== null && rolls > 0 && Number.isInteger(rolls) ? rolls : 3
  const initialCapital =
    rows
      .map((row) => finite(parseMarketFacts(row.facts).initialCapital))
      .find((value) => value !== null) ??
    finite(parseMarketFacts(data.result?.playerResult?.facts).initialCapital)
  const toSample = (raw: unknown, month: number): ResultSample => {
    const facts = parseMarketFacts(raw)
    const assets = balance(raw)
    return {
      ...assets,
      month,
      label: RESULT_MONTHS[month] ?? `Month ${month + 1}`,
      bankBenchmark: finite(facts.bankBenchmark),
      bondsBenchmark: finite(facts.bondsBenchmark),
      stocksBenchmark: finite(facts.stocksBenchmark),
      accumulatedReturn: rate(assets.totalAssets, initialCapital),
    }
  }
  const recordedMonths = quarterRows.flatMap((row) =>
    row.samples
      .slice(1)
      .map((sample, index) =>
        toSample(sample, row.segment.index * monthsPerQuarter + index)
      )
  )
  // Keep missing months as gaps, rather than joining a line across absent data.
  const monthly = Array.from(
    { length: quarter * monthsPerQuarter },
    (_, month) =>
      recordedMonths.find((sample) => sample.month === month) ??
      toSample(undefined, month)
  )
  const quarterSamples = lastQuarter?.samples ?? []
  const startMonth = (quarter - 1) * monthsPerQuarter
  const opening = toSample(quarterSamples[0], startMonth - 1)
  opening.label = startMonth === 0 ? 'Start' : opening.label
  const close = balance(quarterSamples.at(-1))
  const current =
    game.status === 'RESULTS'
      ? balance(parseMarketFacts(ended.at(-1)?.facts).assets)
      : game.status === 'CONSOLIDATION'
        ? balance(parseMarketFacts(data.result?.playerResult?.facts).assets)
        : close
  const years = ended.map((row) => {
    const facts = parseMarketFacts(row.facts)
    const firstQuarter = settled.find(
      (item) => item.period.id === row.period.id && item.segment.index === 0
    )
    const startRow = rows.find(
      (item) => item.type === 'PERIOD_START' && item.period.id === row.period.id
    )
    const start = startRow
      ? balance(parseMarketFacts(startRow.facts).assets).totalAssets
      : balance(readBalanceSamples(firstQuarter?.facts)[0]).totalAssets
    const end = balance(facts.assets)
    return {
      ...end,
      year: 2026 + row.period.index,
      label: String(2026 + row.period.index),
      gain: difference(end.totalAssets, start),
      accumulatedReturn: rate(end.totalAssets, initialCapital),
    }
  })
  const completeSamples =
    quarterRows.length === quarter &&
    quarterRows.every(
      (row, index) =>
        row.segment.index === index &&
        row.samples.length === monthsPerQuarter + 1
    ) &&
    (game.status !== 'RESULTS' ||
      !periodConfig ||
      quarterRows.length === periodConfig.segmentCount)
  const monthlySamples = quarterRows.flatMap((row) => row.samples.slice(1))
  const annualReturns = Object.fromEntries(
    ALLOCATION_KEYS.map((asset) => {
      const returns = monthlySamples.map((sample) =>
        finite(sample[`${asset}Return`])
      )
      return [
        asset,
        completeSamples &&
        returns.length > 0 &&
        returns.every((value) => value !== null)
          ? finite(returns.reduce((total, value) => total * (1 + value), 1) - 1)
          : null,
      ]
    })
  ) as Record<Asset, number | null>
  const decisions = parseMarketFacts(lastQuarter?.facts.decisions)
  const allocation = {
    bank: finite(decisions.bank),
    bonds: finite(decisions.bonds),
    stocks: finite(decisions.stocks),
  }
  return {
    status: game.status as 'PAUSED' | 'CONSOLIDATION' | 'RESULTS',
    year,
    quarter,
    segmentCount: periodConfig?.segmentCount ?? quarter,
    initialCapital,
    current,
    close,
    opening,
    quarterMonths: monthly.slice(startMonth),
    monthly,
    years,
    annualReturns,
    allocation: isAllocationValid(allocation) ? allocation : null,
    quarterGain: difference(close.totalAssets, opening.totalAssets),
    consolidationChange: difference(current.totalAssets, close.totalAssets),
    yearGain: years.at(-1)?.gain ?? null,
    accumulatedReturn: rate(current.totalAssets, initialCapital),
    monthRange: `${RESULT_MONTHS[startMonth] ?? `Month ${startMonth + 1}`} – ${RESULT_MONTHS[startMonth + monthsPerQuarter - 1] ?? `Month ${startMonth + monthsPerQuarter}`}`,
  }
}

export type ResultView = NonNullable<ReturnType<typeof buildResultView>>
