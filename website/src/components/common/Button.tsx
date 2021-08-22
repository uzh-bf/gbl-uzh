import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/solid'
import clsx from 'clsx'

interface Props {
  disabled?: boolean
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

function Button({ disabled, children, onClick, className }: Props) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type="button"
      className={clsx(
        'inline-flex items-center px-4 py-2 text-sm font-bold bg-white border border-gray-300 rounded-md shadow-sm ',
        className,
        disabled ? 'bg-gray-200 cursor-default' : 'hover:bg-gray-50'
      )}
    >
      {children}
    </button>
  )
}

Button.defaultProps = {
  disabled: false,
  className: '',
  onClick: undefined,
}

Button.Arrow = function ButtonArrow() {
  return <ArrowRightIcon className="h-4" />
}

Button.ArrowLeft = function ButtonArrowLeft() {
  return <ArrowLeftIcon className="h-4" />
}

export default Button
