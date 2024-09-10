import { useMutation, useQuery } from '@apollo/client'
import { Layout } from '@gbl-uzh/ui'
import { CycleCountdown, Switch, Table } from '@uzh-bf/design-system'
import {
  ChartContainer,
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
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Quests from 'src/components/Quests'
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

  const sidebar = (
    <div>
      <div className="flex items-center justify-between">
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
              if (secondsRemaining <= 60) {
                if (countdownNotifications['60']) return
                toast({
                  title: 'Countdown update',
                  description:
                    'Less than a minute remaining! Please press ready once you are done.',
                })
                setCountdownNotifications({
                  ...countdownNotifications,
                  '60': true,
                })
              } else if (secondsRemaining <= 180) {
                if (countdownNotifications['180']) return
                toast({
                  title: 'Countdown update',
                  description:
                    'Less than three minutes remaining! Please press ready once you are done.',
                })
                setCountdownNotifications({
                  ...countdownNotifications,
                  '180': true,
                })
              }
            }}
          />
        )}
      </div>
      <Quests />
    </div>
  )

  return (
    <Layout tabs={tabs} playerInfo={playerInfo} sidebar={sidebar}>
      {children}
    </Layout>
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
      ).map((s, i) => ({ total: s, month: 'month_' + String(i) }))

      const columns_segment_results = [
        { label: '', accessor: 'cat', sortable: false },
        {
          label: 'Initial',
          accessor: '0',
          sortable: false,
          transformer: ({ row }: { row: any }) =>
            typeof row['0'] === 'number' && `CHF ${row['0'].toFixed(2)}`,
        },
      ]
      for (let i = 1; i < 4; i++) {
        const strNum = String(i)
        columns_segment_results.push({
          label: 'Month ' + strNum,
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
              <div className="flex justify-center">Total over time chart</div>
              <ResponsiveContainer width="100%" height="50%">
                <ChartContainer
                  config={{
                    desktop: {
                      label: 'Desktop',
                    },
                  }}
                >
                  <LineChart data={totalAssetsPerMonth}>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Line
                      type="natural"
                      dataKey="total"
                      stroke="#8884d8"
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
                    <YAxis />
                    <Tooltip />
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
