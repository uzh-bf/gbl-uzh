import { Button } from '@uzh-bf/design-system'
import { signIn, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function AdminSignIn() {
  const t = useTranslations()
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

  let message = t('auth.signedOut')
  if (hasError) message = t('auth.signInError')
  else if (status === 'loading') message = t('auth.checkingSession')
  else if (isAdmin) message = t('auth.openingGames')
  else if (signInState === 'pending') message = t('auth.connecting')
  else if (status === 'authenticated') message = t('auth.adminRequired')

  return (
    <div className="font-player text-player-text flex min-h-[calc(100dvh-36px)] flex-col bg-[#fafafa] text-[18px] leading-[1.5] [&_*]:box-border">
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
            {t('auth.admin')}
          </p>
          <h1
            id="sign-in-heading"
            className="mt-[12px] mb-0 text-[28px] leading-[1.25] font-bold max-[600px]:text-[24px]"
          >
            {t('auth.title')}
          </h1>
          <p className="text-player-body mt-[12px] mb-0 max-[600px]:text-[16px]">
            {t('auth.introduction')}
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
            {t('auth.signIn')}
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
        <span>{t('auth.department')}</span>
        <span>StartInvest</span>
      </footer>
    </div>
  )
}
