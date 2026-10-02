import type { ResultQuery } from '../graphql/generated/ops'
import {
  ALLOCATION_KEYS,
  isAllocationValid,
  type Allocation,
} from './allocation'
import {
  FIRST_GAME_YEAR,
  MONTHS,
  NUM_MONTHS,
  NUM_MONTHS_PER_SEGMENT,
} from './constants'
import { parseFacts } from './facts'
import { readMarketRoll, revealedIndices } from './market'

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
const rate = (end: number | null, start: number | null) =>
  end !== null && start !== null && start > 0
    ? finiteNumber(end / start - 1)
    : null

function balance(raw: unknown): ResultBalance {
  const facts = parseFacts(raw)
  return {
    bank: finiteNumber(facts.bank),
    bonds: finiteNumber(facts.bonds),
    stocks: finiteNumber(facts.stocks),
    totalAssets: finiteNumber(facts.totalAssets),
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
  const year = FIRST_GAME_YEAR + period.index
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
  const monthsPerQuarter = NUM_MONTHS_PER_SEGMENT
  const initialCapital = readInitialCapital(
    rows,
    data.result?.playerResult?.facts
  )
  const toSample = (raw: unknown, month: number): ResultSample => {
    const facts = parseFacts(raw)
    const assets = balance(raw)
    return {
      ...assets,
      month,
      label: MONTHS[month] ?? `Month ${month + 1}`,
      bankBenchmark: finiteNumber(facts.bankBenchmark),
      bondsBenchmark: finiteNumber(facts.bondsBenchmark),
      stocksBenchmark: finiteNumber(facts.stocksBenchmark),
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
      ? balance(parseFacts(ended.at(-1)?.facts).assets)
      : game.status === 'CONSOLIDATION'
        ? balance(parseFacts(data.result?.playerResult?.facts).assets)
        : close
  const years = ended.map((row) => {
    const facts = parseFacts(row.facts)
    const firstQuarter = settled.find(
      (item) => item.period.id === row.period.id && item.segment.index === 0
    )
    const startRow = rows.find(
      (item) => item.type === 'PERIOD_START' && item.period.id === row.period.id
    )
    const start = startRow
      ? balance(parseFacts(startRow.facts).assets).totalAssets
      : balance(readBalanceSamples(firstQuarter?.facts)[0]).totalAssets
    const end = balance(facts.assets)
    return {
      ...end,
      year: FIRST_GAME_YEAR + row.period.index,
      label: String(FIRST_GAME_YEAR + row.period.index),
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
        finiteNumber(sample[`${asset}Return`])
      )
      return [asset, completeSamples ? compoundReturns(returns) : null]
    })
  ) as Record<Asset, number | null>
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
    allocation: readAllocation(lastQuarter?.facts.decisions),
    quarterGain: difference(close.totalAssets, opening.totalAssets),
    consolidationChange: difference(current.totalAssets, close.totalAssets),
    yearGain: years.at(-1)?.gain ?? null,
    accumulatedReturn: rate(current.totalAssets, initialCapital),
    monthRange: `${MONTHS[startMonth] ?? `Month ${startMonth + 1}`} – ${MONTHS[startMonth + monthsPerQuarter - 1] ?? `Month ${startMonth + monthsPerQuarter}`}`,
  }
}

export type ResultView = NonNullable<ReturnType<typeof buildResultView>>

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

export function buildHistory(data: ResultQuery) {
  const game = data.result?.currentGame
  const active = game?.activePeriod
  const { results, settled, inPeriod } = readResultHistory(data)
  const quarters: HistoryQuarter[] = settled.map((row) => {
    const { facts } = row
    const segment = game?.periods
      .find((period) => period.id === row.period.id)
      ?.segments.find((segment) => segment.id === row.segment.id)
    const revealed = revealedIndices(segment?.facts)
    const samples = readBalanceSamples(facts)
    const months: HistoryMonth[] = samples.slice(1).map((sample, index) => {
      const isRevealed = revealed.includes(index)
      return {
        index,
        bank: finiteNumber(sample.bankReturn),
        bonds: finiteNumber(sample.bondsReturn),
        stocks: finiteNumber(sample.stocksReturn),
        gain: difference(
          finiteNumber(sample.totalAssets),
          finiteNumber(samples[index].totalAssets)
        ),
        dice: isRevealed
          ? (readMarketRoll(segment?.facts, index)?.dice ?? null)
          : null,
        revealed: isRevealed,
      }
    })
    const value = finiteNumber(samples.at(-1)?.totalAssets)
    return {
      id: row.id,
      year: FIRST_GAME_YEAR + row.period.index,
      quarter: row.segment.index + 1,
      label: `${String(FIRST_GAME_YEAR + row.period.index).slice(-2)} Q${row.segment.index + 1}`,
      allocation: readAllocation(facts.decisions),
      value,
      gain: difference(value, finiteNumber(samples[0]?.totalAssets)),
      bonds: compoundReturns(months.map((month) => month.bonds)),
      stocks: compoundReturns(months.map((month) => month.stocks)),
      months,
    }
  })
  const years = [
    ...new Set([
      ...results
        .filter(
          (row) => row.type === 'PERIOD_START' || row.type === 'PERIOD_END'
        )
        .map((row) => FIRST_GAME_YEAR + row.period.index),
      ...quarters.map((quarter) => quarter.year),
      ...(inPeriod && active ? [FIRST_GAME_YEAR + active.index] : []),
    ]),
  ].sort((a, b) => a - b)
  const initialCapital = readInitialCapital(
    results,
    data.result?.playerResult?.facts
  )
  const value = quarters.length ? quarters.at(-1).value : initialCapital
  const gain = difference(value, initialCapital)
  return {
    years,
    quarters,
    value,
    gain,
    gainRate:
      gain !== null && initialCapital !== null && initialCapital > 0
        ? finiteNumber(gain / initialCapital)
        : null,
  }
}

export const finiteNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

export const difference = (end: number | null, start: number | null) =>
  end !== null && start !== null ? finiteNumber(end - start) : null

export function compoundReturns(returns: readonly (number | null)[]) {
  if (!returns.length || returns.some((value) => value === null)) return null
  return finiteNumber(
    returns.reduce((total, value) => total * (1 + value), 1) - 1
  )
}

export function readAllocation(raw: unknown): Allocation | null {
  const facts = parseFacts(raw)
  const allocation = {
    bank: finiteNumber(facts.bank),
    bonds: finiteNumber(facts.bonds),
    stocks: finiteNumber(facts.stocks),
  }
  return isAllocationValid(allocation) ? allocation : null
}

export function readInitialCapital(
  rows: readonly { facts: unknown }[],
  currentFacts: unknown
) {
  return (
    rows
      .map((row) => finiteNumber(parseFacts(row.facts).initialCapital))
      .find((value) => value !== null) ??
    finiteNumber(parseFacts(currentFacts).initialCapital)
  )
}

/** Require a contiguous series starting with the pre-return balance. */
export function readBalanceSamples(raw: unknown) {
  const facts = parseFacts(raw)
  const samples = Array.isArray(facts.assetsWithReturns)
    ? facts.assetsWithReturns.map(parseFacts)
    : []
  return samples.length > 1 &&
    samples.every((sample, index) => sample.ix === index)
    ? samples
    : []
}

/** SEGMENT_END is also the live decision record; lifecycle state proves settlement. */
export function readResultHistory(data: ResultQuery) {
  const game = data.result?.currentGame
  const results = (data.result?.previousResults ?? [])
    .map((row) => ({ ...row, facts: parseFacts(row.facts) }))
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

  return {
    results,
    settled: results.filter(
      (row) => row.type === 'SEGMENT_END' && row.segment && settled(row)
    ),
    inPeriod,
  }
}

const amountFormat = new Intl.NumberFormat('de-CH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function playerAmount(value: number | null, signed = false) {
  if (value === null) return '—'
  const formatted = amountFormat.format(value).replaceAll('’', "'")
  if (formatted === '-0.00' || formatted === '0.00') return '0.00'
  return `${signed && value > 0 ? '+' : ''}${formatted}`
}

export function playerPercent(value: number | null) {
  return value === null ? '—' : `${playerAmount(value * 100, true)}%`
}

export const composeChartData = (dataPerPeriod: any, key: string) => {
  const output = []
  dataPerPeriod.forEach((periodData, periodIndex) => {
    if (Object.keys(periodData).length === 0) return

    const players = Object.values(periodData) as any[]
    const num = players.length > 0 ? players[0][key].length : NUM_MONTHS

    for (let i = 0; i < num; i++) {
      const entry = {
        period: periodIndex,
        month: MONTHS[i % NUM_MONTHS] + ' P' + (periodIndex + 1).toString(),
      }

      players.forEach((player) => {
        entry[player.name] = player[key][i]
      })

      output.push(entry)
    }
  })
  return output
}
