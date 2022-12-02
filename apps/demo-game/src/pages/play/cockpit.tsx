import { useQuery } from '@apollo/client'
import { useContext } from 'react'
import { ResultDocument } from '@gbl-uzh/platform/dist/generated/ops'
import PlayerData from '@components/PlayerData'

function Cockpit() {
    const playerState = useQuery(ResultDocument, { fetchPolicy: 'cache-first' })

    console.log(playerState?.data?.result?.currentGame)
    return (
       <div>
         Hi
       </div>
    )
}

export default Cockpit
