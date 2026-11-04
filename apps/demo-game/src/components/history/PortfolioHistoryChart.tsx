import { ChartContainer } from '@uzh-bf/design-system'
import { useTranslations } from 'next-intl'
import { Bar, BarChart, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '~/i18n/Language'
import type { HistoryQuarter } from '~/lib/results'
import { useTabletLayout } from '~/lib/usePlayerLayout'

export default function PortfolioHistoryChart({
  quarters,
}: {
  quarters: HistoryQuarter[]
}) {
  const t = useTranslations()
  const { playerAmount } = useLanguage()
  const tablet = useTabletLayout()

  return (
    <>
      <div
        className="overflow-x-auto"
        role="region"
        aria-label={t('player.history.portfolioByQuarter')}
        tabIndex={0}
      >
        <div
          style={{
            width: tablet ? '100%' : quarters.length * 56,
            minWidth: tablet ? quarters.length * 44 : undefined,
          }}
        >
          <ChartContainer
            config={{
              value: {
                label: t('player.history.portfolioValue'),
                color: 'var(--color-player-primary)',
              },
            }}
            className="mobile:h-app-chart-history tablet:h-[260px] aspect-auto w-full"
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
                  fontSize: 'var(--history-axis-size, 16px)',
                }}
              />
              <YAxis hide domain={[0, 'dataMax']} />
              <Tooltip
                cursor={false}
                formatter={(value: number) => [
                  `${playerAmount(value)} CHF`,
                  t('player.history.portfolioValue'),
                ]}
              />
              <Bar
                dataKey="value"
                fill="var(--color-player-primary)"
                radius={[8, 8, 0, 0]}
                isAnimationActive={false}
                maxBarSize={tablet ? 56 : 28}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
      <ul className="sr-only" aria-label={t('player.history.quarterlyValues')}>
        {quarters.map((quarter) => (
          <li key={quarter.id}>
            {quarter.year} Q{quarter.quarter}: {playerAmount(quarter.value)} CHF
          </li>
        ))}
      </ul>
    </>
  )
}
