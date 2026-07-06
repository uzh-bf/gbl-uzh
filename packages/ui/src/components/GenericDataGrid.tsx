import { useEffect, useState } from 'react'
import { DataGrid, Column, RowsChangeData } from 'react-data-grid'

export interface GenericDataGridProps<TRow, TSummaryRow = unknown> {
  columns: readonly Column<TRow, TSummaryRow>[]
  rows: readonly TRow[]
  onRowsChange?: (rows: TRow[], data: RowsChangeData<TRow, TSummaryRow>) => void
  className?: string
}

export function GenericDataGrid<TRow, TSummaryRow = unknown>({
  columns,
  rows,
  onRowsChange,
  className = '',
}: GenericDataGridProps<TRow, TSummaryRow>) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="p-4 text-center text-sm text-slate-500">Loading Grid...</div>
  }

  return (
    <div className={`w-full overflow-hidden rounded-lg border border-slate-200 ${className}`}>
      <DataGrid<TRow, TSummaryRow>
        columns={columns}
        rows={rows}
        onRowsChange={onRowsChange}
        className="rdg-light text-sm"
      />
    </div>
  )
}
