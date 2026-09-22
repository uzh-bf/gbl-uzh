import { cn } from '@gbl-uzh/ui'
import { ChartContainer } from '@uzh-bf/design-system'
import type { ReactNode } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ALLOCATION_KEYS } from '~/lib/allocation'
import { historyAmount, historyPercent } from '~/lib/history'
import {
  balanceMix,
  RESULT_MONTHS,
  type ResultBalance,
  type ResultView,
} from '~/lib/results'
import AllocationBar, { assetLabels } from './AllocationBar'

const inset = 'px-[16px] min-[601px]:px-[32px]'
const colors = {
  bank: 'var(--color-player-savings)',
  bonds: 'var(--color-player-bonds)',
  stocks: 'var(--color-player-stocks)',
  totalAssets: 'var(--color-player-primary)',
}
const benchmarkConfig = {
  totalAssets: { label: 'You', color: colors.totalAssets },
  bankBenchmark: { label: 'Savings', color: colors.bank },
  bondsBenchmark: { label: 'Bonds', color: colors.bonds },
  stocksBenchmark: { label: 'Stocks', color: colors.stocks },
}
const assetConfig = Object.fromEntries(
  ALLOCATION_KEYS.map((key) => [
    key,
    {
      label: assetLabels[key].name,
      color: colors[key],
    },
  ])
)
const returnConfig = {
  accumulatedReturn: { label: 'Accumulated return', color: colors.totalAssets },
}
const resultTone = (value: number | null) =>
  value === null || Math.abs(value) < 0.0000001
    ? 'text-player-muted'
    : value < 0
      ? 'text-player-error'
      : 'text-player-success'

function Section({
  title,
  detail,
  children,
  testId,
}: {
  title: string
  detail?: ReactNode
  children: ReactNode
  testId?: string
}) {
  return (
    <section
      className="border-player-border border-b py-[24px] min-[601px]:pt-[28px]"
      data-cy={testId}
    >
      <div
        className={cn(
          inset,
          'mb-[24px] flex flex-wrap items-baseline justify-between gap-x-[16px] gap-y-[6px]'
        )}
      >
        <h2 className="text-player-muted m-0 text-[15px] font-semibold tracking-[1px] uppercase min-[601px]:text-[22px]">
          {title}
        </h2>
        {detail && (
          <div className="text-player-muted text-[15px] min-[601px]:text-[22px]">
            {detail}
          </div>
        )}
      </div>
      {children}
    </section>
  )
}

function TotalAssets({
  view,
  label,
  change,
}: {
  view: ResultView
  label: string
  change: number | null
}) {
  return (
    <section
      data-cy="result-total"
      className={cn(
        inset,
        'border-player-border flex items-end justify-between gap-[12px] border-b py-[28px] min-[601px]:py-[32px]',
        view.status === 'CONSOLIDATION' &&
          'min-[601px]:min-h-[210px] min-[601px]:items-center'
      )}
    >
      <div className="min-w-0">
        <h2 className="text-player-muted m-0 mb-[10px] text-[15px] font-semibold tracking-[1px] uppercase min-[601px]:text-[22px]">
          Total assets
        </h2>
        <p className="m-0 text-[28px] leading-[1.2] font-bold tabular-nums min-[601px]:text-[48px]">
          {historyAmount(view.current.totalAssets)}{' '}
          <span className="whitespace-nowrap">CHF</span>
        </p>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-player-muted text-[15px] min-[601px]:text-[22px]">
          {label}
        </div>
        <p
          className={cn(
            'm-0 mt-[8px] text-[24px] leading-[1.2] font-bold tabular-nums min-[601px]:text-[36px]',
            resultTone(change)
          )}
        >
          {historyAmount(change, true)}
        </p>
      </div>
    </section>
  )
}

function BalanceRow({
  label,
  value,
  muted = false,
  held = false,
}: {
  label: string
  value: ResultBalance
  muted?: boolean
  held?: boolean
}) {
  const mix = balanceMix(value)
  return (
    <div
      className={cn(
        inset,
        'border-player-border grid min-h-[64px] grid-cols-[minmax(44px,0.6fr)_minmax(0,1.5fr)_minmax(92px,0.9fr)] items-center gap-[12px] border-b py-[16px] last:border-b-0 min-[601px]:min-h-[88px] min-[601px]:gap-[24px]',
        muted && 'opacity-45 min-[601px]:min-h-[64px]',
        held &&
          'min-[601px]:min-h-[96px] min-[601px]:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(92px,0.9fr)]'
      )}
    >
      <span
        className={cn(
          'text-[16px] min-[601px]:text-[26px]',
          !muted && 'font-semibold'
        )}
      >
        {label}
      </span>
      {mix ? (
        <div
          className="h-[14px] min-[601px]:h-[20px]"
          role="img"
          aria-label={ALLOCATION_KEYS.map(
            (key) => `${assetLabels[key].name} ${mix[key].toFixed(1)}%`
          ).join(', ')}
        >
          <AllocationBar compact value={mix} className="rounded-[6px]" />
        </div>
      ) : (
        <span className="text-player-muted text-center">—</span>
      )}
      <span
        className={cn(
          'text-right text-[17px] whitespace-nowrap tabular-nums min-[601px]:text-[28px]',
          !muted && 'font-semibold'
        )}
      >
        {historyAmount(value.totalAssets)}
      </span>
    </div>
  )
}

