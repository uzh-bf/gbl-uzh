import { useMutation, useQuery } from '@apollo/client'
import { Switch, Table } from '@uzh-bf/design-system'
import { useEffect, useState } from 'react'
import {
  PerformActionDocument,
  ResultDocument,
} from 'src/graphql/generated/ops'
import { ActionTypes } from 'src/services/ActionsReducer'

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

  const resultFacts = playerDataResult?.playerResult?.facts
  const currentGame = playerDataResult?.currentGame
  const self = playerState?.data?.self

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

  const transformer = ({ row, ix }: { row: any; ix?: number }) =>
    typeof row[ix ?? 0] === 'number' && `CHF ${row[ix ?? 0].toFixed(2)}`

  const columns_segment_results = [
    { label: '', accessor: 'cat', sortable: false },
    {
      label: 'Initial',
      accessor: '0',
      sortable: false,
      transformer: transformer,
    },
  ]

  for (let i = 1; i < 4; i++) {
    const strNum = String(i)
    columns_segment_results.push({
      label: 'Month ' + strNum,
      accessor: strNum,
      sortable: false,
      transformer: transformer,
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
      console.log(value)
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
      return <div>{header} Game is begin prepared.</div>

    case 'COMPLETED':
      return <div> Game is completed. </div>

    case 'CONSOLIDATION':
      return <div> Game is being consolidated. </div>

    case 'PREPARATION':
      return <div> Game is being prepared. </div>

    case 'RESULTS':
      return <div> RESULTS </div>

    case 'SCHEDULED':
      return <div> Game is scheduled. </div>

    case 'PAUSED':
      return (
        <div>
          {header}
          <div className="max-w-2xl">
            <Table
              columns={columns_segment_results}
              data={data_segment_results}
              caption=""
            />
          </div>
        </div>
      )

    case 'RUNNING':
      return (
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
      )
  }
}

export default Cockpit
