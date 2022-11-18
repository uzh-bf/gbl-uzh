import { useMutation } from '@apollo/client'
import { LoginAsTeamDocument } from '@gbl-uzh/platform/dist/generated/ops'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

function Join() {
  const router = useRouter()

  const [loginAsTeam] = useMutation(LoginAsTeamDocument)

  useEffect(() => {
    if (router.query?.token) {
      const executeAsync = async () => {
        await loginAsTeam({
          variables: { token: router.query.token as string },
        })
        router.push('/play/welcome')
      }
      executeAsync()
    }
  }, [router.query?.token])

  return null
}

export default Join
