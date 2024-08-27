import { ApolloProvider } from '@apollo/client'
import { config } from '@fortawesome/fontawesome-svg-core'
import { useApollo } from '@gbl-uzh/platform/dist/lib/apollo'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'

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
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName="p-4"
            containerStyle={{}}
            toastOptions={{
              // Define default options
              duration: 10000,
            }}
          />

          <Component {...pageProps} />
        </ApolloProvider>
      </SessionProvider>
    </RootLayout>
  )
}
