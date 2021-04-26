import clsx from 'clsx'

interface Props {
  children: React.ReactNode
  className?: string
}

const defaultProps = {
  className: undefined,
}

function H1({ children, className }: Props) {
  return (
    <h1 className={clsx('mb-1 text-xl md:text-2xl md:mb-2', className)}>
      {children}
    </h1>
  )
}

function H2({ children, className }: Props) {
  return (
    <h2 className={clsx('mb-1 text-lg md:text-xl', className)}>{children}</h2>
  )
}

function H3({ children, className }: Props) {
  return (
    <h3 className={clsx('mb-1 text-base md:text-lg', className)}>{children}</h3>
  )
}

H1.defaultProps = defaultProps
H2.defaultProps = defaultProps
H3.defaultProps = defaultProps

export default {
  H1,
  H2,
  H3,
}
