import { useEffect, useState } from 'react'

// Keep in sync with the phone/tablet variants in globals.css.
const TABLET_QUERY = '(width >= 641px)'

/** Client-only layout selection; SSR retains the existing phone structure. */
export function useTabletLayout() {
  return useLayoutQuery(TABLET_QUERY)
}

/** Market fills the shell below the desktop two-row sidebar layout. */
export function useFullWidthMarketLayout() {
  return useLayoutQuery('(641px <= width < 1024px)')
}

function useLayoutQuery(mediaQuery: string) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const query = window.matchMedia(mediaQuery)
    const update = () => setMatches(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [mediaQuery])
  return matches
}
