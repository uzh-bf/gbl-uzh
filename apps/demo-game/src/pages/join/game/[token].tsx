import { useApolloClient } from '@apollo/client'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { WelcomeMessage } from '~/components/welcome/WelcomeControls'
import WelcomeSetup from '~/components/welcome/WelcomeSetup'
import {
  PrepareRegistrationDocument,
  RegisterPlayerDocument,
  type PrepareRegistrationMutation,
} from '~/graphql/generated/ops'
import { registrationError } from '~/lib/registration'

type Info = NonNullable<PrepareRegistrationMutation['prepareRegistration']>
export default function JoinGame() {
  const router = useRouter()
  const token = typeof router.query.token === 'string' ? router.query.token : ''
  if (!token)
    return <WelcomeMessage role="status">Loading game…</WelcomeMessage>
  return <Registration key={token} token={token} />
}

function Registration({ token }: { token: string }) {
  const router = useRouter()
  const client = useApolloClient()
  const [info, setInfo] = useState<Info | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let cancelled = false
    async function prepare() {
      try {
        // Establish the HttpOnly browser identity before any enrollment write.
        const prepared = await client.mutate({
          mutation: PrepareRegistrationDocument,
          variables: { token },
        })
        if (cancelled) return
        if (prepared.data?.resumeRegistration) {
          await client.clearStore()
          await router.replace('/play/cockpit')
        } else if (prepared.data?.prepareRegistration)
          setInfo(prepared.data.prepareRegistration)
      } catch (error) {
        if (!cancelled) setError(registrationError(error))
      }
    }
    void prepare()
    return () => {
      cancelled = true
    }
  }, [token, attempt, client, router])

  function retry() {
    setInfo(null)
    setError('')
    setAttempt((value) => value + 1)
  }

  if (error)
    return (
      <WelcomeMessage>
        <h1>Unable to join</h1>
        <p role="alert">{error}</p>
        <button onClick={retry}>Try again</button>
      </WelcomeMessage>
    )
  if (!info) return <WelcomeMessage role="status">Loading game…</WelcomeMessage>
  if (info.availability !== 'OPEN')
    return (
      <WelcomeMessage>
        <h1>{info.name}</h1>
        <p role="status">
          {info.availability === 'FULL'
            ? 'This game is full.'
            : 'Registration is closed.'}
        </p>
        <p>
          Already joined? Use your private return link or ask your instructor.
        </p>
        <button onClick={retry}>Check again</button>
      </WelcomeMessage>
    )
  return (
    <WelcomeSetup
      registration
      player={{ name: '', facts: {}, game: info }}
      onSave={async (name, facts) => {
        await client.mutate({
          mutation: RegisterPlayerDocument,
          variables: { token, name, facts: JSON.stringify(facts) },
        })
        await client.clearStore()
        await router.replace('/play/cockpit')
      }}
    />
  )
}
