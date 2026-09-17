import { cn } from '@gbl-uzh/ui'
import { ALLOCATION_KEYS, type Allocation } from '~/lib/allocation'

export const assetLabels = {
  bank: { name: 'Savings', risk: 'No risk', color: 'bg-player-savings' },
  bonds: {
    name: 'Bonds',
    risk: 'Some risk',
    color: 'bg-player-bonds text-white',
  },
  stocks: { name: 'Stocks', risk: 'High risk', color: 'bg-player-stocks' },
} as const

export default function AllocationBar({
  value,
  className,
}: {
  value: Allocation
  className?: string
}) {
  return (
    <div
      className={cn('flex h-full overflow-hidden rounded-[50px]', className)}
      aria-hidden="true"
    >
      {ALLOCATION_KEYS.map((key) => (
        <div
          key={key}
          className={cn(
            '@container relative min-w-0 overflow-hidden not-first:shadow-[inset_2px_0_white]',
            assetLabels[key].color
          )}
          data-asset={key}
          style={{ width: `${value[key]}%` }}
        >
          {value[key] < 20 ? (
            <div className="grid h-full place-items-center px-[8px] text-[13px] [@container(max-width:30px)]:invisible [@container(max-width:56px)]:px-0 [@container(max-width:56px)]:text-[11px]">
              <strong>{value[key]}%</strong>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-[12px] text-center leading-[1.1] whitespace-nowrap [@container(max-width:56px)]:invisible [@container(max-width:80px)]:px-0">
              <strong className="text-[18px] min-[601px]:text-[21px]">
                {value[key]}%
              </strong>
              <span className="mt-[4px] text-[13px] font-semibold min-[601px]:text-[15px] [@container(max-width:80px)]:hidden">
                {assetLabels[key].name}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
