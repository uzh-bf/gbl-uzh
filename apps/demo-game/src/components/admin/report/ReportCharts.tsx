import { cn } from '@gbl-uzh/ui'
import { Button, ChartContainer, ChartTooltip } from '@uzh-bf/design-system'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  type AdminReport,
  type ReportMode,
  reportAmount,
  reportPercent,
} from '~/lib/adminReport'
import { FIRST_GAME_YEAR } from '~/lib/constants'
import { headingClass, ReportMessage, TeamDot } from './ReportOverview'

type Props = { report: AdminReport; focusedId: string | null }
const axis = {
  tickLine: false,
  axisLine: false,
  tickMargin: 10,
  tick: { fill: '#707070', fontSize: 12 },
}
const amountAxis = new Intl.NumberFormat('de-CH', { maximumFractionDigits: 0 })
const configFor = (report: AdminReport) =>
  Object.fromEntries(
    report.teams.map((team) => [
      team.seriesKey,
      { label: team.name, color: team.color },
    ])
  )

export function PerformanceChart({
  report,
  focusedId,
  mode,
  onMode,
}: Props & { mode: ReportMode; onMode: (mode: ReportMode) => void }) {
  const formatValue = (value: number) =>
    mode === 'assets' ? `${reportAmount(value)} CHF` : reportPercent(value)
  const focusedTeam = report.teams.find((team) => team.id === focusedId)
  const data = report.points.map((point) => ({
    month: point.month,
    label: point.label,
    ...Object.fromEntries(
      report.teams.map((team) => [
        team.seriesKey,
        point.values[team.seriesKey]?.[mode] ?? null,
      ])
    ),
  }))
  const series = [...report.teams].sort(
    (a, b) => Number(a.id === focusedId) - Number(b.id === focusedId)
  )
  return (
    <section
      aria-label="Performance"
      data-mode={mode}
      data-focused-team={focusedId ?? ''}
      className="flex min-w-0 flex-col px-[24px] pt-[20px] pb-[26px]"
    >
      <div className="mb-[20px] flex flex-wrap items-center justify-between gap-[12px]">
        <h2 className={headingClass}>
          {mode === 'assets' ? 'Assets over time' : 'Accumulated return'}{' '}
          <span className="ml-[8px] font-normal tracking-normal">
            {mode === 'assets' ? 'CHF' : '%'}
          </span>
        </h2>
        <div className="flex gap-[6px]" aria-label="Chart measure">
          {(['assets', 'return'] as const).map((value) => (
            <Button
              key={value}
              aria-pressed={mode === value}
              onClick={() => onMode(value)}
              className={{
                root: cn(
                  'border-player-input hover:bg-player-feedback min-h-[34px] rounded-full border bg-white px-[15px] py-[5px] text-[14px] font-normal shadow-none',
                  mode === value &&
                    'border-player-primary text-player-primary font-semibold'
                ),
              }}
            >
              {value === 'assets' ? 'Assets' : 'Return'}
            </Button>
          ))}
        </div>
      </div>
      {!report.hasResults ? (
        <ReportMessage>No settled results in this scope yet.</ReportMessage>
      ) : (
        <ChartContainer
          config={configFor(report)}
          className="aspect-auto h-[365px] w-full min-[1024px]:min-h-[365px] min-[1024px]:flex-1"
        >
          <ComposedChart
            data={data}
            accessibilityLayer
            margin={{
              top: 8,
              right: focusedId ? 118 : 24,
              bottom: 12,
              left: 0,
            }}
          >
            <CartesianGrid vertical={false} stroke="#eeeeee" />
            <XAxis
              {...axis}
              dataKey="month"
              type="number"
              domain={['dataMin', 'dataMax']}
              ticks={report.points
                .filter(
                  (_, index) =>
                    index > 0 && (data.length <= 14 || index % 2 === 0)
                )
                .map((p) => p.month)}
              tickFormatter={(month) =>
                report.points.find((p) => p.month === month)?.label ?? ''
              }
              minTickGap={22}
            />
            <YAxis
              {...axis}
              width={65}
              domain={['auto', 'auto']}
              tickFormatter={(v) =>
                mode === 'assets' ? amountAxis.format(v) : reportPercent(v)
              }
            />
            {mode === 'return' && <ReferenceLine y={0} stroke="#aaaaaa" />}
            {report.years
              .filter(
                (y) =>
                  report.points.some((p) => p.month < y.index * 12) &&
                  report.points.some((p) => p.month > y.index * 12)
              )
              .map((y) => (
                <ReferenceLine
                  key={y.index}
                  x={y.index * 12}
                  stroke="#d8d8d8"
                  strokeDasharray="4 4"
                  label={{
                    value: String(FIRST_GAME_YEAR + y.index),
                    position: 'insideTopRight',
                    fill: '#707070',
                    fontSize: 11,
                  }}
                />
              ))}
            <ChartTooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div className="border-player-border max-h-[320px] overflow-auto rounded-[6px] border bg-white p-[12px] text-[12px] shadow-lg">
                    <p className="mb-[6px] font-semibold">
                      {report.points.find((p) => p.month === label)?.label}
                    </p>
                    {payload
                      .filter(
                        (entry) =>
                          !focusedId || focusedTeam?.seriesKey === entry.dataKey
                      )
                      .map((entry) => (
                        <div
                          key={String(entry.dataKey)}
                          className="flex items-center justify-between gap-[20px]"
                        >
                          <span className="flex items-center gap-[6px]">
                            <span
                              className="h-[8px] w-[8px] rounded-[2px]"
                              style={{ background: entry.color }}
                            />
                            {entry.name}
                          </span>
                          <strong>{formatValue(Number(entry.value))}</strong>
                        </div>
                      ))}
                  </div>
                ) : null
              }
            />
            {series.map((team) => {
              const dim = focusedId !== null && focusedId !== team.id
              const selected = team.id === focusedId
              const lastIndex = data.findLastIndex(
                (row) => row[team.seriesKey] != null
              )
              const shared = {
                dataKey: team.seriesKey,
                name: team.name,
                stroke: team.color,
                strokeWidth: selected ? 3.5 : 2,
                strokeOpacity: dim ? 0.15 : 1,
                connectNulls: false,
                isAnimationActive: false,
                dot: ({
                  cx,
                  cy,
                  index,
                }: {
                  cx?: number
                  cy?: number
                  index?: number
                }) => {
                  // Area dots expose [baseline, value]; read our scalar for both chart modes.
                  const value =
                    report.points[index]?.values[team.seriesKey]?.[mode]
                  if (
                    index !== lastIndex ||
                    cx == null ||
                    cy == null ||
                    value == null
                  )
                    return <g key={`${team.id}-${index}`} />
                  return (
                    <g key={team.id} opacity={dim ? 0.2 : 1}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={selected ? 4 : 3}
                        fill={team.color}
                      />
                      {selected && (
                        <text
                          x={cx + 12}
                          y={cy}
                          fill={team.color}
                          fontSize={12}
                        >
                          <tspan fontWeight={700}>
                            {team.name.length > 16
                              ? `${team.name.slice(0, 15)}…`
                              : team.name}
                          </tspan>
                          <tspan
                            data-cy="report-focused-value"
                            x={cx + 12}
                            dy={16}
                            fontSize={11}
                          >
                            {formatValue(value)}
                          </tspan>
                        </text>
                      )}
                    </g>
                  )
                },
              }
              return mode === 'assets' ? (
                <Line key={team.id} {...shared} type="monotone" />
              ) : (
                <Area
                  key={team.id}
                  {...shared}
                  type="monotone"
                  fill={team.color}
                  fillOpacity={dim ? 0.015 : 0.1}
                  baseValue={0}
                />
              )
            })}
          </ComposedChart>
        </ChartContainer>
      )}
    </section>
  )
}