function AssetRows({ view }: { view: ResultView }) {
  const annual = view.status === 'RESULTS'
  const mix = balanceMix(view.current)
  return (
    <dl className="m-0" data-cy="result-assets">
      {ALLOCATION_KEYS.map((key) => (
        <div
          key={key}
          className={cn(
            inset,
            'border-player-border grid min-h-[70px] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-[16px] border-b py-[20px] min-[601px]:min-h-[100px] min-[601px]:gap-[40px]',
            !annual && 'min-[601px]:min-h-[106px]'
          )}
        >
          <dt className="flex items-center gap-[12px] text-[19px] font-bold min-[601px]:gap-[20px] min-[601px]:text-[30px]">
            <span
              className={cn(
                'size-[12px] shrink-0 rounded-[3px] min-[601px]:size-[20px]',
                assetLabels[key].color
              )}
            />
            {assetLabels[key].name}
          </dt>
          <dd
            className={cn(
              'm-0 text-[16px] tabular-nums min-[601px]:text-[24px]',
              annual ? resultTone(view.annualReturns[key]) : 'text-player-muted'
            )}
          >
            {annual
              ? historyPercent(view.annualReturns[key])
              : mix
                ? `${Number(mix[key].toFixed(1))}%`
                : '—'}
          </dd>
          <dd className="m-0 text-right text-[18px] font-semibold tabular-nums min-[601px]:text-[28px]">
            {historyAmount(view.current[key])}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Benchmarks({ view }: { view: ResultView }) {
  const held = view.status === 'CONSOLIDATION'
  return (
    <Section
      title="You against the benchmarks"
      detail={
        held
          ? `Unchanged since quarter ${view.quarter}`
          : `Jan – ${view.monthly.at(-1)?.label ?? '—'}, CHF`
      }
      testId="result-benchmarks"
    >
      <div className={inset}>
        <ChartContainer
          config={benchmarkConfig}
          className={cn(
            'aspect-auto h-[150px] w-full min-[601px]:h-[180px]',
            held && 'min-[601px]:h-[260px]'
          )}
        >
          <LineChart
            accessibilityLayer
            data={view.monthly}
            margin={{ top: 12, right: 16, left: 16, bottom: 8 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--color-player-border)"
            />
            <XAxis dataKey="label" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${historyAmount(value)} CHF`,
                benchmarkConfig[name]?.label ?? name,
              ]}
            />
            {Object.entries(benchmarkConfig).map(([key, config]) => (
              <Line
                key={key}
                dataKey={key}
                stroke={config.color}
                strokeWidth={key === 'totalAssets' ? 4 : 2.5}
                dot={
                  key === 'totalAssets'
                    ? (props) =>
                        props.index === view.monthly.length - 1 ? (
                          <circle
                            key={props.key}
                            cx={props.cx}
                            cy={props.cy}
                            r={6}
                            fill={config.color}
                          />
                        ) : (
                          <g key={props.key} />
                        )
                    : false
                }
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
        <div
          className="text-player-muted mt-[18px] flex flex-wrap gap-x-[24px] gap-y-[8px] text-[16px] min-[601px]:text-[22px]"
          aria-label="Benchmark legend"
        >
          {Object.entries(benchmarkConfig).map(([key, config]) => (
            <span className="flex items-center gap-[10px]" key={key}>
              <span
                className="h-[4px] w-[28px]"
                style={{ background: config.color }}
              />
              {config.label}
            </span>
          ))}
        </div>
        <div className="sr-only">
          <table>
            <caption>Monthly portfolio and benchmark balances in CHF</caption>
            <thead>
              <tr>
                <th>Month</th>
                {Object.values(benchmarkConfig).map((item) => (
                  <th key={item.label}>{item.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {view.monthly.map((sample) => (
                <tr key={sample.month}>
                  <th>{sample.label}</th>
                  {Object.keys(benchmarkConfig).map((key) => (
                    <td key={key}>
                      {historyAmount(
                        sample[key as keyof typeof benchmarkConfig]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  )
}

function MonthlyReturns({ view }: { view: ResultView }) {
  const bars = RESULT_MONTHS.map((label, month) => ({
    label,
    month,
    accumulatedReturn: view.monthly[month]?.accumulatedReturn ?? null,
  }))
  const currentMonths = new Set(
    view.quarterMonths.map((sample) => sample.month)
  )
  return (
    <Section
      title="Accumulated return by month"
      detail={
        <strong className={resultTone(view.accumulatedReturn)}>
          {historyPercent(view.accumulatedReturn)} since the{' '}
          {historyAmount(view.initialCapital)} start
        </strong>
      }
      testId="result-monthly-returns"
    >
      <div className={inset}>
        <ChartContainer
          config={returnConfig}
          className="aspect-auto h-[130px] w-full min-[601px]:h-[140px]"
        >
          <BarChart
            accessibilityLayer
            data={bars}
            margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            barCategoryGap="7%"
          >
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={({ x, y, payload }) => (
                <text
                  className="text-[13px] min-[601px]:text-[18px]"
                  x={x}
                  y={Number(y) + 16}
                  textAnchor="middle"
                  fill={
                    currentMonths.has(payload.index)
                      ? 'var(--color-player-text)'
                      : 'var(--color-player-muted)'
                  }
                  fontWeight={currentMonths.has(payload.index) ? 700 : 400}
                >
                  {payload.value[0]}
                </text>
              )}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <ReferenceLine y={0} stroke="var(--color-player-border)" />
            <Tooltip
              cursor={false}
              formatter={(value: number) => [
                historyPercent(value),
                'Since start',
              ]}
            />
            <Bar
              dataKey="accumulatedReturn"
              fill={colors.totalAssets}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            >
              {bars.map((bar) => (
                <Cell
                  key={bar.month}
                  fill={
                    bar.accumulatedReturn < 0
                      ? 'var(--color-player-error)'
                      : colors.totalAssets
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <ul className="sr-only" aria-label="Accumulated monthly returns">
          {bars.map((bar) => (
            <li key={bar.month}>
              {bar.label}: {historyPercent(bar.accumulatedReturn)}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

function QuarterResults({ view }: { view: ResultView }) {
  return (
    <div data-cy="quarter-results">
      <TotalAssets view={view} label="This quarter" change={view.quarterGain} />
      <Section title="Assets per month" detail="Mix · total CHF">
        <BalanceRow label={view.opening.label} value={view.opening} muted />
        {view.quarterMonths.map((sample) => (
          <BalanceRow key={sample.month} label={sample.label} value={sample} />
        ))}
        <div
          className={cn(
            inset,
            'text-player-muted mt-[20px] flex flex-wrap gap-x-[28px] gap-y-[8px] text-[15px] min-[601px]:text-[22px]'
          )}
        >
          {ALLOCATION_KEYS.map((key) => (
            <span key={key} className="flex items-center gap-[10px]">
              <span
                className={cn(
                  'size-[14px] rounded-[3px] min-[601px]:size-[18px]',
                  assetLabels[key].color
                )}
              />
              {assetLabels[key].name}{' '}
              {view.allocation ? `${view.allocation[key]}%` : '—'}
            </span>
          ))}
        </div>
      </Section>
      <Benchmarks view={view} />
      <MonthlyReturns view={view} />
    </div>
  )
}

function ConsolidationResults({ view }: { view: ResultView }) {
  return (
    <div data-cy="consolidation-results">
      <TotalAssets
        view={view}
        label="Change"
        change={view.consolidationChange}
      />
      <Section title="Assets held" detail="Carried over">
        <BalanceRow
          label={`Quarter ${view.quarter} close`}
          value={view.close}
          muted
          held
        />
        <BalanceRow label="Now" value={view.current} held />
      </Section>
      <AssetRows view={view} />
      <Benchmarks view={view} />
    </div>
  )
}

function YearResults({ view }: { view: ResultView }) {
  const accumulated = [
    { label: 'Start', accumulatedReturn: view.initialCapital > 0 ? 0 : null },
    ...view.years,
  ]
  return (
    <div data-cy="year-results">
      <TotalAssets view={view} label="This year" change={view.yearGain} />
      <Section
        title="Assets per year"
        detail="CHF"
        testId="result-yearly-assets"
      >
        <div
          className={cn(inset, 'relative overflow-x-auto')}
          role="region"
          aria-label="Assets by year"
          tabIndex={0}
        >
          <div style={{ minWidth: Math.max(260, view.years.length * 180) }}>
            <ChartContainer
              config={assetConfig}
              className="aspect-auto h-[250px] w-full min-[601px]:h-[290px]"
            >
              <BarChart
                accessibilityLayer
                data={view.years}
                margin={{ top: 44, right: 0, left: 0, bottom: 0 }}
                barCategoryGap="11%"
              >
                <XAxis dataKey="label" hide />
                <YAxis hide domain={[0, 'auto']} />
                <Tooltip
                  cursor={false}
                  formatter={(value: number, name: string) => [
                    `${historyAmount(value)} CHF`,
                    assetConfig[name]?.label ?? name,
                  ]}
                />
                {view.initialCapital !== null && (
                  <ReferenceLine
                    isFront
                    y={view.initialCapital}
                    stroke="var(--color-player-divider)"
                    strokeDasharray="6 6"
                    ifOverflow="extendDomain"
                    label={{
                      value: `${historyAmount(view.initialCapital)} start`,
                      position: 'insideTopRight',
                      dy: -20,
                      fill: 'var(--color-player-muted)',
                      fontSize: 14,
                    }}
                  />
                )}
                {ALLOCATION_KEYS.map((key) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="assets"
                    fill={colors[key]}
                    radius={key === 'stocks' ? [12, 12, 0, 0] : 0}
                    isAnimationActive={false}
                  >
                    {key === 'stocks' && (
                      <LabelList
                        dataKey="totalAssets"
                        position="top"
                        offset={16}
                        formatter={(value: number) => historyAmount(value)}
                        fill="var(--color-player-text)"
                        fontSize={20}
                        fontWeight={700}
                      />
                    )}
                  </Bar>
                ))}
              </BarChart>
            </ChartContainer>
            <div
              className="mt-[16px] grid gap-[16px] text-center text-[17px] min-[601px]:text-[22px]"
              style={{
                gridTemplateColumns: `repeat(${Math.max(1, view.years.length)}, minmax(0, 1fr))`,
              }}
            >
              {view.years.map((year) => (
                <div key={year.year}>
                  {year.year}{' '}
                  <strong className={resultTone(year.gain)}>
                    {historyAmount(year.gain, true)}
                  </strong>
                  <span className="sr-only">
                    ; total {historyAmount(year.totalAssets)} CHF
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
      <Section
        title="Accumulated return"
        detail={
          <strong
            className={cn(
              'text-[24px] min-[601px]:text-[30px]',
              resultTone(view.accumulatedReturn)
            )}
          >
            {historyPercent(view.accumulatedReturn)}
          </strong>
        }
        testId="result-yearly-returns"
      >
        <div
          className={cn(inset, 'relative overflow-x-auto')}
          role="region"
          aria-label="Accumulated return by year"
          tabIndex={0}
        >
          <div style={{ minWidth: Math.max(260, accumulated.length * 130) }}>
            <ChartContainer
              config={returnConfig}
              className="aspect-auto h-[160px] w-full min-[601px]:h-[174px]"
            >
              <AreaChart
                accessibilityLayer
                data={accumulated}
                margin={{ top: 16, right: 16, left: 16, bottom: 12 }}
              >
                <XAxis dataKey="label" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <ReferenceLine
                  y={0}
                  stroke="var(--color-player-divider)"
                  strokeDasharray="6 6"
                />
                <Tooltip
                  formatter={(value: number) => [
                    historyPercent(value),
                    'Since start',
                  ]}
                />
                <Area
                  dataKey="accumulatedReturn"
                  stroke={colors.totalAssets}
                  strokeWidth={4}
                  fill="var(--color-player-progress)"
                  fillOpacity={1}
                  baseValue={0}
                  isAnimationActive={false}
                  dot={(props) =>
                    props.index === 0 ? (
                      <g key={props.index} />
                    ) : (
                      <circle
                        key={props.index}
                        cx={props.cx}
                        cy={props.cy}
                        r={6}
                        stroke={colors.totalAssets}
                        strokeWidth={3}
                        fill={
                          props.index === accumulated.length - 1
                            ? colors.totalAssets
                            : 'white'
                        }
                      />
                    )
                  }
                />
              </AreaChart>
            </ChartContainer>
            <div className="text-player-muted mt-[16px] flex justify-between gap-[20px] text-[15px] min-[601px]:text-[20px]">
              {accumulated.map((point) => (
                <span key={point.label}>
                  {point.label} {historyPercent(point.accumulatedReturn)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>
      <AssetRows view={view} />
    </div>
  )
}

export default function ResultPanel({ view }: { view: ResultView | null }) {
  switch (view?.status) {
    case 'PAUSED':
      return <QuarterResults view={view} />
    case 'CONSOLIDATION':
      return <ConsolidationResults view={view} />
    case 'RESULTS':
      return <YearResults view={view} />
    default:
      return (
        <p className="text-player-muted p-[24px]">
          Results are not available yet.
        </p>
      )
  }
}
