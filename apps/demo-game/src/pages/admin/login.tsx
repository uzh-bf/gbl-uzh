import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '~/components/admin/AdminControls'

function Login() {
  const { data: session } = useSession()

  if (session?.user) {
    return (
      <main className="mobile:app-panel mobile:app-body">
        Signed in as {session.user.email} <br />
        <Button onClick={() => signOut()}>Sign out</Button>
      </main>
    )
  }

  return (
    <main className="mobile:app-panel mobile:app-body">
      Not signed in <br />
      <Button
        onClick={() =>
          signIn('auth0', {
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/games`,
          })
        }
      >
        Sign in
      </Button>
    </main>
  )
}

export default Login
