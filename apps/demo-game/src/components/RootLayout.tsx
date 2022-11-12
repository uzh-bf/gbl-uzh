import { sourceSansPro } from '@lib/fonts'

import type { PropsWithChildren } from 'react'

export default function RootLayout({ children }: PropsWithChildren) {
  return <div className={sourceSansPro.variable}>{children}</div>
}
