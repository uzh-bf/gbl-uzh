import clsx from 'clsx'

interface Props {
  className?: string
  children: React.ReactNode
  imgSrc: string
}

function BannerSection({ children, className, imgSrc }: Props) {
  return (
    <div
      className={clsx('px-4 py-4 md:py-8 bg-clip-padding', className)}
      style={{ backgroundImage: `url(${imgSrc})` }}
    >
      <p className="max-w-3xl p-4 m-auto prose-sm prose text-center rounded shadow-lg md:prose-lg bg-uzh-gray-20 bg-opacity-70">
        {children}
      </p>
    </div>
  )
}

BannerSection.defaultProps = {
  className: undefined,
}

export default BannerSection
