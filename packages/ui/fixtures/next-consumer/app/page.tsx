'use client'

import { Logo, TradingForm, XpBar } from '@gbl-uzh/ui'

export default function Page() {
  return (
    <main>
      <Logo name="External Game" level={1} />
      <XpBar value={25} max={100} />
      <TradingForm
        price={10}
        max={100}
        nameButtonBuy="Buy"
        nameButtonSell="Sell"
        onSubmit={async (values) => console.log(values)}
      />
    </main>
  )
}
