import { Form, ProbabilityChart, ReusableFormField } from '@gbl-uzh/ui'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ShadcnTable as Table,
  ShadcnTableBody as TableBody,
  ShadcnTableCell as TableCell,
  ShadcnTableHead as TableHead,
  ShadcnTableHeader as TableHeader,
  ShadcnTableRow as TableRow,
} from '@uzh-bf/design-system'

import GameLayout from '~/components/GameLayout'
import { getFacts, getNumber } from '~/lib/facts'
import { ActionTypes } from '~/types/facts'
import DecisionHistoryLog, {
  formatSegmentEndResults,
} from './DecisionHistoryLog'
import GameHeader from './GameHeader'

export type PortfolioFormValues = {
  savings: number
  bonds: number
  stocks: number
}

function RunningView({
  currentGame,
  playerDataResult,
  period,
  form,
  performAction,
  isSumValid,
  sum,
}) {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form

  const selectedPeriodFacts = getFacts(currentGame.periods[period ?? 0]?.facts)
  const selectedPeriodScenario = getFacts(selectedPeriodFacts.scenario)

  const resultFacts = getFacts(playerDataResult.playerResult?.facts)
  const assets = getFacts(resultFacts.assets)
  const resultFactsDecisions = getFacts(resultFacts.decisions)
  const previousResults = playerDataResult.previousResults

  const segmentEndResults = formatSegmentEndResults(previousResults)

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
      currentValue: `${getNumber(assets.bank).toFixed(2)} CHF`,
      futureValue: `${(
        getNumber(assets.totalAssets) *
        getNumber(resultFactsDecisions.bank) *
        0.01
      ).toFixed(2)} CHF`,
    },
    {
      category: 'Bonds',
      currentValue: `${getNumber(assets.bonds).toFixed(2)} CHF`,
      futureValue: `${(
        getNumber(assets.totalAssets) *
        getNumber(resultFactsDecisions.bonds) *
        0.01
      ).toFixed(2)} CHF`,
    },
    {
      category: 'Stocks',
      currentValue: `${getNumber(assets.stocks).toFixed(2)} CHF`,
      futureValue: `${(
        getNumber(assets.totalAssets) *
        getNumber(resultFactsDecisions.stocks) *
        0.01
      ).toFixed(2)} CHF`,
    },
    {
      category: 'Total',
      currentValue: `${getNumber(assets.totalAssets).toFixed(2)} CHF`,
      futureValue: `${getNumber(assets.totalAssets).toFixed(2)} CHF`,
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
                            {['category', 'currentValue', 'futureValue'].map(
                              (key, ix) => {
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
                              }
                            )}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8">
              <Form<PortfolioFormValues> {...form}>
                <form
                  onSubmit={handleSubmit(async (values) => {
                    const savings = parseInt(String(values.savings), 10)
                    const bonds = parseInt(String(values.bonds), 10)
                    const stocks = parseInt(String(values.stocks), 10)

                    await performAction.mutateAsync({
                      type: ActionTypes.NONE,
                      payload: JSON.stringify({
                        bank: savings,
                        bonds,
                        stocks,
                      }),
                    })
                  })}
                >
                  <div className="mb-4 flex gap-4">
                    <div className="w-24">
                      <ReusableFormField
                        control={control}
                        name="savings"
                        label="Savings"
                        type="number"
                        min={0}
                        max={100}
                      />
                    </div>
                    <div className="w-24">
                      <ReusableFormField
                        control={control}
                        name="bonds"
                        label="Bonds"
                        type="number"
                        min={0}
                        max={100}
                      />
                    </div>
                    <div className="w-24">
                      <ReusableFormField
                        control={control}
                        name="stocks"
                        label="Stocks"
                        type="number"
                        min={0}
                        max={100}
                      />
                    </div>
                  </div>
                  {!isSumValid && (
                    <div className="mb-4 text-sm text-red-500">
                      The sum of the input values must be{' '}
                      <span className="font-bold">100</span>! (Current: {sum}%)
                    </div>
                  )}
                  <Button type="submit" disabled={!isSumValid || isSubmitting}>
                    Submit
                  </Button>
                </form>
              </Form>
            </div>
          </CardContent>
          <CardFooter className="text-slate-500">
            The assets put in savings yield a continuous return of{' '}
            {getNumber(selectedPeriodScenario.interestBank) * 100}% per month.
            The return of bonds and stocks is determined by the market
            expectation and simulated by two dice.
          </CardFooter>
        </Card>

        <DecisionHistoryLog data={segmentEndResults} />

        <Card>
          <CardHeader>
            <CardTitle>Expectation for Bonds</CardTitle>
            <CardDescription>
              The expected value of and possible fluctuations in the bond price.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProbabilityChart
              trendE={getNumber(selectedPeriodScenario.trendBonds)}
              trendGap={getNumber(selectedPeriodScenario.gapBonds)}
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
              trendE={getNumber(selectedPeriodScenario.trendStocks)}
              trendGap={getNumber(selectedPeriodScenario.gapStocks)}
            />
          </CardContent>
        </Card>
      </div>
    </GameLayout>
  )
}

export default RunningView
