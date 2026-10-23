import { cn } from '@gbl-uzh/ui'
import { ALLOCATION_KEYS, type Allocation } from '~/lib/allocation'
import { assetLabels } from '~/lib/constants'

export default function AllocationBar({
  value,
  className,
  compact = false,
  report = false,
}: {
  value: Allocation
  className?: string
  compact?: boolean
  report?: boolean
}) {
  return (
    <div
      className={cn(
        'flex h-full overflow-hidden',
        report ? 'rounded-[3px]' : 'rounded-[50px]',
        className
      )}
      aria-hidden="true"
    >
      {ALLOCATION_KEYS.map((key) => (
        <div
          key={key}
          className={cn(
            '@container relative min-w-0 overflow-hidden',
            !compact && !report && 'not-first:shadow-[inset_2px_0_white]',
            assetLabels[key].color,
            (key === 'bonds' || (report && key === 'stocks')) && 'text-white'
          )}
          data-asset={key}
          style={{ width: `${value[key]}%` }}
        >
          {report ? (
            <span className="grid h-full place-items-center text-[11px] font-semibold [@container(max-width:25px)]:invisible">
              {Number(value[key].toFixed(1))}
            </span>
          ) : compact ? null : value[key] < 20 ? (
            <div className="mobile:px-app-2 mobile:app-annotation grid h-full place-items-center px-[8px] text-[13px] [@container(max-width:30px)]:invisible [@container(max-width:56px)]:px-0 [@container(max-width:56px)]:text-[11px]">
              <strong>{value[key]}%</strong>
            </div>
          ) : (
            <div className="mobile:px-app-3 flex h-full flex-col items-center justify-center px-[12px] text-center leading-[1.1] whitespace-nowrap [@container(max-width:56px)]:invisible [@container(max-width:80px)]:px-0">
              <strong className="mobile:app-body tablet:app-caption tablet:leading-[var(--app-leading-value)] mobile:leading-[var(--app-leading-value)] min-[641px]:text-[21px]">
                {value[key]}%
              </strong>
              <span className="mobile:mt-app-1 mobile:app-annotation tablet:app-annotation tablet:mt-0 mt-[4px] font-semibold min-[641px]:text-[15px] [@container(max-width:80px)]:hidden">
                {assetLabels[key].name}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
