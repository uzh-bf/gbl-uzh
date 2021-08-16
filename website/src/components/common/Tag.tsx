import { ExclamationIcon } from '@heroicons/react/solid'
import clsx from 'clsx'

interface Props {
  label: string
  className?: string
}

function Tag({ label, className }: Props) {
  let labelTEST = ''
  if (label !== 'work in progress') {
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
        'flex mb-1 bg-yellow-400 px-2 mr-2 text-sm prose text-gray-600 border rounded shadow bg-opacity-95',
        className
      )}
    >
      <ExclamationIcon className="w-4 mr-1 bottom-0" />{' '}
      {'In Progress / Development'}
    </div>
  )
}

Tag.defaultProps = {
  className: undefined,
}

export default Tag
