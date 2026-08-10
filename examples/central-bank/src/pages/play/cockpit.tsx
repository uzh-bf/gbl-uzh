import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FormikNumberField,
  ShadcnTable as Table,
  ShadcnTableBody as TableBody,
  ShadcnTableCell as TableCell,
  ShadcnTableHead as TableHead,
  ShadcnTableHeader as TableHeader,
  ShadcnTableRow as TableRow,
} from '@uzh-bf/design-system'
import { Form, Formik } from 'formik'
import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import * as yup from 'yup'
import { getFacts } from '~/lib/facts'
import { trpc } from '~/lib/trpc'
import { DEFAULT_RATE, NEUTRAL_RATE, TREND_GROWTH } from '~/settings/Constants'
import type { PeriodFacts } from '~/types/Period'
import type { ResultFacts } from '~/types/facts'
import GameLayout from '../../components/GameLayout'
import { useToast } from '../../components/ui/use-toast'

function GameHeader({ currentGame }) {
  return (
    <div className="bg-card text-card-foreground flex items-center justify-between rounded-lg border p-4 shadow-sm">
      <div>
        <h2 className="text-xl font-bold tracking-tight">
          Game #{currentGame.id}
        </h2>
        <p className="text-muted-foreground text-xs">
          Monetary Policy Simulation
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="bg-primary/10 text-primary rounded px-2.5 py-0.5 text-sm font-medium">
          Status: {currentGame.status}
        </span>
      </div>
    </div>
  )
}
function MetricCard({
  title,
  value,
  subtext,
  colorClass = '',
  children,
}: {
  title: string
  value: string
  subtext: string
  colorClass?: string
  children?: React.ReactNode
}) {
  return (
    <Card className="min-w-[200px] flex-1">
      <CardHeader className="pb-2">
        <CardDescription className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
        <p className="text-muted-foreground mt-1 text-xs">{subtext}</p>
        {children}
      </CardContent>
    </Card>
  )
}

function renderDeviationMeter(val: number, target: number, range: number) {
  const diff = val - target
  const percentage = Math.min(100, Math.max(0, 50 + (diff / range) * 50))
  return (
    <div className="relative mt-3 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800">
      <div className="absolute top-0 right-[40%] bottom-0 left-[40%] rounded-sm bg-green-200/50 dark:bg-green-950/20"></div>
      <div className="absolute top-[-3px] left-[50%] h-3 w-0.5 bg-gray-400 dark:bg-gray-600"></div>
      <div
        className={`absolute top-[-3px] h-3 w-3 rounded-full border-2 border-white transition-all duration-300 dark:border-gray-900 ${
          Math.abs(diff) > range * 0.5 ? 'bg-red-500' : 'bg-green-500'
        }`}
        style={{ left: `calc(${percentage}% - 6px)` }}
      ></div>
    </div>
  )
}

function NewsflashBanner({ activeSegmentFacts }: { activeSegmentFacts: any }) {
  if (!activeSegmentFacts?.eventName) return null
  const isCalm = activeSegmentFacts.eventName === 'Calm markets'

  return (
    <Card
      className={
        isCalm
          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20'
          : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20'
      }
    >
      <CardHeader className="pb-2">
        <CardTitle
          className={`flex items-center gap-2 text-lg font-bold ${
            isCalm
              ? 'text-emerald-800 dark:text-emerald-300'
              : 'text-amber-800 dark:text-amber-300'
          }`}
        >
          {isCalm
            ? 'Market Situation'
            : `Breaking News: ${activeSegmentFacts.eventName}`}
        </CardTitle>
        <CardDescription>
          {isCalm
            ? 'No major external shocks affecting the economy.'
            : 'An external macroeconomic event is unfolding.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          {isCalm
            ? 'The economy is running on its baseline trend. Shocks are at 0%.'
            : `Macroeconomic shock detected: supply shock is ${
                activeSegmentFacts.supplyShock > 0
                  ? `+${activeSegmentFacts.supplyShock}`
                  : activeSegmentFacts.supplyShock
              }% and demand shock is ${
                activeSegmentFacts.demandShock > 0
                  ? `+${activeSegmentFacts.demandShock}`
                  : activeSegmentFacts.demandShock
              }%. Adjust your interest rate accordingly to steer the economy!`}
        </p>
      </CardContent>
    </Card>
  )
}

