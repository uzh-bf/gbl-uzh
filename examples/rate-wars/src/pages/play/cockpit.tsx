import { useMutation, useQuery } from '@apollo/client'
import {
  Button,
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
  FormikNumberField,
  ShadcnTable as Table,
  ShadcnTableBody as TableBody,
  ShadcnTableCell as TableCell,
  ShadcnTableHead as TableHead,
  ShadcnTableHeader as TableHeader,
  ShadcnTableRow as TableRow,
} from '@uzh-bf/design-system'

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import { Form, Formik } from 'formik'
import {
  PerformActionDocument,
  ResultDocument,
} from 'src/graphql/generated/ops'
import * as yup from 'yup'
import GameLayout from '../../components/GameLayout'

function GameHeader({ currentGame }) {
  return (
    <div className="col-span-2 flex justify-between rounded border p-4">
      <div className="font-bold">Rate Wars — Game {currentGame.id}</div>
      <div>Current status: {currentGame.status}</div>
    </div>
  )
}

const chf = (v: number | undefined | null) =>
  typeof v === 'number' ? `${v.toFixed(2)} CHF` : '—'
const pct = (v: number | undefined | null, digits = 2) =>
  typeof v === 'number' ? `${v.toFixed(digits)}%` : '—'

// Resolve a bank's display name from the (token-free) player list.
function bankName(players: any[], playerId: string, selfId: string) {
  const p = players?.find((p) => p.id === playerId)
  const base = p?.name ?? `Bank ${playerId.slice(0, 4)}`
  return playerId === selfId ? `${base} (you)` : base
}

