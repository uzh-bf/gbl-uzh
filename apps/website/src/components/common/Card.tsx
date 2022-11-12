import { twMerge } from 'tailwind-merge'
import Image, { StaticImageData } from 'next/image'
import customLoader from '../../lib/loader'
import Tag from './Tag'
import { Button } from '@uzh-bf/design-system'

interface Props {
  name?: string
  imgSrc: StaticImageData | string
  tags?: string[]
  className?: string
  onClick?: () => void
  minHeight?: string
  colored?: boolean
}

function Card({
  name,
  tags,
  className,
  imgSrc,
  onClick,
  minHeight,
  colored,
}: Props) {
  return (
    <Button
      fluid
      disabled={!onClick}
      onClick={onClick}
      className={twMerge(
        'p-0 border-none outline outline-1 outline-uzh-grey-60 filter',
        !colored && 'grayscale',
        className,
        onClick
          ? 'hover:shadow-lg hover:outline-uzh-red-100 hover:filter-none'
          : 'cursor-default'
      )}
    >
      <div
        className={twMerge(
          'w-full h-full relative',
          minHeight || 'min-h-[200px]'
        )}
      >
        {tags && tags.length > 0 && (
          <div className="absolute top-0 z-10 flex flex-row flex-wrap gap-1 p-2">
            {tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        )}

        {name && (
          <div className="absolute left-0 right-0 z-10 py-1 text-lg font-bold prose text-center bg-white bg-opacity-80 bottom-3">
            {name}
          </div>
        )}

        <Image
          className={twMerge('z-0 w-full rounded opacity-90')}
          src={imgSrc}
          alt={`Image of ${name}`}
          layout="fill"
          objectFit="cover"
        />
      </div>
    </Button>
  )
}

Card.defaultProps = {
  name: undefined,
  className: undefined,
  tags: [],
  onClick: undefined,
  minHeight: undefined,
  colored: false,
}

export default Card
