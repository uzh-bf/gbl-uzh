import { useRouter } from 'next/router'

import { useQuery } from '@apollo/client'
import {
  Game,
  GameDocument,
  SpecificResultsDocument,
} from 'src/graphql/generated/ops'

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
} from '@uzh-bf/design-system/dist/future'

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

function ReportGame() {
  const router = useRouter()

  const { data, error, loading } = useQuery(GameDocument, {
    variables: { id: Number(router.query.id) },
    // pollInterval: 15000,
    skip: !router.query.id,
  })

  const {
    data: segmentEndResults,
    loading: segmentEndResultsLoading,
    error: segmentEndResultsError,
  } = useQuery(SpecificResultsDocument, {
    variables: {
      gameId: Number(router.query.id),
      type: 'SEGMENT_END',
    },
    // pollInterval: 15000,
    fetchPolicy: 'cache-first',
  })

  if (loading || segmentEndResultsLoading || !data?.game) {
    return <div>loading...</div>
  }

  if (error) {
    return <div>{error.message}</div>
  }
  if (segmentEndResultsError) {
    return <div>{segmentEndResultsError.message}</div>
  }

  const game: Game = data.game

  console.log('segmentEndResults', segmentEndResults.specificResults)
  let totalDecisionAvg = [0, 0, 0]

  const segmentResultsPerPlayer = game.players.map((player) => {
    return segmentEndResults.specificResults
      .filter((result) => result.player.id === player.id)
      .map((result) => {
        return Object.values(result.facts.decisions).map((decision, _, arr) => {
          return Number(decision) / arr.length
        })
      })
  })
  const segmentResultPerPlayerAvg = segmentResultsPerPlayer.map((arr) => {
    return arr.reduce((acc, val, ix) => {
      val.map((v, i) => (acc[i] += v / arr.length))
      return acc
    }, Array(arr[0].length).fill(0))
  })

  totalDecisionAvg = segmentResultPerPlayerAvg.reduce((acc, val) => {
    val.map((v, i) => (acc[i] += v / segmentResultPerPlayerAvg.length))
    return acc
  }, Array(segmentResultPerPlayerAvg[0].length).fill(0))

  console.log('segmentResultsPerPlayer', segmentResultsPerPlayer)
  console.log('segmentResultPerPlayerAvg', segmentResultPerPlayerAvg)
  console.log('totalDecisionAvg', totalDecisionAvg)

  // const dataAvg = [
  //   {
  //     bank: totalDecisionAvg[0],
  //     bonds: totalDecisionAvg[1],
  //     stocks: totalDecisionAvg[2],
  //   },
  // ]
  const dataAvg = [
    {
      bank: totalDecisionAvg[0],
    },
    {
      bonds: totalDecisionAvg[1],
    },
    {
      stocks: totalDecisionAvg[2],
    },
  ]

  const labels = ['Bank', 'Bonds', 'Stocks']
  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
  ]
  const config = {
    bank: { label: labels[0], color: colors[0] },
    bonds: { label: labels[1], color: colors[1] },
    stocks: { label: labels[2], color: colors[2] },
  }

  return (
    <div className="p-4">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Avg Decisions</CardTitle>
          <CardDescription>Average decisions over players.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={config}>
            <BarChart data={dataAvg}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
                        formatter={(v) => `${v.toFixed(2) * 100}%`}
                      />
                    )}
                  </Bar>
                )
              })}
              {/* {Object.keys(config).map((key, ix, arr) => {
                segmentResultPerPlayerAvg.map((result) => {
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
                          formatter={(v) => `${v.toFixed(2) * 100}%`}
                        />
                      )}
                    </Bar>
                  )
                })
              })} */}
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
                tickFormatter={(v) => `${v.toFixed(2) * 100}%`}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReportGame
