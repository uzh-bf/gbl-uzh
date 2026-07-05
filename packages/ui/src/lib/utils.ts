import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (
  value: number | undefined | null,
  decimals: number = 2,
  addSign = false
) => {
  if (value === undefined || value === null) return 'N/A'
  const formatted = value
    .toLocaleString('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    .replace('CHF', 'CHF ')
  if (addSign && value > 0) {
    return `+${formatted}`
  }
  return formatted
}

export const formatPercent = (value: number | undefined | null) => {
  if (value === undefined || value === null) return 'N/A'
  const percentage = value * 100
  return percentage % 1 === 0
    ? `${percentage.toFixed(0)}%`
    : `${percentage.toFixed(1)}%`
}
