import { useEffect, useState } from 'react'

// Keep in sync with the phone/tablet variants in globals.css.
const PHONE_QUERY =
  '(width < 768px), (orientation: landscape) and (pointer: coarse) and (width <= 1024px) and (height <= 500px)'

/** Client-only layout selection; SSR retains the existing phone structure. */
export function useTabletLayout() {
  const [tablet, setTablet] = useState(false)
  useEffect(() => {
    const phone = window.matchMedia(PHONE_QUERY)
    const update = () => setTablet(!phone.matches)
    update()
    phone.addEventListener('change', update)
    return () => phone.removeEventListener('change', update)
  }, [])
  return tablet
}
