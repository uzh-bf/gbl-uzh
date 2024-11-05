import { useRouter } from 'next/router'
import { useState } from 'react'

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@uzh-bf/design-system/dist/future'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts'

const colors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
]

import { composeChartData } from '~/lib/analysis'
import { NUM_MONTHS } from '~/lib/constants'

function ReportGame() {
  const router = useRouter()

  const [currPeriod, setCurrPeriod] = useState<number>(0)

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
  const initialCapital = previousSegmentResults[0].facts.initialCapital
  // console.log(
  //   'previousSegmentResults',
  //   JSON.stringify(previousSegmentResults, null, 4)
  // )
  console.log('previousSegmentResults', previousSegmentResults)
  console.log('numPeriods', numPeriods)
  console.log('game', game)

  const labels = [
    'Bank Benchmark',
    'Bonds Benchmark',
    'Stocks Benchmark',
    'Total Assets',
  ]

  const playerConfig = game.players.reduce((acc, player, ix) => {
    acc[player.name] = {
      label: player.name,
      color: colors[ix % colors.length],
    }
    return acc
  }, {})

  let totalDecisionAvg = [0, 0, 0]

  let dataPerPeriod = []
  for (let i = 0; i < numPeriods; i++) {
    const playerResPerPeriod = previousSegmentResults.filter(
      (result) => result.period.index === i
    )
    let dataPerPlayer = {}
    playerResPerPeriod.map((result) => {
      const decisions = Object.keys(result.facts.decisions).reduce((a, v) => {
        return { ...a, [v]: Number(result.facts.decisions[v]) }
      }, {})
      const totalAssetsTmp = result.facts.assetsWithReturns.map((a) => {
        return a.totalAssets
      })
      const accTotalAssetsReturnTmp = result.facts.assetsWithReturns.map(
        (a) => {
          return a.accTotalAssetsReturn ?? 0
        }
      )

      if (!dataPerPlayer[result.player.id]) {
        dataPerPlayer[result.player.id] = {
          decisions: [decisions],
          name: result.player.name,
          totalAssets: totalAssetsTmp,
          accTotalAssetsReturn: accTotalAssetsReturnTmp,
        }
      } else {
        dataPerPlayer[result.player.id].decisions.push(decisions)
        dataPerPlayer[result.player.id].totalAssets.push(
          ...totalAssetsTmp.filter((_, ix) => ix > 0)
        )
        dataPerPlayer[result.player.id].accTotalAssetsReturn.push(
          ...accTotalAssetsReturnTmp.filter((_, ix) => ix > 0)
        )
      }
    })
    dataPerPeriod.push(dataPerPlayer)
  }

  const dataTotalAssets = composeChartData(dataPerPeriod, 'totalAssets')
  const dataAccTotalAssetsReturn = composeChartData(
    dataPerPeriod,
    'accTotalAssetsReturn'
  )
  console.log('dataTotalAssets', dataTotalAssets)

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

  // console.log('segmentResultsPerPlayer', segmentResultsPerPlayer)
  // console.log('segmentResultPerPlayerAvg', segmentResultPerPlayerAvg)
  // console.log('totalDecisionAvg', totalDecisionAvg)

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
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <Card className="flex h-full w-full flex-col">
          <CardHeader>
            <CardTitle>Absolute performance</CardTitle>
            <CardDescription>Assets over time.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ChartContainer config={playerConfig} className="h-[300px] w-full">
              <LineChart data={dataTotalAssets} accessibilityLayer>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                  formatter={(value, name, item) => [
                    <div className="flex w-full items-center justify-between gap-x-2">
                      <div className="flex items-center gap-x-1">
                        <div
                          className="h-[8px] w-[8px] rounded-sm"
                          style={{ background: item.color }}
                        />
                        <span className="text-xs text-gray-600">{name}</span>
                      </div>
                      <span className="font-bold text-black">
                        {value.toFixed(2)}
                      </span>
                    </div>,
                  ]}
                />
                {Object.keys(playerConfig).map((key) => {
                  return (
                    <Line
                      key={key}
                      type="natural"
                      dataKey={key}
                      stroke={playerConfig[key].color}
                      dot={false}
                      strokeWidth={2}
                    />
                  )
                })}

                <ReferenceLine
                  y={initialCapital}
                  stroke="#666666"
                  strokeWidth={0.2}
                  label={{
                    value: initialCapital.toString(),
                    position: 'left',
                  }}
                />

                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="flex h-full w-full flex-col">
          <CardHeader>
            <CardTitle>Accumulated Total Return</CardTitle>
            {/* <CardDescription>Assets over time.</CardDescription> */}
            <Select
              onValueChange={(value) => setCurrPeriod(parseInt(value) - 1)}
              defaultValue="1"
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                {dataPerPeriod.map((_, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>
                    Period {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex-grow">
            <ChartContainer config={playerConfig} className="h-[300px] w-full">
              <AreaChart
                data={dataAccTotalAssetsReturn.slice(
                  currPeriod * NUM_MONTHS,
                  (currPeriod + 1) * NUM_MONTHS
                )}
                accessibilityLayer
              >
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                  formatter={(value, name, item) => [
                    <div className="flex w-full items-center justify-between gap-x-2">
                      <div className="flex items-center gap-x-1">
                        <div
                          className="h-[8px] w-[8px] rounded-sm"
                          style={{ background: item.color }}
                        />
                        <span className="text-xs text-gray-600">{name}</span>
                      </div>
                      <span className="font-bold text-black">
                        {(value * 100).toFixed(2)}%
                      </span>
                    </div>,
                  ]}
                />
                {Object.keys(playerConfig).map((key) => {
                  return (
                    <Area
                      key={key}
                      dataKey={key}
                      fill={playerConfig[key].color}
                      fillOpacity={0.4}
                      stroke={playerConfig[key].color}
                      type="natural"
                    />
                  )
                })}

                <ReferenceLine y={0} stroke="#000000" isFront={true} />

                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={(props) => {
                    const { x, y, payload } = props
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={0}
                          dy={4}
                          textAnchor="end"
                          fill={payload.value === 0 ? '#ff0000' : '#666'}
                          fontWeight={payload.value === 0 ? 'bold' : 'normal'}
                        >
                          {payload.value.toFixed(2) * 100}%
                        </text>
                      </g>
                    )
                  }}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="flex h-full w-full flex-col">
          <CardHeader>
            <CardTitle>Player Decisions</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    {game.players.map((player) => (
                      <TableHead key={player.id}>{player.name}</TableHead>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableHead></TableHead>
                    {game.players.map((player) => (
                      <TableHead key={player.id}>
                        <div className="flex justify-center gap-x-2">
                          <div>Bank</div>
                          <div>Bonds</div>
                          <div>Stocks</div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataPerPeriod.map((dataPerPlayer, periodIndex) => {
                    return (
                      <TableRow key={periodIndex}>
                        <TableCell className="align-top font-medium">
                          {Object.values(dataPerPlayer)[0]?.decisions.map(
                            (d, segmentIx) => {
                              return (
                                <div key={segmentIx} className="min-w-12 ">
                                  P{periodIndex + 1} S{segmentIx + 1}
                                </div>
                              )
                            }
                          )}
                        </TableCell>
                        {Object.values(dataPerPlayer).map((d) => {
                          const decisions = d.decisions

                          return (
                            <TableCell className="align-top font-medium">
                              {decisions.map((decision, segmentIx) => {
                                return (
                                  <div
                                    key={segmentIx}
                                    className="flex justify-around"
                                  >
                                    <div>{decision.bank}</div>
                                    <div>{decision.bonds}</div>
                                    <div>{decision.stocks}</div>
                                  </div>
                                )
                              })}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="flex h-full w-full flex-col">
          <CardHeader>
            <CardTitle>Avg Decisions</CardTitle>
            <CardDescription>Average decisions over players.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ChartContainer config={config} className="h-[300px] w-full">
              <BarChart data={dataAvg}>
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
    </div>
  )
}

export default ReportGame
