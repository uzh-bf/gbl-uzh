import clsx from 'clsx'
import Tag from './Tag'

interface Props {
  name: string
  imgSrc: string
  tags?: string[]
  className?: string
  onClick?: () => void
}

function Card({ name, tags, className, imgSrc, onClick }: Props) {
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
      <div className="w-full h-full relative min-h-[100px]">
        {tags?.length > 0 && (
          <div className="absolute top-0 z-10 flex flex-row flex-wrap p-2">
            {tags.map((tag) => (
              <Tag label={tag} />
            ))}
          </div>
        )}

        <div className="absolute left-0 right-0 z-10 py-1 text-lg font-bold prose text-center bg-white bg-opacity-70 bottom-3">
          {name}
        </div>

        <img
          className="z-0 object-cover w-full h-full rounded opacity-80 grayscale filter"
          width="100%"
          src={imgSrc}
          alt={`Screenshot of ${name}`}
        />
      </div>
    </button>
  )
}

Card.defaultProps = {
  className: undefined,
  tags: [],
  onClick: undefined,
}

export default Card
