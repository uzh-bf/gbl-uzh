import { twMerge } from 'tailwind-merge'

interface Props {
  label: string
  className?: string
}

function Tag({ label, className }: Props) {
  return (
    <div
      className={twMerge(
        'px-2 text-sm prose text-gray-600 border rounded shadow bg-opacity-95',
        label !== 'Work in Progress' ? 'bg-white' : 'bg-yellow-200',
        className
      )}
    >
      {label}
    </div>
  )
}

Tag.defaultProps = {
  className: undefined,
}

export default Tag
