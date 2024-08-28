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
} from '@uzh-bf/design-system/dist/future'

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import LearningElements from 'src/components/LearningElements'
import {
  TransactionsDisplay,
  TransactionsDisplayCompact,
} from 'src/components/TransactionsDisplay'
import {
  PerformActionDocument,
  ResultDocument,
  UpdateReadyStateDocument,
} from 'src/graphql/generated/ops'
import { ActionTypes } from 'src/services/ActionsReducer'
// TODO(JJ): This will be replaced by the design system
import StoryElements from '~/components/StoryElements'
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

function getTotalAssetsOfPreviousResults(previousResults: any[]) {
  const filtered = previousResults.filter((o) => o.type == 'SEGMENT_END')

  filtered.sort((a, b) =>
    a.period.index > b.period.index && a.segment.index > b.segment.index
      ? -1
      : 1
  )

  return filtered
    .map((e) => e.facts.assetsWithReturns)
    .flat()
    .map((e) => e.totalAssets)
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
  const { loading, error, data } = useQuery(ResultDocument, {
    fetchPolicy: 'cache-first',
  })

  const [performAction, updatedPlayerResult] = useMutation(
    PerformActionDocument,
    {
      refetchQueries: 'active',
    }
  )

  if (loading) return null
  if (error) return `Error! ${error}`

  const playerDataResult = data.result
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
      const previousResults = playerDataResult.previousResults

      // TODO(JJ): Move computation helpers to lib.
      const filtered = previousResults
        .filter((o) => o.type == 'SEGMENT_END')
        .sort((a, b) =>
          a.period.index > b.period.index && a.segment.index > b.segment.index
            ? -1
            : 1
        )
      const assetsWithReturns = filtered.map((e) => e.facts.assetsWithReturns)
      const assetsWithReturnsFlat = assetsWithReturns.flat()
      const initialCapital = assetsWithReturnsFlat[0].totalAssets
      console.log('assetsWithReturnsFlat', assetsWithReturnsFlat)

      const assetsPerMonthPrep = assetsWithReturnsFlat.map((e, ix) => {
        return {
          total: e.totalAssets,
          // totalReturns: e.totalAssetsReturn ?? 0,
          bankReturn: e.bankReturn ?? 0,
          bondsReturn: e.bondsReturn ?? 0,
          stocksReturn: e.stocksReturn ?? 0,
          month: months[ix % numMonths],
          period: ~~(ix / numMonths) + 1, // integer division
        }
      })
      console.log('assetsPerMonthPrep', assetsPerMonthPrep)

      const assetsPerMonth = assetsPerMonthPrep.reduce((acc, val, ix) => {
        const key_prefix = 'period_' + val.period
        const key_total = key_prefix + '_total'
        const key_bankReturn = key_prefix + '_bankReturn'
        const key_bondsReturn = key_prefix + '_bondsReturn'
        const key_stocksReturn = key_prefix + '_stocksReturn'
        // const key_totalReturns = key_prefix + '_totalReturns'

        const index = ix % numMonths
        acc[index] = acc[index] || { month: val.month }
        acc[index][key_total] = val.total
        acc[index][key_bankReturn] = val.bankReturn
        acc[index][key_bondsReturn] = val.bondsReturn
        acc[index][key_stocksReturn] = val.stocksReturn
        // acc[index][key_totalReturns] = val.totalReturns
        return acc
      }, [])

      const benchmarksPrep = assetsPerMonthPrep.reduce((acc, val, ix) => {
        acc[ix] = {
          month: val.month,
          bank: initialCapital,
          bankReturn: 0,
          bonds: initialCapital,
          bondsReturn: 0,
          stocks: initialCapital,
          stocksReturn: 0,
          period: val.period,
        }
        if (ix > 0) {
          acc[ix].bank = acc[ix - 1].bank * (val.bankReturn + 1)
          acc[ix].bonds = acc[ix - 1].bonds * (val.bondsReturn + 1)
          acc[ix].stocks = acc[ix - 1].stocks * (val.stocksReturn + 1)
          acc[ix].bankReturn = acc[ix].bank / initialCapital - 1
          acc[ix].bondsReturn = acc[ix].bonds / initialCapital - 1
          acc[ix].stocksReturn = acc[ix].stocks / initialCapital - 1
        }
        return acc
      }, [])
      console.log('benchmarksPrep', benchmarksPrep)

      const benchmarks = benchmarksPrep.reduce((acc, val, ix) => {
        const key_prefix = 'period_' + val.period
        const key_bank = key_prefix + '_bank'
        const key_bonds = key_prefix + '_bonds'
        const key_stocks = key_prefix + '_stocks'
        const key_bankReturn = key_prefix + '_bankReturn'
        const key_bondsReturn = key_prefix + '_bondsReturn'
        const key_stocksReturn = key_prefix + '_stocksReturn'

        const index = ix % numMonths
        acc[index] = acc[index] || { month: val.month }
        acc[index][key_bank] = val.bank
        acc[index][key_bonds] = val.bonds
        acc[index][key_stocks] = val.stocks
        acc[index][key_bankReturn] = val.bankReturn
        acc[index][key_bondsReturn] = val.bondsReturn
        acc[index][key_stocksReturn] = val.stocksReturn
        return acc
      }, [])
      console.log('benchmarks', benchmarks)

      const totalAssetsPerMonth = assetsPerMonth.map((e, ix) => {
        const totalEntries = Object.keys(e).reduce((acc, key, index) => {
          if (key.endsWith('total')) {
            acc[key] = e[key]
          }
          return acc
        }, {})

        return {
          month: e.month,
          ...totalEntries,
        }
      })

      const accReturnsTotalPerCent = totalAssetsPerMonth.map((e, ix) => {
        const totalEntries = Object.keys(e).reduce((acc, key, index) => {
          if (key.endsWith('total')) {
            acc[key] = e[key] / initialCapital - 1
          }
          return acc
        }, {})

        return {
          month: e.month,
          ...totalEntries,
        }
      })

      const accReturnsPerCent = assetsPerMonth.map((e, ix) => {
        const totalEntries = Object.keys(e).reduce((acc, key, index) => {
          if (key.endsWith('total')) {
            acc[key] = e[key] / initialCapital - 1
          } else if (key.endsWith('bank')) {
            acc[key] = e[key] / initialCapital - 1
          } else {
            acc[key] = e[key]
          }
          return acc
        }, {})

        return {
          month: e.month,
          ...totalEntries,
        }
      })

      console.log('accReturnsTotalPerCent', accReturnsTotalPerCent)
      console.log('accReturnsPerCent', accReturnsPerCent)
      console.log('assetsPerMonth', assetsPerMonth)
      console.log('totalAssetsPerMonth', totalAssetsPerMonth)

      const config = Object.keys(assetsPerMonth[0]).reduce((acc, key) => {
        const strName = 'period_'
        const periodNameIx = strName.length
        if (key.startsWith(strName)) {
          const periodIx = key.substring(periodNameIx, periodNameIx + 1)
          acc[key] = {
            label:
              'P' + periodIx + ' (' + key.substring(periodNameIx + 2) + ')',
            color: `hsl(var(--chart-${periodIx}))`,
          }
        }
        return acc
      }, {})

      const configTotal = Object.keys(config).reduce((acc, key) => {
        if (key.endsWith('_total')) {
          acc[key] = config[key]
        }
        return acc
      }, {})

      // const configTotalReturns = Object.keys(config).reduce((acc, key) => {
      //   if (key.endsWith('_Returns')) {
      //     acc[key] = config[key]
      //   }
      //   return acc
      // }, {})

      console.log('config', config)
      console.log('configTotal', configTotal)

      const columns_segment_results = [
        { label: '', accessor: 'cat', sortable: false, transformer: null },
      ]
      for (let i = 0; i < numMonthsPerSegment; i++) {
        const strNum = String(i)

        const numDataPoints = assetsWithReturnsFlat.length
        const index = (numDataPoints - numMonthsPerSegment + i) % numMonths
        const periodIx = ~~(numDataPoints / numMonths) + 1

        columns_segment_results.push({
          label: months[index] + ' Period ' + periodIx,
          accessor: strNum,
          sortable: false,
          transformer: ({ row }: { row: any }) =>
            typeof row[strNum] === 'number' && `CHF ${row[strNum].toFixed(2)}`,
        })
      }

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
              <div>
                <Table
                  columns={columns_segment_results}
                  data={data_segment_results}
                  caption=""
                />
              </div>
              <div className="flex flex-col gap-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Assets</CardTitle>
                    <CardDescription>
                      Total assets over time (per period).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={configTotal}>
                      <LineChart data={totalAssetsPerMonth} accessibilityLayer>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        {Object.keys(configTotal).map((key) => {
                          return (
                            <Line
                              key={key}
                              type="natural"
                              dataKey={key}
                              stroke={configTotal[key].color}
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
                {/* <Card>
                  <CardHeader>
                    <CardTitle>Total Accumulated Returns</CardTitle>
                    <CardDescription>
                      Total accumulated returns in percent over time (per
                      period).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={configTotal}>
                      <BarChart
                        data={accReturnsTotalPerCent}
                        accessibilityLayer
                      >
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        {Object.keys(configTotal).map((key) => {
                          return (
                            <Bar
                              key={key}
                              stackId="1"
                              dataKey={key}
                              fill={configTotal[key].color}
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
                </Card> */}
                <Card>
                  <CardHeader>
                    <CardTitle>Total Accumulated Returns Benchmark</CardTitle>
                    <CardDescription>
                      Total accumulated returns in percent over time (per
                      period).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        period_1_bank: { color: '#007bff', label: 'Bank P1' },
                        period_2_bank: { color: '#34f4ff', label: 'Bank P2' },
                        period_1_bonds: { color: '#0000ff', label: 'Bonds P1' },
                        period_2_bonds: { color: '#3400ff', label: 'Bonds P2' },
                        period_1_stocks: {
                          color: '#887b88',
                          label: 'Stocks P1',
                        },
                        period_2_stocks: {
                          color: '#123456',
                          label: 'Stocks P2',
                        },
                      }}
                    >
                      <LineChart data={benchmarks} accessibilityLayer>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />

                        <Line
                          // key={key}
                          type="natural"
                          dataKey="period_1_bank"
                          stroke={'#007bff'}
                          dot={false}
                          strokeWidth={2}
                        />
                        <Line
                          // key={key}
                          type="natural"
                          dataKey="period_2_bank"
                          stroke={'#34f4ff'}
                          dot={false}
                          strokeWidth={2}
                        />
                        <Line
                          // key={key}
                          type="natural"
                          dataKey="period_1_bonds"
                          stroke={'#0000ff'}
                          dot={false}
                          strokeWidth={2}
                        />
                        <Line
                          // key={key}
                          type="natural"
                          dataKey="period_2_bonds"
                          stroke={'#3400ff'}
                          dot={false}
                          strokeWidth={2}
                        />
                        <Line
                          // key={key}
                          type="natural"
                          dataKey="period_1_stocks"
                          stroke={'#887b88'}
                          dot={false}
                          strokeWidth={2}
                        />
                        <Line
                          // key={key}
                          type="natural"
                          dataKey="period_2_stocks"
                          stroke={'#123456'}
                          dot={false}
                          strokeWidth={2}
                        />

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
                    <CardTitle>Total Accumulated Returns</CardTitle>
                    <CardDescription>
                      Total accumulated returns in percent over time (per
                      period).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={configTotal}>
                      <LineChart
                        data={accReturnsTotalPerCent}
                        accessibilityLayer
                      >
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        {Object.keys(configTotal).map((key) => {
                          return (
                            <Line
                              key={key}
                              type="natural"
                              dataKey={key}
                              stroke={configTotal[key].color}
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
                          tickFormatter={(v) => `${v.toFixed(2) * 100}%`}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
                {/* <Card>
                  <CardHeader>
                    <CardTitle>Returns</CardTitle>
                    <CardDescription>
                      Returns in percent over time (per period).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={config}>
                      <BarChart data={accReturnsPerCent} accessibilityLayer>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        {Object.keys(config).map((key) => {
                          return (
                            <Bar
                              key={key}
                              stackId="1"
                              dataKey={key}
                              fill={config[key].color}
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
                </Card> */}
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
