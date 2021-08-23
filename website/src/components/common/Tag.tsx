import clsx from 'clsx'

interface Props {
  label: string
  className?: string
}

function Tag({ label, className }: Props) {
  let labelTEST = ''
  if (label !== 'Work in Progress') {
    return (
      <div
        className={clsx(
          'bg-white mb-1 px-2 mr-2 text-sm prose text-gray-600 border rounded shadow bg-opacity-95',
          className
        )}
      >
        {label}
      </div>
    )
  }
  return (
    <div
      className={clsx(
        'bg-yellow-200 mb-1 px-2 mr-2 text-sm prose text-gray-600 border rounded shadow bg-opacity-95',
        className
      )}
    >
      In Progress / Development
    </div>
  )
}

Tag.defaultProps = {
  className: undefined,
}

export default Tag
