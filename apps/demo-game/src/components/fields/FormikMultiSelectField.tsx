import { useField } from 'formik'
import { MultiSelect } from '~/components/MultiSelect'

interface MultiSelectFieldProps {
  name: string
  label: string
  options: { value: string; label: string }[]
  placeholderCmdSearch: string
}

export const FormikMultiSelectField = ({
  name,
  label,
  options,
  placeholderCmdSearch,
}: MultiSelectFieldProps) => {
  const [field, meta, helpers] = useField(name)
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-normal text-gray-700">{label}</span>
      <MultiSelect
        {...field}
        options={options}
        placeholderCmdSearch={placeholderCmdSearch}
        onChange={(value) => {
          helpers.setValue(value)
        }}
      />
      {meta.touched && meta.error ? (
        <div className="text-sm text-red-600">{meta.error}</div>
      ) : null}
    </div>
  )
}
