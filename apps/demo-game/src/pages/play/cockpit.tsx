import { useMutation, useQuery } from '@apollo/client'
import { Switch } from '@uzh-bf/design-system'
import { useEffect, useState } from 'react'
import {
  PerformActionDocument,
  ResultDocument,
} from 'src/graphql/generated/ops'
import { ActionTypes } from 'src/reducers/ActionsReducer'

function Cockpit() {
  const playerState = useQuery(ResultDocument, { fetchPolicy: 'cache-first' })
  const [bankDecisionState, setBankDecisionState] = useState(null)
  const [bondsDecisionState, setBondsDecisionState] = useState(null)
  const [stockDecisionState, setStockDecisionState] = useState(null)

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
          <div class="wrapper">
            <div class="entry">...</div>
          </div>
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
