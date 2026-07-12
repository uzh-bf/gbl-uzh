import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { cn } from '~/lib/utils'

export interface EventLogColumn<T = Record<string, unknown>> {
  key: string
  label: string
  className?: string
  formatter?: (value: unknown, row: T) => React.ReactNode
}

export interface EventLogProps<T = Record<string, unknown>> {
  title: string
  description?: string
  columns: EventLogColumn<T>[]
  data: T[]
  maxHeightClass?: string
  className?: string
  rowClassName?: (row: T) => string
  getRowKey?: (row: T, index: number) => string | number
  emptyText?: string
}

export function EventLog<T = Record<string, unknown>>({
  title,
  description,
  columns,
  data,
  maxHeightClass = 'max-h-[300px]',
  className = '',
  rowClassName,
  getRowKey,
  emptyText = 'No entries available.',
}: EventLogProps<T>) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-800">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className={cn('overflow-y-auto border-t border-slate-100', maxHeightClass)}>
          {data.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 italic">
              {emptyText}
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        'p-3 font-semibold text-slate-700 select-none text-xs uppercase tracking-wider',
                        col.className
                      )}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, rIdx) => {
                  const customRowClass = rowClassName ? rowClassName(row) : ''
                  const key = getRowKey ? getRowKey(row, rIdx) : rIdx
                  return (
                    <tr
                      key={key}
                      className={cn(
                        'hover:bg-slate-50/50 transition-colors',
                        customRowClass
                      )}
                    >
                      {columns.map((col) => {
                        const rawVal = (row as Record<string, unknown>)[col.key]
                        const formatted = col.formatter ? col.formatter(rawVal, row) : String(rawVal ?? '')
                        return (
                          <td key={col.key} className={cn('p-3', col.className)}>
                            {formatted}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
