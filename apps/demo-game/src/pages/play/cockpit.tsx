import { useMutation, useQuery } from '@apollo/client'
import { Layout, ProbabilityChart } from '@gbl-uzh/ui'
import { CycleCountdown, Switch } from '@uzh-bf/design-system'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

import {
  PerformActionDocument,
  ResultDocument,
  UpdateReadyStateDocument,
} from 'src/graphql/generated/ops'
import { getSegmentEndResults } from 'src/lib/analysis'
import { ActionTypes } from 'src/services/ActionsReducer'
import { DecisionsDisplayCompact } from '~/components/DecisionsDisplay'
import LearningElements from '~/components/LearningElements'
import StoryElements from '~/components/StoryElements'
// TODO(JJ): This will be replaced by the design system
import { useToast } from '../../components/ui/use-toast'

const LABEL_MAP = {
  accTotalAssetsReturn: 'Total Assets Return',
  accBankBenchmarkReturn: 'Savings Return',
  accBondsBenchmarkReturn: 'Bonds Return',
  accStocksBenchmarkReturn: 'Stocks Return',
}

function GameHeader({ currentGame }) {
  return (
    <div className="col-span-2 flex justify-between rounded border p-4">
      <div className="font-bold">Game {currentGame.id}</div>
      <div className="">Current status: {currentGame.status}</div>
    </div>
  )
}

function GameLayout({ children }: { children: React.ReactNode }) {
  // TODO(JJ): Fetch data in Layout
  const { data } = useQuery(ResultDocument, {
    fetchPolicy: 'cache-first',
    pollInterval: 10000,
  })

  const [updateReadyState, { loading }] = useMutation(UpdateReadyStateDocument)

  const [countdownNotifications, setCountdownNotifications] = useState({
    '60': false,
    '180': false,
  })

  const { toast } = useToast()

  const strExpiresAt = data?.result?.currentGame?.activePeriod?.activeSegment
    ?.countdownExpiresAt as string | null
  const countdownDurationMs = data?.result?.currentGame?.activePeriod
    ?.activeSegment?.countdownDurationMs as number | null

  useEffect(() => {
    const dateExpiresAt = dayjs(strExpiresAt)
    const secondsRemaining = dateExpiresAt.diff(dayjs(), 's')

    if (secondsRemaining > 0) {
      toast({
        title: 'Countdown set',
        description: `${secondsRemaining} seconds remaining! Please press ready once you are done playing.`,
      })
    }
  }, [strExpiresAt])

  const playerInfo = {
    name: data.self.name,
    color: data.self.facts.color,
    location: data.self.facts.location,
    level: data.self.level.index,
    xp: data.self.experience,
    xpMax: data.self.experienceToNext,
    achievements: data.self.achievements,
    imgPathAvatar: data.self.facts.avatar,
    imgPathLocation: `/locations/${data.self.facts.location}.svg`,
    onClick: () => {
      // router.replace('/play/welcome')
    },
  }
  const playerState = {
    data,
  }
  const player = {
    role: data.self.role,
  }

  const sidebar = (
    <div>
      <div className="flex items-center justify-between">
        {data?.self && (
          <Switch
            className={{
              root: 'text-xs font-bold text-gray-600',
            }}
            disabled={!data.self || loading}
            id="isReady"
            checked={data.self.isReady}
            label="Ready?"
            onCheckedChange={async () => {
              await updateReadyState({
                variables: {
                  isReady: !data.self.isReady,
                },
              })
            }}
          />
        )}

        {/* {countdownDurationMs !== null && (
          <CycleCountdown
            className={{
              root: '',
              countdownWrapper: '',
              countdown: 'text-xs font-bold text-gray-600',
            }}
            totalDuration={countdownDurationMs / 1000}
            expiresAt={dayjs(strExpiresAt).toDate()}
            formatter={(value) => `${value}s`}
            onExpire={() =>
              toast({
                title: 'Countdown expired',
                description: 'Time is up! The period will be closed soon.',
                variant: 'destructive',
              })
            }
            onUpdate={(secondsRemaining) => {
              const minutesRemainingThreshold = [1, 3]
              minutesRemainingThreshold.forEach((minute) => {
                const seconds = minute * 60
                if (secondsRemaining <= seconds) {
                  const secondsStr = String(seconds)
                  if (countdownNotifications[secondsStr]) return
                  const minutesRemaining = Math.ceil(secondsRemaining / 60)
                  toast({
                    title: 'Countdown update',
                    description: `Less than ${minutesRemaining} min remaining! Please press ready once you are done.`,
                  })
                  setCountdownNotifications((prevState) => ({
                    ...prevState,
                    [secondsStr]: true,
                  }))
                }
              })
            }}
          />
        )} */}
      </div>
      <LearningElements />
    </div>
  )

  return (
    <>
      <StoryElements playerState={playerState} player={player} />
      <Layout tabs={tabs} playerInfo={playerInfo} sidebar={sidebar}>
        {children}
      </Layout>
    </>
  )
}

