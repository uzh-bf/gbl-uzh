import { useMutation, useQuery, useSubscription } from '@apollo/client'
import { Layout, PlayerDisplay, ProbabilityChart } from '@gbl-uzh/ui'
import {
  Button,
  // CycleCountdown,
  FormikNumberField,
  Switch,
} from '@uzh-bf/design-system'
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
  ShadcnTable as Table,
  ShadcnTableBody as TableBody,
  ShadcnTableCell as TableCell,
  ShadcnTableHead as TableHead,
  ShadcnTableHeader as TableHeader,
  ShadcnTableRow as TableRow,
} from '@uzh-bf/design-system'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

import { CycleCountdown } from '~/components/CycleCountDown'

import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
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
  GlobalEventsDocument,
  PerformActionDocument,
  ResultDocument,
  UpdateReadyStateDocument,
} from 'src/graphql/generated/ops'
import { getSegmentEndResults } from 'src/lib/analysis'
import { DecisionsDisplayCompact } from '~/components/DecisionsDisplay'
import LearningElements from '~/components/LearningElements'
import StoryElements from '~/components/StoryElements'
// TODO(JJ): This will be replaced by the design system
import { Form, Formik } from 'formik'
import * as yup from 'yup'
import { useToast } from '../../components/ui/use-toast'

