import clsx from 'clsx'
import Image from 'next/image'
import customLoader from '../../lib/loader'
import Tag from './Tag'

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
    <button
      disabled={!onClick}
      type="button"
      onClick={onClick}
      className={clsx(
        'border rounded shadow w-full',
        className,
        onClick ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'
      )}
    >
      <div
        className={clsx('w-full h-full relative', minHeight || 'min-h-[200px]')}
      >
        {tags?.length > 0 && (
          <div className="absolute top-0 z-10 flex flex-row flex-wrap gap-1 p-2">
            {tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        )}

        {name && (
          <div className="absolute left-0 right-0 z-10 py-1 text-lg font-bold prose text-center bg-white bg-opacity-70 bottom-3">
            {name}
          </div>
        )}

        <Image
          // placeholder="blur"
          loader={customLoader}
          className={clsx(
            'z-0 w-full rounded opacity-80 ',
            !colored && 'grayscale filter'
          )}
          src={imgSrc}
          alt={`Screenshot of ${name}`}
          layout="fill"
          objectFit="cover"
        />
      </div>
    </button>
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
