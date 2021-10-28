import { AppProps } from 'next/dist/shared/lib/router/router'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { useEffect } from 'react'
import * as gtag from '../lib/gtag'
import '../styles/globals.css'

function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    if (gtag.GA_TRACKING_ID) {
      const handleRouteChange = (url) => {
        gtag.pageview(url)
      }
      router.events.on('routeChangeComplete', handleRouteChange)
      return () => {
        router.events.off('routeChangeComplete', handleRouteChange)
      }
    }
  }, [router.events])

  return (
    <>
      {gtag.GA_TRACKING_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
          />
          <Script
            id="gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />
        </>
      )}
      {process.env.NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY && (
        <Script
          id="openreplay-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function(A,s,a,y,e,r){
              r=window.OpenReplay=[s,r,e,[y-1]];
              s=document.createElement('script');s.src=a;s.async=!A;
              document.getElementsByTagName('head')[0].appendChild(s);
              r.start=function(v){r.push([0])};
              r.stop=function(v){r.push([1])};
              r.setUserID=function(id){r.push([2,id])};
              r.setUserAnonymousID=function(id){r.push([3,id])};
              r.setMetadata=function(k,v){r.push([4,k,v])};
              r.event=function(k,p,i){r.push([5,k,p,i])};
              r.issue=function(k,p){r.push([6,k,p])};
              r.isActive=function(){return false};
              r.getSessionToken=function(){};
            })(0, "${process.env.NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY}", "//static.openreplay.com/latest/openreplay.js",1,93);
          `,
          }}
        />
      )}
      <Component {...pageProps} />
    </>
  )
}

export default App
