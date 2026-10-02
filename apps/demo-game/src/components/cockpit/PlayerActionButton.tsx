import { cn } from '@gbl-uzh/ui'
import { Button, type ButtonProps } from '@uzh-bf/design-system'

const variants = {
  primary:
    'bg-player-primary text-white hover:bg-player-primary hover:text-white disabled:bg-player-primary disabled:opacity-50 disabled:hover:bg-player-primary',
  secondary:
    'border-player-input bg-white text-player-text hover:bg-white hover:text-player-text disabled:border-transparent disabled:bg-player-disabled-surface disabled:text-player-disabled disabled:font-semibold disabled:opacity-100 disabled:hover:bg-player-disabled-surface disabled:hover:text-player-disabled',
} as const

export default function PlayerActionButton({
  variant = 'primary',
  className,
  ...props
}: Omit<ButtonProps, 'primary' | 'className'> & {
  variant?: keyof typeof variants
  className?: string
}) {
  return (
    <Button
      {...props}
      className={{
        root: cn(
          'mobile:app-control w-[180px] min-w-0 shrink rounded-[9px] font-normal transition-[background-color,opacity] duration-150 min-[601px]:min-h-[60px] min-[601px]:w-[220px] min-[601px]:px-[20px] min-[601px]:py-[12px] min-[601px]:text-[20px]',
          variants[variant],
          className
        ),
      }}
    />
  )
}
