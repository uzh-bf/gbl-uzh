import Link from 'next/link'
import { useRouter } from 'next/router'
import { WelcomeMessage } from 'src/components/welcome/WelcomeControls'
import WelcomeSetup from 'src/components/welcome/WelcomeSetup'
import { trpc } from '~/lib/trpc'

function Welcome() {
  const router = useRouter()
  const editing = router.query.edit === '1'
  const tab =
    typeof router.query.tab === 'string' &&
    ['cockpit', 'market', 'history', 'team'].includes(router.query.tab)
      ? router.query.tab
      : 'cockpit'
  const returnUrl = editing ? `/play/cockpit?tab=${tab}` : '/play/cockpit'
  const utils = trpc.useUtils()
  const {
    data: self,
    isFetchedAfterMount,
    error,
    refetch,
  } = trpc.play.self.useQuery(undefined, {
    enabled: router.isReady,
    refetchOnMount: 'always',
  })
  const updatePlayerData = trpc.play.updatePlayerData.useMutation({
    onSuccess: () => utils.play.self.invalidate(),
  })

  if (!router.isReady || (!isFetchedAfterMount && !error))
    return <WelcomeMessage role="status">Loading your bank…</WelcomeMessage>

  if (error || !self) {
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
        <Link
          href={editing ? returnUrl : '/'}
          className="text-player-primary mobile:app-control"
        >
          {editing ? 'Back to game' : 'Back to Minigame'}
        </Link>
      </WelcomeMessage>
    )
  }

  return (
    <WelcomeSetup
      key={`${self.id}:${editing}`}
      player={self}
      onCancel={editing ? () => void router.replace(returnUrl) : undefined}
      onSave={async (name, facts) => {
        await updatePlayerData.mutateAsync({
          name,
          facts: JSON.stringify(facts),
        })
        await router.replace(returnUrl)
      }}
    />
  )
}

export default Welcome
