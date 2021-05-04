interface Props {
  children: React.ReactNode
}

function CitationSection({ children }: Props) {
  return (
    <div className="max-w-6xl px-8 pb-2 m-auto prose text-center text-gray-600 border-b-2 md:prose-lg md:px-0 border-uzh-gray-100">
      {children}
    </div>
  )
}
export default CitationSection
