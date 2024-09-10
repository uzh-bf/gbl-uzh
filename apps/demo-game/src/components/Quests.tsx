import {
  faLightbulb as faLightbulbRegular,
  faSquare,
  faSquareCheck,
} from '@fortawesome/free-regular-svg-icons'
import { faLightbulb as faLightbuldSolid } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { H3 } from '@uzh-bf/design-system'
import Link from 'next/link'
import { sortBy } from 'ramda'
import { useMemo } from 'react'

import { useQuery } from '@apollo/client'
import { ResultDocument } from 'src/graphql/generated/ops'

const QUESTS = {
  BONDS: {
    title: 'Bonds',
    xp: 50,
  },
  BONDS_MARKET: {
    title: 'Bonds Market',
    xp: 50,
  },
  STOCKS: {
    title: 'Stocks',
    xp: 50,
  },
  STOCKS_MARKET: {
    title: 'Stocks Market',
    xp: 50,
  },
  INVESTMENT_RISKS: {
    title: 'Investment Risks',
    xp: 50,
  },
  TIME_VALUE_OF_MONEY: {
    title: 'Time Value of Money',
    xp: 50,
  },
  INTEREST: {
    title: 'Interest',
    xp: 50,
  },
}

function Quests({}) {
  // TODO(JJ): Decide which one is more suitable - query here or take as input
  const { data } = useQuery(ResultDocument, {
    fetchPolicy: 'cache-only',
  })

  const player = data?.self
  const achievements = player?.achievement
  const achievementKeys = player?.achievementKeys

  // TODO: move quests logic to flexible solution with prisma and backend
  const [openQuests, completedQuests] = useMemo(() => {
    if (!achievements) return [[], []]
    const { open, closed } = Object.entries(QUESTS).reduce(
      (acc, [achievementKey, details]) => {
        if (achievementKeys.includes(achievementKey)) {
          return {
            ...acc,
            closed: [...acc.closed, details],
          }
        } else {
          return {
            ...acc,
            open: [...acc.open, details],
          }
        }
      },
      {
        open: [],
        closed: [],
      }
    )
    return [open, closed]
  }, [achievementKeys, achievements])

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
      <H3>Quests</H3>
      <ul className="flex max-h-36 flex-col gap-1 overflow-auto">
        {openQuests?.length + completedQuests?.length === 0 && (
          <li>No open assignments</li>
        )}
        {openQuests?.length > 0 &&
          sortBy((elem) => elem.title, openQuests)
            .filter((elem) => {
              return !elem.market
            })
            .map((elem) => (
              <li key={elem.id}>
                <FontAwesomeIcon icon={faSquare} />
                <span className="ml-1">{elem.title}</span>
              </li>
            ))}
        {completedQuests?.length > 0 &&
          sortBy((elem) => elem.title, completedQuests).map((elem) => (
            <li key={elem.id}>
              <FontAwesomeIcon icon={faSquareCheck} />
              <span className="ml-1">{elem.title}</span>
            </li>
          ))}
      </ul>
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

export default Quests
