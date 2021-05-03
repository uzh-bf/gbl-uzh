import Link from 'next/link'
import Card from '../common/Card'

interface Props {
  name: string
  linkHref: string
  tags?: string[]
}

function GameCard({ name, tags, linkHref }: Props) {
  return (
    <Link href={linkHref}>
      <Card isHoverable name={name} tags={tags} />
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
