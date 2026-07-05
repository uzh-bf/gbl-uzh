import {
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Minus,
} from 'lucide-react'

export interface RelativeMeasureProps {
  label?: string
  value?: number
  doubleFrom?: number
  className?: string
}

const DOUBLE_FROM_MULTIPLIER = 1.0

export function RelativeMeasure({
  label,
  value,
  doubleFrom,
  className = '',
}: RelativeMeasureProps) {
  if (typeof value !== 'number') {
    return null
  }

  let Icon = Minus
  let iconColor = 'text-slate-400'

  if (value > 0) {
    if (
      typeof doubleFrom !== 'undefined' &&
      value > doubleFrom * DOUBLE_FROM_MULTIPLIER
    ) {
      Icon = ChevronsUp
      iconColor = 'text-blue-600'
    } else {
      Icon = ChevronUp
      iconColor = 'text-blue-600'
    }
  } else if (value < 0) {
    if (
      typeof doubleFrom !== 'undefined' &&
      value < -doubleFrom * DOUBLE_FROM_MULTIPLIER
    ) {
      Icon = ChevronsDown
      iconColor = 'text-orange-500'
    } else {
      Icon = ChevronDown
      iconColor = 'text-orange-500'
    }
  }

  return (
    <div
      className={`flex items-stretch border border-slate-200 rounded-sm overflow-hidden ${className}`}
    >
      {label && (
        <div className="bg-slate-100 px-2 py-1 flex items-center justify-center font-medium text-sm text-slate-600 uppercase">
          {label}
        </div>
      )}
      <div className="bg-white px-2 py-1 flex items-center justify-center">
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
  )
}
