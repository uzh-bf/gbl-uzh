import Link from 'next/link'

interface Props {
  name: string
  linkHref: string
  tags?: string[]
}

function GameCard({ name, tags, linkHref }: Props) {
  return (
    <Link href={linkHref}>
      <div className="flex-1 mb-4 border rounded shadow cursor-pointer hover:shadow-lg md:mb-0 md:mr-4 last:mr-0">
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
              <div className="px-2 mr-1 text-sm bg-white border rounded">
                {tag}
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

GameCard.defaultProps = {
  tags: [],
}

GameCard.ProcessSignifier = function ProcessSignifier() {
  return (
    <div className="flex flex-col items-center p-2 mb-2 border rounded md:mb-0 md:mr-2 md:last:mr-0">
      <div className="flex flex-row">
        <svg height="35" width="35">
          <circle
            cx="15"
            cy="15"
            r="15"
            stroke="black"
            strokeWidth="1"
            fill="grey"
          />
        </svg>
        <svg height="35" width="35">
          <circle
            cx="15"
            cy="15"
            r="15"
            stroke="black"
            strokeWidth="1"
            fill="none"
          />
        </svg>
        <svg height="35" width="35">
          <circle
            cx="15"
            cy="15"
            r="15"
            stroke="black"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>
    </div>
  )
}

export default GameCard
