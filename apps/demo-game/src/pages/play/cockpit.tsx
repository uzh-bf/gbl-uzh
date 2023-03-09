import { useMutation, useQuery } from '@apollo/client'
import { Switch, Table } from '@uzh-bf/design-system'
import { useState } from 'react'
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

  const [performAction, updatedPlayerResult] = useMutation(
    PerformActionDocument,
    {
      refetchQueries: 'active',
    }
  )

  const columns = [
    { label: 'Count', accessor: 'count', sortable: true },
    { label: 'Answer', accessor: 'answer', sortable: true },
    { label: 'Username', accessor: 'username', sortable: false },
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
      return <div> Game is paused. </div>

    case 'RUNNING':
      return (
        <div>

          <Table columns={columns} data={data} caption="Table with example data" />
          
        
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
        </div>)
  }
}

export default Cockpit
