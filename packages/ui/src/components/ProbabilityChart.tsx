import { useMemo, type ComponentType, type ReactNode } from 'react'
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
  highlightLabel,
}: {
  trendE: number
  trendGap: number
  totalEyes?: string
  variant?: 'default' | 'market'
  title?: string
  titleContent?: ReactNode
  highlightLabel?: ReactNode
}) {
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
    return (
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
          <div>
            <h2 className="m-0 text-[24px] font-bold min-[601px]:text-[30px]">
              {title}
            </h2>
            {titleContent && <div className="mt-[8px]">{titleContent}</div>}
          </div>
          <div className="grid grid-cols-3 items-baseline gap-x-[12px] text-[15px] text-[var(--color-player-muted,#707070)] min-[601px]:gap-x-[20px] min-[601px]:text-[20px]">
            <span>
              Expected{' '}
              <strong
                className={
                  trendE < 0
                    ? 'block text-[var(--color-player-error,#a51c14)] min-[601px]:inline'
                    : 'block text-[var(--color-player-success,#557018)] min-[601px]:inline'
                }
              >
                {signedPercent(trendE, 2)}
              </strong>
            </span>
            <span>
              Trend gap{' '}
              <strong className="block text-[var(--color-player-text,#151515)] min-[601px]:inline">
                {(trendGap * 100).toFixed(2)}%
              </strong>
            </span>
            <span>
              Volatility{' '}
              <strong className="block text-[var(--color-player-text,#151515)] min-[601px]:inline">
                {(vola * 100).toFixed(2)}%
              </strong>
            </span>
          </div>
        </div>
        <div
          className="mt-[20px]"
          role="region"
          aria-label={`${title} return probabilities`}
        >
          <svg
            viewBox="0 0 726 258"
            className="block w-full"
            role="img"
            aria-label={`${title}: bar height is probability; labels show return. ${totalEyes ? `Latest revealed total: ${totalEyes}.` : 'No roll revealed.'}`}
          >
            <line
              x1="0"
              x2="726"
              y1="211"
              y2="211"
              stroke="var(--color-player-border, #e9e9e9)"
            />
            {data.map((item, index) => {
              const selected = item.eyes === totalEyes
              const height = (item.prob / 0.1667) * 168
              const x = index * 66 + 7
              return (
                <g
                  key={item.eyes}
                  data-roll={item.eyes}
                  data-highlighted={selected}
                >
                  <title>{`Roll ${item.eyes}: ${(item.prob * 100).toFixed(2)}% probability, ${signedPercent(item.value)} return${selected ? ', latest revealed roll' : ''}`}</title>
                  <rect
                    x={x}
                    y={200 - height}
                    width="52"
                    height={height}
                    rx="8"
                    fill={
                      selected
                        ? 'var(--theme-color-primary, #0028a5)'
                        : 'var(--color-player-progress, #bfcaea)'
                    }
                  />
                  <text
                    x={x + 26}
                    y={188 - height}
                    textAnchor="middle"
                    fontSize="16"
                    className="max-[600px]:text-[22px]"
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
                    x={x + 26}
                    y="244"
                    textAnchor="middle"
                    fontSize="18"
                    className="max-[600px]:text-[22px]"
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
        {highlightLabel && (
          <p className="m-0 mt-[6px] text-[14px] text-[var(--color-player-muted,#707070)]">
            {highlightLabel}
          </p>
        )}
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
