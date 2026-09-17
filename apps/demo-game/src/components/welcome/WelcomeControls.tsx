import { cn } from '@gbl-uzh/ui'
import { Button } from '@uzh-bf/design-system'
import type { ComponentPropsWithRef, ComponentPropsWithoutRef } from 'react'

export function WelcomeActionButton({
  className,
  onClick,
  ...props
}: ComponentPropsWithRef<'button'>) {
  return (
    <Button
      {...props}
      primary
      onClick={(event) => event && onClick?.(event)}
      className={{
        root: cn(
          'bg-player-primary font-player hover:bg-player-primary-hover focus-visible:outline-player-primary disabled:bg-player-disabled-surface disabled:text-player-disabled disabled:hover:bg-player-disabled-surface min-h-[48px] cursor-pointer rounded-[6px] border-0 px-[21px] py-[10px] text-[18px] leading-[1.5] font-normal text-white focus-visible:outline-2 focus-visible:outline-offset-[3px] disabled:cursor-not-allowed disabled:opacity-100',
          className
        ),
      }}
    />
  )
}

export function WelcomeTextInput({
  className,
  ...props
}: ComponentPropsWithRef<'input'>) {
  return (
    <input
      {...props}
      className={cn(
        'border-player-input placeholder:text-player-muted focus-visible:outline-player-primary aria-invalid:border-player-invalid min-h-[44px] w-full rounded-[6px] border bg-white px-[12px] py-[9px] [font:inherit] focus-visible:outline-2 focus-visible:outline-offset-[3px]',
        className
      )}
    />
  )
}

export function WelcomeTextButton({
  className,
  ...props
}: ComponentPropsWithRef<'button'>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'font-player text-player-primary focus-visible:outline-player-primary min-h-[44px] min-w-[44px] cursor-pointer border-0 bg-transparent px-[2px] py-0 text-[16px] leading-[1.5] font-bold focus-visible:outline-2 focus-visible:outline-offset-[3px] disabled:cursor-not-allowed',
        className
      )}
    />
  )
}

export function WelcomeMessage({
  className,
  ...props
}: ComponentPropsWithoutRef<'main'>) {
  return (
    <main
      {...props}
      className={cn(
        'font-player text-player-text mx-auto my-[64px] grid max-w-[600px] gap-[16px] bg-white p-[24px] text-[16px] leading-[1.5]',
        className
      )}
    />
  )
}
