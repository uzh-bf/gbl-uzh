import React from 'react' // Import React for InputHTMLAttributes
import { Control, FieldValues, Path } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input' // Adjust import path as needed

// Define the props for the reusable component
// Use generics to ensure type safety between the form values and the field name
interface ReusableFormFieldProps<TFieldValues extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Use React's standard input attributes type
  control: Control<TFieldValues>
  name: Path<TFieldValues> // Use Path for type safety on field names
  label: string
  isInt?: boolean
}

export function ReusableFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  isInt = true,
  type = 'text', // Default type to 'text'
  ...inputProps // Pass any other standard input attributes like placeholder etc.
}: ReusableFormFieldProps<TFieldValues>) {
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
              {...inputProps} // Spread the rest of the input props
              {...field} // Spread the field props from react-hook-form
              onChange={(e) => {
                // Handle potential number conversion or keep original value
                const value = e.target.value
                if (type === 'number') {
                  if (isInt) {
                    // Allow empty string for clearing the input, otherwise parse
                    field.onChange(value === '' ? '' : parseInt(value, 10))
                  } else {
                    // Allow empty string for clearing the input, otherwise parse
                    field.onChange(value === '' ? '' : parseFloat(value))
                  }
                } else {
                  field.onChange(value)
                }
              }}
              // Ensure value is controlled, handling potential undefined/null from react-hook-form
              value={field.value ?? ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
