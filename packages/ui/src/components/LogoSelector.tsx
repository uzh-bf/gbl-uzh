import React from 'react'
import { cn } from '~/lib/utils'

export interface LogoSelectorProps {
  value: string
  onChange: (value: string) => void
  color: string
  avatarOptions: readonly string[]
  colorsMap: Record<string, { bg: string; ring: string }>
  fallbackSrc?: string
  label?: string
  className?: string
}

export const LogoSelector = React.forwardRef<
  HTMLDivElement,
  LogoSelectorProps & React.HTMLAttributes<HTMLDivElement>
>(({ value, onChange, color, avatarOptions, colorsMap, fallbackSrc, label, className, ...props }, ref) => {
  const colorConfig = colorsMap[color] || { bg: 'bg-slate-200', ring: 'ring-slate-500' }

  return (
    <div ref={ref} className={cn('space-y-2', className)} {...props}>
      {label && <p className="text-sm font-medium text-slate-700">{label}</p>}
      <div className="grid grid-cols-4 gap-2">
        {avatarOptions.map((avatarPath) => (
          <button
            key={avatarPath}
            type="button"
            onClick={() => onChange(avatarPath)}
            className={cn(
              'relative aspect-square overflow-hidden rounded-md border border-slate-200 bg-white p-1 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
              value === avatarPath
                ? `ring-2 ring-offset-2 ${colorConfig.ring} border-transparent`
                : 'border-slate-300 hover:border-slate-400'
            )}
            aria-label={`Select avatar ${avatarPath.split('/').pop()?.split('.')[0] || ''}`}
          >
            <img
              src={avatarPath}
              alt="Avatar option"
              className="h-full w-full object-contain p-1"
              onError={(e) => {
                if (fallbackSrc) {
                  ;(e.target as HTMLImageElement).src = fallbackSrc
                }
              }}
            />
            {value === avatarPath && (
              <div className={cn('absolute inset-0 opacity-20', colorConfig.bg)} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
})

LogoSelector.displayName = 'LogoSelector'
