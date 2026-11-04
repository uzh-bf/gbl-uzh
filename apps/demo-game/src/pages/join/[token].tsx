import { useMutation } from '@apollo/client'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { LoginAsTeamDocument } from 'src/graphql/generated/ops'
import { WelcomeMessage } from '~/components/welcome/WelcomeControls'
import { parseFacts } from '~/lib/facts'
import { bankSetupSchema } from '~/lib/registration'

export default function Join() {
  const t = useTranslations()
  const router = useRouter()
  const [loginAsTeam, { client }] = useMutation(LoginAsTeamDocument)
  const token = typeof router.query.token === 'string' ? router.query.token : ''
  const [error, setError] = useState(false)
  useEffect(() => {
    if (!token) return
    let cancelled = false
    async function login() {
      try {
        const { data } = await loginAsTeam({
          variables: { token },
        })
        if (cancelled) return
        const player = data?.loginAsTeam
        if (!player) throw new Error('Login failed')
        const complete = bankSetupSchema.isValidSync({
          ...parseFacts(player.facts),
          name: player.name,
        })
        await client.clearStore()
        await router.replace(complete ? '/play/cockpit' : '/play/welcome')
      } catch {
        if (!cancelled) setError(true)
      }
    }
    void login()
    return () => {
      cancelled = true
    }
  }, [token, loginAsTeam, client, router])
  return (
    <WelcomeMessage role={error ? 'alert' : 'status'}>
      {error
        ? t('player.registration.returnError')
        : t('player.registration.openingBank')}
    </WelcomeMessage>
  )
}
