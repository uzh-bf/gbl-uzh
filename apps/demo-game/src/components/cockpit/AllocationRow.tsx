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
        'border-player-border mobile:gap-app-3 mobile:px-app-4 mobile:py-app-3 grid min-h-[64px] items-center border-b min-[601px]:gap-[16px] min-[601px]:px-[24px] min-[601px]:py-[16px] [@media(max-width:360px)]:gap-[8px]',
        saved
          ? 'grid-cols-[12px_minmax(0,1fr)_auto_52px] min-[601px]:min-h-[76px] min-[601px]:grid-cols-[14px_minmax(0,1fr)_auto_64px] [@media(max-width:360px)]:grid-cols-[10px_minmax(0,1fr)_auto_44px]'
          : 'grid-cols-[12px_minmax(0,1fr)_auto_84px] min-[601px]:min-h-[88px] min-[601px]:grid-cols-[14px_minmax(0,1fr)_auto_96px] [@media(max-width:360px)]:grid-cols-[10px_minmax(0,1fr)_auto_78px]'
      )}
    >
      <span
        className={cn(
          'size-[12px] rounded-[3px] min-[601px]:size-[14px]',
          color
        )}
        data-asset={asset}
        aria-hidden="true"
      />
      <Label
        htmlFor={saved ? undefined : `allocation-${asset}`}
        className="mobile:app-body block leading-[1.2] font-bold min-[601px]:flex min-[601px]:items-baseline min-[601px]:gap-[12px] min-[601px]:text-[22px]"
      >
        {name}
        <span className="text-player-muted mobile:mt-app-1 mobile:app-caption block font-normal whitespace-nowrap min-[601px]:mt-0 min-[601px]:text-[16px]">
          {risk}
        </span>
      </Label>
      <Amount className="text-player-muted mobile:app-caption m-0 whitespace-nowrap tabular-nums min-[601px]:text-[18px] [@media(max-width:360px)]:text-[13px]">
        {amount === null ? '—' : formatCHF(amount)}
      </Amount>
      {children}
    </div>
  )
}