function MetricsSummary({
  resultFacts,
  scenario,
}: {
  resultFacts: any
  scenario: any
}) {
  return (
    <div className="flex flex-wrap gap-4">
      <MetricCard
        title="Current Inflation"
        value={`${(resultFacts.inflation ?? DEFAULT_RATE).toFixed(1)}%`}
        subtext={`Target: ${scenario.targetInflation.toFixed(1)}%`}
        colorClass={
          Math.abs(
            (resultFacts.inflation ?? DEFAULT_RATE) - scenario.targetInflation
          ) > 2
            ? 'text-red-500'
            : 'text-green-500'
        }
      >
        {renderDeviationMeter(
          resultFacts.inflation ?? DEFAULT_RATE,
          scenario.targetInflation,
          DEFAULT_RATE
        )}
      </MetricCard>
      <MetricCard
        title="Unemployment"
        value={`${(resultFacts.unemployment ?? DEFAULT_RATE).toFixed(1)}%`}
        subtext={`Natural Rate: ${scenario.naturalUnemployment.toFixed(1)}%`}
        colorClass={
          Math.abs(
            (resultFacts.unemployment ?? DEFAULT_RATE) -
              scenario.naturalUnemployment
          ) > 1.5
            ? 'text-red-500'
            : 'text-green-500'
        }
      >
        {renderDeviationMeter(
          resultFacts.unemployment ?? DEFAULT_RATE,
          scenario.naturalUnemployment,
          3.0
        )}
      </MetricCard>
      <MetricCard
        title="GDP Growth"
        value={`${(resultFacts.growth ?? 3.0).toFixed(1)}%`}
        subtext="Target: ~2.0-3.0%"
        colorClass={
          (resultFacts.growth ?? 3.0) < 0 ? 'text-red-500' : 'text-green-500'
        }
      >
        {renderDeviationMeter(resultFacts.growth ?? 3.0, 2.5, 5.0)}
      </MetricCard>
      <MetricCard
        title="Cumulative Loss"
        value={(resultFacts.cumulativePenalty ?? 0).toFixed(2)}
        subtext="Target: 0.0 (Perfect Mandate)"
      />
    </div>
  )
}

