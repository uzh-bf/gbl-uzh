import clsx from 'clsx'

interface Props {
  className?: string
  children: React.ReactNode
  unpadded?: boolean
}

function PaddedSection({ className, children, unpadded }: Props) {
  return (
    <div
      className={clsx(
        unpadded ? '' : 'sm:px-4 px-4 py-4 md:py-4 md:px-4',
        className
      )}
    >
      {children}
    </div>
  )
}

PaddedSection.defaultProps = {
  className: undefined,
  unpadded: false,
}

export default PaddedSection
