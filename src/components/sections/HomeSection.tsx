interface Props {
  title: string
  children: React.ReactNode
  className?: string
}

function HomeSection({ title, children, className }: Props) {
  return (
    <div className="py-16">
      <div className="max-w-6xl m-auto">
        <h1 className="mb-2 text-4xl text-center font-kollektif-bold md:mb-4 text-uzh-red-100 md:text-left">
          {title}
        </h1>
        <div>{children}</div>
      </div>
    </div>
  )
}

HomeSection.defaultProps = {
  className: undefined,
}

interface IconContentProps {
  iconSrc: string
  iconAlt: string
  children: React.ReactNode
}

HomeSection.IconContent = function IconContent({
  iconSrc,
  iconAlt,
  children,
}: IconContentProps) {
  return (
    <div className="relative flex flex-col items-center mb-2 md:flex-row md:mb-4">
      <div className="flex justify-center w-full md:w-40">
        <img src={iconSrc} alt={iconAlt} />
      </div>
      <p className="p-2 prose text-gray-600 md:prose-lg md:prose-ld md:p-0 md:pl-16">
        {children}
      </p>
    </div>
  )
}

export default HomeSection
