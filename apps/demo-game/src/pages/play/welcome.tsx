import { useMutation, useQuery } from '@apollo/client'
import Link from 'next/link'
import { useRouter } from 'next/router'
import WelcomeSetup from 'src/components/welcome/WelcomeSetup'
import styles from 'src/components/welcome/WelcomeSetup.module.css'
import {
  SelfDocument,
  UpdatePlayerDataDocument,
} from 'src/graphql/generated/ops'

function Welcome() {
  const router = useRouter()
  const { data, loading, error, refetch } = useQuery(SelfDocument)
  const [updatePlayerData] = useMutation(UpdatePlayerDataDocument)

  if (loading)
    return (
      <main className={styles.message} role="status">
        Loading your bank…
      </main>
    )

  if (error || !data?.self) {
    return (
      <main className={styles.message}>
        <h1>We couldn’t load your bank</h1>
        <p role="alert">
          {error
            ? 'Please try again. Your bank details have not been changed.'
            : 'Open the join link from your instructor to set up your bank.'}
        </p>
        {error && <button onClick={() => void refetch()}>Try again</button>}
        <Link href="/">Back to Minigame</Link>
      </main>
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
