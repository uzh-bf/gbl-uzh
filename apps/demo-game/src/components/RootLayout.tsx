import { sourceSansPro } from '~/lib/fonts'

import type { PropsWithChildren } from 'react'

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <div
      className={`${sourceSansPro.variable} ${sourceSansPro.className} mobile:font-player mobile:app-body`}
    >
      {children}
      {/* Portals do not inherit the font variable from the app wrapper. A plain
          static <style> keeps server and client markup identical. */}
      <style>{`
        @media (width < 641px) {
          :root {
            --source-sans-pro: ${sourceSansPro.style.fontFamily};
            --theme-font-primary: ${sourceSansPro.style.fontFamily};
          }
        }
      `}</style>
    </div>
  )
}
