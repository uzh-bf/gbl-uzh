import { config } from '@fortawesome/fontawesome-svg-core'
import { Source_Sans_Pro } from '@next/font/google'
import { init } from '@socialgouv/matomo-next'
import { ThemeProvider } from '@uzh-bf/design-system'
import { AppProps } from 'next/app'
import { useEffect } from 'react'

import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

import '../globals.css'

const sourceSansPro = Source_Sans_Pro({
  subsets: ['latin'],
  variable: '--source-sans-pro',
  weight: ['300', '400', '700'],
})

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID

function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (MATOMO_URL && MATOMO_SITE_ID) {
      init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID })
    }
  }, [])

  return (
    <div className={`${sourceSansPro.variable} font-sans h-full`}>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </div>
  )
}

export default App
