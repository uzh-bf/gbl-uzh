import { twMerge } from 'tailwind-merge'

interface Props {
  title: string
  isCentered?: boolean
  className?: string
  size?: string
}

function Title({ title, isCentered, className, size }: Props) {
  return (
    <div className="max-w-6xl m-auto">
      <h1
        className={twMerge(
          'font-kollektif font-bold  lg:pl-8',
          isCentered ? 'text-center' : 'text-left',
          size === 'medium' && 'text-2xl sm:text-3xl lg:text-4xl',
          size === 'large' && 'text-3xl sm:text-4xl lg:text-5xl',
          className
        )}
      >
        {title}
      </h1>
    </div>
  )
}

Title.defaultProps = {
  isCentered: false,
  size: 'medium',
}

export default Title
