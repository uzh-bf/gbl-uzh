import { Button, Tag } from '@uzh-bf/design-system'
import Image, { StaticImageData } from 'next/image'
import { twMerge } from 'tailwind-merge'

interface Props {
  name?: string
  imgSrc: StaticImageData | string
  tags?: string[]
  className?: string
  onClick?: () => void
  minHeight?: string
  colored?: boolean
  disabled?: boolean
  objectFit?: string
}

function Card({
  name,
  tags,
  className,
  imgSrc,
  onClick,
  minHeight,
  colored,
  disabled,
  objectFit = undefined,
}: Props) {
  return (
    <Button
      fluid
      disabled={disabled || !onClick}
      onClick={onClick}
      className={{
        root: twMerge(
          'border-none p-0 outline outline-1 outline-uzh-grey-60 filter',
          !colored && 'grayscale',
          className,
          onClick
            ? 'hover:shadow-lg hover:outline-uzh-red-100 hover:filter-none'
            : 'cursor-default'
        ),
      }}
    >
      <div
        className={twMerge(
          'relative h-full w-full',
          minHeight || 'min-h-[200px]'
        )}
      >
        {tags && tags.length > 0 && (
          <div className="absolute top-0 z-10 flex flex-row flex-wrap gap-1 p-2">
            {tags.map((tag) => (
              <Tag
                key={tag}
                label={tag}
                className={{
                  root: 'border border-slate-200 bg-white',
                }}
              />
            ))}
          </div>
        )}

        {name && (
          <div className="prose absolute bottom-3 left-0 right-0 z-10 bg-white bg-opacity-95 py-1 text-center text-lg font-bold">
            {name}
          </div>
        )}

        <Image
          className={twMerge('z-0 w-full rounded object-cover opacity-90')}
          src={imgSrc}
          alt={`Image of ${name}`}
          objectFit={objectFit}
          fill
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
