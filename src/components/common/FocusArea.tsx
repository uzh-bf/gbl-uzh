import clsx from 'clsx'
import Card from './Card'
import Header from './Header'

interface Props {
  className?: string
  imgSrc: StaticImageData
  title: string
  description: string
}

function FocusArea({ className, imgSrc, title, description }: Props) {
  return (
    <div className={clsx('flex flex-col md:flex-row', className)}>
      <div className="flex-1 md:flex-initial md:w-36">
        <Card className="w-36" imgSrc={imgSrc} minHeight="min-h-[100px]" />
      </div>
      <div>
        <Header.H3 className="mb-0 md:pl-4">{title}</Header.H3>
        <p className="flex-1 prose md:pl-4 max-w-none">{description}</p>
      </div>
    </div>
  )
}

FocusArea.defaultProps = {
  className: undefined,
}

export default FocusArea
