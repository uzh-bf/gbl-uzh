import { useId, useMemo, type ComponentType, type ReactNode } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Label,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
  type BarProps,
  type XAxisProps,
  type YAxisProps,
} from 'recharts'
import { probabilityDistribution, signedPercent } from '../lib/probability'
import { cn } from '../lib/utils'

// Recharts 2 declares legacy class components that are not JSX-compatible
// with React 19's types, despite the runtime's React 19 peer support.
const CompatibleBar = Bar as unknown as ComponentType<BarProps>
const CompatibleXAxis = XAxis as unknown as ComponentType<XAxisProps>
const CompatibleYAxis = YAxis as unknown as ComponentType<YAxisProps>

function ProbabilityChart({
  trendE,
  trendGap,
  totalEyes,
  variant = 'default',
  title,
  titleContent,
  month,
  monthLabel,
  compact = false,
  fixedHeight,
  monthlyHighlights,
}: {
  trendE: number
  trendGap: number
  totalEyes?: string
  variant?: 'default' | 'market'
  title?: string
  titleContent?: ReactNode
  month?: number
  monthLabel?: string
  compact?: boolean
  /** Market-only: distribute bars horizontally without scaling height or text. */
  fixedHeight?: number
  monthlyHighlights?: { totalEyes: string; label: string; color: string }[]
}) {
  const chartId = useId().replace(/:/g, '')
  const { data, vola } = useMemo(() => {
    const { data, volatility } = probabilityDistribution(trendE, trendGap)
    return {
      data: data.map((item) => ({
        ...item,
        change: `${(item.value * 100).toFixed(1)}%`,
      })),
      vola: volatility,
    }
  }, [trendE, trendGap])

  if (variant === 'market') {
    const revealDescription = monthlyHighlights
      ? monthlyHighlights
          .map((item) => `${item.label}: ${item.totalEyes}`)
          .join('. ') || 'No roll revealed.'
      : totalEyes
        ? `Latest revealed total: ${totalEyes}.`
        : 'No roll revealed.'
    const barStep = compact ? 40 : 66
    const barWidth = compact ? 30 : 52
    const chartWidth = data.length * barStep
    const fixedSize = fixedHeight !== undefined
    const verticalScale = fixedSize ? fixedHeight / 258 : 1
    const horizontal = (value: number) =>
      fixedSize ? `${(value / chartWidth) * 100}%` : value
    const returnLabelSize = fixedSize
      ? 14
      : compact
        ? 18
        : 'var(--market-chart-label-size,16px)'
    const rollLabelSize = fixedSize
      ? 16
      : compact
        ? 20
        : 'var(--market-chart-label-size,18px)'
    const labelClass =
      !fixedSize && !compact ? 'max-[600px]:text-[22px]' : undefined
    const metricClass = cn(
      'block',
      !compact && 'min-[601px]:[display:var(--market-value-display,inline)]'
    )
    return (
      <div>
        <div
          className={cn(
            'flex flex-wrap items-baseline gap-[8px]',
            compact ? 'justify-center text-center' : 'justify-between'
          )}
        >
          <div>
            <h2
              className={
                compact
                  ? 'm-0 text-[20px] leading-[1.25] font-bold'
                  : 'm-0 text-[length:var(--market-heading-size,24px)] leading-[var(--market-heading-leading,inherit)] font-bold min-[601px]:text-[length:var(--market-heading-size,30px)]'
              }
            >
              {title}
            </h2>
            {titleContent && (
              <div className={cn('mt-[8px]', compact && 'flex justify-center')}>
                {titleContent}
              </div>
            )}
          </div>
          <div
            className={
              compact
                ? 'grid grid-cols-3 items-baseline gap-x-[8px] text-[14px] leading-[1.4] text-[var(--color-player-muted,#707070)]'
                : 'grid grid-cols-3 items-baseline gap-x-[12px] text-[length:var(--market-metric-size,15px)] leading-[var(--market-metric-leading,inherit)] text-[var(--color-player-muted,#707070)] min-[601px]:gap-x-[var(--market-metric-gap,20px)] min-[601px]:text-[length:var(--market-metric-size,20px)]'
            }
          >
            <span>
              Expected{' '}
              <strong
                className={cn(
                  metricClass,
                  trendE < 0
                    ? 'text-[var(--color-player-error,#a51c14)]'
                    : 'text-[var(--color-player-success,#557018)]'
                )}
              >
                {signedPercent(trendE, 2)}
              </strong>
              {(monthLabel !== undefined || month !== undefined) && (
                <span
                  className={
                    compact
                      ? 'mt-[4px] block text-[12px]'
                      : 'mt-[4px] block text-[14px] min-[601px]:text-[length:var(--market-month-size,16px)]'
                  }
                >
                  {monthLabel ?? `Month ${month}`}
                </span>
              )}
            </span>
            <span>
              Trend gap{' '}
              <strong
                className={cn(
                  metricClass,
                  'text-[var(--color-player-text,#151515)]'
                )}
              >
                {(trendGap * 100).toFixed(2)}%
              </strong>
            </span>
            <span>
              Volatility{' '}
              <strong
                className={cn(
                  metricClass,
                  'text-[var(--color-player-text,#151515)]'
                )}
              >
                {(vola * 100).toFixed(2)}%
              </strong>
            </span>
          </div>
        </div>
        <div
          className="mt-[var(--market-chart-gap,20px)]"
          role="region"
          aria-label={`${title} return probabilities`}
        >
          <svg
            viewBox={fixedSize ? undefined : `0 0 ${chartWidth} 258`}
            height={fixedHeight}
            className="block w-full"
            role="img"
            aria-label={`${title}: bar height is probability; labels show return. ${revealDescription}`}
          >
            <line
              x1="0"
              x2={horizontal(chartWidth)}
              y1={211 * verticalScale}
              y2={211 * verticalScale}
              stroke="var(--color-player-border, #e9e9e9)"
            />
            {data.map((item, index) => {
              const highlights =
                monthlyHighlights?.filter(
                  (highlight) => highlight.totalEyes === item.eyes
                ) ?? []
              const selected = monthlyHighlights
                ? highlights.length > 0
                : item.eyes === totalEyes
              const height = (item.prob / 0.1667) * 168
              const x = index * barStep + (barStep - barWidth) / 2
              // Fixed-size edge labels need room for signed multi-digit returns.
              const firstLabel = fixedSize && index === 0
              const lastLabel = fixedSize && index === data.length - 1
              return (
                <g
                  key={item.eyes}
                  data-roll={item.eyes}
                  data-highlighted={selected}
                >
                  <title>{`Roll ${item.eyes}: ${(item.prob * 100).toFixed(2)}% probability, ${signedPercent(item.value)} return${highlights.length ? `, ${highlights.map((highlight) => highlight.label).join(', ')}` : selected ? ', latest revealed roll' : ''}`}</title>
                  {highlights.length > 0 && (
                    <defs>
                      <linearGradient
                        id={`${chartId}-roll-${item.eyes}`}
                        x1="0"
                        x2="1"
                        y1="0"
                        y2="0"
                      >
                        {highlights.flatMap((highlight, highlightIndex) => [
                          <stop
                            key={`${highlightIndex}-start`}
                            offset={`${(highlightIndex / highlights.length) * 100}%`}
                            stopColor={highlight.color}
                            stopOpacity={0.7}
                          />,
                          <stop
                            key={`${highlightIndex}-end`}
                            offset={`${((highlightIndex + 1) / highlights.length) * 100}%`}
                            stopColor={highlight.color}
                            stopOpacity={0.7}
                          />,
                        ])}
                      </linearGradient>
                    </defs>
                  )}
                  <rect
                    x={horizontal(x)}
                    y={(200 - height) * verticalScale}
                    width={horizontal(barWidth)}
                    height={height * verticalScale}
                    rx={8 * verticalScale}
                    fill={
                      highlights.length
                        ? `url(#${chartId}-roll-${item.eyes})`
                        : selected
                          ? 'var(--theme-color-primary, #0028a5)'
                          : 'var(--color-player-progress, #bfcaea)'
                    }
                  />
                  <text
                    x={horizontal(
                      firstLabel
                        ? x
                        : lastLabel
                          ? x + barWidth
                          : x + barWidth / 2
                    )}
                    y={(188 - height) * verticalScale}
                    textAnchor={
                      firstLabel ? 'start' : lastLabel ? 'end' : 'middle'
                    }
                    fontSize={returnLabelSize}
                    className={labelClass}
                    fontWeight={selected ? 700 : 400}
                    fill={
                      selected
                        ? 'var(--theme-color-primary, #0028a5)'
                        : 'var(--color-player-muted, #707070)'
                    }
                  >
                    {signedPercent(item.value).replace('%', '')}
                  </text>
                  <text
                    x={horizontal(x + barWidth / 2)}
                    y={244 * verticalScale}
                    textAnchor="middle"
                    fontSize={rollLabelSize}
                    className={labelClass}
                    fontWeight={selected ? 700 : 400}
                    fill={
                      selected
                        ? 'var(--theme-color-primary, #0028a5)'
                        : 'var(--color-player-muted, #707070)'
                    }
                  >
                    {item.eyes}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-row gap-4 px-2 py-1 text-sm">
        <div>Expectation: {(trendE * 100).toFixed(2)}%</div>
        <div>Trend Gap: {(trendGap * 100).toFixed(2)}%</div>
        <div>Volatility: {(vola * 100).toFixed(2)}%</div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          margin={{ left: 15, bottom: 15, top: 30, right: 15 }}
        >
          <CompatibleXAxis dataKey="eyes">
            <Label value="Dice Roll" position="bottom" offset={0} />
          </CompatibleXAxis>
          <CompatibleYAxis
            dataKey="prob"
            tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
          >
            <Label value="Probability" angle={-90} position="left" offset={0} />
          </CompatibleYAxis>
          <CompatibleBar dataKey="prob">
            <LabelList
              dataKey="change"
              position="top"
              offset={10}
              fontSize={14}
              angle={0}
            />

            {data.map((entry, index) => (
              <Cell
                fill={entry.eyes == totalEyes ? '#dc6027' : 'grey'}
                key={`cell-${index}`}
              ></Cell>
            ))}
          </CompatibleBar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { ProbabilityChart }
