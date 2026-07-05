
export interface MultiProgressProps {
  value: number
  adjustment: number
  valueColor?: string
  positiveColor?: string
  negativeColor?: string
  className?: string
}

export function MultiProgress({
  value,
  adjustment,
  valueColor = 'bg-blue-500/50',
  positiveColor = 'bg-rose-500/50',
  negativeColor = 'bg-green-500/50',
  className = '',
}: MultiProgressProps) {
  if (adjustment < 0) {
    return (
      <div className={`flex h-5 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
        <div className={`h-full ${valueColor}`} style={{ flexBasis: `${value + adjustment}%` }} />
        <div className={`h-full ${positiveColor}`} style={{ flexBasis: `${-adjustment}%` }} />
      </div>
    )
  }

  return (
    <div className={`flex h-5 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div className={`h-full ${valueColor}`} style={{ flexBasis: `${value}%` }} />
      <div className={`h-full ${negativeColor}`} style={{ flexBasis: `${adjustment}%` }} />
    </div>
  )
}
