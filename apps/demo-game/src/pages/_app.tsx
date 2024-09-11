import { ApolloProvider } from '@apollo/client'
import { config } from '@fortawesome/fontawesome-svg-core'
import { useApollo } from '@gbl-uzh/platform/dist/lib/apollo'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import { Toaster } from '../components/ui/toaster'
// import { Toaster } from '@uzh-bf/design-system'

import '@fortawesome/fontawesome-svg-core/styles.css'
import RootLayout from '../components/RootLayout'
import '../globals.css'

config.autoAddCss = false

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const apolloClient = useApollo(pageProps.initialApolloState)

  return (
    <RootLayout>
      <SessionProvider session={session}>
        <ApolloProvider client={apolloClient}>
          <Toaster />

          <Component {...pageProps} />
        </ApolloProvider>
      </SessionProvider>
    </RootLayout>
  )
}
