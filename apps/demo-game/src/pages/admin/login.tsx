import { Button } from '@uzh-bf/design-system'
import { signIn, signOut, useSession } from 'next-auth/react'

function Login() {
  const { data: session } = useSession()

  if (session?.user) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <Button onClick={() => signOut()}>Sign out</Button>
      </>
    )
  }

  return (
    <>
      Not signed in <br />
      <Button
        onClick={() =>
          signIn('github', {
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/games`,
          })
        }
      >
        Sign in
      </Button>
    </>
  )
}

export default Login