function MarketOverviewTable({
  market,
  players,
  selfId,
}: {
  market: any[]
  players: any[]
  selfId: string
}) {
  const rows = [...market].sort((a, b) => a.rank - b.rank)
  return (
    <Table data-cy="market-table">
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Bank</TableHead>
          <TableHead className="text-right">Deposit rate</TableHead>
          <TableHead className="text-right">Loan rate</TableHead>
          <TableHead className="text-right">Deposit share</TableHead>
          <TableHead className="text-right">Loan share</TableHead>
          <TableHead className="text-right">Profit</TableHead>
          <TableHead className="text-right">Equity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.playerId}
            className={row.playerId === selfId ? 'font-bold' : ''}
          >
            <TableCell>{row.rank}</TableCell>
            <TableCell data-cy={`bank-${row.rank}`}>
              {bankName(players, row.playerId, selfId)}
            </TableCell>
            <TableCell className="text-right">{pct(row.depositRate)}</TableCell>
            <TableCell className="text-right">{pct(row.loanRate)}</TableCell>
            <TableCell className="text-right">
              {pct(row.depositShare * 100, 1)}
            </TableCell>
            <TableCell className="text-right">
              {pct(row.loanShare * 100, 1)}
            </TableCell>
            <TableCell className="text-right">{chf(row.profit)}</TableCell>
            <TableCell className="text-right">{chf(row.equity)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function IncomeStatementTable({ income }: { income: any }) {
  const rows = [
    { label: 'Interest income from loans', value: income.interestIncome },
    { label: 'Treasury income (central bank)', value: income.treasuryIncome },
    { label: 'Interest paid on deposits', value: -income.interestExpense },
    { label: 'Credit losses (defaults)', value: -income.creditLoss },
    { label: 'Operating cost', value: -income.fixedCost },
  ]
  return (
    <Table data-cy="income-statement">
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.label}>
            <TableCell>{r.label}</TableCell>
            <TableCell
              className={`text-right ${r.value < 0 ? 'text-red-600' : 'text-green-700'}`}
            >
              {chf(r.value)}
            </TableCell>
          </TableRow>
        ))}
        <TableRow className="font-bold">
          <TableCell>Profit</TableCell>
          <TableCell
            className={`text-right ${income.profit < 0 ? 'text-red-600' : 'text-green-700'}`}
          >
            {chf(income.profit)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

function ScenarioCard({ scenario }: { scenario: any }) {
  if (!scenario) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle>Market conditions this year</CardTitle>
        <CardDescription>
          Set by the central bank and the economy — identical for all banks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Central bank rate (on unlent funds)</TableCell>
              <TableCell className="text-right">
                {pct(scenario.centralBankRate)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Deposit pool (all savers)</TableCell>
              <TableCell className="text-right">
                {chf(scenario.depositPool)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Loan demand (all borrowers)</TableCell>
              <TableCell className="text-right">
                {chf(scenario.loanDemand)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Expected default rate</TableCell>
              <TableCell className="text-right">
                {pct(scenario.baseDefaultRate)} ± shocks
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Operating cost</TableCell>
              <TableCell className="text-right">
                {chf(scenario.fixedCost)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function Cockpit() {
  const { loading, error, data } = useQuery(ResultDocument, {
    fetchPolicy: 'cache-first',
  })

  const [performAction] = useMutation(PerformActionDocument, {
    refetchQueries: [ResultDocument],
  })

  if (loading) return null
  if (error) return `Error! ${error}`

  const playerDataResult = data.result
  if (!playerDataResult) return null
  const currentGame = playerDataResult.currentGame
  const players = currentGame?.players ?? []
  const selfId = data.self?.id

  switch (currentGame?.status) {
    case 'PREPARATION':
    case 'COMPLETED':
      return (
        <GameLayout>
          <div className="w-full">
            <GameHeader currentGame={currentGame} />
            <div className="mt-4 text-gray-600">
              The next year is being prepared — waiting for the facilitator.
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

    case 'RUNNING': {
      const resultFacts = playerDataResult.playerResult.facts
      const decisions = resultFacts.decisions ?? { depositRate: 1, loanRate: 4 }
      const scenario = currentGame.activePeriod?.facts?.scenario
      const lastMarket = resultFacts.lastMarket

      const schema = yup.object({
        depositRate: yup
          .number()
          .min(0, 'Deposit rate must be at least 0%')
          .max(8, 'Deposit rate can be at most 8%')
          .required('Deposit rate is required'),
        loanRate: yup
          .number()
          .min(0, 'Loan rate must be at least 0%')
          .max(15, 'Loan rate can be at most 15%')
          .required('Loan rate is required'),
      })

      return (
        <GameLayout>
          <div className="flex w-full grid-cols-2 flex-col gap-4 xl:grid">
            <GameHeader currentGame={currentGame} />

            <Card>
              <CardHeader>
                <CardTitle>Set your rates</CardTitle>
                <CardDescription>
                  Deposits chase high deposit rates; borrowers chase low loan
                  rates. Your margin is the spread — if you attract volume.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-sm text-gray-600">
                  Equity:{' '}
                  <span className="font-bold">{chf(resultFacts.equity)}</span>
                  {' · '}Cumulative profit:{' '}
                  <span className="font-bold">
                    {chf(resultFacts.cumulativeProfit)}
                  </span>
                </div>
                <Formik
                  initialValues={{
                    depositRate: decisions.depositRate,
                    loanRate: decisions.loanRate,
                  }}
                  validationSchema={schema}
                  onSubmit={async (values) => {
                    await performAction({
                      variables: {
                        type: '',
                        payload: JSON.stringify({
                          depositRate: Number(values.depositRate),
                          loanRate: Number(values.loanRate),
                        }),
                      },
                    })
                  }}
                >
                  {(form) => (
                    <Form>
                      <div className="mb-2 flex gap-2">
                        <FormikNumberField
                          name="depositRate"
                          label="Deposit rate (%)"
                          placeholder="1.0"
                          tooltip="What you pay savers per year. Allowed: 0–8%."
                          required
                          data={{ cy: 'deposit-rate' }}
                          className={{ label: 'pb-2 font-normal' }}
                        />
                        <FormikNumberField
                          name="loanRate"
                          label="Loan rate (%)"
                          placeholder="4.0"
                          tooltip="What you charge borrowers per year. Allowed: 0–15%."
                          required
                          data={{ cy: 'loan-rate' }}
                          className={{ label: 'pb-2 font-normal' }}
                        />
                      </div>
                      <div className="mb-2 text-sm text-gray-600">
                        Spread:{' '}
                        <span className="font-bold">
                          {pct(
                            Number(form.values.loanRate) -
                              Number(form.values.depositRate)
                          )}
                        </span>
                      </div>
                      <Button
                        type="submit"
                        disabled={!form.isValid || form.isSubmitting}
                        data={{ cy: 'submit-rates' }}
                      >
                        Submit rates
                      </Button>
                    </Form>
                  )}
                </Formik>
              </CardContent>
              <CardFooter className="text-sm text-slate-500">
                You can resubmit until the facilitator closes the year. Funds
                you attract but cannot lend earn the central bank rate.
              </CardFooter>
            </Card>

            <ScenarioCard scenario={scenario} />

            {lastMarket && (
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Last year&apos;s market</CardTitle>
                  <CardDescription>
                    How the market split last year — use it to position
                    yourself.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MarketOverviewTable
                    market={lastMarket}
                    players={players}
                    selfId={selfId}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </GameLayout>
      )
    }

    case 'CONSOLIDATION':
    case 'PAUSED': {
      const resultFacts = playerDataResult.playerResult.facts
      const decisions = resultFacts.decisions
      return (
        <GameLayout>
          <div className="flex w-full flex-col gap-4">
            <GameHeader currentGame={currentGame} />
            <Card>
              <CardHeader>
                <CardTitle>Rates locked</CardTitle>
                <CardDescription>
                  The market is clearing — results follow when the facilitator
                  opens them.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Your deposit rate</TableCell>
                      <TableCell className="text-right">
                        {pct(decisions?.depositRate)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Your loan rate</TableCell>
                      <TableCell className="text-right">
                        {pct(decisions?.loanRate)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="font-bold">
                      <TableCell>Spread</TableCell>
                      <TableCell className="text-right">
                        {pct(
                          (decisions?.loanRate ?? 0) -
                            (decisions?.depositRate ?? 0)
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </GameLayout>
      )
    }

    case 'RESULTS': {
      const periodEndResults = playerDataResult.previousResults.filter(
        (o) => o.type === 'PERIOD_END'
      )
      const latest = periodEndResults[periodEndResults.length - 1]
      if (!latest) {
        return (
          <GameLayout>
            <div className="w-full">
              <GameHeader currentGame={currentGame} />
              <div className="mt-4">No results yet.</div>
            </div>
          </GameLayout>
        )
      }

      const facts = latest.facts
      const history = facts.history ?? []
      const lastSnapshot = history[history.length - 1]
      const market = facts.lastMarket ?? []

      const equitySeries = [
        {
          year: 'Start',
          equity: history[0]?.equityStart ?? facts.equity,
        },
        ...history.map((h) => ({
          year: `Year ${h.periodIx + 1}`,
          equity: h.equityEnd,
        })),
      ]

      const equityConfig = {
        equity: { label: 'Equity', color: 'var(--chart-1)' },
      }

      return (
        <GameLayout>
          <div className="flex w-full flex-col gap-4">
            <GameHeader currentGame={currentGame} />

            <Card data-cy="leaderboard">
              <CardHeader>
                <CardTitle>
                  Leaderboard — Year {(lastSnapshot?.periodIx ?? 0) + 1}
                </CardTitle>
                <CardDescription>
                  Ranked by equity. Realized default rate this year:{' '}
                  {pct(lastSnapshot?.realizedDefaultRate)}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MarketOverviewTable
                  market={market}
                  players={players}
                  selfId={selfId}
                />
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4 lg:flex-row">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Your income statement</CardTitle>
                  <CardDescription>
                    Where your profit came from — and where it went.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {lastSnapshot && (
                    <IncomeStatementTable income={lastSnapshot.income} />
                  )}
                  {lastSnapshot && (
                    <div className="mt-4 text-sm text-gray-600">
                      Deposits attracted: {chf(lastSnapshot.deposits)} · Loans
                      made: {chf(lastSnapshot.loans)} · Parked at central bank:{' '}
                      {chf(lastSnapshot.excess)} · ROE:{' '}
                      {pct(lastSnapshot.roe * 100)}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Your equity over time</CardTitle>
                  <CardDescription>
                    Cumulative result of your rate-setting.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={equityConfig}>
                    <LineChart data={equitySeries} accessibilityLayer>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                      />
                      <Line
                        type="natural"
                        dataKey="equity"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                      />
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="year"
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
            </div>
          </div>
        </GameLayout>
      )
    }

    default:
      return <div>Game has not been created yet.</div>
  }
}

export default Cockpit
