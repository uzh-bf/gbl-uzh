import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { trpc } from '~/lib/trpc'

function Join() {
  const router = useRouter()
  const token =
    typeof router.query?.token === 'string'
      ? router.query.token
      : Array.isArray(router.query?.token)
        ? router.query.token[0]
        : undefined

  const loginAsTeam = trpc.auth.loginAsTeam.useMutation()
  const { isPending: isLoginAsTeamPending, mutateAsync: loginAsTeamAsync } =
    loginAsTeam
  const handledToken = useRef<string | null>(null)

  useEffect(() => {
    if (!token) return
    if (isLoginAsTeamPending) return
    if (handledToken.current === token) return

    handledToken.current = token
    const executeAsync = async () => {
      try {
        await loginAsTeamAsync({ token })
        await router.replace('/play/welcome')
      } catch (error) {
        // Keep `handledToken` set so the effect does not immediately refire the
        // same failing token (which would loop login attempts against the
        // server). The error is surfaced below via `loginAsTeam.isError`.
        console.error('Error logging in with join token:', error)
      }
    }

    void executeAsync()
  }, [isLoginAsTeamPending, loginAsTeamAsync, router, token])

  // Previously this always rendered `null`, so an invalid/expired token left the
  // user on a permanently blank page with no explanation. Surface the state.
  const message = !token
    ? 'This join link is invalid.'
    : loginAsTeam.isError
      ? 'Could not join the game. The link may be invalid or expired — please ask for a new one.'
      : 'Joining the game…'

  return (
    <div className="m-auto flex min-h-screen max-w-md items-center justify-center p-8 text-center text-gray-700">
      {message}
    </div>
  )
}

export default Join
