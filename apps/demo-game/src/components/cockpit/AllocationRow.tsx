import { cn } from '@gbl-uzh/ui'
import type { ReactNode } from 'react'
import { type Allocation, formatCHF } from '~/lib/allocation'
import { assetLabels } from './AllocationBar'

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
        'border-player-border grid min-h-[64px] items-center gap-[12px] border-b px-[16px] py-[12px] min-[601px]:gap-[16px] min-[601px]:px-[24px] min-[601px]:py-[16px] [@media(max-width:360px)]:gap-[8px]',
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
        className="block text-[18px] leading-[1.2] font-bold min-[601px]:flex min-[601px]:items-baseline min-[601px]:gap-[12px] min-[601px]:text-[22px]"
      >
        {name}
        <span className="text-player-muted mt-[4px] block text-[13px] font-normal whitespace-nowrap min-[601px]:mt-0 min-[601px]:text-[16px]">
          {risk}
        </span>
      </Label>
      <Amount className="text-player-muted m-0 text-[15px] whitespace-nowrap tabular-nums min-[601px]:text-[18px] [@media(max-width:360px)]:text-[13px]">
        {amount === null ? '—' : formatCHF(amount)}
      </Amount>
      {children}
    </div>
  )
}
