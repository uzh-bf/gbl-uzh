import { Button, H2 } from '@uzh-bf/design-system'
import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

interface Props {
  imgSrc: StaticImageData
  label: string
  href: string
  className?: string
}

function HeroImage({ imgSrc, label, href, className }: Props) {
  return (
    <div className="flex-1">
      <Link href={href} className={twMerge(className)}>
        <Button fluid className={{ root: 'text-uzh-red-100' }}>
          <div className="relative h-28 w-28 flex-none">
            <Image src={imgSrc} alt="Hero" fill />
          </div>
          <H2 className={{ root: 'flex-1 font-bold' }}>{label}</H2>
        </Button>
      </Link>
    </div>
  )
}

HeroImage.defaultProps = {
  className: '',
}

HeroImage.Group = function HeroImageGroup({
  children,
}: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-col gap-4 md:m-auto md:flex-row md:justify-between">
      {children}
    </div>
  )
}

export default HeroImage
