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
      playerState?.data?.result?.playerResult?.facts.bankDecision
    )
    setBondsDecisionState(
      playerState?.data?.result?.playerResult?.facts.bondDecision
    )
    setStockDecisionState(
      playerState?.data?.result?.playerResult?.facts.stockDecision
    )
  }, [playerState])

  const [performAction, updatedPlayerResult] = useMutation(
    PerformActionDocument,
    {
      refetchQueries: 'active',
    }
  )

  // <Table columns={columns} data={data} caption="Table with example data" />
        
  const columns = [
    { label: 'Category', accessor: 'cat', sortable: false },
    { label: 'Month 1', accessor: 'mon1', sortable: false },
    { label: 'Month 2', accessor: 'mon2', sortable: false },
    { label: 'Month 3', accessor: 'mon2', sortable: false },
  ]

  const data = [
    { cat: 'Portfolio: Saving', mon1: 100, mon2: 200, mon3: 300 },
    { cat: 'Portfolio: Stocks', mon1: 100, mon2: 200, mon3: 300 },
    { cat: 'Portfolio: Bonds', mon1: 100, mon2: 200, mon3: 300 },
  ]

  console.log(playerState?.data?.result?.currentGame)
  switch (playerState?.data?.result?.currentGame?.status) {
    case 'PREPARATION':
      return <div>Game is begin prepared.</div>

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
      return <div> 
          <Table columns={columns} data={data} caption="Segment Results" />
        </div>

    case 'RUNNING':
      return (
       
        <div>
        
          <Switch
            label="Bank Decision"
            checked={bankDecisionState}
            id="switch"
            onCheckedChange={async (cheked) => {
              setBankDecisionState(cheked)
              await performAction({
                variables: {
                  type: ActionTypes.DECIDE_BANK,
                  payload: JSON.stringify({
                    decision: cheked,
                  }),
                },
              })
            }}
          />
          <Switch
            label="Bonds Decision"
            checked={bondsDecisionState}
            id="switch"
            onCheckedChange={async (cheked) => {
              setBondsDecisionState(cheked)
              await performAction({
                variables: {
                  type: ActionTypes.DECIDE_BONDS,
                  payload: JSON.stringify({
                    decision: cheked,
                  }),
                },
              })
            }}
          />
          <Switch
            label="Stock Decision"
            checked={stockDecisionState}
            id="switch"
            onCheckedChange={async (cheked) => {
              setStockDecisionState(cheked)
              await performAction({
                variables: {
                  type: ActionTypes.DECIDE_STOCK,
                  payload: JSON.stringify({
                    decision: cheked,
                  }),
                },
              })
            }}
          />
        </div>
      )
  }
}

export default Cockpit
