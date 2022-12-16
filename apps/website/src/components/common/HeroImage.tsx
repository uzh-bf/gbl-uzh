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
    <Link
      passHref
      href={href}
      className={twMerge(
        'rounded-xl border shadow flex flex-row items-center px-2 mb-4 text-center cursor-pointer last:mb-0 md:mb-0 md:last:mr-0 md:p-4 md:flex-1 md:flex-col text-uzh-red-100 hover:bg-uzh-grey-20',
        className
      )}
    >
      <div className="relative flex-1">
        <Image src={imgSrc} alt="Hero" fill />
      </div>
      <p className="flex-1 pl-8 text-2xl font-bold md:pl-0">{label}</p>
    </Link>
  )
}

HeroImage.defaultProps = {
  className: '',
}

HeroImage.Group = function HeroImageGroup({
  children,
}: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-col gap-2 md:m-auto md:justify-between md:flex-row">
      {children}
    </div>
  )
}

export default HeroImage
