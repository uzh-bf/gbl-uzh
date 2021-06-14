import clsx from 'clsx'

interface Props {
  children: React.ReactNode
  className?: string
}

function TitleBackground({ children, className }: Props) {
  return (
    <div className={clsx('w-full shadow bg-uzh-gray-20', className || 'p-8')}>
      {children}
    </div>
  )
}

TitleBackground.defaultProps = {
  className: undefined,
}

export default TitleBackground
