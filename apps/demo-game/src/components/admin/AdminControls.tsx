import { cn } from '@gbl-uzh/ui'
import * as UI from '@uzh-bf/design-system'
import type { ComponentProps } from 'react'

// App-local sizing adapters: desktop and other games retain design-system defaults.
export function Button({
  className,
  ...props
}: ComponentProps<typeof UI.Button>) {
  return (
    <UI.Button
      {...props}
      className={{
        ...className,
        root: cn('mobile:app-control', className?.root),
      }}
    />
  )
}
export function Modal({
  className,
  ...props
}: ComponentProps<typeof UI.Modal>) {
  return (
    <UI.Modal
      {...props}
      className={{
        ...className,
        content: cn(
          'mobile:font-player mobile:app-body mobile:rounded-app-sheet mobile:max-w-[calc(100vw-32px)] mobile:max-h-[90dvh] mobile:overflow-y-auto mobile:[&>[data-slot=dialog-close]]:app-touch mobile:[&>[data-slot=dialog-close]]:top-app-1 mobile:[&>[data-slot=dialog-close]]:right-app-1',
          className?.content
        ),
        header: cn('mobile:p-app-4', className?.header),
        title: cn('mobile:app-heading', className?.title),
        footer: cn(
          'mobile:flex-wrap mobile:gap-app-2 mobile:p-app-4',
          className?.footer
        ),
        primary: cn('mobile:app-control', className?.primary),
        secondary: cn('mobile:app-control', className?.secondary),
      }}
    />
  )
}

export function Card({ className, ...props }: ComponentProps<typeof UI.Card>) {
  return (
    <UI.Card
      {...props}
      className={cn(
        'mobile:rounded-app-card mobile:gap-app-3 mobile:py-app-3 mobile:min-w-0',
        className
      )}
    />
  )
}

export function CardHeader({
  className,
  ...props
}: ComponentProps<typeof UI.CardHeader>) {
  return (
    <UI.CardHeader
      {...props}
      className={cn('mobile:px-app-3 mobile:py-0 mobile:gap-app-2', className)}
    />
  )
}

export function CardContent({
  className,
  ...props
}: ComponentProps<typeof UI.CardContent>) {
  return (
    <UI.CardContent
      {...props}
      className={cn(
        'mobile:px-app-3 mobile:app-body mobile:min-w-0',
        className
      )}
    />
  )
}

export function CardFooter({
  className,
  ...props
}: ComponentProps<typeof UI.CardFooter>) {
  return (
    <UI.CardFooter
      {...props}
      className={cn(
        'mobile:px-app-3 mobile:gap-app-2 mobile:flex-wrap',
        className
      )}
    />
  )
}

export function CardTitle({
  className,
  ...props
}: ComponentProps<typeof UI.CardTitle>) {
  return (
    <UI.CardTitle {...props} className={cn('mobile:app-heading', className)} />
  )
}

export function CardDescription({
  className,
  ...props
}: ComponentProps<typeof UI.CardDescription>) {
  return (
    <UI.CardDescription
      {...props}
      className={cn('mobile:app-caption', className)}
    />
  )
}

export function H3({ className, ...props }: ComponentProps<typeof UI.H3>) {
  return (
    <UI.H3
      {...props}
      className={{
        ...className,
        root: cn('mobile:app-heading', className?.root),
      }}
    />
  )
}

export function H4({ className, ...props }: ComponentProps<typeof UI.H4>) {
  return (
    <UI.H4
      {...props}
      className={{
        ...className,
        root: cn('mobile:app-heading', className?.root),
      }}
    />
  )
}

export function ShadcnTable({
  className,
  ...props
}: ComponentProps<typeof UI.ShadcnTable>) {
  return (
    <UI.ShadcnTable {...props} className={cn('mobile:app-body', className)} />
  )
}

export function ShadcnTableCell({
  className,
  ...props
}: ComponentProps<typeof UI.ShadcnTableCell>) {
  return (
    <UI.ShadcnTableCell
      {...props}
      className={cn('mobile:app-cell', className)}
    />
  )
}

export function ShadcnTableHead({
  className,
  ...props
}: ComponentProps<typeof UI.ShadcnTableHead>) {
  return (
    <UI.ShadcnTableHead
      {...props}
      className={cn(
        'mobile:app-caption mobile:px-app-2 mobile:py-app-2',
        className
      )}
    />
  )
}
