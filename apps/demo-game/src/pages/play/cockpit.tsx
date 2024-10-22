import { useMutation, useQuery } from '@apollo/client'
import { Layout } from '@gbl-uzh/ui'
import { CycleCountdown, Switch, Table } from '@uzh-bf/design-system'
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
} from '@uzh-bf/design-system/dist/future'

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

import {
  TransactionsDisplay,
  TransactionsDisplayCompact,
} from 'src/components/TransactionsDisplay'
import {
  PerformActionDocument,
  ResultDocument,
  UpdateReadyStateDocument,
} from 'src/graphql/generated/ops'
import { getSegmentEndResults } from 'src/lib/analysis'
import { ActionTypes } from 'src/services/ActionsReducer'
import LearningElements from '~/components/LearningElements'
import StoryElements from '~/components/StoryElements'
// TODO(JJ): This will be replaced by the design system
import { useToast } from '../../components/ui/use-toast'

function GameHeader({ currentGame }) {
  return (
    <div className="flex justify-between rounded border p-4">
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

        {countdownDurationMs !== null && (
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
        )}
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
    if (period === null && data?.result?.currentGame?.periods?.length) {
      setPeriod(data.result.currentGame.periods.length - 1)
    }
  })

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
      return (
        <GameLayout>
          <div>
            <GameHeader currentGame={currentGame} />
            <div>Game is being prepared.</div>
          </div>
        </GameLayout>
      )

    case 'COMPLETED':
      return (
        <GameLayout>
          <div> Game is completed. </div>
        </GameLayout>
      )

    case 'CONSOLIDATION':
      return (
        <GameLayout>
          <div> Game is being consolidated. </div>
        </GameLayout>
      )

    case 'RESULTS':
      return (
        <GameLayout>
          <div> RESULTS </div>
        </GameLayout>
      )

    case 'SCHEDULED':
      return (
        <GameLayout>
          <div> Game is scheduled. </div>
        </GameLayout>
      )

    case 'PAUSED': {
      const numPeriods = currentGame.periods.length
      const previousResults = playerDataResult.previousResults
      const previousSegmentResults = getSegmentEndResults(previousResults)

      const assetsWithReturns = previousSegmentResults.map(
        (e) => e.facts.assetsWithReturns
      )
      const assetsWithReturnsFlat = assetsWithReturns.flat()

      // The current data stores some values twice: once as a last value from
      // the previous segment and once as a first value from the current
      // segment. Therefore, we remove the first value from the current return.
      const firstValue = assetsWithReturnsFlat[0]
      const assetsWithReturnsFlatClean = [
        {
          bank: firstValue.bank,
          bonds: firstValue.bonds,
          stocks: firstValue.stocks,
          bankBenchmark: firstValue.bankBenchmark,
          bondsBenchmark: firstValue.bondsBenchmark,
          stocksBenchmark: firstValue.stocksBenchmark,
          accBankBenchmarkReturn: firstValue.accBankBenchmarkReturn,
          accBondsBenchmarkReturn: firstValue.accBondsBenchmarkReturn,
          accStocksBenchmarkReturn: firstValue.accStocksBenchmarkReturn,
          accTotalAssetsReturn: firstValue.accTotalAssetsReturn,
          totalAssets: firstValue.totalAssets,
          month: months[0],
        },
      ]
      for (let i = 1, j = 1; i < assetsWithReturnsFlat.length; i++) {
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
        'Bank Benchmark',
        'Bonds Benchmark',
        'Stocks Benchmark',
        'Total Assets',
      ]
      const colors = [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
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
      for (let i = 0; i < numMonthsPerSegment; i++) {
        const strNum = String(i)

        const numDataPoints = assetsWithReturnsFlat.length
        const index = (numDataPoints - numMonthsPerSegment + i) % numMonths
        const periodIx = ~~(numDataPoints / numMonths) + 1

        // TODO(JJ): Double-check if the month is correct
        columns_segment_results.push({
          label: months[index] + ' Period ' + periodIx,
          accessor: strNum,
          sortable: false,
          transformer: ({ row }: { row: any }) =>
            typeof row[strNum] === 'number' && `CHF ${row[strNum].toFixed(2)}`,
        })
      }
      console.log('columns_segment_results', columns_segment_results)

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
                <Table
                  columns={columns_segment_results}
                  data={data_segment_results}
                  caption=""
                />
              </div>
              <div className="flex flex-col gap-2">
                <Card>
                  <CardHeader className="flex flex-row justify-between">
                    <div>
                      <CardTitle>Absolute performance</CardTitle>
                      <CardDescription>Assets over time.</CardDescription>
                    </div>
                    <Select
                      defaultValue={(period + 1).toString()}
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
                  </CardHeader>
                  <CardContent className="max-w-full">
                    <ChartContainer
                      config={configAbsolute}
                      className="h-[300px]"
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
                <Card>
                  <CardHeader>
                    <CardTitle>Total accumulated returns</CardTitle>
                    <CardDescription>
                      Total accumulated returns with respect to initial capital
                      over time (per period).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={configAccReturn}>
                      <BarChart data={allDataPerPeriod[period]}>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
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
                          tickFormatter={(v) => `${v.toFixed(2) * 100}%`}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
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

      const columns_portfolio = [
        { label: 'Category', accessor: 'cat', sortable: false },
        { label: 'Value', accessor: 'val', sortable: false },
      ]

      const data_portfolio = [
        {
          cat: 'Savings',
          val: `CHF ${assets.bank.toFixed(2)}`,
        },
        {
          cat: 'Bonds',
          val: `CHF ${assets.bonds.toFixed(2)}`,
        },
        {
          cat: 'Stocks',
          val: `CHF ${assets.stocks.toFixed(2)}`,
        },
        {
          cat: 'Total',
          val: `CHF ${assets.totalAssets.toFixed(2)}`,
        },
      ]

      const decisions = [
        {
          name: 'Bank',
          label: (percentage: number, totalAssets: number) =>
            `Invest ${(percentage * 100).toFixed()}% (CHF ${(
              totalAssets * percentage
            ).toFixed(2)}) into bank.`,
          state: resultFactsDecisions.bank,
          action: ActionTypes.DECIDE_BANK,
        },
        {
          name: 'Bonds',
          label: (percentage: number, totalAssets: number) =>
            `Invest ${(percentage * 100).toFixed()}% (CHF ${(
              totalAssets * percentage
            ).toFixed(2)}) into bonds.`,
          state: resultFactsDecisions.bonds,
          action: ActionTypes.DECIDE_BONDS,
        },
        {
          name: 'Stocks',
          label: (percentage: number, totalAssets: number) =>
            `Invest ${(percentage * 100).toFixed()}% (CHF ${(
              totalAssets * percentage
            ).toFixed(2)}) into stocks.`,
          state: resultFactsDecisions.stocks,
          action: ActionTypes.DECIDE_STOCK,
        },
      ]
      return (
        <GameLayout>
          <div className="flex w-full flex-col">
            <GameHeader currentGame={currentGame} />
            <div className="max-w-md">
              <Table
                columns={columns_portfolio}
                data={data_portfolio}
                caption=""
              />
            </div>

            <div className="rounded border p-4">
              {decisions.map(function (decision, i) {
                return (
                  <div className="p-1" key={decision.name}>
                    <Switch
                      label={decision.label(
                        decision.state
                          ? 1 /
                              (+resultFactsDecisions.bank +
                                +resultFactsDecisions.bonds +
                                +resultFactsDecisions.stocks)
                          : 0,
                        assets.totalAssets
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
            <div className="my-2 flex flex-wrap gap-2">
              <TransactionsDisplayCompact
                transactions={data.result.transactions}
              />
              <TransactionsDisplay transactions={data.result.transactions} />
            </div>
          </div>
        </GameLayout>
      )
    }

    default:
      return <div> Game has not been created yet. </div>
  }
}

export default Cockpit
