import clsx from 'clsx'

interface Props {
  title: string
  isCentered?: boolean
}

function Title({ title, isCentered }: Props) {
  return (
    <h1
      className={clsx(
        'max-w-6xl m-auto font-kollektif-bold text-2xl sm:text-4xl lg:text-6xl',
        isCentered ? 'text-center' : 'text-left'
      )}
    >
      {title}
    </h1>
  )
}

Title.defaultProps = {
  isCentered: false,
}

export default Title
