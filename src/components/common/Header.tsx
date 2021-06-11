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
    <h1
      className={clsx(
        'mb-2 text-xl font-kollektif-bold md:text-2xl md:mb-4 text-center md:text-left',
        className
      )}
    >
      {children}
    </h1>
  )
}

function H2({ children, className }: Props) {
  return (
    <h2
      className={clsx(
        'mb-2 text-xl md:text-xl md:mb-4 font-kollektif-bold text-center md:text-left',
        className
      )}
    >
      {children}
    </h2>
  )
}

function H3({ children, className }: Props) {
  return (
    <h3
      className={clsx(
        'mb-2 text-base md:text-lg md:mb-4 text-gray-700 font-kollektif-bold text-center md:text-left',
        className
      )}
    >
      {children}
    </h3>
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
