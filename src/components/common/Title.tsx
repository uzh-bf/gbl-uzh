interface Props {
  title: string
}

function Title({ title }: Props) {
  return (
    <h1 className="max-w-6xl m-auto font-mono text-2xl font-bold text-center text-uzh-red-80 sm:text-4xl lg:text-5xl">
      {title}
    </h1>
  )
}

export default Title
