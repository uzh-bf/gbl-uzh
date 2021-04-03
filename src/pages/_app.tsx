import { AppProps } from 'next/dist/next-server/lib/router/router'
import '../styles/globals.css'

function App({ Component, pageProps }: AppProps) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Component {...pageProps} />
}

export default App
