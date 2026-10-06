import { cn } from '@gbl-uzh/ui'
import type { ReactNode } from 'react'
import { type Allocation, formatCHF } from '~/lib/allocation'
import { assetLabels } from '~/lib/constants'

/** Shared asset identity and CHF column in editable and saved allocations. */
export default function AllocationRow({
  asset,
  amount,
  saved = false,
  children,
}: {
  asset: keyof Allocation
  amount: number | null
  saved?: boolean
  children: ReactNode
}) {
  const Label = saved ? 'dt' : 'label'
  const Amount = saved ? 'dd' : 'span'
  const { name, risk, color } = assetLabels[asset]
  return (
    <div
      data-cy={`${saved ? 'submitted' : 'allocation'}-${asset}`}
      className={cn(
        'border-player-border mobile:gap-app-3 mobile:px-app-4 mobile:py-app-3 tablet:gap-[8px] tablet:px-[12px] tablet:py-[8px] grid min-h-[64px] items-center border-b min-[641px]:gap-[16px] min-[641px]:px-[24px] min-[641px]:py-[16px] [@media(max-width:360px)]:gap-[8px]',
        saved
          ? 'tablet:min-h-[52px] tablet:grid-cols-[10px_minmax(0,1fr)_auto_44px] grid-cols-[12px_minmax(0,1fr)_auto_52px] min-[641px]:min-h-[76px] min-[641px]:grid-cols-[14px_minmax(0,1fr)_auto_64px] [@media(max-width:360px)]:grid-cols-[10px_minmax(0,1fr)_auto_44px]'
          : 'tablet:min-h-[52px] tablet:grid-cols-[10px_minmax(0,1fr)_auto_64px] grid-cols-[12px_minmax(0,1fr)_auto_84px] min-[641px]:min-h-[88px] min-[641px]:grid-cols-[14px_minmax(0,1fr)_auto_96px] [@media(max-width:360px)]:grid-cols-[10px_minmax(0,1fr)_auto_78px]'
      )}
    >
      <span
        className={cn(
          'tablet:size-[10px] size-[12px] rounded-[3px] min-[641px]:size-[14px]',
          color
        )}
        data-asset={asset}
        aria-hidden="true"
      />
      <Label
        htmlFor={saved ? undefined : `allocation-${asset}`}
        className="mobile:app-body tablet:block tablet:app-caption block leading-[1.2] font-bold min-[641px]:flex min-[641px]:items-baseline min-[641px]:gap-[12px] min-[641px]:text-[22px]"
      >
        {name}
        <span className="text-player-muted mobile:mt-app-1 mobile:app-caption tablet:whitespace-normal tablet:text-[12px] tablet:leading-[1.3] block font-normal whitespace-nowrap min-[641px]:mt-0 min-[641px]:text-[16px]">
          {risk}
        </span>
      </Label>
      <Amount className="text-player-muted mobile:app-caption tablet:text-[12px] tablet:leading-[1.3] m-0 whitespace-nowrap tabular-nums min-[641px]:text-[18px] [@media(max-width:360px)]:text-[13px]">
        {amount === null ? '—' : formatCHF(amount)}
      </Amount>
      {children}
    </div>
  )
}
