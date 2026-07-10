import type { InputHTMLAttributes } from 'react'
import type { Control, FieldValues, Path } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'

interface ReusableFormFieldProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
> extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'defaultValue' | 'id' | 'name' | 'onBlur' | 'onChange' | 'value'
  > {
  control: Control<TFieldValues, TContext, TTransformedValues>
  name: Path<TFieldValues>
  label: string
  isInt?: boolean
}

export function ReusableFormField<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  label,
  isInt = true,
  type = 'text',
  ...inputProps
}: ReusableFormFieldProps<TFieldValues, TContext, TTransformedValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              {...inputProps}
              {...field}
              onChange={(event) => {
                const value = event.currentTarget.value
                if (type === 'number') {
                  if (isInt) {
                    field.onChange(value === '' ? '' : Number.parseInt(value, 10))
                  } else {
                    field.onChange(value === '' ? '' : Number.parseFloat(value))
                  }
                } else {
                  field.onChange(value)
                }
              }}
              value={field.value ?? ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