export function RiskReturnChart({ report, focusedId }: Props) {
  const valid = report.teams.filter((t) => t.risk !== null && t.return !== null)
  return (
    <section
      aria-label="Risk and return"
      data-focused-team={focusedId ?? ''}
      className="min-w-0 p-[24px]"
    >
      <div className="mb-[24px] flex flex-wrap justify-between gap-[12px]">
        <h2 className={headingClass}>Risk and return</h2>
        <span className="text-player-muted text-[13px]">
          Up and to the left is better
        </span>
      </div>
      {valid.length ? (
        <ChartContainer
          config={configFor(report)}
          className="aspect-auto h-[300px] w-full"
        >
          <ScatterChart
            accessibilityLayer
            margin={{ top: 10, right: 30, bottom: 15, left: 0 }}
          >
            <CartesianGrid stroke="#eeeeee" />
            <XAxis
              {...axis}
              dataKey="risk"
              type="number"
              name="Volatility, annualised"
              domain={[0, 'auto']}
              tickFormatter={reportPercent}
            />
            <YAxis
              {...axis}
              dataKey="return"
              type="number"
              name="Return in scope"
              width={60}
              domain={[
                (min: number) => Math.min(0, min),
                (max: number) => Math.max(0, max),
              ]}
              tickFormatter={reportPercent}
            />
            <ReferenceLine y={0} stroke="#cccccc" />
            <ChartTooltip
              content={({ active, payload }) => {
                const team = payload?.[0]?.payload as
                  (typeof report.teams)[number] | undefined
                return active && team ? (
                  <div className="border-player-border rounded-[6px] border bg-white p-[12px] text-[13px] shadow-lg">
                    <strong>{team.name}</strong>
                    <p>Return {reportPercent(team.return)}</p>
                    <p>Annualised volatility {reportPercent(team.risk)}</p>
                  </div>
                ) : null
              }}
            />
            {valid.map((team) => (
              <Scatter
                key={team.id}
                name={team.name}
                data={[team]}
                fill={team.color}
                isAnimationActive={false}
                shape={({ cx, cy }: { cx?: number; cy?: number }) => (
                  <g opacity={focusedId && focusedId !== team.id ? 0.2 : 1}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={focusedId === team.id ? 7 : 5}
                      fill={team.color}
                    />
                    {focusedId === team.id && (
                      <text
                        x={(cx ?? 0) + 12}
                        y={(cy ?? 0) + 4}
                        fill={team.color}
                        fontSize={12}
                        fontWeight={700}
                      >
                        {team.name}
                      </text>
                    )}
                  </g>
                )}
              />
            ))}
          </ScatterChart>
        </ChartContainer>
      ) : (
        <ReportMessage>
          Not enough monthly results to compare risk and return.
        </ReportMessage>
      )}
      <div className="text-player-muted mt-[14px] flex justify-between gap-[12px] text-[12px]">
        <span>Return in scope, vertical</span>
        <span>Volatility, annualised</span>
      </div>
    </section>
  )
}

