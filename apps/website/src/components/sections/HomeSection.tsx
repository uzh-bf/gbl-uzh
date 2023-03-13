import { H2, Prose } from '@uzh-bf/design-system'
import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

interface Props {
  className?: string
  children: React.ReactNode
}

function HomeSection({ className, children }: Props) {
  return (
    <div className={twMerge('py-4 md:py-4', className)}>
      <div className="flex flex-row max-w-6xl m-auto md:min-h-[350px] shadow-lg">
        {children}
      </div>
    </div>
  )
}

HomeSection.defaultProps = {
  className: undefined,
}

interface HomeSectionContentProps {
  title: string
  content?: string
  children?: React.ReactNode
}

HomeSection.Content = function HomeSectionContent({
  title,
  content,
  children,
}: HomeSectionContentProps) {
  return (
    <div className="flex-1 w-1/2 bg-slate-100">
      <div className="p-8 md:p-16">
        <H2>{title}</H2>
        {content && (
          <Prose className={{ root: 'mt-4 md:prose-lg' }}>{content}</Prose>
        )}
        {children}
      </div>
    </div>
  )
}

interface HomeSectionHeroProps {
  src: string
  padded?: boolean
  contain?: boolean
  className?: string
}

HomeSection.Hero = function HomeSectionHero({
  padded,
  src,
  contain,
  className,
}: HomeSectionHeroProps) {
  return (
    <div className="relative items-center flex-1 hidden w-1/2 md:flex justify-items-center">
      <Image
        alt="Hero"
        className={twMerge(
          'w-full h-full opacity-90',
          padded && 'p-4',
          contain ? 'object-contain' : 'object-cover',
          className
        )}
        src={src}
        fill
      />
    </div>
  )
}

export default HomeSection
