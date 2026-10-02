import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { trpc } from '~/lib/trpc'

function firstParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0]
  return undefined
}

function Join() {
  const router = useRouter()
  const token = firstParam(router.query?.token)

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
  function statusMessage(): string {
    if (!token) return 'This join link is invalid.'
    if (loginAsTeam.isError) {
      return 'Could not join the game. The link may be invalid or expired — please ask for a new one.'
    }
    return 'Joining the game…'
  }

  return (
    <div className="m-auto flex min-h-screen max-w-md items-center justify-center p-8 text-center text-gray-700">
      {statusMessage()}
    </div>
  )
}

export default Join
