import { Button } from '@uzh-bf/design-system'
import { signIn, useSession } from 'next-auth/react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function AdminSignIn() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [signInState, setSignInState] = useState<'idle' | 'pending' | 'error'>(
    'idle'
  )
  const role = (session?.user as { role?: string } | undefined)?.role
  const isAdmin = role === 'ADMIN' || role === 'MASTER'
  const busy = status === 'loading' || isAdmin || signInState === 'pending'
  const hasError = signInState === 'error'

  useEffect(() => {
    if (status === 'authenticated' && isAdmin) {
      void router.replace('/admin/games')
    }
  }, [status, isAdmin, router])

  async function handleSignIn() {
    if (busy) return
    setSignInState('pending')

    try {
      await signIn('auth0', { callbackUrl: '/admin/games' })
    } catch {
      setSignInState('error')
    }
  }

  let message = 'You are not signed in.'
  if (hasError) message = 'Could not start sign-in. Please try again.'
  else if (status === 'loading') message = 'Checking your session…'
  else if (isAdmin) message = 'Opening your games…'
  else if (signInState === 'pending') message = 'Connecting to sign in…'
  else if (status === 'authenticated')
    message = 'Sign in with an administrator account.'

  return (
    <div className="font-player text-player-text flex min-h-dvh flex-col bg-[#fafafa] text-[18px] leading-[1.5] [&_*]:box-border">
      <Head>
        <title>Sign in to StartInvest</title>
      </Head>
      <header className="border-player-divider flex min-h-[92px] shrink-0 items-center border-b bg-white px-[40px] py-[24px] max-[600px]:min-h-[72px] max-[600px]:px-[20px] max-[600px]:py-[16px]">
        <Image
          src="/uzh-logo.svg"
          alt="Universität Zürich"
          width={134}
          height={46}
          priority
          className="h-auto w-[134px] max-[600px]:w-[116px]"
        />
      </header>

      <main className="flex flex-1 items-center justify-center px-[24px] py-[48px] max-[600px]:px-[16px] max-[600px]:py-[32px]">
        <section
          aria-labelledby="sign-in-heading"
          className="border-player-input w-full max-w-[592px] rounded-[16px] border bg-white px-[44px] py-[48px] shadow-[0_1px_4px_#00000012] max-[600px]:rounded-[12px] max-[600px]:px-[24px] max-[600px]:py-[32px]"
        >
          <p className="text-player-muted m-0 text-[14px] font-semibold tracking-[1px]">
            ADMIN
          </p>
          <h1
            id="sign-in-heading"
            className="mt-[12px] mb-0 text-[28px] leading-[1.25] font-bold max-[600px]:text-[24px]"
          >
            Sign in to StartInvest
          </h1>
          <p className="text-player-body mt-[12px] mb-0 max-[600px]:text-[16px]">
            Run games, roll the dice and show period reports to the class.
          </p>

          <Button
            type="button"
            primary
            disabled={busy}
            onClick={handleSignIn}
            className={{
              root: 'bg-player-primary font-player hover:bg-player-primary-hover focus-visible:outline-player-primary mt-[36px] min-h-[60px] w-full cursor-pointer rounded-[8px] border-0 px-[20px] py-[12px] text-[20px] leading-[1.5] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-[4px] disabled:cursor-wait disabled:opacity-60 max-[600px]:mt-[28px] max-[600px]:min-h-[48px] max-[600px]:text-[18px]',
            }}
          >
            Sign in
          </Button>

          <div className="border-player-border mt-[34px] border-t pt-[20px] text-[16px] max-[600px]:mt-[28px] max-[600px]:text-[14px]">
            <p
              role={hasError ? 'alert' : 'status'}
              className={
                hasError ? 'text-player-error m-0' : 'text-player-muted m-0'
              }
            >
              {message}
            </p>
          </div>
        </section>
      </main>

      <footer className="text-player-muted flex shrink-0 flex-wrap items-center justify-between gap-x-[24px] gap-y-[8px] px-[40px] pt-[16px] pb-[max(20px,env(safe-area-inset-bottom))] text-[16px] max-[600px]:px-[20px] max-[600px]:text-[14px]">
        <span>Department of Finance · Game Based Learning</span>
        <span>StartInvest</span>
      </footer>
    </div>
  )
}
