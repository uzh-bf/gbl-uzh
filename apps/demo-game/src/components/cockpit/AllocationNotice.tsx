import { cn } from '@gbl-uzh/ui'
import { Check, Clock3, Info } from 'lucide-react'
import type { ReactNode } from 'react'

export const playerNoticeStyles = {
  surface:
    'mobile:gap-app-3 mobile:p-app-3 mobile:app-caption mobile:rounded-app-card flex items-start rounded-[14px] border leading-[1.5] min-[601px]:gap-[18px] min-[601px]:rounded-[18px] min-[601px]:p-[24px] min-[601px]:text-[21px]',
  success:
    'border-player-success bg-player-success-surface text-player-success',
  icon: 'mobile:mt-app-1 mt-[3px] size-[20px] shrink-0 min-[601px]:size-[24px]',
  title:
    'mobile:mb-app-1 mobile:app-body mb-[4px] block leading-[1.3] min-[601px]:text-[24px]',
  body: 'text-player-body m-0',
} as const

const variants = {
  success: {
    icon: Check,
    className: playerNoticeStyles.success,
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
        'mobile:p-app-4 min-[601px]:p-[24px]',
        variant === 'success' && 'border-player-border border-b'
      )}
    >
      <div
        className={cn(playerNoticeStyles.surface, className)}
        role={variant === 'success' ? 'status' : undefined}
      >
        <Icon
          aria-hidden="true"
          className={cn(playerNoticeStyles.icon, iconClassName)}
        />
        <div>
          {title && (
            <strong className={playerNoticeStyles.title}>{title}</strong>
          )}
          <p className={playerNoticeStyles.body}>{children}</p>
        </div>
      </div>
    </div>
  )
}
