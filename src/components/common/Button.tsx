import { ArrowRightIcon } from '@heroicons/react/solid'

interface Props {
  children: React.ReactNode
  onClick: () => void
}

function Button({ children, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="inline-flex items-center px-4 py-2 text-sm font-bold bg-white border border-gray-300 rounded-md shadow-sm text-uzh-blue-60 hover:bg-gray-50"
    >
      {children}
    </button>
  )
}

Button.Arrow = () => <ArrowRightIcon className="h-4 mr-2" />

export default Button
