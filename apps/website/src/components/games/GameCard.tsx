import { StaticImageData } from 'next/legacy/image'
import { useRouter } from 'next/router'
import Card from '../common/Card'

interface Props {
  name: string
  linkHref?: string
  imgSrc: StaticImageData | string
  tags?: string[]
}

function GameCard({ name, tags, linkHref, imgSrc }: Props) {
  const router = useRouter()

  const addToRouter = () => {
    if (linkHref) {
      router.push(linkHref)
    }
  }

  return <Card name={name} tags={tags} imgSrc={imgSrc} onClick={addToRouter} />
}

GameCard.defaultProps = {
  linkHref: undefined,
  tags: [],
}

GameCard.ProcessSignifier = function ProcessSignifier() {
  return (
    <div className="mb-2 flex flex-col items-center rounded border p-2 md:mb-0 md:mr-2 md:last:mr-0">
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
