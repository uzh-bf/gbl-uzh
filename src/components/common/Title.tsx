import clsx from 'clsx'

interface Props {
  title: string
  isCentered?: boolean
}

function Title({ title, isCentered }: Props) {
  return (
    <h1
      className={clsx(
        'max-w-6xl m-auto font-mono text-2xl font-bold text-uzh-gray-20 sm:text-4xl lg:text-5xl',
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
