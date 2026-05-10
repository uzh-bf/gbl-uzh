import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'

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
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from 'recharts'

import { composeChartData, type ReportPlayerResult } from '~/lib/analysis'
import { NUM_MONTHS } from '~/lib/constants'
import { trpc } from '~/lib/trpc'
import type { RouterOutputs } from '~/server/trpc/router'

const colors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
]

const labels = ['Savings', 'Bonds', 'Stocks', 'Total Assets']
type ReportGame = NonNullable<RouterOutputs['game']['byId']>
type ReportSpecificResult = ReportPlayerResult
type ReportSpecificResultList = ReportSpecificResult[]

const config = {
  bank: { label: labels[0], color: colors[0] },
  bonds: { label: labels[1], color: colors[1] },
  stocks: { label: labels[2], color: colors[2] },
}

type DecisionFacts = {
  bank: number
  bonds: number
  stocks: number
}

type PlayerPeriodData = {
  decisions: DecisionFacts[]
  name: string
  totalAssets: number[]
  accTotalAssetsReturn: number[]
  risk?: number
  totalAssetsReturnsPA?: number
}

type RiskReturnPlayerData = {
  name: string
  risk: number
  totalAssetsReturnsPA: number
}

function ReportGame() {
  const router = useRouter()
  const gameId = Number(router.query.id)
  const hasGameId = Number.isFinite(gameId)

  const [currPeriod, setCurrPeriod] = useState<number>(0)

  const {
    data: reportGameData,
    error: gameError,
    isLoading: gameLoading,
  } = trpc.game.byId.useQuery(
    { id: hasGameId ? gameId : 0 },
    {
      enabled: hasGameId,
    }
  )

  const {
    data: segmentEndResults = [],
    isLoading: segmentEndResultsLoading,
    error: segmentEndResultsError,
  } = trpc.results.specific.useQuery(
    {
      gameId: hasGameId ? gameId : 0,
      type: 'SEGMENT_END',
    },
    {
      enabled: hasGameId,
    }
  )

  const {
    data: periodEndResults = [],
    isLoading: periodEndResultsLoading,
    error: periodEndResultsError,
  } = trpc.results.specific.useQuery(
    {
      gameId: hasGameId ? gameId : 0,
      type: 'PERIOD_END',
    },
    {
      enabled: hasGameId,
    }
  )

  const reportGame = reportGameData as ReportGame | undefined
  const reportSegmentEndResults =
    segmentEndResults as unknown as ReportSpecificResultList
  const reportPeriodEndResults =
    periodEndResults as unknown as ReportSpecificResultList

  const memoizedData = useMemo(() => {
    if (
      gameLoading ||
      segmentEndResultsLoading ||
      gameError ||
      segmentEndResultsError ||
      !reportGame ||
      !reportSegmentEndResults
    ) {
      return null
    }

    const currentGame = reportGame

    const numPeriods = currentGame.periods.length
    // const numPeriodsVis = numPeriods - 1
    const previousSegmentResults = reportSegmentEndResults
    const initialCapital = previousSegmentResults[0].facts.initialCapital
    // console.log(
    //   'previousSegmentResults',
    //   JSON.stringify(previousSegmentResults, null, 4)
    // )

    const playerConfig = currentGame.players.reduce((acc, player, ix) => {
      acc[player.name] = {
        label: player.name,
        color: colors[ix % colors.length],
      }
      return acc
    }, {})

    const computeDataPerPeriod = () => {
      if (!previousSegmentResults || previousSegmentResults.length === 0)
        return []
      const output: Record<string, PlayerPeriodData>[] = []
      for (let i = 0; i < numPeriods; i++) {
        const playerResPerPeriod = previousSegmentResults.filter(
          (result) => result.period.index === i
        )
        const dataPerPlayer: Record<string, PlayerPeriodData> = {}
        playerResPerPeriod.map((result) => {
          const decisions = {} as DecisionFacts
          Object.keys(result.facts.decisions).forEach((v) => {
            decisions[v] = Number(result.facts.decisions[v])
          })

          const assetsWithReturns = result.facts.assetsWithReturns ?? []
          const totalAssetsTmp = assetsWithReturns
            .filter((_, ix) => ix > 0)
            .map((a) => a.totalAssets)
          const accTotalAssetsReturnTmp = assetsWithReturns
            .filter((_, ix) => ix > 0)
            .map((a) => a.accTotalAssetsReturn)

          if (!dataPerPlayer[result.player.id]) {
            dataPerPlayer[result.player.id] = {
              decisions: [decisions],
              name: result.player.name,
              totalAssets: [...totalAssetsTmp],
              accTotalAssetsReturn: [...accTotalAssetsReturnTmp],
              risk: result.facts.risk,
              totalAssetsReturnsPA: result.facts.totalAssetsReturnsPA,
            }
          } else {
            dataPerPlayer[result.player.id].decisions.push(decisions)
            dataPerPlayer[result.player.id].totalAssets.push(...totalAssetsTmp)
            dataPerPlayer[result.player.id].accTotalAssetsReturn.push(
              ...accTotalAssetsReturnTmp
            )
            if (result.facts.risk) {
              dataPerPlayer[result.player.id].risk = result.facts.risk
            }
            if (result.facts.totalAssetsReturnsPA) {
              dataPerPlayer[result.player.id].totalAssetsReturnsPA =
                result.facts.totalAssetsReturnsPA
            }
          }
        })
        output.push(dataPerPlayer)
      }
      return output
    }

    const dataPerPeriod = computeDataPerPeriod()
    const dataTotalAssets = composeChartData(dataPerPeriod, 'totalAssets')
    const dataAccTotalAssetsReturn = composeChartData(
      dataPerPeriod,
      'accTotalAssetsReturn'
    )

    const segmentResultsPerPlayer = currentGame.players.map((player) => {
      return previousSegmentResults
        .filter((result) => result.player.id === player.id)
        .map((result) => {
          const decisionsToNumbers = Object.values(result.facts.decisions).map(
            (decision) => Number(decision)
          )
          const weight =
            1 / decisionsToNumbers.reduce((acc, decision) => acc + decision, 0)
          return decisionsToNumbers.map((decision) => decision * weight)
        })
    })

    const segmentResultPerPlayerAvg = segmentResultsPerPlayer.map((arr) => {
      const result = Array(arr[0].length).fill(0)
      arr.forEach((val) => {
        val.forEach((v, i) => {
          result[i] += v / arr.length
        })
      })
      return result
    })

    const computeTotalDecisionAvg = () => {
      const result = Array(segmentResultPerPlayerAvg[0].length).fill(0)
      segmentResultPerPlayerAvg.forEach((val) => {
        val.forEach((v, i) => {
          result[i] += v / segmentResultPerPlayerAvg.length
        })
      })
      return result
    }
    const totalDecisionAvg = computeTotalDecisionAvg()

    return {
      game: currentGame,
      playerConfig,
      initialCapital,
      dataPerPeriod,
      dataTotalAssets,
      dataAccTotalAssetsReturn,
      totalDecisionAvg,
    }
  }, [
    reportGame,
    gameLoading,
    gameError,
    reportSegmentEndResults,
    segmentEndResultsLoading,
    segmentEndResultsError,
  ])

  const memoizedDataPeriod = useMemo(() => {
    if (
      periodEndResultsLoading ||
      periodEndResultsError ||
      !reportPeriodEndResults
    ) {
      return null
    }

    const previousPeriodResults = reportPeriodEndResults

    if (previousPeriodResults.length === 0) {
      return {
        riskReturnPerPeriod: [],
        sharpeRatioPerPeriod: [],
        configSharpeRatio: {},
      }
    }

    const riskReturnPerPeriod = previousPeriodResults.reduce<
      Record<string, RiskReturnPlayerData>[]
    >((acc, result) => {
      if (!acc[result.period.index]) {
        acc[result.period.index] = {
          [result.player.id]: {
            name: result.player.name,
            risk: result.facts.risk,
            totalAssetsReturnsPA: result.facts.totalAssetsReturnsPA,
          },
        }
      } else {
        acc[result.period.index][result.player.id] = {
          name: result.player.name,
          risk: result.facts.risk,
          totalAssetsReturnsPA: result.facts.totalAssetsReturnsPA,
        }
      }
      return acc
    }, [])

    const sharpeRatioPerPeriod = previousPeriodResults.reduce((acc, result) => {
      acc[result.period.index] = {
        ...acc[result.period.index],
        period: result.period.index + 1,
        [result.player.name + '-sharpeRatio']: result.facts.sharpeRatio,
      }
      return acc
    }, [])

    const configSharpeRatio = Object.keys(sharpeRatioPerPeriod[0] ?? {}).reduce(
      (acc, item) => {
        if (item.endsWith('sharpeRatio')) {
          acc[item] = {
            label: item.replace('-sharpeRatio', ''),
          }
        }
        return acc
      },
      {}
    )

    return { riskReturnPerPeriod, sharpeRatioPerPeriod, configSharpeRatio }
  }, [reportPeriodEndResults, periodEndResultsLoading, periodEndResultsError])

  if (
    gameLoading ||
    segmentEndResultsLoading ||
    periodEndResultsLoading ||
    !memoizedDataPeriod ||
    !memoizedData
  ) {
    return <div>loading...</div>
  }

  if (gameError) {
    return <div>{gameError.message}</div>
  }
  if (segmentEndResultsError) {
    return <div>{segmentEndResultsError.message}</div>
  }
  if (periodEndResultsError) {
    return <div>{periodEndResultsError.message}</div>
  }

  const {
    game: reportResultGame,
    playerConfig,
    initialCapital,
    dataPerPeriod,
    dataTotalAssets,
    dataAccTotalAssetsReturn,
    totalDecisionAvg,
  } = memoizedData

  const { riskReturnPerPeriod, sharpeRatioPerPeriod, configSharpeRatio } =
    memoizedDataPeriod

  const game = reportResultGame

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
                    <div
                      key={name}
                      className="flex w-full items-center justify-between gap-x-2"
                    >
                      <div className="flex items-center gap-x-1">
                        <div
                          className="h-[8px] w-[8px] rounded-sm"
                          style={{ background: item.color }}
                        />
                        <span className="text-xs text-gray-600">{name}</span>
                      </div>
                      <span className="font-bold text-black">
                        {Number(value).toFixed(2)}
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
              onValueChange={(value) => setCurrPeriod(parseInt(value))}
              defaultValue="0"
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key={0} value="0">
                  All Periods
                </SelectItem>
                {dataPerPeriod.map((_, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    Period {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex-grow">
            <ChartContainer config={playerConfig} className="h-[300px] w-full">
              <AreaChart
                data={
                  currPeriod === 0
                    ? dataAccTotalAssetsReturn
                    : dataAccTotalAssetsReturn.slice(
                        (currPeriod - 1) * NUM_MONTHS,
                        currPeriod * NUM_MONTHS
                      )
                }
                accessibilityLayer
              >
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                  formatter={(value, name, item) => [
                    <div
                      key={name}
                      className="flex w-full items-center justify-between gap-x-2"
                    >
                      <div className="flex items-center gap-x-1">
                        <div
                          className="h-[8px] w-[8px] rounded-sm"
                          style={{ background: item.color }}
                        />
                        <span className="text-xs text-gray-600">{name}</span>
                      </div>
                      <span className="font-bold text-black">
                        {(Number(value) * 100).toFixed(2)}%
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
                          {(payload.value * 100).toFixed(1)}%
                        </text>
                      </g>
                    )
                  }}
                  domain={['auto', (dataMax) => dataMax * 1.1]}
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
                        <div className="flex w-40 items-center justify-around">
                          <div>Savings</div>
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
                        {Object.values(dataPerPlayer).map((d, dIx) => {
                          const decisions = d.decisions

                          return (
                            <TableCell
                              key={'player-decisions-' + dIx}
                              className="align-top font-medium"
                            >
                              {decisions.map((decision, segmentIx) => {
                                return (
                                  <div
                                    key={'decision-' + segmentIx}
                                    className="flex w-40 items-center justify-around"
                                  >
                                    <div>{decision.bank} %</div>
                                    <div>{decision.bonds} %</div>
                                    <div>{decision.stocks} %</div>
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
                          className="fill-foreground"
                          fontSize={12}
                          formatter={(v) => `${(Number(v) * 100).toFixed(1)}%`}
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
                  tickFormatter={(v) => `${(Number(v) * 100).toFixed(1)}%`}
                  domain={['auto', (dataMax) => dataMax * 1.1]}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="flex h-full w-full flex-col">
          <CardHeader>
            <CardTitle>Risk-Return </CardTitle>
            <CardDescription>
              Risk-Return chart of the latest completed period.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ChartContainer config={playerConfig} className="h-[300px] w-full">
              <ScatterChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                  formatter={(value, name, item) => [
                    <div
                      key={name}
                      className="flex w-full items-center justify-between gap-x-2"
                    >
                      <div className="flex items-center gap-x-1">
                        <div
                          className="h-[8px] w-[8px] rounded-sm"
                          style={{ background: item.color }}
                        />
                        <span className="text-xs text-gray-600">{name}</span>
                      </div>
                      <span className="font-bold text-black">
                        {(Number(value) * 100).toFixed(2)}%
                      </span>
                    </div>,
                  ]}
                />
                <CartesianGrid />
                <XAxis
                  dataKey="risk"
                  tickLine={false}
                  tickMargin={8}
                  type="number"
                  name="Risk"
                  tickFormatter={(v) => `${(Number(v) * 100).toFixed(2)}%`}
                />
                <YAxis
                  dataKey="totalAssetsReturnsPA"
                  type="number"
                  name="Returns p.a."
                  tickLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => `${(Number(v) * 100).toFixed(2)}%`}
                />
                {Object.values(
                  riskReturnPerPeriod[riskReturnPerPeriod.length - 1]
                ).map((playerData, ix) => {
                  return (
                    <Scatter
                      key={playerData.name}
                      name={playerData.name}
                      data={[playerData]}
                      fill={colors[ix]}
                    />
                  )
                })}
                <ChartLegend content={<ChartLegendContent />} />
              </ScatterChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="flex h-full w-full flex-col">
          <CardHeader>
            <CardTitle>Sharpe Ratio</CardTitle>
            {/* <CardDescription>Average decisions over players.</CardDescription> */}
          </CardHeader>
          <CardContent className="flex-grow">
            <ChartContainer
              config={configSharpeRatio}
              className="h-[300px] w-full"
            >
              <BarChart data={sharpeRatioPerPeriod}>
                {Object.keys(configSharpeRatio).map((key, ix) => {
                  return (
                    <Bar key={key} dataKey={key} fill={colors[ix]} radius={4}>
                      <LabelList
                        position="top"
                        className="fill-foreground"
                        fontSize={12}
                        formatter={(v) => `${Number(v).toFixed(2)}`}
                      />
                    </Bar>
                  )
                })}
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => `P${v}`}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => `${Number(v).toFixed(2)}`}
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
