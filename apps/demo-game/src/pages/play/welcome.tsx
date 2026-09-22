import { useMutation, useQuery } from '@apollo/client'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { WelcomeMessage } from 'src/components/welcome/WelcomeControls'
import WelcomeSetup from 'src/components/welcome/WelcomeSetup'
import {
  SelfDocument,
  UpdatePlayerDataDocument,
} from 'src/graphql/generated/ops'

function Welcome() {
  const router = useRouter()
  const { data, loading, error, refetch } = useQuery(SelfDocument)
  const [updatePlayerData] = useMutation(UpdatePlayerDataDocument)

  if (loading)
    return <WelcomeMessage role="status">Loading your bank…</WelcomeMessage>

  if (error || !data?.self) {
    return (
      <WelcomeMessage>
        <h1 className="mobile:app-heading">We couldn’t load your bank</h1>
        <p role="alert">
          {error
            ? 'Please try again. Your bank details have not been changed.'
            : 'Open the join link from your instructor to set up your bank.'}
        </p>
        {error && (
          <button
            className="text-player-primary mobile:app-control"
            onClick={() => void refetch()}
          >
            Try again
          </button>
        )}
        <Link href="/" className="text-player-primary mobile:app-control">
          Back to Minigame
        </Link>
      </WelcomeMessage>
    )
  }

  return (
    <WelcomeSetup
      key={data.self.id}
      player={data.self}
      onStart={async (name, facts) => {
        await updatePlayerData({
          variables: { name, facts: JSON.stringify(facts) },
        })
        await router.replace('/play/cockpit')
      }}
    />
  )
}

export default Welcome
