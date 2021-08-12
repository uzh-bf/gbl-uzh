import clsx from 'clsx'

interface Props {
  title: string
  isCentered?: boolean
}

function Title({ title, isCentered }: Props) {
  return (
    <div className="max-w-6xl m-auto">
      <h1
        className={clsx(
          'font-kollektif-bold text-2xl sm:text-3xl lg:text-4xl lg:pl-8',
          isCentered ? 'text-center' : 'text-left'
        )}
      >
        {title}
      </h1>
    </div>
  )
}

Title.defaultProps = {
  isCentered: false,
}

export default Title
