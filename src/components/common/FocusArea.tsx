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
    <div
      className={clsx(
        'flex flex-col md:flex-row items-center md:items-center',
        className
      )}
    >
      <div className="flex-1 md:flex-initial md:w-36">
        <Card
          colored
          className="p-4 w-36"
          imgSrc={imgSrc}
          minHeight="min-h-[100px]"
        />
      </div>
      <div>
        <Header.H3 className="mt-4 mb-0 md:mt-0 md:pl-4">{title}</Header.H3>
        <p className="flex-1 prose md:pl-4 max-w-none">{description}</p>
      </div>
    </div>
  )
}

FocusArea.defaultProps = {
  className: undefined,
}

export default FocusArea
