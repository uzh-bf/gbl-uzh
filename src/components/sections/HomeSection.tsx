import Header from '../common/Header'
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
