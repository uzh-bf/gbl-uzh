import { faLightbulb as faLightbulbRegular } from '@fortawesome/free-regular-svg-icons'
import { faLightbulb as faLightbulbSolid } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { H3 } from '@uzh-bf/design-system'
import { sortBy } from 'ramda'

import { useQuery } from '@apollo/client'
import { Button, Modal } from '@uzh-bf/design-system'
import { useMemo, useState } from 'react'
import {
  LearningElement as LearningElementType,
  Period,
  ResultDocument,
} from 'src/graphql/generated/ops'

import LearningElement from './LearningElement'

function LearningElements() {
  const { data } = useQuery(ResultDocument, {
    fetchPolicy: 'cache-only',
  })

  const [activeId, setActiveId] = useState<string | null>(null)

  const playerDataResult = data?.result
  const currentGame = playerDataResult?.currentGame
  const periods: Period[] = currentGame?.periods
  const learningElements: LearningElementType[] =
    currentGame?.activePeriod?.activeSegment?.learningElements

  const completedLearningElementIds =
    playerDataResult?.playerResult?.player?.completedLearningElementIds ?? []

  const completedLearningElements = useMemo(() => {
    if (completedLearningElementIds.length === 0 || !periods) return []
    const allLearningElements = periods
      .flatMap((period) =>
        period.segments.flatMap((segment) => segment.learningElements)
      )
      .reduce((acc, elem) => {
        acc[elem.id] = elem
        return acc
      }, {})
    return completedLearningElementIds.map(
      (id) => allLearningElements[id]
    ) as LearningElementType[]
  }, [periods, completedLearningElementIds])

  if (!learningElements) return null

  const sortedElements = sortBy((elem) => elem.title, learningElements)
  const openElements = sortedElements.filter(
    (elem) => !completedLearningElementIds.includes(elem.id)
  )

  return (
    <div className="flex flex-col gap-1 text-xs">
      <H3 className={{ root: 'mt-4' }}>Learning Activities</H3>
      <ul className="flex max-h-36 flex-col gap-1 overflow-auto">
        {openElements?.length + completedLearningElements.length === 0 && (
          <li>No open learning activities</li>
        )}
        {openElements.map((elem) => {
          return (
            <li key={elem.id}>
              <Button
                onClick={() => setActiveId(elem.id)}
                className={{ root: 'w-full' }}
              >
                <FontAwesomeIcon icon={faLightbulbRegular} />
                <span className="ml-1">{elem.title}</span>
              </Button>
            </li>
          )
        })}
        {sortBy((elem) => elem.title, completedLearningElements).map((elem) => (
          <li key={elem.id}>
            <Button
              onClick={() => setActiveId(elem.id)}
              className={{ root: 'w-full' }}
            >
              <FontAwesomeIcon icon={faLightbulbSolid} />
              <span className="ml-1">{elem.title}</span>
            </Button>
          </li>
        ))}
      </ul>
      <Modal
        className={{ content: 'max-w-4xl overflow-y-auto' }}
        open={activeId ? true : false}
        onClose={() => setActiveId(null)}
        title="Learning Activity"
      >
        <LearningElement elementId={activeId} />
      </Modal>
    </div>
  )
}

export default LearningElements
