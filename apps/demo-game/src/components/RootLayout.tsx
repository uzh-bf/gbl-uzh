import { sourceSansPro } from '~/lib/fonts'

import type { PropsWithChildren } from 'react'

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <div
      className={`${sourceSansPro.variable} mobile:font-player mobile:app-body`}
    >
      {children}
      <style jsx global>{`
        :root {
          --source-sans-pro: ${sourceSansPro.variable};
          --theme-font-primary: ${sourceSansPro.variable};
        }
        /* Portals do not inherit the font variable from the app wrapper. */
        @media (width < 601px) {
          :root {
            --source-sans-pro: ${sourceSansPro.style.fontFamily};
            --theme-font-primary: ${sourceSansPro.style.fontFamily};
          }
        }
      `}</style>
    </div>
  )
}
