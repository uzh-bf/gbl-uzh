import { useQuery, useMutation } from '@apollo/client'
import { useContext, useState } from 'react'
import { PerformActionDocument, ResultDocument } from '@gbl-uzh/platform/dist/generated/ops'
import PlayerData from '@components/PlayerData'
import { ActionTypes } from 'src/reducers/ActionsReducer'
import { Switch } from '@uzh-bf/design-system'

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

    console.log(playerState?.data?.result?.currentGame)
    return (
      <div>
        <Switch label='Bank Decision' checked={bankDecisionState} id='switch'
          onCheckedChange={async (cheked) => {
            setBankDecisionState(cheked);
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
        <Switch label='Bonds Decision' checked={bondsDecisionState} id='switch'
          onCheckedChange={async (cheked) => {
            setBondsDecisionState(cheked);
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
        <Switch label='Stock Decision' checked={stockDecisionState} id='switch'
          onCheckedChange={async (cheked) => {
            setStockDecisionState(cheked);
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

export default Cockpit
