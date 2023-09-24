import { config } from '@fortawesome/fontawesome-svg-core'
import { init } from '@socialgouv/matomo-next'
import { AppProps } from 'next/app'
import { Source_Sans_3 } from 'next/font/google'
import { useEffect } from 'react'

import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

import '../globals.css'

const sourceSansPro = Source_Sans_3({
  subsets: ['latin'],
  variable: '--theme-font-primary',
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
        <Component {...pageProps} />
    </div>
  )
}

export default App
