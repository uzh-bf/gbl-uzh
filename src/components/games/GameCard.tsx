import { useRouter } from 'next/router'
import Card from '../common/Card'

interface Props {
  name: string
  linkHref?: string
  imgSrc: any
  tags?: string[]
}

function GameCard({ name, tags, linkHref, imgSrc }: Props) {
  const router = useRouter()

  return (
    <Card
      name={name}
      tags={tags}
      imgSrc={imgSrc}
      onClick={linkHref ? () => router.push(linkHref) : undefined}
    />
  )
}

GameCard.defaultProps = {
  linkHref: undefined,
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
