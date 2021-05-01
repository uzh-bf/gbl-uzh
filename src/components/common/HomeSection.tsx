import Header from './Header'
import PaddedSection from './PaddedSection'

interface Props {
  title: string
  children: React.ReactNode
  className?: string
}

function HomeSection({ title, children, className }: Props) {
  return (
    <PaddedSection className={className}>
      <div className="max-w-6xl m-auto">
        <Header.H1>{title}</Header.H1>
        <div>{children}</div>
      </div>
    </PaddedSection>
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
      <div className="flex items-center justify-center w-full md:w-52">
        <img src={iconSrc} alt={iconAlt} />
      </div>
      <p className="p-2 prose md:p-4 md:pl-16">{children}</p>
    </div>
  )
}

export default HomeSection
