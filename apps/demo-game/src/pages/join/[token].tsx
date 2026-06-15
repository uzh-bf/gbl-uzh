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
        console.error('Error logging in with join token:', error)
        handledToken.current = null
      }
    }

    void executeAsync()
  }, [isLoginAsTeamPending, loginAsTeamAsync, router, token])

  return null
}

export default Join