function HistoryChart({ history }) {
  const chartData = useMemo(() => {
    return (history || []).map((h: any) => ({
      round: `R${h.segmentIx + 1}`,
      inflation: h.inflation,
      unemployment: h.unemployment,
      growth: h.growth,
      rate: h.rate,
    }))
  }, [history])

  if (!chartData.length) {
    return (
      <div className="text-muted-foreground flex h-[300px] items-center justify-center">
        No economic history available yet. Play a round to see charts.
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="round" />
          <YAxis unit="%" />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="inflation"
            stroke="#ef4444"
            strokeWidth={2}
            name="Inflation"
          />
          <Line
            type="monotone"
            dataKey="unemployment"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Unemployment"
          />
          <Line
            type="monotone"
            dataKey="growth"
            stroke="#10b981"
            strokeWidth={2}
            name="GDP Growth"
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Policy Rate"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function Leaderboard() {
  const { data = [] } = trpc.results.listForCurrentGame.useQuery(undefined, {
    refetchInterval: 5000,
  })

  const leaderboard = useMemo(() => {
    if (!data) return []

    const latestResultByPlayer: Record<string, any> = {}
    data.forEach((res: any) => {
      const playerId = res.player.id
      const current = latestResultByPlayer[playerId]
      if (!current) {
        latestResultByPlayer[playerId] = res
      } else {
        const curPeriod = current.period?.index ?? -1
        const curSegment = current.segment?.index ?? -1
        const resPeriod = res.period?.index ?? -1
        const resSegment = res.segment?.index ?? -1
        if (
          resPeriod > curPeriod ||
          (resPeriod === curPeriod && resSegment > curSegment)
        ) {
          latestResultByPlayer[playerId] = res
        }
      }
    })

    return Object.values(latestResultByPlayer)
      .map((res: any) => ({
        id: res.player.id,
        name: res.player.name,
        cumulativePenalty: res.facts?.cumulativePenalty ?? 0,
        inflation: res.facts?.inflation ?? 0,
        unemployment: res.facts?.unemployment ?? 0,
        growth: res.facts?.growth ?? 0,
      }))
      .sort((a, b) => a.cumulativePenalty - b.cumulativePenalty)
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>
          Ranked by lowest cumulative mandate penalty (lower is better).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Governor (Team)</TableHead>
              <TableHead className="text-right">Inflation</TableHead>
              <TableHead className="text-right">Unemployment</TableHead>
              <TableHead className="text-right">Cumulative Penalty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((player, index) => (
              <TableRow
                key={player.id}
                className={index === 0 ? 'bg-primary/5 font-semibold' : ''}
              >
                <TableCell className="font-mono">#{index + 1}</TableCell>
                <TableCell>{player.name}</TableCell>
                <TableCell className="text-right">
                  {player.inflation.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  {player.unemployment.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right font-mono">
                  {player.cumulativePenalty.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function Cockpit() {
  const { data: playerDataResult } = trpc.play.result.useQuery()
  const utils = trpc.useUtils()
  const performAction = trpc.play.performAction.useMutation({
    async onSuccess() {
      await Promise.all([
        utils.play.result.invalidate(),
        utils.results.listForCurrentGame.invalidate(),
      ])
    },
  })
  const { toast } = useToast()

  const currentGame = playerDataResult?.currentGame
  const status = currentGame?.status

  const resultsQuery = trpc.results.listForCurrentGame.useQuery(undefined, {
    enabled:
      status !== 'RUNNING' &&
      status !== 'PREPARATION' &&
      status !== 'SCHEDULED',
    refetchInterval: 5000,
  })
  const resultsData = resultsQuery.data

  const activeSegmentFacts = useMemo(() => {
    const f = currentGame?.activePeriod?.activeSegment?.facts
    if (!f) return {}
    if (typeof f === 'string') {
      try {
        return JSON.parse(f)
      } catch {
        return {}
      }
    }
    return f
  }, [currentGame])

  const comparativeData = useMemo(() => {
    if (!resultsData) return []

    const playerMap: Record<string, any[]> = {}
    resultsData.forEach((res: any) => {
      if (res.period?.index === currentGame?.activePeriod?.index) {
        if (!playerMap[res.player.id]) playerMap[res.player.id] = []
        playerMap[res.player.id].push(res)
      }
    })

    return Object.entries(playerMap).map(([playerId, playerResults]) => {
      const activeSegResult = playerResults.find(
        (res) =>
          res.type === 'SEGMENT_END' &&
          res.segment?.index === currentGame?.activePeriod?.activeSegmentIx
      )
      const periodEndResult = playerResults.find(
        (res) => res.type === 'PERIOD_END'
      )

      const displayResult = periodEndResult || activeSegResult
      let facts = displayResult?.facts || {}
      if (typeof facts === 'string') {
        try {
          facts = JSON.parse(facts)
        } catch {
          facts = {}
        }
      }

      return {
        id: playerId,
        name: playerResults[0]?.player.name || 'Governor',
        inflation: facts.inflation ?? 0,
        unemployment: facts.unemployment ?? 0,
        growth: facts.growth ?? 0,
        cumulativePenalty: facts.cumulativePenalty ?? 0,
        exchangeRate: facts.exchangeRateIndex ?? 100,
        tradeBalance: facts.tradeBalance ?? 0,
        spilloverInflation: facts.spilloverInflation ?? 0,
        spilloverUnemployment: facts.spilloverUnemployment ?? 0,
        history: [...playerResults]
          .filter((res) => res.type === 'SEGMENT_END')
          .sort((a, b) => (a.segment?.index ?? 0) - (b.segment?.index ?? 0))
          .map((res) => {
            let f = res.facts
            if (typeof f === 'string') {
              try {
                f = JSON.parse(f)
              } catch {
                f = {}
              }
            }
            return f.decisions?.rate ?? DEFAULT_RATE
          }),
      }
    })
  }, [resultsData, currentGame])

  const policyHistoryData = useMemo(() => {
    if (!currentGame?.activePeriod) return []
    const segCount =
      currentGame.activePeriod.activeSegmentIx !== null &&
      currentGame.activePeriod.activeSegmentIx !== undefined
        ? currentGame.activePeriod.activeSegmentIx + 1
        : 0
    const chartPoints = []

    for (let i = 0; i < segCount; i++) {
      const point: any = { round: `R${i + 1}` }
      comparativeData.forEach((team) => {
        point[team.name] = team.history[i] ?? DEFAULT_RATE
      })
      chartPoints.push(point)
    }
    return chartPoints
  }, [comparativeData, currentGame])

  if (!playerDataResult) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading cockpit...
      </div>
    )
  }

  const resultFacts = getFacts(
    playerDataResult.playerResult?.facts
  ) as ResultFacts
  const activePeriodFacts = getFacts(currentGame.activePeriod?.facts)
  const scenario = (activePeriodFacts.scenario as
    PeriodFacts['scenario'] | undefined) || {
    targetInflation: 2.0,
    naturalUnemployment: 5.0,
  }

  switch (status) {
    case 'PREPARATION':
    case 'COMPLETED':
    case 'SCHEDULED':
      return (
        <GameLayout>
          <div className="space-y-6">
            <GameHeader currentGame={currentGame} />
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Central Bank!</CardTitle>
                <CardDescription>
                  Monetary Policy Learning Simulation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  As the Governor of the Central Bank, your objective is to
                  steer the economy toward the target inflation of{' '}
                  <span className="font-bold">{scenario.targetInflation}%</span>{' '}
                  while keeping unemployment close to the natural rate of{' '}
                  <span className="font-bold">
                    {scenario.naturalUnemployment}%
                  </span>
                  .
                </p>
                <p className="text-muted-foreground text-sm">
                  Wait for the facilitator to start the period and segment. Once
                  running, you will be able to adjust the interest rate.
                </p>
              </CardContent>
            </Card>
          </div>
        </GameLayout>
      )

    case 'RUNNING': {
      const currentRate = resultFacts.decisions?.rate ?? DEFAULT_RATE
      const inflation = resultFacts.inflation ?? 4.0
      const growth = resultFacts.growth ?? 3.0
      const targetInflation = scenario.targetInflation ?? 2.0

      const taylorRate =
        NEUTRAL_RATE +
        1.5 * (inflation - targetInflation) +
        0.5 * (growth - TREND_GROWTH)
      const recommendedRate = Math.min(
        15,
        Math.max(0, parseFloat(taylorRate.toFixed(2)))
      )

      const schema = yup.object({
        rate: yup
          .number()
          .min(0, 'Policy rate cannot be below 0%')
          .max(15, 'Policy rate cannot exceed 15%')
          .required('Policy rate is required'),
      })

      return (
        <GameLayout>
          <div className="space-y-6">
            <GameHeader currentGame={currentGame} />

            {/* Event Newsflash Banner */}
            <NewsflashBanner activeSegmentFacts={activeSegmentFacts} />

            {/* Current Metrics */}
            <MetricsSummary resultFacts={resultFacts} scenario={scenario} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Decision Form */}
              <div className="flex flex-col gap-4 lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Set Policy Interest Rate</CardTitle>
                    <CardDescription>
                      Adjust the interest rate to steer the economy. Higher
                      rates cool inflation but slow growth and increase
                      unemployment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Formik
                      initialValues={{
                        rate: currentRate,
                      }}
                      validationSchema={schema}
                      onSubmit={async (values) => {
                        try {
                          await performAction.mutateAsync({
                            type: '',
                            payload: JSON.stringify({
                              rate: parseFloat(values.rate.toString()),
                            }),
                          })
                          toast({
                            title: 'Decision submitted',
                            description: `Policy rate set to ${values.rate}%`,
                          })
                        } catch (e: any) {
                          toast({
                            title: 'Error submitting decision',
                            description: e.message,
                            variant: 'destructive',
                          })
                        }
                      }}
                    >
                      {(formik) => (
                        <Form className="space-y-4">
                          <FormikNumberField
                            placeholder="e.g. 4.0"
                            label="Interest Rate (%)"
                            name="rate"
                            tooltip="Select your central bank interest rate between 0% and 15%."
                            required
                            data={{ cy: 'rate-input-cy' }}
                            className={{ label: 'pb-2 font-semibold' }}
                          />
                          <div className="pt-1">
                            <input
                              type="range"
                              min="0"
                              max="15"
                              step="0.25"
                              value={formik.values.rate}
                              onChange={(e) => {
                                formik.setFieldValue(
                                  'rate',
                                  parseFloat(e.target.value)
                                )
                              }}
                              className="accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                            />
                            <div className="text-muted-foreground flex justify-between px-1 pt-1 text-[10px]">
                              <span className="font-semibold text-blue-500">
                                Dovish (0%)
                              </span>
                              <span className="text-gray-400">
                                Neutral (4%)
                              </span>
                              <span className="font-semibold text-red-500">
                                Hawkish (15%)
                              </span>
                            </div>
                          </div>
                          <Button
                            type="submit"
                            disabled={!formik.isValid || formik.isSubmitting}
                            className={{ root: 'mt-4 w-full' }}
                          >
                            Submit Policy Rate
                          </Button>
                        </Form>
                      )}
                    </Formik>
                  </CardContent>
                </Card>

                {/* Economic Advisor Outlook Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-primary text-sm font-bold tracking-wider uppercase">
                      Economic Advisor Outlook
                    </CardTitle>
                    <CardDescription>
                      Theoretical recommendation based on the Taylor Rule.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline justify-between border-b pb-2">
                      <span className="text-muted-foreground text-xs font-semibold">
                        Recommended Rate:
                      </span>
                      <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                        {recommendedRate.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-muted-foreground space-y-2 text-xs">
                      <p>
                        The Taylor Rule aims to balance inflation and growth:
                      </p>
                      <div className="bg-muted rounded p-1.5 font-mono text-[10px] select-all">
                        Rate = {NEUTRAL_RATE.toFixed(1)} + 1.5 * (Inflation -{' '}
                        {targetInflation.toFixed(1)}) + 0.5 * (Growth -{' '}
                        {TREND_GROWTH.toFixed(1)})
                      </div>
                      <ul className="list-disc space-y-1 pl-4">
                        <li>
                          Inflation Gap:{' '}
                          <span className="text-foreground font-semibold">
                            {(inflation - targetInflation).toFixed(2)}%
                          </span>{' '}
                          {inflation > targetInflation ? 'above' : 'below'}{' '}
                          target.
                        </li>
                        <li>
                          Output Gap (GDP):{' '}
                          <span className="text-foreground font-semibold">
                            {(growth - 2.5).toFixed(2)}%
                          </span>{' '}
                          relative to trend.
                        </li>
                      </ul>
                      <p className="text-muted-foreground/80 border-t pt-1 text-[10px] italic">
                        *Note: Shocks and spillovers are unpredictable and will
                        cause deviation from this target.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Graphical Trend */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Economic Trends</CardTitle>
                  <CardDescription>
                    Historical overview of inflation, unemployment, and growth.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HistoryChart history={resultFacts.history} />
                </CardContent>
              </Card>
            </div>
          </div>
        </GameLayout>
      )
    }

    case 'PAUSED':
    case 'CONSOLIDATION': {
      return (
        <GameLayout>
          <div className="space-y-6">
            <GameHeader currentGame={currentGame} />

            {/* Event Newsflash Banner (Keep visible during results review) */}
            <NewsflashBanner activeSegmentFacts={activeSegmentFacts} />

            {/* Current Metrics */}
            <MetricsSummary resultFacts={resultFacts} scenario={scenario} />

            {/* Tactical Charts (Only own history, no spillovers or team comparisons yet) */}
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Economic History</CardTitle>
                  <CardDescription>
                    Historical path of your economic metrics across segments in
                    this policy cycle.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <HistoryChart history={resultFacts.history} />
                </CardContent>
              </Card>
            </div>
          </div>
        </GameLayout>
      )
    }

    case 'RESULTS': {
      return (
        <GameLayout>
          <div className="space-y-6">
            <GameHeader currentGame={currentGame} />

            {/* Event Newsflash Banner (Keep visible during results review) */}
            <NewsflashBanner activeSegmentFacts={activeSegmentFacts} />

            {/* Current Metrics */}
            <MetricsSummary resultFacts={resultFacts} scenario={scenario} />

            {/* International Trade Spillover Report (visible if spillovers calculated) */}
            {resultFacts.exchangeRateIndex !== undefined && (
              <Card>
                <CardHeader>
                  <CardTitle>International Spillover & FX Report</CardTitle>
                  <CardDescription>
                    How your monetary policy interacted with other countries
                    during the policy cycle.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Card className="bg-muted/50 border-none">
                      <CardContent className="p-4 text-center">
                        <div className="text-muted-foreground text-xs font-semibold uppercase">
                          Exchange Rate Index
                        </div>
                        <div
                          className={`mt-1 text-xl font-bold ${
                            resultFacts.exchangeRateIndex > 100.05
                              ? 'text-blue-600'
                              : resultFacts.exchangeRateIndex < 99.95
                                ? 'text-amber-600'
                                : 'text-gray-600'
                          }`}
                        >
                          {resultFacts.exchangeRateIndex.toFixed(1)}
                        </div>
                        <div className="text-muted-foreground mt-0.5 text-[10px]">
                          {resultFacts.exchangeRateIndex > 100.05
                            ? 'Appreciated 📈'
                            : resultFacts.exchangeRateIndex < 99.95
                              ? 'Depreciated 📉'
                              : 'Stable ⚖️'}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50 border-none">
                      <CardContent className="p-4 text-center">
                        <div className="text-muted-foreground text-xs font-semibold uppercase">
                          Trade Balance
                        </div>
                        <div
                          className={`mt-1 text-xl font-bold ${
                            resultFacts.tradeBalance > 0.01
                              ? 'text-green-600'
                              : resultFacts.tradeBalance < -0.01
                                ? 'text-red-600'
                                : 'text-gray-600'
                          }`}
                        >
                          {resultFacts.tradeBalance > 0
                            ? `+${resultFacts.tradeBalance.toFixed(2)}`
                            : resultFacts.tradeBalance.toFixed(2)}
                          % of GDP
                        </div>
                        <div className="text-muted-foreground mt-0.5 text-[10px]">
                          {resultFacts.tradeBalance > 0.01
                            ? 'Trade Surplus 💰'
                            : resultFacts.tradeBalance < -0.01
                              ? 'Trade Deficit 💸'
                              : 'Balanced ⚖️'}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50 border-none">
                      <CardContent className="p-4 text-center">
                        <div className="text-muted-foreground text-xs font-semibold uppercase">
                          Imported Inflation
                        </div>
                        <div
                          className={`mt-1 text-xl font-bold ${
                            resultFacts.spilloverInflation > 0.01
                              ? 'text-red-600'
                              : resultFacts.spilloverInflation < -0.01
                                ? 'text-green-600'
                                : 'text-gray-600'
                          }`}
                        >
                          {resultFacts.spilloverInflation > 0
                            ? `+${resultFacts.spilloverInflation.toFixed(2)}`
                            : resultFacts.spilloverInflation.toFixed(2)}
                          %
                        </div>
                        <div className="text-muted-foreground mt-0.5 text-[10px]">
                          Spillover from global rates
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/50 border-none">
                      <CardContent className="p-4 text-center">
                        <div className="text-muted-foreground text-xs font-semibold uppercase">
                          Export Job Effect
                        </div>
                        <div
                          className={`mt-1 text-xl font-bold ${
                            resultFacts.spilloverUnemployment > 0.01
                              ? 'text-red-600'
                              : resultFacts.spilloverUnemployment < -0.01
                                ? 'text-green-600'
                                : 'text-gray-600'
                          }`}
                        >
                          {resultFacts.spilloverUnemployment > 0
                            ? `+${resultFacts.spilloverUnemployment.toFixed(2)}`
                            : resultFacts.spilloverUnemployment.toFixed(2)}
                          %
                        </div>
                        <div className="text-muted-foreground mt-0.5 text-[10px]">
                          Unemployment change
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="text-muted-foreground bg-primary/5 border-primary/10 rounded border p-3 text-xs">
                    <span className="text-primary font-semibold">
                      Economic Briefing:
                    </span>{' '}
                    {resultFacts.exchangeRateIndex > 100.05 ? (
                      <span>
                        Your relatively high interest rate attracted capital
                        inflows,{' '}
                        <strong>appreciating your exchange rate</strong> to{' '}
                        {resultFacts.exchangeRateIndex.toFixed(1)}. This made
                        imports cheaper (lowering domestic inflation by{' '}
                        {Math.abs(resultFacts.spilloverInflation).toFixed(2)}%),
                        but hurt your export competitiveness, creating a{' '}
                        <strong>trade deficit</strong> of{' '}
                        {Math.abs(resultFacts.tradeBalance).toFixed(2)}% and
                        raising unemployment by{' '}
                        {resultFacts.spilloverUnemployment.toFixed(2)}%.
                      </span>
                    ) : resultFacts.exchangeRateIndex < 99.95 ? (
                      <span>
                        Your relatively low interest rate caused capital
                        outflows,{' '}
                        <strong>depreciating your exchange rate</strong> to{' '}
                        {resultFacts.exchangeRateIndex.toFixed(1)}. This boosted
                        your exports (creating a <strong>trade surplus</strong>{' '}
                        of {resultFacts.tradeBalance.toFixed(2)}% and lowering
                        unemployment by{' '}
                        {Math.abs(resultFacts.spilloverUnemployment).toFixed(2)}
                        %), but increased the price of imports, adding{' '}
                        <strong>imported inflation</strong> of{' '}
                        {resultFacts.spilloverInflation.toFixed(2)}% to your
                        economy.
                      </span>
                    ) : (
                      <span>
                        Your monetary policy was in perfect sync with your
                        trading partners. Exchange rates remained stable, and
                        international trade spillover effects were neutral.
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Leaderboard */}
              <div className="lg:col-span-1">
                <Leaderboard />
              </div>

              {/* Charts & Analysis */}
              <div className="space-y-6 lg:col-span-2">
                {/* Economic History Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Economic History</CardTitle>
                    <CardDescription>
                      Historical path of the economic factors under your policy
                      rate (with period-end spillovers applied).
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HistoryChart history={resultFacts.history} />
                  </CardContent>
                </Card>

                {/* Comparative Charts */}
                {policyHistoryData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Policy Rate Comparison</CardTitle>
                      <CardDescription>
                        Compare interest rate paths chosen by all central bank
                        governors.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={policyHistoryData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              opacity={0.3}
                            />
                            <XAxis dataKey="round" />
                            <YAxis unit="%" />
                            <Tooltip />
                            <Legend />
                            {comparativeData.map((team, idx) => {
                              const colors = [
                                '#3b82f6',
                                '#ef4444',
                                '#10b981',
                                '#f59e0b',
                                '#8b5cf6',
                                '#ec4899',
                                '#ec4899',
                              ]
                              const color = colors[idx % colors.length]
                              return (
                                <Line
                                  key={team.name}
                                  type="monotone"
                                  dataKey={team.name}
                                  stroke={color}
                                  strokeWidth={2}
                                />
                              )
                            })}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {comparativeData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Global Market Comparison</CardTitle>
                      <CardDescription>
                        Compare final economic states across all Central Banks.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={comparativeData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              opacity={0.3}
                            />
                            <XAxis dataKey="name" />
                            <YAxis unit="%" />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="inflation"
                              fill="#ef4444"
                              name="Inflation (%)"
                            />
                            <Bar
                              dataKey="unemployment"
                              fill="#3b82f6"
                              name="Unemployment (%)"
                            />
                            <Bar
                              dataKey="growth"
                              fill="#10b981"
                              name="GDP Growth (%)"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={comparativeData} layout="vertical">
                            <CartesianGrid
                              strokeDasharray="3 3"
                              opacity={0.3}
                            />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip />
                            <Bar
                              dataKey="cumulativePenalty"
                              fill="#6b7280"
                              name="Cumulative Loss (lower is better)"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </GameLayout>
      )
    }
  }
}
