import { config } from '@fortawesome/fontawesome-svg-core'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import { Toaster } from '../components/ui/toaster'
import { TRPCProvider } from '../lib/trpc'
// import { Toaster } from '@uzh-bf/design-system'

import '@fortawesome/fontawesome-svg-core/styles.css'
import RootLayout from '../components/RootLayout'
import '../globals.css'

config.autoAddCss = false

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <RootLayout>
      <SessionProvider session={session}>
        <TRPCProvider>
          <Toaster />

          <Component {...pageProps} />
        </TRPCProvider>
      </SessionProvider>
    </RootLayout>
  )
}
