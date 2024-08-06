import { useMutation, useQuery } from '@apollo/client'
import { PlayerDisplay } from '@gbl-uzh/ui'
import { Switch, Table } from '@uzh-bf/design-system'
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import {
  PerformActionDocument,
  ResultDocument,
} from 'src/graphql/generated/ops'
import { ActionTypes } from 'src/services/ActionsReducer'

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

function Cockpit() {
  const { loading, error, data } = useQuery(ResultDocument, {
    // TODO(JJ): This is the default fetchPolicy -> Remove? @RS
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

  // TODO(JJ):
  // - Make it visually more appealing
  // - Add title to every gamge state
  // - Add a color to the info
  // console.log(playerState)
  if (!currentGame) {
    return (
      <div>
        <h1> Demo Game </h1>
        <p>The game has not started yet.</p>
      </div>
    )
  }

  const resultFacts = playerDataResult.playerResult.facts
  const previousResults = playerDataResult.previousResults
  const resultFactsDecisions = resultFacts.decisions
  const assets = resultFacts.assets

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

  const columns_portfolio = [
    { label: 'Category', accessor: 'cat', sortable: false },
    { label: 'Value', accessor: 'val', sortable: false },
  ]

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
      return {
        ...acc,
        [value.ix]: val,
      }
    }
  }

  const assetsWithReturnsArr = resultFacts.assetsWithReturns
  const data_segment_results = [
    assetsWithReturnsArr.reduce(reduceFn('bank'), { cat: 'Savings' }),
    assetsWithReturnsArr.reduce(reduceFn('bonds'), { cat: 'Bonds' }),
    assetsWithReturnsArr.reduce(reduceFn('stocks'), { cat: 'Stocks' }),
    assetsWithReturnsArr.reduce(reduceFn('total'), { cat: 'Total' }),
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

  // TODO(JJ):
  // - Level is not consistent with component
  // Component wants a number, level is an object, though.
  // console.log(self)
  // - Do onclick logic
  // - PlayerDisplay is not ideal/nice yet

  const playerInfo = data.self
  const playerDisplay = (
    <div className="w-1/4">
      <PlayerDisplay
        achievements={playerInfo.achievements}
        name={playerInfo.name}
        color={playerInfo.color}
        level={playerInfo.level.id}
        xpToNext={playerInfo.experienceToNext}
        xp={playerInfo.experience}
        avatar={playerInfo.avatar}
        location={playerInfo.location}
        onClick={() => {}}
      />
    </div>
  )

  // Transactions
  // TODO(JJ): Integrate into the layout
  // The following is only temporary

  console.log(data.result.transactions)
  const transactions = (
    <div className="m-4">
      <h1 className="border-b-2 text-xl font-bold">History</h1>
      {data.result.transactions
        .slice(0)
        .reverse()
        .map(
          (transaction: {
            periodIx: number
            segmentIx: number
            type: string
            facts: { decision: boolean }
          }) => {
            return (
              <div className="flex flex-col border-b-2 py-2">
                <div className="flex">
                  <div>P {transaction.periodIx}</div>
                  <div>Q {transaction.segmentIx}</div>
                </div>
                <div className="flex justify-between">
                  <div>Decision: {transaction.type}</div>
                  <div> {transaction.facts.decision ? 'On' : 'Off'} </div>
                </div>
              </div>
            )
          }
        )}
    </div>
  )

  const header = (
    <div className="rounded border p-4">
      <div className="font-bold">
        Playing as {playerInfo.name} in game {currentGame.id}
      </div>

      <div className="">Current status: {currentGame.status}</div>
    </div>
  )

  switch (currentGame?.status) {
    case 'PREPARATION':
      return (
        <div className="flex w-full justify-between">
          <div>{header} Game is being prepared.</div>
          {playerDisplay}
        </div>
      )

    case 'COMPLETED':
      return <div> Game is completed. </div>

    case 'CONSOLIDATION':
      return (
        <div className="flex w-full justify-between">
          <div> Game is being consolidated. </div>
          {playerDisplay}
        </div>
      )

    case 'RESULTS':
      return (
        <div className="flex w-full justify-between">
          <div> RESULTS </div>
          {playerDisplay}
        </div>
      )

    case 'SCHEDULED':
      return (
        <div className="flex w-full justify-between">
          <div> Game is scheduled. </div>
          {playerDisplay}
        </div>
      )

    case 'PAUSED':
      const totalAssetsPerMonth = getTotalAssetsOfPreviousResults(
        previousResults
      ).map((s, i) => ({ total: s, month: 'month_' + String(i) }))
      return (
        <div className="flex w-full justify-between">
          <div>
            {header}
            <div className="max-w-2xl">
              <Table
                columns={columns_segment_results}
                data={data_segment_results}
                caption=""
              />
            </div>
            <div className="flex justify-center">Total over time chart</div>
            <LineChart width={600} height={400} data={totalAssetsPerMonth}>
              <Line type="monotone" dataKey="total" stroke="#8884d8" />
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </div>

          {playerDisplay}
        </div>
      )

    case 'RUNNING':
      return (
        <div className="flex w-full justify-between">
          <div className="w-3/4">
            {header}
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
                        // TODO(JJ): Discuss with @RS if we should rename
                        // payload -> facts
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
            {transactions}
          </div>
          {playerDisplay}
        </div>
      )
    default:
      return <div> Game has not been created yet. </div>
  }
}

export default Cockpit
