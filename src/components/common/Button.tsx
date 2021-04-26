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
      className="inline-flex items-center px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
    >
      {children}
    </button>
  )
}

Button.Arrow = () => <ArrowRightIcon className="h-4 mr-2" />

export default Button
