'use client'
// TODO(JJ): This will be replaced by the design system
import { Clock3 } from 'lucide-react'
import { playerNoticeStyles } from '../cockpit/AllocationNotice'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast'
import { useToast } from './use-toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const countdown = props.variant === 'countdown'
        return (
          <Toast key={id} {...props}>
            {countdown && (
              <Clock3 aria-hidden="true" className={playerNoticeStyles.icon} />
            )}
            <div className={countdown ? 'min-w-0 flex-1' : 'grid gap-1'}>
              {title && (
                <ToastTitle
                  className={countdown ? playerNoticeStyles.title : undefined}
                >
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription
                  className={
                    countdown
                      ? `${playerNoticeStyles.body} text-[length:inherit] opacity-100`
                      : undefined
                  }
                >
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose
              aria-label="Dismiss notification"
              className={
                countdown
                  ? 'text-player-success top-1 right-1 flex min-h-[44px] min-w-[44px] items-center justify-center opacity-100'
                  : undefined
              }
            />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
