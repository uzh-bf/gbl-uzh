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
  ShadcnTable as Table,
  ShadcnTableBody as TableBody,
  ShadcnTableCell as TableCell,
  ShadcnTableHead as TableHead,
  ShadcnTableHeader as TableHeader,
  ShadcnTableRow as TableRow,
} from '@uzh-bf/design-system'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

import GameLayout from '~/components/GameLayout'
import { getFacts, getFactsArray, getNumber, type FactMap } from '~/lib/facts'
import { colors } from './chartColors'
import DecisionHistoryLog, {
  formatSegmentEndResults,
} from './DecisionHistoryLog'
import GameHeader from './GameHeader'

const LABEL_MAP = {
  accTotalAssetsReturn: 'Total Assets Return',
  accBankBenchmarkReturn: 'Savings Return',
  accBondsBenchmarkReturn: 'Bonds Return',
  accStocksBenchmarkReturn: 'Stocks Return',
}

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

type SegmentResultColumn = {
  label: string
  accessor: string
}

function ConsolidationView({
  currentGame,
  playerDataResult,
  period,
  setPeriod,
}) {
  const activePeriodFacts = getFacts(currentGame.activePeriod?.facts)

  const numPeriods = currentGame.periods.length
  const previousResults = playerDataResult.previousResults
  const previousSegmentResults = previousResults.filter(
    (o) => o.type === 'SEGMENT_END'
  )
  const segmentEndResults = formatSegmentEndResults(previousResults)

  const assetsWithReturnsFlat = previousSegmentResults.flatMap((e) =>
    getFactsArray(getFacts(e.facts).assetsWithReturns)
  )

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

  const allDataPerPeriod = Array.from(Array(numPeriods).keys()).map((ix) => {
    const from = ix * numMonths
    const to = from + numMonths
    return assetsWithReturnsFlatClean.slice(from, to)
  })

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

  const numMonthsPerSegment = Math.max(
    1,
    Math.floor(getNumber(activePeriodFacts.rollsPerSegment))
  )
  const numMonthsInTable = numMonthsPerSegment + 1
  const periodIx = currentGame.activePeriod.index + 1

  const activeSegmentIx = currentGame.activePeriod.activeSegment.index
  const indexArr = Array.from({ length: numMonthsInTable }, (_, i) => i - 1)
  const columns_segment_results: SegmentResultColumn[] = [
    { label: '', accessor: 'cat' },
    ...indexArr.map((i) => {
      const index = (i + activeSegmentIx * numMonthsPerSegment) % numMonths

      const strNum = String(i + 1)
      const p = index === -1 ? periodIx - 1 : periodIx
      const m = index === -1 ? months[numMonths + index] : months[index]

      return {
        label: m + ' Period ' + p,
        accessor: strNum,
      }
    }),
  ]
  const segmentResultAccessors = columns_segment_results.map(
    (column) => column.accessor
  )

  type SegmentSeries = Record<string, number>

  const reduceFn = (type: string) => {
    return (acc: SegmentSeries, value: FactMap) => {
      let val = getNumber(value.bank)
      const idx = String(getNumber(value.ix))
      if (type == 'bonds') {
        val = getNumber(value.bonds)
      } else if (type == 'stocks') {
        val = getNumber(value.stocks)
      } else if (type == 'total') {
        val = getNumber(value.totalAssets)
      }
      acc[idx] = val
      return acc
    }
  }

  const resultFacts = getFacts(playerDataResult.playerResult?.facts)
  const assetsWithReturnsArr = getFactsArray(resultFacts.assetsWithReturns)
  const data_segment_results = [
    {
      cat: 'Savings',
      ...(assetsWithReturnsArr.reduce(reduceFn('bank'), {}) as Record<
        string,
        number
      >),
    },
    {
      cat: 'Bonds',
      ...(assetsWithReturnsArr.reduce(reduceFn('bonds'), {}) as Record<
        string,
        number
      >),
    },
    {
      cat: 'Stocks',
      ...(assetsWithReturnsArr.reduce(reduceFn('stocks'), {}) as Record<
        string,
        number
      >),
    },
    {
      cat: 'Total',
      ...(assetsWithReturnsArr.reduce(reduceFn('total'), {}) as Record<
        string,
        number
      >),
    },
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
                  Assets of the last month of the previous segment, and of the
                  next months of the current segment.
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
                      {data_segment_results.map((row) => {
                        const rowData = row as Record<string, unknown> & {
                          cat: string
                        }
                        return (
                          <TableRow
                            key={rowData.cat}
                            className={`${
                              rowData.cat === 'Total' ? 'font-bold' : ''
                            }`}
                          >
                            {segmentResultAccessors.map((key, ix) => {
                              if (ix > 0) {
                                return (
                                  <TableCell
                                    key={key}
                                    className={`${
                                      key === '0' ? 'text-gray-400' : ''
                                    }`}
                                  >
                                    <div className="flex justify-end">
                                      {getNumber(rowData[key]).toFixed(2)} CHF
                                    </div>
                                  </TableCell>
                                )
                              }
                              return (
                                <TableCell key={key}>
                                  <div className="flex">
                                    {String(rowData[key] ?? '')}
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
                      Your portfolio&apos;s total value (total assets) compared
                      to benchmarks (savings, bonds and stocks, respectively)
                      over time.
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
                      Total accumulated returns of your portfolio (total assets)
                      with respect to the initial capital over time (per time
                      period).
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

export default ConsolidationView
