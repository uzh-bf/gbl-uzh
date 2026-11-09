import { useApolloClient } from '@apollo/client'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { WelcomeMessage } from '~/components/welcome/WelcomeControls'
import WelcomeSetup from '~/components/welcome/WelcomeSetup'
import {
  PrepareRegistrationDocument,
  RegisterPlayerDocument,
  type PrepareRegistrationMutation,
} from '~/graphql/generated/ops'
import type { MessageKey } from '~/i18n/catalogs'
import { registrationError } from '~/lib/registration'

type Info = NonNullable<PrepareRegistrationMutation['prepareRegistration']>
export default function JoinGame() {
  const t = useTranslations()
  const router = useRouter()
  const token = typeof router.query.token === 'string' ? router.query.token : ''
  if (!token)
    return (
      <WelcomeMessage role="status">
        {t('player.registration.loadingGame')}
      </WelcomeMessage>
    )
  return <Registration key={token} token={token} />
}

function Registration({ token }: { token: string }) {
  const t = useTranslations()
  const router = useRouter()
  const client = useApolloClient()
  const [info, setInfo] = useState<Info | null>(null)
  const [error, setError] = useState<MessageKey | ''>('')
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
        <h1>{t('player.registration.unableToJoin')}</h1>
        <p role="alert">{t(error)}</p>
        <button onClick={retry}>{t('player.quiz.retry')}</button>
      </WelcomeMessage>
    )
  if (!info)
    return (
      <WelcomeMessage role="status">
        {t('player.registration.loadingGame')}
      </WelcomeMessage>
    )
  if (info.availability !== 'OPEN')
    return (
      <WelcomeMessage>
        <h1>{info.name}</h1>
        <p role="status">
          {info.availability === 'FULL'
            ? t('player.registration.full')
            : t('player.registration.closed')}
        </p>
        <p>{t('player.registration.alreadyJoined')}</p>
        <button onClick={retry}>{t('player.registration.retry')}</button>
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
