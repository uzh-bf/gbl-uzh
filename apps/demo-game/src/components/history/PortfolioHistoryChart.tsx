import { ChartContainer } from '@uzh-bf/design-system'
import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts'
import { historyAmount, type HistoryQuarter } from '~/lib/history'

export default function PortfolioHistoryChart({
  quarters,
}: {
  quarters: HistoryQuarter[]
}) {
  return (
    <>
      <div
        className="overflow-x-auto"
        role="region"
        aria-label="Portfolio value by quarter"
        tabIndex={0}
      >
        <div
          style={{
            minWidth: Math.max(280, quarters.length * 88),
          }}
        >
          <ChartContainer
            config={{
              value: {
                label: 'Portfolio value',
                color: 'var(--color-player-primary)',
              },
            }}
            className="aspect-auto h-[260px] w-full min-[601px]:h-[300px]"
          >
            <BarChart
              accessibilityLayer
              data={quarters}
              margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
              barCategoryGap="7%"
            >
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: 'var(--color-player-border)' }}
                interval={0}
                height={42}
                tickMargin={14}
                tick={{
                  fill: 'var(--color-player-muted)',
                  fontSize: 16,
                }}
              />
              <YAxis hide domain={[0, 'dataMax']} />
              <Tooltip
                cursor={false}
                formatter={(value: number) => [
                  `${historyAmount(value)} CHF`,
                  'Portfolio value',
                ]}
              />
              <Bar
                dataKey="value"
                fill="var(--color-player-primary)"
                radius={[8, 8, 0, 0]}
                isAnimationActive={false}
                maxBarSize={100}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
      <ul className="sr-only" aria-label="Quarterly portfolio values">
        {quarters.map((quarter) => (
          <li key={quarter.id}>
            {quarter.year} Q{quarter.quarter}: {historyAmount(quarter.value)}{' '}
            CHF
          </li>
        ))}
      </ul>
    </>
  )
}
