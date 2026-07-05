import React from 'react'
import { Card } from '@uzh-bf/design-system'
import { RelativeMeasure } from './RelativeMeasure'

export interface ForecastItem {
  label: string
  value?: number
}

export interface OutlookCardProps {
  title: string
  doubleFrom?: number
  forecasts: ForecastItem[]
  children?: React.ReactNode
  className?: string
}

export function OutlookCard({
  title,
  doubleFrom,
  forecasts,
  children,
  className = '',
}: OutlookCardProps) {
  const hasForecasts = forecasts.some((f) => typeof f.value === 'number')

  return (
    <Card className={`w-full ${className}`}>
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="p-4">
        {hasForecasts ? (
          <div className="flex flex-wrap gap-2">
            {forecasts.map((forecast, index) => (
              <RelativeMeasure
                key={index}
                label={forecast.label}
                value={forecast.value}
                doubleFrom={doubleFrom}
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 italic">No forecasts available.</div>
        )}
      </div>
      {children && <div className="p-4 pt-0">{children}</div>}
    </Card>
  )
}
