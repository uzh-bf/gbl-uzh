import { HelpTooltip } from '@gbl-uzh/ui'
import type { HTMLInputTypeAttribute } from 'react'
import type {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from 'react-hook-form'

interface AdminInputFieldProps<TFieldValues extends FieldValues> {
  label: string
  name: Path<TFieldValues>
  register: UseFormRegister<TFieldValues>
  error?: FieldError
  type?: HTMLInputTypeAttribute
  placeholder?: string
  tooltip?: string
  required?: boolean
  min?: number
  step?: number
  testId?: string
  minMessage?: string
}

export function AdminInputField<TFieldValues extends FieldValues>({
  label,
  name,
  register,
  error,
  type = 'text',
  placeholder,
  tooltip,
  required,
  min,
  step,
  testId,
  minMessage,
}: AdminInputFieldProps<TFieldValues>) {
  const errorId = `${name}-error`

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-center gap-1.5 pb-1">
        <label htmlFor={name} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        {tooltip && <HelpTooltip content={tooltip} />}
      </div>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        min={min}
        step={step}
        {...register(
          name,
          type === 'number'
            ? {
                required: required ? 'Required' : false,
                valueAsNumber: true,
                min:
                  min !== undefined && minMessage
                    ? { value: min, message: minMessage }
                    : undefined,
              }
            : { required: required ? 'Required' : false }
        )}
        className="w-full rounded border border-slate-300 bg-white p-2 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
        data-cy={testId ?? name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span id={errorId} role="alert" className="text-xs text-red-500">
          {error.message}
        </span>
      )}
    </div>
  )
}
