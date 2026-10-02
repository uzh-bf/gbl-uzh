import { cn } from '@gbl-uzh/ui'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { sourceSansPro } from '~/lib/fonts'

export const sheetPadding = 'mobile:px-app-4 min-[601px]:px-[32px]'
export const contentProse =
  'prose max-w-none [--tw-prose-body:var(--color-player-body)] text-player-body mobile:app-body leading-[1.6] min-[601px]:text-[28px] [&_p]:my-[12px] [&_img]:mx-auto [&_img]:max-h-[340px] [&_img]:rounded-[16px] [&_img]:object-contain'

export default function ContentSheet({
  title,
  label,
  onClose,
  children,
  footer,
}: {
  title: string
  label: ReactNode
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}) {
  const body = useRef<HTMLDivElement>(null)
  useEffect(() => {
    body.current?.scrollTo({ top: 0 })
  }, [title])
  const returnFocus = useRef<HTMLElement | null>(null)
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80" />
        <Dialog.Content
          className={cn(
            sourceSansPro.variable,
            'font-player text-player-text mobile:rounded-t-app-sheet mobile:app-body fixed bottom-0 left-1/2 z-50 flex max-h-[90dvh] w-full max-w-[784px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[24px] bg-white leading-[1.5] [--theme-font-primary:var(--source-sans-pro)] min-[601px]:rounded-t-[32px] min-[601px]:text-[28px] [&_*]:box-border'
          )}
          onPointerDownOutside={(event) => event.preventDefault()}
          onOpenAutoFocus={() => {
            returnFocus.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            if (returnFocus.current?.isConnected) returnFocus.current.focus()
          }}
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <div
            className={`mobile:gap-app-3 mobile:pt-app-4 flex shrink-0 items-center justify-between gap-[12px] pt-[18px] min-[601px]:pt-[32px] ${sheetPadding}`}
          >
            <div className="text-player-muted mobile:gap-app-3 mobile:app-caption flex flex-wrap items-center gap-[12px] font-semibold tracking-[1px] uppercase min-[601px]:text-[22px]">
              {label}
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="text-player-muted focus-visible:outline-player-primary mobile:app-touch -mr-[8px] grid size-[44px] shrink-0 place-items-center rounded-[8px] focus-visible:outline-2"
            >
              <X
                size={28}
                className="mobile:size-app-icon"
                aria-hidden="true"
              />
            </button>
          </div>
          <div
            ref={body}
            className="min-h-0 overflow-y-auto overscroll-contain"
          >
            {children}
          </div>
          <div
            className={`border-player-border mobile:gap-app-3 mobile:pt-app-3 flex shrink-0 items-center justify-between gap-[12px] border-t bg-white pt-[12px] pb-[max(12px,env(safe-area-inset-bottom))] min-[601px]:pt-[24px] min-[601px]:pb-[max(24px,env(safe-area-inset-bottom))] ${sheetPadding}`}
          >
            {footer}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function SheetTextButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-visible:outline-player-primary mobile:app-control min-h-[48px] shrink-0 rounded-[8px] whitespace-nowrap focus-visible:outline-2 min-[601px]:px-[32px] min-[601px]:text-[28px]"
    >
      {children}
    </button>
  )
}
