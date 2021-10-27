import clsx from 'clsx'

interface Props {
  label: string
  className?: string
}

function Tag({ label, className }: Props) {
  return (
    <div
      className={clsx(
        'mb-1 px-2 mr-2 text-sm prose text-gray-600 border rounded shadow bg-opacity-95',
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
