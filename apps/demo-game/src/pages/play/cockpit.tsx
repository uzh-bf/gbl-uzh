import { useMutation, useQuery } from '@apollo/client'
import { EventLog } from '@gbl-uzh/ui'
import {
  Button,
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
  ShadcnTable as Table,
  ShadcnTableBody as TableBody,
  ShadcnTableCell as TableCell,
  ShadcnTableHead as TableHead,
  ShadcnTableHeader as TableHeader,
  ShadcnTableRow as TableRow,
} from '@uzh-bf/design-system'
import { useEffect, useRef, useState } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

import {
  PerformActionDocument,
  ResultDocument,
  UpdateReadyStateDocument,
} from 'src/graphql/generated/ops'
import { getSegmentEndResults } from 'src/lib/analysis'
import GameLayout from '~/components/GameLayout'
import AllocationForm from '~/components/cockpit/AllocationForm'
import AllocationSummary from '~/components/cockpit/AllocationSummary'
import styles from '~/components/cockpit/Cockpit.module.css'
import { useAllocationForm } from '~/components/cockpit/useAllocationForm'
import { useToast } from '~/components/ui/use-toast'

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

const DECISION_HISTORY_COLUMNS = [
  {
    key: 'time',
    label: 'Time',
    formatter: (_, row) => `P${row.period.index + 1} S${row.segment.index + 1}`,
  },
  {
    key: 'savings',
    label: 'Savings',
    formatter: (_, row) => `${row.decisions.bank}%`,
  },
  {
    key: 'bonds',
    label: 'Bonds',
    formatter: (_, row) => `${row.decisions.bonds}%`,
  },
  {
    key: 'stocks',
    label: 'Stocks',
    formatter: (_, row) => `${row.decisions.stocks}%`,
  },
]

function DecisionHistoryLog({ data }: { data: any[] }) {
  return (
    <EventLog
      title="Decision History"
      description="Chronological record of your portfolio allocation decisions across savings, bonds, and stocks by time period. P: Period S: Segment"
      data={data}
      maxHeightClass="h-56"
      columns={DECISION_HISTORY_COLUMNS}
    />
  )
}

function formatSegmentEndResults(results: any[]) {
  return results
    .filter((o) => o.type == 'SEGMENT_END')
    .map((e) => ({
      period: e.period,
      segment: e.segment,
      decisions: e.facts.decisions,
    }))
    .reverse()
}

const colors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
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

  const { loading, error, data, refetch } = useQuery(ResultDocument, {
    fetchPolicy: 'cache-and-network',
  })

  const [performAction] = useMutation(PerformActionDocument, {
    refetchQueries: [ResultDocument],
    awaitRefetchQueries: true,
  })

  const currentRound = `${data?.result?.currentGame?.id ?? ''}:${data?.result?.currentGame?.activePeriod?.id ?? ''}:${data?.result?.currentGame?.activePeriod?.activeSegment?.id ?? ''}`
  const roundRef = useRef(currentRound)
  useEffect(() => {
    roundRef.current = currentRound
  }, [currentRound])
  const { toast } = useToast()
  const [updateReadyState, { loading: updatingReady }] = useMutation(
    UpdateReadyStateDocument,
    {
      refetchQueries: [ResultDocument],
      awaitRefetchQueries: true,
    }
  )
  const allocationController = useAllocationForm(
    data?.result?.playerResult?.facts?.decisions,
    currentRound,
    (values) =>
      performAction({
        variables: { type: '', payload: JSON.stringify(values) },
      }),
    data?.result?.playerResult?.facts?.allocationSubmitted === true,
    data?.self?.isReady === true
  )

  const readyControl = {
    disabled:
      updatingReady ||
      allocationController.form.isSubmitting ||
      (data?.result?.currentGame?.status === 'RUNNING' &&
        allocationController.view === 'editing'),
    onChange: async (isReady: boolean) => {
      const changingRound = currentRound
      try {
        await updateReadyState({ variables: { isReady } })
      } catch {
        if (roundRef.current === changingRound)
          toast({
            title: 'Could not update Ready',
            description: 'Please try again.',
          })
      }
    },
  }

  useEffect(() => {
    if (data?.result?.currentGame?.periods?.length > 0) {
      setPeriod(data.result.currentGame.periods.length - 1)
    }
  }, [data?.result?.currentGame?.periods?.length])

  if (loading && !data) return null
  if (error && !data) return `Error! ${error}`

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
        <GameLayout
          data={data}
          refetchResult={refetch}
          readyControl={readyControl}
        >
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
        <GameLayout
          data={data}
          refetchResult={refetch}
          readyControl={readyControl}
        >
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
        <GameLayout
          data={data}
          refetchResult={refetch}
          readyControl={readyControl}
        >
          <div> Game is scheduled. </div>
        </GameLayout>
      )

    case 'CONSOLIDATION':
    case 'PAUSED': {
      const numPeriods = currentGame.periods.length
      const previousResults = playerDataResult.previousResults
      const previousSegmentResults = getSegmentEndResults(previousResults)
      const segmentEndResults = formatSegmentEndResults(previousResults)

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
      indexArr.forEach((i) => {
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
        <GameLayout
          data={data}
          refetchResult={refetch}
          readyControl={readyControl}
        >
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
                <DecisionHistoryLog data={segmentEndResults} />
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
                          Your portfolio&apos;s total value (total assets)
                          compared to benchmarks (savings, bonds and stocks,
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
                                        {(Number(value) * 100).toFixed(2)}%
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
      const resultFacts = playerDataResult.playerResult?.facts
      const { view, form } = allocationController
      return (
        <GameLayout
          data={data}
          refetchResult={refetch}
          readyControl={readyControl}
          allocationView={view}
          action={
            view === 'editing' ? (
              <Button
                key="submit-allocation"
                type="submit"
                form="allocation-form"
                className={{ root: `${styles.footerAction} ${styles.submit}` }}
                disabled={
                  !allocationController.valid ||
                  form.isSubmitting ||
                  updatingReady
                }
              >
                {form.isSubmitting ? 'Submitting…' : 'Submit allocation'}
              </Button>
            ) : (
              <Button
                key="change-allocation"
                type="button"
                className={{
                  root: `${styles.footerAction} ${styles.changeAllocation}`,
                }}
                disabled={
                  view === 'ready' || form.isSubmitting || updatingReady
                }
                onClick={allocationController.beginEditing}
              >
                Change allocation
              </Button>
            )
          }
        >
          {view === 'editing' ? (
            <AllocationForm
              controller={allocationController}
              disabled={updatingReady}
              assets={resultFacts?.assets?.totalAssets ?? 0}
              scenario={currentGame.activePeriod?.facts?.scenario}
            />
          ) : (
            <AllocationSummary
              allocation={allocationController.saved}
              assets={resultFacts?.assets?.totalAssets ?? 0}
              quarterNumber={
                (currentGame.activePeriod?.activeSegment?.index ?? 0) + 1
              }
              ready={view === 'ready'}
            />
          )}
        </GameLayout>
      )
    }

    default:
      return <div>Game has not been created yet.</div>
  }
}

export default Cockpit
