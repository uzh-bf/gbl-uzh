import { cn } from '@gbl-uzh/ui'
import { Check, Clock3, Info } from 'lucide-react'
import type { ReactNode } from 'react'

const variants = {
  success: {
    icon: Check,
    className:
      'border-player-success bg-player-success-surface text-player-success',
    iconClassName: '',
  },
  pending: {
    icon: Clock3,
    className: 'border-player-warning bg-player-warning-surface',
    iconClassName: 'text-player-warning',
  },
  informational: {
    icon: Info,
    className: 'border-player-input',
    iconClassName: 'text-player-primary',
  },
} as const

export default function AllocationNotice({
  variant,
  title,
  children,
}: {
  variant: keyof typeof variants
  title?: string
  children: ReactNode
}) {
  const { icon: Icon, className, iconClassName } = variants[variant]
  return (
    <div
      className={cn(
        'p-[16px] min-[601px]:p-[24px]',
        variant === 'success' && 'border-player-border border-b'
      )}
    >
      <div
        className={cn(
          'flex items-start gap-[10px] rounded-[14px] border p-[14px] text-[14px] leading-[1.5] min-[601px]:gap-[18px] min-[601px]:rounded-[18px] min-[601px]:p-[24px] min-[601px]:text-[21px]',
          className
        )}
        role={variant === 'success' ? 'status' : undefined}
      >
        <Icon
          aria-hidden="true"
          className={cn(
            'mt-[3px] size-[20px] shrink-0 min-[601px]:size-[24px]',
            iconClassName
          )}
        />
        <div>
          {title && (
            <strong className="mb-[4px] block text-[18px] leading-[1.3] min-[601px]:text-[24px]">
              {title}
            </strong>
          )}
          <p className="text-player-body m-0">{children}</p>
        </div>
      </div>
    </div>
  )
}
