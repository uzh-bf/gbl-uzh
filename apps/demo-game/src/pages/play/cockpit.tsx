import { useMutation, useQuery } from '@apollo/client'
import { PlayerDisplay } from '@gbl-uzh/ui'
import { Switch, Table } from '@uzh-bf/design-system'
import { useEffect, useState } from 'react'
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
  const playerState = useQuery(ResultDocument, { fetchPolicy: 'cache-first' })
  const [bankDecisionState, setBankDecisionState] = useState(false)
  const [bondsDecisionState, setBondsDecisionState] = useState(false)
  const [stockDecisionState, setStockDecisionState] = useState(false)

  useEffect(() => {
    setBankDecisionState(
      playerState?.data?.result?.playerResult?.facts.decisions.bank
    )
    setBondsDecisionState(
      playerState?.data?.result?.playerResult?.facts.decisions.bonds
    )
    setStockDecisionState(
      playerState?.data?.result?.playerResult?.facts.decisions.stocks
    )
  }, [playerState])

  const [performAction, updatedPlayerResult] = useMutation(
    PerformActionDocument,
    {
      refetchQueries: 'active',
    }
  )

  const playerData = playerState.data
  const playerDataResult = playerData?.result
  const currentGame = playerDataResult?.currentGame

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
  const resultFacts = playerDataResult?.playerResult?.facts
  const previousResults = playerDataResult?.previousResults
  const self = playerState?.data?.self

  const decisions = [
    {
      name: 'Bank',
      label: (percentage: number, totalAssets: number) =>
        `Invest ${(percentage * 100).toFixed()}% (CHF ${(
          totalAssets * percentage
        ).toFixed(2)}) into bank.`,
      effect: setBankDecisionState,
      state: bankDecisionState,
      action: ActionTypes.DECIDE_BANK,
    },
    {
      name: 'Bonds',
      label: (percentage: number, totalAssets: number) =>
        `Invest ${(percentage * 100).toFixed()}% (CHF ${(
          totalAssets * percentage
        ).toFixed(2)}) into bonds.`,
      effect: setBondsDecisionState,
      state: bondsDecisionState,
      action: ActionTypes.DECIDE_BONDS,
    },
    {
      name: 'Stocks',
      label: (percentage: number, totalAssets: number) =>
        `Invest ${(percentage * 100).toFixed()}% (CHF ${(
          totalAssets * percentage
        ).toFixed(2)}) into stocks.`,
      effect: setStockDecisionState,
      state: stockDecisionState,
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

  const assetsWithReturnsArr = Object.values(
    resultFacts?.assetsWithReturns ?? {}
  )

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

  const data_segment_results = [
    assetsWithReturnsArr.reduce(reduceFn('bank'), { cat: 'Savings' }),
    assetsWithReturnsArr.reduce(reduceFn('bonds'), { cat: 'Bonds' }),
    assetsWithReturnsArr.reduce(reduceFn('stocks'), { cat: 'Stocks' }),
    assetsWithReturnsArr.reduce(reduceFn('total'), { cat: 'Total' }),
  ]

  const data_portfolio = [
    {
      cat: 'Savings',
      val: `CHF ${resultFacts?.assets.bank.toFixed(2)}`,
    },
    {
      cat: 'Bonds',
      val: `CHF ${resultFacts?.assets.bonds.toFixed(2)}`,
    },
    {
      cat: 'Stocks',
      val: `CHF ${resultFacts?.assets.stocks.toFixed(2)}`,
    },
    {
      cat: 'Total',
      val: `CHF ${resultFacts?.assets.totalAssets.toFixed(2)}`,
    },
  ]

  // TODO(JJ):
  // - Level is not consistent with component
  // Component wants a number, level is an object, though.
  // console.log(self)
  // - Do onclick logic
  // - PlayerDisplay is not ideal/nice yet
  const playerDisplay = (
    <div className="w-1/4">
      <PlayerDisplay
        achievements={self?.achievements}
        name={self?.name}
        color={self?.color}
        level={0}
        xpToNext={self?.experienceToNext}
        xp={self?.experience}
        avatar={self?.avatar}
        location={self?.location}
        onClick={() => {}}
      />
    </div>
  )

  const header = (
    <div className="rounded border p-4">
      <div className="font-bold">
        Playing as {self?.name} in game {currentGame.id}
      </div>

      <div className="">Current status: {currentGame.status}</div>
    </div>
  )

  switch (currentGame?.status) {
    case 'PREPARATION':
      return (
        <div className="flex w-full justify-between">
          <div>{header} Game is begin prepared.</div>
          {/* <div>{playerDisplay}</div> */}
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
          <div>
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
                              (+bankDecisionState +
                                +bondsDecisionState +
                                +stockDecisionState)
                          : 0,
                        resultFacts.assets.totalAssets
                      )}
                      checked={decision.state}
                      id="switch"
                      onCheckedChange={async (checked) => {
                        decision.effect(checked)
                        await performAction({
                          variables: {
                            type: decision.action,
                            payload: JSON.stringify({
                              decision: checked,
                            }),
                          },
                        })
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
          {playerDisplay}
        </div>
      )
    default:
      return <div> Game has not been created yet. </div>
  }
}

export default Cockpit
