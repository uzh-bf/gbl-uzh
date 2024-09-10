import { faLightbulb as faLightbulbRegular } from '@fortawesome/free-regular-svg-icons'
import { faLightbulb as faLightbuldSolid } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { H3 } from '@uzh-bf/design-system'
import Link from 'next/link'
import { sortBy } from 'ramda'
import { useMemo } from 'react'

import { useQuery } from '@apollo/client'
import { ResultDocument } from 'src/graphql/generated/ops'

function LearningElements({}) {
  const { data } = useQuery(ResultDocument, {
    fetchPolicy: 'cache-only',
  })

  const playerDataResult = data?.result
  const currentGame = playerDataResult?.currentGame
  const periods = currentGame?.periods
  const learningElements =
    currentGame?.activePeriod?.activeSegment?.learningElements

  const completedLearningElementIds =
    playerDataResult?.playerResult?.player?.completedLearningElementIds

  const completedLearningElements = useMemo(() => {
    if (!completedLearningElementIds) return []
    const allLearningElements = periods
      .flatMap((period) =>
        period.segments.flatMap((segment) => segment.learningElements)
      )
      .reduce(
        (acc, elem) => ({
          ...acc,
          [elem.id]: elem,
        }),
        {}
      )
    return completedLearningElementIds.map((id) => allLearningElements[id])
  }, [periods, completedLearningElementIds])

  const sortedElements = sortBy((elem) => elem.title, learningElements)
  const openElements = sortedElements.filter(
    (elem) => !completedLearningElementIds.includes(elem.id)
  )

  return (
    <div className="flex flex-col gap-1 text-xs">
      <H3 className={{ root: 'mt-4' }}>Learning Activities</H3>
      <ul className="flex max-h-36 flex-col gap-1 overflow-auto">
        {openElements?.length + completedLearningElements?.length === 0 && (
          <li>No open learning activities</li>
        )}
        {openElements.map((elem) => (
          <li key={elem.id} className="hover:text-orange-700">
            <Link href={`/play/learning/${elem.id}`} passHref>
              <FontAwesomeIcon icon={faLightbulbRegular} />
              <span className="ml-1">{elem.title}</span>
            </Link>
          </li>
        ))}
        {sortBy((elem) => elem.title, completedLearningElements).map((elem) => (
          <li key={elem.id} className="hover:text-orange-700">
            <Link href={`/play/learning/${elem.id}`} passHref>
              <FontAwesomeIcon icon={faLightbuldSolid} />
              <span className="ml-1">{elem.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LearningElements
