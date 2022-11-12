interface Props {
  children: React.ReactNode
}

function Content({ children }: Props) {
  return <div className="max-w-6xl p-4 m-auto md:p-8">{children}</div>
}

export default Content
