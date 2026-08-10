import { config } from '@fortawesome/fontawesome-svg-core'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import { Toaster } from '../components/ui/toaster'
import { trpc } from '../lib/trpc'
// import { Toaster } from '@uzh-bf/design-system'

import '@fortawesome/fontawesome-svg-core/styles.css'
import RootLayout from '../components/RootLayout'
import '../globals.css'

config.autoAddCss = false

function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <RootLayout>
      <SessionProvider session={session}>
        <Toaster />

        <Component {...pageProps} />
      </SessionProvider>
    </RootLayout>
  )
}

export default trpc.withTRPC(App)
