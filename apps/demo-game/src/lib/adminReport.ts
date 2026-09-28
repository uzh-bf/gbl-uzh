import type { GameQuery, SpecificResultsQuery } from '~/graphql/generated/ops'
import { ALLOCATION_KEYS, type Allocation } from './allocation'
import { FIRST_GAME_YEAR, MONTHS, NUM_MONTHS_PER_SEGMENT } from './constants'
import { parseFacts } from './facts'
import {
  compoundReturns,
  finiteNumber,
  readAllocation,
  readBalanceSamples,
} from './results'

type Game = NonNullable<GameQuery['game']>
type Result = NonNullable<SpecificResultsQuery['specificResults']>[number]
export type ReportScope = 'all' | number
export type ReportMode = 'assets' | 'return'

// Stable across ranking/scope changes; separate from the three asset colors.
const TEAM_COLORS = [
  '#0033b3',
  '#e65f25',
  '#27866c',
  '#0988a4',
  '#91c441',
  '#dcac00',
  '#813e98',
  '#6982d0',
  '#a34519',
  '#7cb7a6',
  '#c91159',
  '#62b6c8',
  '#5d6975',
  '#f29e7d',
  '#171717',
]

export type ReportQuarter = {
  key: string
  label: string
  startMonth: number
  settled: boolean
}
export type ReportPoint = {
  month: number
  label: string
  values: Record<string, { assets: number | null; return: number | null }>
}
export type ReportTeam = {
  id: string
  name: string
  color: string
  seriesKey: string
  assets: number | null
  return: number | null
  risk: number | null
  sharpe: number | null
  decisions: Record<string, Allocation | null>
  mix: Allocation | null
}

export function averageAllocation(
  values: (Allocation | null)[]
): Allocation | null {
  const valid = values.filter((v): v is Allocation => v !== null)
  return valid.length
    ? (Object.fromEntries(
        ALLOCATION_KEYS.map((key) => [
          key,
          valid.reduce((sum, value) => sum + value[key], 0) / valid.length,
        ])
      ) as Allocation)
    : null
}

export function buildAdminReport(
  game: Game,
  segmentResults: Result[],
  periodResults: Result[],
  scope: ReportScope
) {
  const periods = [...game.periods]
    .sort((a, b) => a.index - b.index)
    .map((period) => ({
      ...period,
      segments: [...period.segments].sort((a, b) => a.index - b.index),
    }))
  const ended = new Set(periodResults.map((row) => row.period.id))
  const inPeriod = [
    'PREPARATION',
    'RUNNING',
    'PAUSED',
    'CONSOLIDATION',
  ].includes(game.status)
  const lastClosed =
    (game.activePeriod?.activeSegmentIx ?? -1) -
    (['PAUSED', 'CONSOLIDATION'].includes(game.status) ? 0 : 1)
  const quarters: ReportQuarter[] = periods
    .filter((p) => scope === 'all' || p.index === scope)
    .flatMap((period) =>
      period.segments.map((segment) => ({
        key: `${period.id}:${segment.id}`,
        startMonth: period.index * 12 + segment.index * NUM_MONTHS_PER_SEGMENT,
        label: `Q${segment.index + 1} ${String(FIRST_GAME_YEAR + period.index).slice(-2)}`,
        settled:
          ended.has(period.id) ||
          (inPeriod &&
            game.activePeriod?.id === period.id &&
            segment.index <= lastClosed),
      }))
    )
  const closed = quarters.filter((q) => q.settled)
  const rows = new Map(
    segmentResults
      .filter((row) => row.segment)
      .map((row) => [
        `${row.player.id}:${row.period.id}:${row.segment!.id}`,
        row,
      ])
  )
  const firstMonth = closed[0]?.startMonth ?? 0
  const lastQuarter = closed.at(-1)
  // Keep every calendar slot so the chart cannot join across missing months.
  const points: ReportPoint[] = Array.from(
    {
      length: lastQuarter
        ? lastQuarter.startMonth + NUM_MONTHS_PER_SEGMENT - firstMonth + 1
        : 0,
    },
    (_, offset) => {
      const month = firstMonth + offset
      return {
        month,
        label:
          offset === 0
            ? 'Start'
            : `${MONTHS[(month - 1) % 12]}${scope === 'all' ? ` ${String(FIRST_GAME_YEAR + Math.floor((month - 1) / 12)).slice(-2)}` : ''}`,
        values: {},
      }
    }
  )
  const teams: ReportTeam[] = [...game.players]
    .sort((a, b) => a.number - b.number || a.id.localeCompare(b.id))
    .map((player, index) => {
      const seriesKey = `team${index}`
      const decisions: ReportTeam['decisions'] = {}
      const returns: (number | null)[] = []
      const bankReturns: (number | null)[] = []
      let cumulative: number | null = 1
      let assets: number | null = null
      let previousEnd: number | null = null
      for (const quarter of quarters) {
        const raw = rows.get(`${player.id}:${quarter.key}`)
        decisions[quarter.key] =
          quarter.settled && raw
            ? readAllocation(parseFacts(raw.facts).decisions)
            : null
        if (!quarter.settled) continue
        const samples = raw ? readBalanceSamples(raw.facts) : []
        const { startMonth } = quarter
        const start = finiteNumber(samples[0]?.totalAssets)
        if (quarter === closed[0])
          points[0].values[seriesKey] = {
            assets: start,
            return: start !== null && start > 0 ? 0 : null,
          }
        // A changed opening balance or a missing quarter cannot be silently compounded.
        if (
          start === null ||
          start <= 0 ||
          (previousEnd !== null && Math.abs(start - previousEnd) > 0.01)
        )
          cumulative = null
        for (let month = 1; month <= NUM_MONTHS_PER_SEGMENT; month++) {
          const current = finiteNumber(samples[month]?.totalAssets)
          const previous = finiteNumber(samples[month - 1]?.totalAssets)
          const rate =
            current !== null && previous !== null && previous > 0
              ? finiteNumber(current / previous - 1)
              : null
          const bank = finiteNumber(samples[month]?.bankReturn)
          returns.push(rate)
          bankReturns.push(bank)
          cumulative =
            cumulative !== null && rate !== null
              ? finiteNumber(cumulative * (1 + rate))
              : null
          points[startMonth + month - firstMonth].values[seriesKey] = {
            assets: current,
            return: cumulative === null ? null : cumulative - 1,
          }
          assets = current
        }
        previousEnd = assets
      }
      const totalReturn =
        returns.length && cumulative !== null
          ? finiteNumber(cumulative - 1)
          : null
      const complete =
        returns.length > 1 &&
        returns.every((value): value is number => value !== null)
      const mean = complete
        ? returns.reduce((sum, value) => sum + value, 0) / returns.length
        : 0
      const risk = complete
        ? finiteNumber(
            Math.sqrt(
              returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
                (returns.length - 1)
            ) * Math.sqrt(12)
          )
        : null
      const bankReturn = compoundReturns(bankReturns)
      const annualReturn =
        totalReturn !== null
          ? (1 + totalReturn) ** (12 / returns.length) - 1
          : null
      const annualBank =
        bankReturn !== null
          ? (1 + bankReturn) ** (12 / returns.length) - 1
          : null
      const sharpe =
        risk !== null &&
        risk > 0.0001 &&
        annualReturn !== null &&
        annualBank !== null
          ? finiteNumber((annualReturn - annualBank) / risk)
          : null
      return {
        id: player.id,
        name: player.name,
        color:
          TEAM_COLORS[index] ??
          `hsl(${((index * 137.508) % 360).toFixed(3)} 65% 42%)`,
        seriesKey,
        assets,
        return: totalReturn,
        risk,
        sharpe,
        decisions,
        mix: averageAllocation(Object.values(decisions)),
      }
    })
  const rankBy = (metric: 'return' | 'sharpe') =>
    [...teams].sort(
      (a, b) =>
        (b[metric] ?? -Infinity) - (a[metric] ?? -Infinity) ||
        a.name.localeCompare(b.name) ||
        a.id.localeCompare(b.id)
    )
  const ranking = rankBy('return')
  const sharpeRanking = rankBy('sharpe')
  const eligible = teams.filter((team) => team.return !== null)
  const averageReturn = eligible.length
    ? eligible.reduce((sum, team) => sum + team.return!, 0) / eligible.length
    : null
  const averageDecisions = Object.fromEntries(
    quarters.map((q) => [
      q.key,
      averageAllocation(teams.map((t) => t.decisions[q.key])),
    ])
  )
  return {
    teams,
    ranking,
    sharpeRanking,
    quarters,
    points,
    top: ranking.find((t) => t.return !== null) ?? null,
    bestSharpe: sharpeRanking.find((t) => t.sharpe !== null) ?? null,
    averageReturn,
    eligibleCount: eligible.length,
    mix: averageAllocation(teams.map((t) => t.mix)),
    averageDecisions,
    hasResults: points.some((point) =>
      Object.values(point.values).some((value) => value.assets !== null)
    ),
    years: periods.map((p) => ({
      index: p.index,
      year: FIRST_GAME_YEAR + p.index,
      quarters: p.segments.map((s) => s.index + 1),
      complete: ended.has(p.id),
    })),
  }
}

export type AdminReport = ReturnType<typeof buildAdminReport>
export { playerAmount as reportAmount } from './results'
export const reportPercent = (value: number | null) => {
  if (value === null) return '—'
  const rounded = Math.round(value * 1000) / 10
  return `${rounded > 0 ? '+' : ''}${(Object.is(rounded, -0) ? 0 : rounded).toFixed(1)}%`
}
