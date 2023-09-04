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
}: Props) {
  return (
    <Button
      fluid
      disabled={disabled || !onClick}
      onClick={onClick}
      className={{
        root: twMerge(
          'p-0 border-none outline outline-1 outline-uzh-grey-60 filter',
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
          'w-full h-full relative',
          minHeight || 'min-h-[200px]'
        )}
      >
        {tags && tags.length > 0 && (
          <div className="absolute top-0 z-10 flex flex-row flex-wrap gap-1 p-2">
            {tags.map((tag) => (
              <Tag
                key={tag}
                label={tag}
                className={{ root: 'bg-slate-200 border-slate-400 border' }}
              />
            ))}
          </div>
        )}

        {name && (
          <div className="absolute left-0 right-0 z-10 py-1 text-lg font-bold prose text-center bg-white bg-opacity-95 bottom-3">
            {name}
          </div>
        )}

        <Image
          className={twMerge('z-0 w-full rounded opacity-90 object-cover')}
          src={imgSrc}
          alt={`Image of ${name}`}
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
