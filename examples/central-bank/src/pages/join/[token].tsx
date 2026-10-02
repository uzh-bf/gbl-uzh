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
  const handledToken = useRef<string | null>(null)

  useEffect(() => {
    if (!token || loginAsTeam.isPending || handledToken.current === token) {
      return
    }

    handledToken.current = token
    void loginAsTeam
      .mutateAsync({ token })
      .then(() => router.replace('/play/welcome'))
      .catch((error) => {
        console.error('Error logging in with join token:', error)
      })
  }, [loginAsTeam, router, token])

  const statusMessage = !token
    ? 'This join link is invalid.'
    : loginAsTeam.isError
      ? 'Could not join the game. The link may be invalid or expired — please ask for a new one.'
      : 'Joining the game…'

  return (
    <div className="m-auto flex min-h-screen max-w-md items-center justify-center p-8 text-center text-gray-700">
      {statusMessage}
    </div>
  )
}

export default Join
