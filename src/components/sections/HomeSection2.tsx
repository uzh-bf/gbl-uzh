import PaddedSection from './PaddedSection'

interface Props {
  className?: string
  children: React.ReactNode
}

function HomeSection2({ className, children }: Props) {
  return (
    <PaddedSection className={className}>
      <div className="flex flex-row max-w-6xl m-auto min-h-[350px] shadow-md">
        {children}
      </div>
    </PaddedSection>
  )
}

HomeSection2.defaultProps = {
  className: undefined,
}

interface HomeSectionContentProps {
  title: string
  content: string
  children?: React.ReactNode
}

HomeSection2.Content = function HomeSectionContent({
  title,
  content,
  children,
}: HomeSectionContentProps) {
  return (
    <div className="flex-1 w-1/2 bg-gray-50">
      <div className="p-16">
        <h1 className="mb-2 text-4xl text-center font-kollektif-bold md:mb-4 text-uzh-red-100 md:text-left">
          {title}
        </h1>
        <p className="prose-lg">{content}</p>
        {children}
      </div>
    </div>
  )
}

interface HomeSectionHeroProps {
  src: string
}

HomeSection2.Hero = function HomeSectionHero({ src }: HomeSectionHeroProps) {
  return (
    <div className="items-center flex-1 hidden w-1/2 md:flex justify-items-center">
      <img className="w-full h-full" src={src} />
    </div>
  )
}

export default HomeSection2