const tabs = [
  { name: 'Welcome', href: '/play/welcome' },
  { name: 'Cockpit', href: '/play/cockpit' },
]

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

function Cockpit() {
  const [period, setPeriod] = useState<number>(null)

  const { loading, error, data } = useQuery(ResultDocument, {
    fetchPolicy: 'cache-first',
  })

  const [performAction, updatedPlayerResult] = useMutation(
    PerformActionDocument,
    {
      refetchQueries: 'active',
    }
  )

  useEffect(() => {
    if (data?.result?.currentGame?.periods?.length > 0) {
      setPeriod(data.result.currentGame.periods.length - 1)
    }
  }, [data?.result?.currentGame?.periods?.length])

  if (loading) return null
  if (error) return `Error! ${error}`

  const playerDataResult = data.result
  if (!playerDataResult) return null
  const currentGame = playerDataResult.currentGame

  // TODO(JJ): The results should only be computed for certain states.
  // - Create different components, which compute the things internally.

  // console.log(data.result.transactions)

  switch (currentGame?.status) {
    case 'PREPARATION':
    case 'COMPLETED':
      return (
        <GameLayout>
          <div className="w-full">
            <GameHeader currentGame={currentGame} />
          </div>
        </GameLayout>
      )

    case 'RESULTS':
      const previousPeriodResults = playerDataResult.previousResults.filter(
        (o) => o.type == 'PERIOD_END'
      )

      const assets = previousPeriodResults.map((e, ix) => {
        return {
          ...e.facts.assets,
          period: 'Period ' + (ix + 1),
        }
      })

      const assetsWithReturns = previousPeriodResults.map(
        (e) => e.facts.assetsWithReturns
      )

      const lastAssets = assetsWithReturns.map((e, ix) => {
        return {
          ...e[e.length - 1],
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
                    Total accumulated returns with respect to initial capital
                    over time (per period).
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

    case 'SCHEDULED':
      return (
        <GameLayout>
          <div> Game is scheduled. </div>
        </GameLayout>
      )

    case 'CONSOLIDATION':
    case 'PAUSED': {
      const numPeriods = currentGame.periods.length
      const previousResults = playerDataResult.previousResults
      const previousSegmentResults = getSegmentEndResults(previousResults)
      const segmentEndResults = previousSegmentResults
        .map((e) => {
          return {
            period: e.period,
            segment: e.segment,
            decisions: e.facts.decisions,
          }
        })
        .reverse()

      const assetsWithReturns = previousSegmentResults.map(
        (e) => e.facts.assetsWithReturns
      )
      const assetsWithReturnsFlat = assetsWithReturns.flat()

      // The current data stores some values twice: once as a last value from
      // the previous segment and once as a first value from the current
      // segment. Therefore, we remove the first value from the current return.

      const assetsWithReturnsFlatClean = []
      for (let i = 0, j = 0; i < assetsWithReturnsFlat.length; i++) {
        const { ix, ...val } = assetsWithReturnsFlat[i]
        if (ix == 0) continue

        const index = j % numMonths
        assetsWithReturnsFlatClean.push({
          ...val,
          month: months[index],
        })
        j++
      }

      const allDataPerPeriod = Array.from(Array(numPeriods).keys()).map(
        (ix) => {
          const from = ix * numMonths
          const to = from + numMonths
          return assetsWithReturnsFlatClean.slice(from, to)
        }
      )

      const labels = [
        'Savings Benchmark',
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

      const columns_segment_results = [
        { label: '', accessor: 'cat', sortable: false, transformer: null },
      ]
      const numMonthsPerSegment = currentGame.activePeriod.facts.rollsPerSegment
      const numMonthsInTable = numMonthsPerSegment + 1
      const periodIx = currentGame.activePeriod.index + 1

      const activeSegmentIx = currentGame.activePeriod.activeSegment.index
      const indexArr = Array.from({ length: numMonthsInTable }, (_, i) => i - 1)
      indexArr.map((i) => {
        const index = (i + activeSegmentIx * numMonthsPerSegment) % numMonths

        const strNum = String(i + 1)
        const p = index === -1 ? periodIx - 1 : periodIx
        const m = index === -1 ? months[numMonths + index] : months[index]
        columns_segment_results.push({
          label: m + ' Period ' + p,
          accessor: strNum,
          sortable: false,
          transformer: ({ row }: { row: any }) =>
            typeof row[strNum] === 'number' && `CHF ${row[strNum].toFixed(2)}`,
        })
      })

      const reduceFn = (type: string) => {
        return (acc, value) => {
          let val = value.bank
          if (type == 'bonds') {
            val = value.bonds
          } else if (type == 'stocks') {
            val = value.stocks
          } else if (type == 'total') {
            val = value.totalAssets
          }
          acc[value.ix] = val
          return acc
        }
      }

      const resultFacts = playerDataResult.playerResult.facts
      const assetsWithReturnsArr = resultFacts.assetsWithReturns ?? []
      const data_segment_results = [
        assetsWithReturnsArr.reduce(reduceFn('bank'), { cat: 'Savings' }),
        assetsWithReturnsArr.reduce(reduceFn('bonds'), { cat: 'Bonds' }),
        assetsWithReturnsArr.reduce(reduceFn('stocks'), { cat: 'Stocks' }),
        assetsWithReturnsArr.reduce(reduceFn('total'), { cat: 'Total' }),
      ]

      return (
        <GameLayout>
          <div className="flex flex-col">
            <div>
              <GameHeader currentGame={currentGame} />
              <div className="py-8">
                {/* <Table
                  columns={columns_segment_results}
                  data={data_segment_results}
                  caption=""
                  className={{
                    tableHeader: 'text-right pr-4', row: 'text-right'
                  }}
                /> */}
                <Card className="flex h-full w-full flex-col">
          <CardHeader>
            <CardTitle>Assets Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns_segment_results.map((column) => (
                      <TableHead key={column.accessor}>
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>                  
                </TableHeader>
                <TableBody>
                  {data_segment_results.map((row, rowIx) => {
                      return (
                        <TableRow key={row.cat} className={`${row.cat === 'Total' ? 'font-bold' : ''}`}>
                          {['cat', '0', '1', '2', '3'].map((key, ix) => {
                            if (ix > 0) {
                              return (  
                                <TableCell key={key}>
                                  <div className="flex justify-between w-24">
                                    <span>CHF </span>
                                    <span>{row[key].toFixed(2)}</span>
                                  </div>
                                </TableCell>
                              )
                            }
                            return (  
                              <TableCell key={key}>
                                <div className="flex">
                                  {row[key]}
                                </div>
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      )})}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
                <div className="mt-8">
                  {period !== null && (
                    <Select
                      defaultValue={period.toString()}
                      onValueChange={(value) => {
                        setPeriod((prev) => parseInt(value))
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        {allDataPerPeriod.map((_, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            Period {index + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <div className="flex flex-1 flex-col gap-2 xl:flex-row">
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle>Absolute Performance</CardTitle>
                      <CardDescription>Assets over time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={configAbsolute}
                        // className="h-[300px]"
                      >
                        <LineChart
                          data={allDataPerPeriod[period]}
                          accessibilityLayer
                        >
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                          />
                          {Object.keys(configAbsolute).map((key) => {
                            return (
                              <Line
                                key={key}
                                type="natural"
                                dataKey={key}
                                stroke={configAbsolute[key].color}
                                dot={false}
                                strokeWidth={2}
                              />
                            )
                          })}

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
                          />
                          <ChartLegend content={<ChartLegendContent />} />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                  <Card className="flex-1">
                    <CardHeader>
                      <CardTitle>Total Accumulated Returns</CardTitle>
                      <CardDescription>
                        Total accumulated returns with respect to initial
                        capital over time (per period).
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={configAccReturn}>
                        <BarChart data={allDataPerPeriod[period]}>
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent
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
                                      <span className="text-xs text-gray-600">
                                        {LABEL_MAP[name]}
                                      </span>
                                    </div>
                                    <span className="font-bold text-black">
                                      {(value * 100).toFixed(2)}%
                                    </span>
                                  </div>,
                                ]}
                              />
                            }
                          />
                          {Object.keys(configAccReturn).map((key) => {
                            return (
                              <Bar
                                key={key}
                                // stackId="1"
                                dataKey={key}
                                fill={configAccReturn[key].color}
                                radius={4}
                              />
                            )
                          })}
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
                            tickFormatter={(v) => `${(v * 100).toFixed(2)}%`}
                          />
                          <ChartLegend content={<ChartLegendContent />} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>
                <DecisionsDisplayCompact segmentDecisions={segmentEndResults} />
              </div>
            </div>
          </div>
        </GameLayout>
      )
    }

    case 'RUNNING': {
      const resultFacts = playerDataResult.playerResult.facts
      const assets = resultFacts.assets
      const resultFactsDecisions = resultFacts.decisions
      const previousResults = playerDataResult.previousResults

      const segmentEndResults = previousResults
        .filter((o) => o.type == 'SEGMENT_END')
        .map((e) => {
          return {
            period: e.period,
            segment: e.segment,
            decisions: e.facts.decisions,
          }
        })
        .reverse()

      const columns_portfolio = [
        { label: 'Category', accessor: 'category', sortable: false },
        {
          label: 'Value before decisions',
          accessor: 'currentValue',
          sortable: false,
        },
        {
          label: 'Value after decisions',
          accessor: 'futureValue',
          sortable: false,
        },
      ]

      const data_portfolio = [
        {
          category: 'Savings',
          currentValue: `CHF ${assets.bank.toFixed(2)}`,
          futureValue: `CHF ${(
            assets.totalAssets *
            (resultFactsDecisions.bank
              ? 1 /
                (+resultFactsDecisions.bank +
                  +resultFactsDecisions.bonds +
                  +resultFactsDecisions.stocks)
              : 0)
          ).toFixed(2)}`,
        },
        {
          category: 'Bonds',
          currentValue: `CHF ${assets.bonds.toFixed(2)}`,
          futureValue: `CHF ${(
            assets.totalAssets *
            (resultFactsDecisions.bonds
              ? 1 /
                (+resultFactsDecisions.bank +
                  +resultFactsDecisions.bonds +
                  +resultFactsDecisions.stocks)
              : 0)
          ).toFixed(2)}`,
        },
        {
          category: 'Stocks',
          currentValue: `CHF ${assets.stocks.toFixed(2)}`,
          futureValue: `CHF ${(
            assets.totalAssets *
            (resultFactsDecisions.stocks
              ? 1 /
                (+resultFactsDecisions.bank +
                  +resultFactsDecisions.bonds +
                  +resultFactsDecisions.stocks)
              : 0)
          ).toFixed(2)}`,
        },
        {
          category: 'Total',
          currentValue: `CHF ${assets.totalAssets.toFixed(2)}`,
          futureValue: `CHF ${assets.totalAssets.toFixed(2)}`,
        },
      ]

      const decisions = [
        {
          name: 'Savings',
          label: (percentage: number) =>
            `Put ${(percentage * 100).toFixed()}% in savings.`,
          state: resultFactsDecisions.bank,
          action: ActionTypes.DECIDE_BANK,
        },
        {
          name: 'Bonds',
          label: (percentage: number) =>
            `Invest ${(percentage * 100).toFixed()}% in bonds.`,
          state: resultFactsDecisions.bonds,
          action: ActionTypes.DECIDE_BONDS,
        },
        {
          name: 'Stocks',
          label: (percentage: number) =>
            `Invest ${(percentage * 100).toFixed()}% in stocks.`,
          state: resultFactsDecisions.stocks,
          action: ActionTypes.DECIDE_STOCK,
        },
      ]

      return (
        <GameLayout>
          <div className="flex w-full grid-cols-2 flex-col gap-4 xl:grid">
            <GameHeader currentGame={currentGame} />

            <Card>
              <CardHeader>
                <CardTitle>Your Portfolio</CardTitle>
                <CardDescription>The assets in your portfolio.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table
                  columns={columns_portfolio}
                  data={data_portfolio}
                  caption=""
                  className={{
                    tableHeader: 'text-right pr-4', row: 'text-right'
                  }}
                />

                <div className="mt-8 flex flex-row gap-2">
                  {decisions.map((decision) => {
                    return (
                      <div className="p-1" key={decision.name}>
                        <Switch
                          label={decision.label(
                            decision.state
                              ? 1 /
                                  (+resultFactsDecisions.bank +
                                    +resultFactsDecisions.bonds +
                                    +resultFactsDecisions.stocks)
                              : 0
                          )}
                          checked={decision.state}
                          id="switch"
                          onCheckedChange={async (checked) => {
                            await performAction({
                              variables: {
                                type: decision.action,
                                payload: JSON.stringify({
                                  decision: checked,
                                }),
                              },
                              refetchQueries: [ResultDocument],
                            })
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
              <CardFooter className="text-slate-500">
                The assets put in savings yield a continuous return of{' '}
                {currentGame.periods[period]?.facts.scenario.interestBank * 100}
                % per month. The return of bonds and stocks is determined by the
                market expectation and simulated by two dice.
              </CardFooter>
            </Card>

            <DecisionsDisplayCompact segmentDecisions={segmentEndResults} />

            <Card>
              <CardHeader>
                <CardTitle>Expectation for Bonds</CardTitle>
                <CardDescription>
                  The expected value of and possible fluctuations in the bond
                  price.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProbabilityChart
                  trendE={
                    currentGame.periods[period]?.facts.scenario.trendBonds
                  }
                  trendGap={
                    currentGame.periods[period]?.facts.scenario.gapBonds
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expectation for Stocks</CardTitle>
                <CardDescription>
                  The expected value of and possible fluctuations in the stock
                  price.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProbabilityChart
                  trendE={
                    currentGame.periods[period]?.facts.scenario.trendStocks
                  }
                  trendGap={
                    currentGame.periods[period]?.facts.scenario.gapStocks
                  }
                />
              </CardContent>
            </Card>
          </div>
        </GameLayout>
      )
    }

    default:
      return <div>Game has not been created yet.</div>
  }
}

export default Cockpit
