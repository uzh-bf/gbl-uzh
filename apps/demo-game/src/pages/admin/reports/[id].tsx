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

const colors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
]

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const numMonths = months.length
const numMonthsPerSegment = 4

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

  const numPeriods = game.periods.length
  // const numPeriodsVis = numPeriods - 1
  const previousSegmentResults = segmentEndResults.specificResults
  console.log('previousSegmentResults', previousSegmentResults)
  console.log('numPeriods', numPeriods)
  console.log('game', game)

  const labels = [
    'Bank Benchmark',
    'Bonds Benchmark',
    'Stocks Benchmark',
    'Total Assets',
  ]

  const configAbsolute = {
    bankBenchmark: { label: labels[0], color: colors[0] },
    bondsBenchmark: { label: labels[1], color: colors[1] },
    stocksBenchmark: { label: labels[2], color: colors[2] },
    totalAssets: { label: labels[3], color: colors[3] },
  }

  const configAccReturn = {
    accBankBenchmarkReturn: { label: labels[0], color: colors[0] },
    accBondsBenchmarkReturn: { label: labels[1], color: colors[1] },
    accStocksBenchmarkReturn: { label: labels[2], color: colors[2] },
    accTotalAssetsReturn: { label: labels[3], color: colors[3] },
  }

  let totalDecisionAvg = [0, 0, 0]

  let dataPerPeriod = []
  for (let i = 0; i < numPeriods; i++) {
    const playerResPerPeriod = previousSegmentResults.filter(
      (result) => result.period.index === i
    )
    let pp = {}
    playerResPerPeriod.map((result) => {
      if (!pp[result.player.id]) {
        pp[result.player.id] = {
          decisions: [],
          name: result.player.name,
          totalAssets: [],
        }
      }
      const decisions = Object.keys(result.facts.decisions).reduce((a, v) => {
        return { ...a, [v]: Number(result.facts.decisions[v]) }
      }, {})
      pp[result.player.id].decisions.push(decisions)
      pp[result.player.id].totalAssets.push(
        result.facts.assetsWithReturns
          .filter((a, _, arr) => a.ix === arr.length - 1)
          .map((a) => {
            return a.totalAssets
          })[0]
      )
    })
    dataPerPeriod.push(pp)
    console.log('playerResPerPeriod', playerResPerPeriod)

    console.log('pp', pp)
  }
  console.log('dataPerPeriod', dataPerPeriod)

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

  const config = {
    bank: { label: labels[0], color: colors[0] },
    bonds: { label: labels[1], color: colors[1] },
    stocks: { label: labels[2], color: colors[2] },
  }

  return (
    <div className="p-4">
      {dataPerPeriod.map((dataPerPlayer, ix) => {
        const bla = Object.values(dataPerPlayer).map((data, ix) => {
          const name = data.name
          const decisions = data.decisions.map((d) => {
            return (
              <div className="flex flex-col">
                <div className="flex gap-2">
                  <div>Bank</div>
                  <div>Bonds</div>
                  <div>Stocks</div>
                </div>
                <div className="flex border border-black">
                  <div>{d.bank}</div>
                  <div>{d.bonds}</div>
                  <div>{d.stocks}</div>
                </div>
              </div>
            )
          })
          return (
            <div>
              <div>{name}</div>
              <div className="flex w-full gap-2">{decisions}</div>
            </div>
          )
        })
        return (
          <div>
            <div>Period {ix + 1}</div>
            <div>
              {bla}
              {/* {data.map((player, ix) => {
                return (
                  <div>
                    <div>{player.name}</div>
                    <div>Decisions: {player.decisions}</div>
                    <div>Total Assets: {player.totalAssets}</div>
                  </div>
                )
              })} */}
            </div>
          </div>
        )
      })}

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