export function SharpeChart({ report, focusedId }: Props) {
  const values = report.teams.flatMap((t) =>
    t.sharpe === null ? [] : [t.sharpe]
  )
  const min = Math.min(0, ...values)
  const max = Math.max(0, ...values)
  const span = max - min || 1
  const origin = (-min / span) * 100
  return (
    <section
      aria-label="Sharpe ratio"
      data-focused-team={focusedId ?? ''}
      className="border-player-border min-w-0 border-t p-[24px] min-[1024px]:border-t-0 min-[1024px]:border-l"
    >
      <div className="mb-[20px] flex flex-wrap justify-between gap-[12px]">
        <h2 className={headingClass}>Sharpe ratio</h2>
        <span className="text-player-muted text-[13px]">
          Return per unit of risk
        </span>
      </div>
      <ol
        className="max-h-[368px] overflow-y-auto"
        tabIndex={0}
        aria-label="Team Sharpe ratios"
      >
        {report.sharpeRanking.map((team) => (
          <li
            key={team.id}
            data-team-id={team.id}
            data-focused={team.id === focusedId}
            className={cn(
              'grid min-h-[23px] grid-cols-[minmax(100px,1fr)_minmax(70px,1.5fr)_60px] items-center gap-[12px] text-[13px]',
              team.id === focusedId && 'text-player-primary font-bold'
            )}
          >
            <span className="flex min-w-0 items-center gap-[8px]">
              <TeamDot team={team} />
              <span className="truncate">{team.name}</span>
            </span>
            <span className="relative block h-[23px]" aria-hidden="true">
              <span
                className="border-player-divider absolute top-0 h-full border-l"
                style={{ left: `${origin}%` }}
              />
              {team.sharpe !== null && (
                <span
                  className="absolute top-[5px] h-[13px] rounded-[2px]"
                  style={{
                    left: `${((Math.min(0, team.sharpe) - min) / span) * 100}%`,
                    width: `${(Math.abs(team.sharpe) / span) * 100}%`,
                    background: team.color,
                    opacity: focusedId && focusedId !== team.id ? 0.18 : 1,
                  }}
                />
              )}
            </span>
            <span className="text-right tabular-nums">
              {team.risk !== null && team.risk <= 0.0001
                ? 'No risk'
                : (team.sharpe?.toFixed(2) ?? '—')}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
