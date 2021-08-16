import clsx from 'clsx'

interface Props {
  children: React.ReactNode
  className?: string
  align?: string
}

const defaultProps = {
  className: undefined,
  align: undefined,
}

function H1({ children, className }: Props) {
  return (
    <h1
      className={clsx(
        'mb-2 text-2xl sm:text-3xl lg:text-4xl font-kollektif-bold md:mb-4 text-center md:text-left',
        className
      )}
    >
      {children}
    </h1>
  )
}

function H2({ children, className, align }: Props) {
  let styles = ''
  if (align === 'left') {
    styles =
      'mb-2 text-xl sm:text-2xl lg:text-3xl md:mb-4 text-left font-kollektif-bold md:text-left'
  } else if (align === 'right') {
    styles =
      'mb-2 text-xl sm:text-2xl lg:text-3xl md:mb-4 text-left font-kollektif-bold md:text-right'
  } else {
    styles =
      'mb-2 text-xl sm:text-2xl lg:text-3xl md:mb-4 font-kollektif-bold text-center md:text-left'
  }

  return <h2 className={clsx(styles, className)}>{children}</h2>
}

function H3({ children, className }: Props) {
  return (
    <h3
      className={clsx(
        'mb-2 text-base sm:text-lg lg:text-xl text-gray-700 font-kollektif-bold text-center md:text-left',
        className
      )}
    >
      {children}
    </h3>
  )
}

function H4({ children, className }: Props) {
  return (
    <h4
      className={clsx(
        'mb-2 text-sm sm:text-base lg:text-lg text-gray-600 font-kollektif text-center md:text-left',
        className
      )}
    >
      {children}
    </h4>
  )
}

H1.defaultProps = defaultProps
H2.defaultProps = defaultProps
H3.defaultProps = defaultProps
H4.defaultProps = defaultProps

const elements = {
  H1,
  H2,
  H3,
  H4,
}

export default elements
