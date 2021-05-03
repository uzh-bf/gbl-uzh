import clsx from 'clsx'
import Tag from './Tag'

interface Props {
  name: string
  tags?: string[]
  isHoverable?: boolean
  className?: string
}

function Card({ name, tags, className, isHoverable }: Props) {
  return (
    <div
      className={clsx(
        'flex-1 mb-4 border rounded shadow md:mb-0 md:mr-4 last:mr-0',
        className,
        isHoverable && 'cursor-pointer hover:shadow-lg'
      )}
    >
      <div className="relative">
        <div className="absolute left-0 right-0 z-10 py-1 text-base text-center text-white bg-uzh-blue-60 bottom-3">
          {name}
        </div>

        <img
          className="z-0 grayscale filter"
          width="100%"
          src="images/pfm_game.png"
          alt={`Screenshot of ${name}`}
        />
      </div>

      {tags?.length > 0 && (
        <div className="flex flex-row flex-wrap p-1 bg-gray-100">
          {tags.map((tag) => (
            <Tag label={tag} />
          ))}
        </div>
      )}
    </div>
  )
}

Card.defaultProps = {
  className: undefined,
  tags: [],
  isHoverable: false,
}

export default Card
