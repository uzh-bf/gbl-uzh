import { useMutation, useQuery } from '@apollo/client'
import { Switch, Table } from '@uzh-bf/design-system'
import { useEffect, useState } from 'react'
import {
  PerformActionDocument,
  ResultDocument,
} from 'src/graphql/generated/ops'
import { ActionTypes } from 'src/reducers/ActionsReducer'

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

  const resultFacts = playerState.data?.result?.playerResult?.facts
  const currentGame = playerState?.data?.result?.currentGame
  const self = playerState?.data?.self

  if (!currentGame) return null

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
      accessor: 0,
      sortable: false,
      transformer: (val, row) =>
        typeof val === 'number' && `CHF ${val.toFixed(2)}`,
    },
    {
      label: 'Month 1',
      accessor: 1,
      sortable: false,
      transformer: (val, row) =>
        typeof val === 'number' && `CHF ${val.toFixed(2)}`,
    },
    {
      label: 'Month 2',
      accessor: 2,
      sortable: false,
      transformer: (val, row) =>
        typeof val === 'number' && `CHF ${val.toFixed(2)}`,
    },
    {
      label: 'Month 3',
      accessor: 3,
      sortable: false,
      transformer: (val, row) =>
        typeof val === 'number' && `CHF ${val.toFixed(2)}`,
    },
  ]

  const columns_portfolio = [
    { label: 'Category', accessor: 'cat', sortable: false },
    { label: 'Value', accessor: 'val', sortable: false },
  ]

  const bankResults = Object.values(resultFacts.assetsWithReturns ?? {}).reduce(
    (acc, value) => {
      return {
        ...acc,
        [value.ix]: value.bank,
      }
    },
    { cat: 'Savings' }
  )

  const bondsResults = Object.values(
    resultFacts.assetsWithReturns ?? {}
  ).reduce(
    (acc, value) => {
      return {
        ...acc,
        [value.ix]: value.bonds,
      }
    },
    { cat: 'Bonds' }
  )

  const stocksResults = Object.values(
    resultFacts.assetsWithReturns ?? {}
  ).reduce(
    (acc, value) => {
      return {
        ...acc,
        [value.ix]: value.stocks,
      }
    },
    { cat: 'Stocks' }
  )

  const totalResults = Object.values(
    resultFacts.assetsWithReturns ?? {}
  ).reduce(
    (acc, value) => {
      return {
        ...acc,
        [value.ix]: value.totalAssets,
      }
    },
    { cat: 'Total' }
  )

  const data_segment_results = [
    bankResults,
    bondsResults,
    stocksResults,
    totalResults,
  ]

  const data_portfolio = [
    {
      cat: 'Savings',
      val: `CHF ${resultFacts.assets.bank.toFixed(2)}`,
    },
    {
      cat: 'Bonds',
      val: `CHF ${resultFacts.assets.bonds.toFixed(2)}`,
    },
    {
      cat: 'Stocks',
      val: `CHF ${resultFacts.assets.stocks.toFixed(2)}`,
    },
    {
      cat: 'Total',
      val: `CHF ${resultFacts.assets.totalAssets.toFixed(2)}`,
    },
  ]

  const header = (
    <div className="p-4 border rounded">
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

          <div className="p-4 border rounded">
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
