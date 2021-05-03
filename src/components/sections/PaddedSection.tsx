import clsx from 'clsx'

interface Props {
  className?: string
  children: React.ReactNode
}

function PaddedSection({ className, children }: Props) {
  return (
    <div className={clsx('sm:px-4 px-8 py-4 md:py-16 md:px-16', className)}>
      {children}
    </div>
  )
}

PaddedSection.defaultProps = {
  className: undefined,
}

export default PaddedSection
