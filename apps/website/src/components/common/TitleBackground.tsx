import { twMerge } from 'tailwind-merge'

interface Props {
  children: React.ReactNode
  className?: string
}

function TitleBackground({ children, className }: Props) {
  return (
    <div
      className={twMerge('w-full shadow bg-uzh-grey-20', className || 'p-8')}
    >
      {children}
    </div>
  )
}

TitleBackground.defaultProps = {
  className: undefined,
}

export default TitleBackground
