import React, { useMemo } from 'react'
import { Control, useWatch, Controller, FieldValues, Path, PathValue } from 'react-hook-form'
import { Input } from '~/components/ui/input'

export interface MatrixDimension {
  id: string
  label: string
  icon?: React.ReactNode
  tooltip?: string
  min?: number
  max?: number
}

export interface AssetAllocationMatrixProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  name: string
  rows: MatrixDimension[]
  columns: MatrixDimension[]
  disabled?: boolean
}

export function AssetAllocationMatrix<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  rows,
  columns,
  disabled = false,
}: AssetAllocationMatrixProps<TFieldValues>) {
  // We expect form data to be an object: { [rowId]: { [colId]: number } }
  const matrixValues = useWatch({
    control,
    name: name as unknown as Path<TFieldValues>,
    defaultValue: {} as unknown as PathValue<TFieldValues, Path<TFieldValues>>,
  })

  // Calculate totals
  const columnTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    columns.forEach((col) => {
      totals[col.id] = rows.reduce((acc, row) => {
        const val = matrixValues?.[row.id]?.[col.id] || 0
        return acc + Number(val)
      }, 0)
    })
    return totals
  }, [matrixValues, rows, columns])

  const rowTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    rows.forEach((row) => {
      totals[row.id] = columns.reduce((acc, col) => {
        const val = matrixValues?.[row.id]?.[col.id] || 0
        return acc + Number(val)
      }, 0)
    })
    return totals
  }, [matrixValues, rows, columns])

  const grandTotal = Object.values(rowTotals).reduce((a, b) => a + b, 0)

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 border-b border-r text-left min-w-[150px]"></th>
            {columns.map((col) => (
              <th key={col.id} className="p-2 border-b text-center min-w-[100px]">
                <div className="flex items-center justify-center gap-2">
                  {col.icon}
                  <span title={col.tooltip}>{col.label}</span>
                </div>
              </th>
            ))}
            <th className="p-2 border-b border-l text-center bg-slate-50 font-semibold min-w-[100px]">
              Total
            </th>
          </tr>
          <tr>
            <th className="p-2 border-b border-r text-left text-sm text-slate-500">Min / Max</th>
            {columns.map((col) => (
              <th key={col.id} className="p-2 border-b text-center text-sm text-slate-500 font-normal">
                {col.min ?? 0}% / {col.max ?? 100}%
              </th>
            ))}
            <th className="p-2 border-b border-l bg-slate-50"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isRowValid =
              rowTotals[row.id] >= (row.min ?? 0) && rowTotals[row.id] <= (row.max ?? 100)

            return (
              <tr key={row.id}>
                <td className="p-2 border-r font-medium">
                  <div className="flex items-center gap-2" title={row.tooltip}>
                    {row.icon}
                    {row.label}
                  </div>
                  <div className="text-xs text-slate-500 font-normal mt-1">
                    Range: {row.min ?? 0}% - {row.max ?? 100}%
                  </div>
                </td>
                {columns.map((col) => (
                  <td key={col.id} className="p-2 text-center">
                    <Controller
                      name={`${name}.${row.id}.${col.id}` as unknown as Path<TFieldValues>}
                      control={control}
                      defaultValue={0 as unknown as PathValue<TFieldValues, Path<TFieldValues>>}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          max={100}
                          disabled={disabled}
                          className="w-full text-center"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10)
                            field.onChange(val)
                          }}
                        />
                      )}
                    />
                  </td>
                ))}
                <td
                  className={`p-2 border-l text-center font-semibold bg-slate-50 ${
                    !isRowValid ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {rowTotals[row.id]}%
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="border-t bg-slate-50 font-semibold">
            <td className="p-2 border-r text-left">Total</td>
            {columns.map((col) => {
              const isColValid =
                columnTotals[col.id] >= (col.min ?? 0) && columnTotals[col.id] <= (col.max ?? 100)
              return (
                <td
                  key={col.id}
                  className={`p-2 text-center ${!isColValid ? 'text-rose-600' : 'text-slate-900'}`}
                >
                  {columnTotals[col.id]}%
                </td>
              )
            })}
            <td
              className={`p-2 border-l text-center ${
                grandTotal !== 100 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {grandTotal}%
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