// import { BaseGlobalNotificationType } from '@gbl-uzh/platform/src/types.js'
enum BaseGlobalNotificationType {
  PERIOD_ACTIVATED = 'PERIOD_ACTIVATED',
  SEGMENT_ACTIVATED = 'SEGMENT_ACTIVATED',
  COUNTDOWN_UPDATED = 'COUNTDOWN_UPDATED',
}

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
  const { data, refetch: refetchResult } = useQuery(ResultDocument, {
    // fetchPolicy: 'cache-first',
    fetchPolicy: 'cache-and-network',
    // pollInterval: 10000,
  })

  const [updateReadyState, { loading }] = useMutation(UpdateReadyStateDocument)

  const [countdownNotifications, setCountdownNotifications] = useState({
    '60': false,
    '180': false,
  })

  const { toast } = useToast()

  const currentGameId = parseInt(data?.result?.currentGame?.id)

  useSubscription(GlobalEventsDocument, {
    skip: !currentGameId, // Only subscribe if we have a game ID
    onData: ({ data: subData }) => {
      if (subData?.data?.eventsGlobal) {
        const event = subData.data.eventsGlobal
        if (
          event.type === BaseGlobalNotificationType.COUNTDOWN_UPDATED &&
          event.facts?.gameId === currentGameId
        ) {
          console.log(
            `Player Cockpit: Relevant COUNTDOWN_UPDATED event for game ${currentGameId}. Refetching ResultDocument...`
          )
          // Refetch the main ResultDocument to get the new countdown times
          refetchResult()
        } else if (
          (event?.type === BaseGlobalNotificationType.PERIOD_ACTIVATED ||
            event?.type === BaseGlobalNotificationType.SEGMENT_ACTIVATED) &&
          event?.facts?.gameId === currentGameId
        ) {
          console.log(
            `Player Cockpit: Relevant ${event.type} event for game ${currentGameId}. Refetching ResultDocument...`
          )
          refetchResult()
        }
      }
    },
    onError: (err) => {
      console.error('Player Cockpit: Subscription error:', err)
    },
  })

  const strExpiresAt = data?.result?.currentGame?.activePeriod?.activeSegment
    ?.countdownExpiresAt as string | null
  const countdownDurationMs = data?.result?.currentGame?.activePeriod
    ?.activeSegment?.countdownDurationMs as number | null

  const expiresAtDate = useMemo(() => {
    return strExpiresAt ? dayjs(strExpiresAt).toDate() : null
  }, [strExpiresAt])

  useEffect(() => {
    if (!strExpiresAt) return

    const dateExpiresAt = dayjs(strExpiresAt)
    const secondsRemaining = dateExpiresAt.diff(dayjs(), 's')

    if (secondsRemaining > 0) {
      toast({
        title: 'Countdown set/updated!',
        description: `${secondsRemaining} seconds remaining! Please press ready once you are done playing.`,
      })
    }

    setCountdownNotifications({ '60': false, '180': false })
  }, [strExpiresAt, countdownDurationMs])

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
    <div id="sidebar" className="flex flex-col justify-between">
      <Card
        // className="flex max-w-96 flex-col fixed bottom-4 right-4 h-[calc(100vh-5rem)]"
        className="mb-4"
      >
        <CardContent>
          <PlayerDisplay
            name={playerInfo.name}
            color={playerInfo.color}
            location={playerInfo.location}
            level={playerInfo.level}
            // xp={playerInfo.xp}
            // xpMax={playerInfo.xpMax}
            achievements={playerInfo.achievements}
            imgPathAvatar={playerInfo.imgPathAvatar}
            imgPathLocation={playerInfo.imgPathLocation}
            onClick={playerInfo.onClick}
          />
          <div className="flex items-center justify-between">
            {data?.self && (
              <div data-cy="ready-switch">
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
              </div>
            )}

            {countdownDurationMs !== null && expiresAtDate !== null && (
              <CycleCountdown
                expiresAt={expiresAtDate}
                totalDuration={countdownDurationMs / 1000}
                onUpdate={(secondsLeft) => {
                  const minutesRemainingThreshold = [1, 3]
                  minutesRemainingThreshold.forEach((minute) => {
                    const secondsThreshold = minute * 60
                    // Only trigger if we are *just crossing* this threshold
                    if (
                      secondsLeft <= secondsThreshold &&
                      secondsLeft > secondsThreshold - 1
                    ) {
                      const secondsKey = String(secondsThreshold)
                      if (!countdownNotifications[secondsKey]) {
                        const friendlyMinutes = Math.ceil(secondsLeft / 60)
                        toast({
                          title: 'Countdown Update',
                          description: `Less than ${friendlyMinutes} min remaining! Please press ready.`,
                        })
                        setCountdownNotifications((prevState) => ({
                          ...prevState,
                          [secondsKey]: true,
                        }))
                      }
                    }
                  })
                }}
                onExpire={() => console.log('Countdown expired')}
                className="text-xs font-bold text-gray-600"
              />
            )}
          </div>
          <LearningElements />
        </CardContent>
      </Card>
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
      refetchQueries: [ResultDocument],
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
          <div className="flex w-full flex-col">
            <div>
              <GameHeader currentGame={currentGame} />
              <div className="flex flex-wrap gap-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Assets Overview</CardTitle>
                    <CardDescription>
                      Assets of the last month of the previous segment, and of
                      the next months of the current segment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {columns_segment_results.map((column, ix) => (
                              <TableHead
                                key={column.accessor}
                                className={`${
                                  ix === 1
                                    ? 'max-w-24 text-right text-gray-400'
                                    : 'max-w-24 text-right'
                                }`}
                              >
                                {column.label}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data_segment_results.map((row, rowIx) => {
                            return (
                              <TableRow
                                key={row.cat}
                                className={`${
                                  row.cat === 'Total' ? 'font-bold' : ''
                                }`}
                              >
                                {['cat', '0', '1', '2', '3'].map((key, ix) => {
                                  if (ix > 0) {
                                    return (
                                      <TableCell
                                        key={key}
                                        className={`${
                                          key === '0' ? 'text-gray-400' : ''
                                        }`}
                                      >
                                        <div className="flex justify-end">
                                          {row[key].toFixed(2)} CHF
                                        </div>
                                      </TableCell>
                                    )
                                  }
                                  return (
                                    <TableCell key={key}>
                                      <div className="flex">{row[key]}</div>
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
                <DecisionsDisplayCompact segmentDecisions={segmentEndResults} />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <div>Graphical Overview</div>
                    <div className="font-normal">
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
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* <div className="flex flex-1 flex-col gap-2 xl:flex-row"> */}
                  <div className="flex flex-col gap-2 lg:flex-row">
                    <Card className="flex-1">
                      <CardHeader>
                        <CardTitle>Absolute Performance</CardTitle>
                        <CardDescription>
                          Your portfolio&apos;s total value (total assets) compared
                          to benchmarks (savings, bonds and stocks,
                          respectively) over time.
                        </CardDescription>
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
                          Total accumulated returns of your portfolio (total
                          assets) with respect to the initial capital over time
                          (per time period).
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
                </CardContent>
              </Card>
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
        { label: 'Assets', accessor: 'category', sortable: false },
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
          currentValue: `${assets.bank.toFixed(2)} CHF`,
          futureValue: `${(
            assets.totalAssets *
            resultFactsDecisions.bank *
            0.01
          ).toFixed(2)} CHF`,
        },
        {
          category: 'Bonds',
          currentValue: `${assets.bonds.toFixed(2)} CHF`,
          futureValue: `${(
            assets.totalAssets *
            resultFactsDecisions.bonds *
            0.01
          ).toFixed(2)} CHF`,
        },
        {
          category: 'Stocks',
          currentValue: `${assets.stocks.toFixed(2)} CHF`,
          futureValue: `${(
            assets.totalAssets *
            resultFactsDecisions.stocks *
            0.01
          ).toFixed(2)} CHF`,
        },
        {
          category: 'Total',
          currentValue: `${assets.totalAssets.toFixed(2)} CHF`,
          futureValue: `${assets.totalAssets.toFixed(2)} CHF`,
        },
      ]

      const decisions = [
        {
          name: 'Savings',
        },
        {
          name: 'Bonds',
        },
        {
          name: 'Stocks',
        },
      ]

      const schema = yup
        .object({
          savings: yup
            .number()
            .integer()
            .min(0, 'Savings % must be greater equal than 0')
            .max(100, 'Savings % must be smaller equal than 100')
            .required('Savings % is required'),
          bonds: yup
            .number()
            .integer()
            .min(0, 'Bonds % must be greater equal than 0')
            .max(100, 'Bonds % must be smaller equal than 100')
            .required('Bonds % is required'),
          stocks: yup
            .number()
            .integer()
            .min(0, 'Stocks % must be greater equal than 0')
            .max(100, 'Stocks % must be smaller equal than 100')
            .required('Stocks % is required'),
        })
        .test('sum', 'Sum of values must be 100', (values, ctx) => {
          const sum = values.savings + values.bonds + values.stocks
          if (sum === 100) return true
          return ctx.createError({
            path: 'sum',
            message: 'Sum of values must be 100',
          })
        })
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
                <Card>
                  <CardHeader>
                    <CardTitle>Assets Overview</CardTitle>
                    <CardDescription>
                      Assets of the last month of the previous segment, and of
                      the next months of the current segment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {columns_portfolio.map((column, ix) => (
                              <TableHead key={column.accessor}>
                                <div
                                  className={`${
                                    ix === 0 ? '' : 'max-w-36 text-right'
                                  }`}
                                >
                                  {column.label}
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data_portfolio.map((row, rowIx) => {
                            return (
                              <TableRow
                                key={row.category}
                                className={`${
                                  row.category === 'Total' ? 'font-bold' : ''
                                }`}
                              >
                                {[
                                  'category',
                                  'currentValue',
                                  'futureValue',
                                ].map((key, ix) => {
                                  return (
                                    <TableCell key={key}>
                                      <div
                                        className={`${
                                          ix > 0 ? 'max-w-36 text-right' : ''
                                        }`}
                                      >
                                        {row[key]}
                                      </div>
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

                <div className="mt-8 flex flex-row gap-2">
                  <Formik
                    initialValues={{
                      savings: resultFactsDecisions.bank,
                      bonds: resultFactsDecisions.bonds,
                      stocks: resultFactsDecisions.stocks,
                    }}
                    validationSchema={schema}
                    onSubmit={async (values) => {
                      const savings = parseInt(values.savings)
                      const bonds = parseInt(values.bonds)
                      const stocks = parseInt(values.stocks)

                      await performAction({
                        variables: {
                          type: '',
                          payload: JSON.stringify({
                            bank: savings,
                            bonds,
                            stocks,
                          }),
                        },
                      })
                    }}
                  >
                    {(newDecisionForm) => {
                      return (
                        <Form>
                          <div className="mb-2 flex gap-2">
                            {decisions.map((decision) => {
                              const fieldName = decision.name.toLowerCase()
                              return (
                                <FormikNumberField
                                  key={fieldName}
                                  placeholder="0 %"
                                  label={decision.name}
                                  name={fieldName}
                                  tooltip={`Determine how much of all assets you want
                                      to invest in the ${decision.name}. The
                                      total should be equal to 100 percent.`}
                                  required
                                  data={{ cy: decision.name + '-cy' }}
                                  className={{ label: 'pb-2 font-normal' }}
                                />
                              )
                            })}
                          </div>
                          {newDecisionForm.errors.sum && (
                            <div className="text-red-500">
                              The sum of the input values must be{' '}
                              <span className="font-bold">100</span>!
                            </div>
                          )}
                          <Button
                            type="submit"
                            disabled={
                              !newDecisionForm.isValid ||
                              newDecisionForm.isSubmitting
                            }
                            data={{ cy: 'decision-submit' }}
                          >
                            Submit
                          </Button>
                        </Form>
                      )
                    }}
                  </Formik>
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
