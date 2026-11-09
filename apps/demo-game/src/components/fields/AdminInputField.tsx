import { HelpTooltip } from '@gbl-uzh/ui'
import { useTranslations } from 'next-intl'
import type { HTMLInputTypeAttribute } from 'react'
import type {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from 'react-hook-form'
import type { MessageKey } from '~/i18n/catalogs'

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
  minMessage?: MessageKey
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
  const t = useTranslations()
  const errorId = `${name}-error`

  return (
    <div className="mobile:gap-app-1 flex w-full flex-col gap-1">
      <div className="flex items-center gap-1.5 pb-1">
        <label
          htmlFor={name}
          className="mobile:app-caption text-sm font-medium text-slate-700"
        >
          {label}
        </label>
        {tooltip && (
          <HelpTooltip label={t('shared.actions.help')} content={tooltip} />
        )}
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
                required: required ? 'shared.validation.required' : false,
                valueAsNumber: true,
                min:
                  min !== undefined && minMessage
                    ? { value: min, message: minMessage }
                    : undefined,
              }
            : { required: required ? 'shared.validation.required' : false }
        )}
        className="mobile:app-control w-full rounded border border-slate-300 bg-white p-2 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
        data-cy={testId ?? name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span
          id={errorId}
          role="alert"
          className="mobile:app-caption text-xs text-red-500"
        >
          {error.message && t(error.message as MessageKey)}
        </span>
      )}
    </div>
  )
}
