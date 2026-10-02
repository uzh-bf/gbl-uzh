import { sourceSansPro } from '~/lib/fonts'

import type { PropsWithChildren } from 'react'

// `next/font` classes applied statically: identical on server and client, so no
// hydration mismatch (the previous dynamic `<style jsx global>` made styled-jsx
// tag this div with a per-render `jsx-NNN` class only on the server). `.variable`
// exposes `--source-sans-pro` for design-system rules that read it; `.className`
// sets the real Source Sans 3 font-family on this wrapper, which all page
// content inherits.
export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <div
      className={`${sourceSansPro.variable} ${sourceSansPro.className} mobile:font-player mobile:app-body`}
    >
      {children}
      {/* Portals do not inherit the font variable from the app wrapper. A plain
          static <style> keeps server and client markup identical. */}
      <style>{`
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
