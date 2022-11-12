import { init } from '@socialgouv/matomo-next'
import { AppProps } from 'next/dist/shared/lib/router/router'
import { useEffect } from 'react'
import { config } from '@fortawesome/fontawesome-svg-core'
import { ThemeProvider } from '@uzh-bf/design-system'

import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

import '../globals.css'

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID

function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (MATOMO_URL && MATOMO_SITE_ID) {
      init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID })
    }
  }, [])

  return (
    <ThemeProvider theme={{}}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default App
