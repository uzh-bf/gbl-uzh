import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@uzh-bf/design-system'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from 'recharts'

import GameLayout from '~/components/GameLayout'
import { getFacts, getFactsArray, type FactMap } from '~/lib/facts'
import { colors } from './chartColors'
import GameHeader from './GameHeader'

function ResultsView({ currentGame, playerDataResult }) {
  const previousPeriodResults = playerDataResult.previousResults.filter(
    (o) => o.type == 'PERIOD_END'
  )

  const assets = previousPeriodResults.map((e, ix) => {
    const facts = getFacts(e.facts)
    const periodAssets = getFacts(facts.assets)
    return {
      ...periodAssets,
      period: 'Period ' + (ix + 1),
    }
  })

  const assetsWithReturns = previousPeriodResults.map((e) =>
    getFactsArray((e.facts as FactMap).assetsWithReturns)
  )

  const lastAssets = assetsWithReturns.map((e, ix) => {
    return {
      ...((e as Array<FactMap>)[e.length - 1] ?? {}),
      period: 'Period ' + (ix + 1),
    }
  })

  const labels = ['Savings', 'Bonds', 'Stocks']

  const config = {
    bank: { label: labels[0], color: colors[0] },
    bonds: { label: labels[1], color: colors[1] },
    stocks: { label: labels[2], color: colors[2] },
  }

  const configAccReturn = {
    accTotalAssetsReturn: { label: 'Total Assets', color: colors[3] },
  }

  return (
    <GameLayout>
      <div className="w-full">
        <GameHeader currentGame={currentGame} />
        <div className="mt-4 flex w-full flex-row gap-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Total Assets</CardTitle>
              <CardDescription>Assets over periods.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={config}>
                <BarChart data={assets}>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  {Object.keys(config).map((key, ix, arr) => {
                    return (
                      <Bar
                        key={key}
                        stackId="1"
                        dataKey={key}
                        fill={config[key].color}
                        radius={4}
                      >
                        {ix === arr.length - 1 && (
                          <LabelList
                            position="top"
                            offset={12}
                            className="fill-foreground"
                            fontSize={12}
                            formatter={(v) => `${v.toFixed(2)}`}
                          />
                        )}
                      </Bar>
                    )
                  })}
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Total Accumulated Returns</CardTitle>
              <CardDescription>
                Total accumulated returns with respect to initial capital over
                time (per period).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={configAccReturn}>
                <AreaChart data={lastAssets} accessibilityLayer>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  {Object.keys(configAccReturn).map((key) => {
                    return (
                      <Area
                        key={key}
                        dataKey={key}
                        fill={configAccReturn[key].color}
                        fillOpacity={0.4}
                        stroke={configAccReturn[key].color}
                        type="natural"
                      />
                    )
                  })}
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(v) => `${(v * 100).toFixed(2)}%`}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </GameLayout>
  )
}

export default ResultsView
