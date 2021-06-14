interface Props {
  children: React.ReactNode
}

function Content({ children }: Props) {
  return <div className="max-w-6xl p-8 m-auto lg:py-16">{children}</div>
}

export default Content
