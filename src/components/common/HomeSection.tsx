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

export default HomeSection
