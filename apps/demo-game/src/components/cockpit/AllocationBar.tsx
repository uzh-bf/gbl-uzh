import { cn } from '@gbl-uzh/ui'
import { ALLOCATION_KEYS, type Allocation } from '~/lib/allocation'
import { assetLabels } from '~/lib/constants'

export default function AllocationBar({
  value,
  className,
  compact = false,
}: {
  value: Allocation
  className?: string
  compact?: boolean
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
            '@container relative min-w-0 overflow-hidden',
            !compact && 'not-first:shadow-[inset_2px_0_white]',
            assetLabels[key].color,
            key === 'bonds' && 'text-white'
          )}
          data-asset={key}
          style={{ width: `${value[key]}%` }}
        >
          {compact ? null : value[key] < 20 ? (
            <div className="mobile:px-app-2 mobile:app-annotation grid h-full place-items-center px-[8px] text-[13px] [@container(max-width:30px)]:invisible [@container(max-width:56px)]:px-0 [@container(max-width:56px)]:text-[11px]">
              <strong>{value[key]}%</strong>
            </div>
          ) : (
            <div className="mobile:px-app-3 flex h-full flex-col items-center justify-center px-[12px] text-center leading-[1.1] whitespace-nowrap [@container(max-width:56px)]:invisible [@container(max-width:80px)]:px-0">
              <strong className="mobile:app-body mobile:leading-[var(--app-leading-value)] min-[601px]:text-[21px]">
                {value[key]}%
              </strong>
              <span className="mobile:mt-app-1 mobile:app-annotation mt-[4px] font-semibold min-[601px]:text-[15px] [@container(max-width:80px)]:hidden">
                {assetLabels[key].name}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
