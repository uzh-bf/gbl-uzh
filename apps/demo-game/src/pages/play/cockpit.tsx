import { useMutation, useQuery } from '@apollo/client'
import { Layout } from '@gbl-uzh/ui'
import { CycleCountdown, Switch, Table } from '@uzh-bf/design-system'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@uzh-bf/design-system/dist/future'

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
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

      const totalAssetsPerMonth = getTotalAssetsOfPreviousResults(
        previousResults
      ).map((s, i) => ({
        total: s,
        month: months[i % numMonths],
        period: ~~(i / numMonths) + 1, // integer division
      }))

      const newTotalAssetsPerMonths = totalAssetsPerMonth.reduce(
        (acc, val, ix) => {
          const key = 'period_' + val.period
          const index = ix % numMonths
          acc[index] = acc[index] || { month: val.month }
          acc[index][key] = val.total
          return acc
        },
        []
      )

      const config = Object.keys(newTotalAssetsPerMonths[0]).reduce(
        (acc, key, ix) => {
          if (key.startsWith('period_')) {
            acc[key] = {
              label: key,
              color: `hsl(var(--chart-${ix}))`,
            }
          }
          return acc
        },
        {}
      )

      const columns_segment_results = [
        { label: '', accessor: 'cat', sortable: false, transformer: null },
      ]
      for (let i = 0; i < numMonthsPerSegment; i++) {
        const strNum = String(i)

        const numDataPoints = totalAssetsPerMonth.length
        const index = (numDataPoints - numMonthsPerSegment + i) % numMonths
        const periodIx = ~~(numDataPoints / numMonths) + 1

        columns_segment_results.push({
          label: months[index] + ' Period ' + String(periodIx),
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
              <div className="max-w-2xl">
                <Table
                  columns={columns_segment_results}
                  data={data_segment_results}
                  caption=""
                />
              </div>
              <div className="flex justify-center">
                Total assets over time chart
              </div>
              <ResponsiveContainer width="100%" height="50%">
                <ChartContainer config={config}>
                  <LineChart data={newTotalAssetsPerMonths}>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    {Object.keys(config).map((key) => {
                      return (
                        <Line
                          key={key}
                          type="natural"
                          dataKey={key}
                          stroke={config[key].color}
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
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </LineChart>
                </ChartContainer>
              </ResponsiveContainer>
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
