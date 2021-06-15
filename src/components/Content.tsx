interface Props {
  children: React.ReactNode
}

function Content({ children }: Props) {
  return <div className="max-w-6xl p-8 m-auto">{children}</div>
}

export default Content
