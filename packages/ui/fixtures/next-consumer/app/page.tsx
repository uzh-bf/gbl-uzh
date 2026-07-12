'use client'

import { Logo, XpBar } from '@gbl-uzh/ui'

export default function Page() {
  return (
    <main>
      <Logo name="External Game" level={1} />
      <XpBar value={25} max={100} />
    </main>
  )
}
