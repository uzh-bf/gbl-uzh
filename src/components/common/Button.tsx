import { ArrowRightIcon } from '@heroicons/react/solid'
import clsx from 'clsx'

interface Props {
  children: React.ReactNode
  className?: string
  onClick: () => void
}

function Button({ children, onClick, className }: Props) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={clsx(
        'inline-flex items-center px-4 py-2 text-sm font-bold bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50',
        className
      )}
    >
      {children}
    </button>
  )
}

Button.defaultProps = {
  className: '',
}

Button.Arrow = () => <ArrowRightIcon className="h-4 mr-2" />

export default Button
