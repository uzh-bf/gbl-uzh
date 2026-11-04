import { useMutation, useQuery } from '@apollo/client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { WelcomeMessage } from 'src/components/welcome/WelcomeControls'
import WelcomeSetup from 'src/components/welcome/WelcomeSetup'
import {
  SelfDocument,
  UpdatePlayerDataDocument,
} from 'src/graphql/generated/ops'

function Welcome() {
  const t = useTranslations()
  const router = useRouter()
  const editing = router.query.edit === '1'
  const tab =
    typeof router.query.tab === 'string' &&
    ['cockpit', 'market', 'history', 'team'].includes(router.query.tab)
      ? router.query.tab
      : 'cockpit'
  const returnUrl = editing ? `/play/cockpit?tab=${tab}` : '/play/cockpit'
  const { data, loading, error, refetch } = useQuery(SelfDocument, {
    skip: !router.isReady,
    fetchPolicy: 'network-only',
  })
  const [updatePlayerData] = useMutation(UpdatePlayerDataDocument)

  if (!router.isReady || loading)
    return (
      <WelcomeMessage role="status">
        {t('player.setup.loadingBank')}
      </WelcomeMessage>
    )

  if (error || !data?.self) {
    return (
      <WelcomeMessage>
        <h1 className="mobile:app-heading">
          {t('player.setup.loadBankError')}
        </h1>
        <p role="alert">
          {error ? t('player.setup.retryHint') : t('player.setup.joinLinkHint')}
        </p>
        {error && (
          <button
            className="text-player-primary mobile:app-control"
            onClick={() => void refetch()}
          >
            {t('player.quiz.retry')}
          </button>
        )}
        <Link
          href={editing ? returnUrl : '/'}
          className="text-player-primary mobile:app-control"
        >
          {editing
            ? t('player.setup.backToGame')
            : t('player.setup.backToMinigame')}
        </Link>
      </WelcomeMessage>
    )
  }

  return (
    <WelcomeSetup
      key={`${data.self.id}:${editing}`}
      player={data.self}
      onCancel={editing ? () => void router.replace(returnUrl) : undefined}
      onSave={async (name, facts) => {
        await updatePlayerData({
          variables: { name, facts: JSON.stringify(facts) },
        })
        await router.replace(returnUrl)
      }}
    />
  )
}

export default Welcome
