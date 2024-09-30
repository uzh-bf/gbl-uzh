import {
  faGem,
  faLightbulb as faLightbulbRegular,
} from '@fortawesome/free-regular-svg-icons'
import {
  faBookOpenReader,
  faLightbulb as faLightbulbSolid,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { H3 } from '@uzh-bf/design-system'
import Link from 'next/link'
import { sortBy } from 'ramda'

import { useMutation, useQuery } from '@apollo/client'
import { LearningElementState } from '@gbl-uzh/platform'
import { Button, Modal } from '@uzh-bf/design-system'
import { useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import {
  AttemptLearningElementDocument,
  ResultDocument,
} from 'src/graphql/generated/ops'
import { twMerge } from 'tailwind-merge'
import { useToast } from './ui/use-toast'

function LearningElements() {
  const { data } = useQuery(ResultDocument, {
    fetchPolicy: 'cache-only',
  })

  const [isModalOpen, setIsModalOpen] = useState(false)

  const playerDataResult = data?.result
  const currentGame = playerDataResult?.currentGame
  const periods = currentGame?.periods
  const learningElements =
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
    return completedLearningElementIds.map((id) => allLearningElements[id])
  }, [periods, completedLearningElementIds])

  const [activeElements, setActiveElements] = useState([])

  const [elementState, setElementState] = useState(null)

  const { toast } = useToast()

  // const learningElement = useQuery(LearningElementDocument, {
  //   variables: {
  //     // id: router.query.id,
  //   },
  //   onCompleted({ learningElement }) {
  //     setElementState(learningElement.state as any)
  //     try {
  //       if (learningElement.solution) {
  //         setActiveElements(JSON.parse(learningElement.solution))
  //       }
  //     } catch (e) {}
  //   },
  // })

  // console.log('learningElement', learningElement)

  // TODO(JJ): Experience points are not updated...
  const [attemptLearningElement, { loading }] = useMutation(
    AttemptLearningElementDocument,
    {
      variables: {
        elementId: '', // router.query.id as string,
        selection: JSON.stringify(activeElements),
      },
      onCompleted({ attemptLearningElement: result }) {
        if (result.pointsAchieved === result.pointsMax) {
          setElementState(LearningElementState.SOLVED)
        } else {
          setElementState(LearningElementState.ATTEMPTED)
          toast({
            title: 'Wrong answer',
            description: 'Try again!',
          })
        }
      },
      refetchQueries: 'all',
    }
  )

  console.log('B')

  if (loading) return <div>Loading...</div>
  console.log('attemptLearningElement', attemptLearningElement)
  console.log('C')
  // if (elementState == null) {
  //   return null
  // }
  // if (!learningElement.data || elementState == null) {
  //   return null
  // }
  console.log('D')
  if (!learningElements) return null

  console.log('E')

  const sortedElements = sortBy((elem) => elem.title, learningElements)
  const openElements = sortedElements.filter(
    (elem) => !completedLearningElementIds.includes(elem.id)
  )
  console.log('openElements', openElements)
  console.log('completedLearningElements', completedLearningElements)

  return (
    <div className="flex flex-col gap-1 text-xs">
      <H3 className={{ root: 'mt-4' }}>Learning Activities</H3>
      <ul className="flex max-h-36 flex-col gap-1 overflow-auto">
        {openElements?.length + completedLearningElements.length === 0 && (
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
              <FontAwesomeIcon icon={faLightbulbSolid} />
              <span className="ml-1">{elem.title}</span>
            </Link>
            <Button
              onClick={() => {
                setIsModalOpen(true)
              }}
            >
              <FontAwesomeIcon icon={faLightbulbSolid} />
              <span className="ml-1">{elem.title}</span>
            </Button>
            <Modal
              className={{ content: 'max-w-4xl overflow-y-auto' }}
              open={isModalOpen}
              onClose={() => {
                setIsModalOpen(false)
              }}
              onPrimaryAction={<Button>Continue</Button>}
              // title={unseenStoryElements[0]?.title}
            >
              <div>
                {/* <Progress
          max={activeStoryElements?.length}
          value={activeStoryElements?.length - unseenStoryElements?.length + 1}
          formatter={Number}
        /> */}
              </div>

              <div className="prose prose-img:max-w-xs prose-img:rounded mt-4 max-w-none">
                {/* <Markdown>
          {(unseenStoryElements[0]?.type === 'GENERIC' &&
            unseenStoryElements[0]?.content) ||
            (unseenStoryElements[0]?.type === 'ROLE_BASED' &&
              unseenStoryElements[0]?.contentRole?.[player.role])}
        </Markdown> */}
                <div className="m-auto flex w-full max-w-5xl flex-col rounded border">
                  <div
                    className={twMerge(
                      'px-2 py-1 text-xs font-bold text-gray-600'
                      // elementState === LearningElementState.SOLVED
                      //   ? 'bg-green-100'
                      //   : 'bg-orange-100'
                    )}
                  >
                    {elementState}
                  </div>
                  <div className="flex flex-row items-start gap-4 border-b px-8 py-4">
                    <div className="flex-1">
                      <h1 className="mb-1 text-lg font-bold">{elem.title}</h1>
                      <Markdown className="prose prose-lg max-w-full">
                        {/* {learningElement.data.learningElement.element.question} */}
                        <div>hi</div>
                      </Markdown>
                    </div>
                    <div className="flex flex-initial flex-col items-end gap-2">
                      <FontAwesomeIcon
                        icon={faBookOpenReader}
                        size="2x"
                        className="text-gray-400"
                      />
                      <div className="text-orange-500">Awards 20XP</div>
                    </div>
                  </div>
                  <div className="flex flex-row gap-8 px-8 py-4">
                    <div
                      className={twMerge(
                        'flex flex-1 flex-col justify-between gap-4',
                        elementState === LearningElementState.SOLVED
                          ? 'order-2'
                          : 'order-1'
                      )}
                    >
                      <div>
                        {/* {elementState === LearningElementState.SOLVED &&
                          learningElement.data.learningElement.element
                            .feedback && (
                            <div className="flex max-w-none flex-row gap-4 px-4 py-2 text-sm">
                              <FontAwesomeIcon
                                className="mt-1 text-gray-400"
                                icon={faInfoCircle}
                                size="2x"
                              />
                              <div>
                                <div className="mb-1 font-bold">
                                  Explanation
                                </div>
                                <Markdown className="prose prose-sm">
                                  {
                                    learningElement.data.learningElement.element
                                      .feedback
                                  }
                                </Markdown>
                              </div>
                            </div>
                          )} */}
                      </div>
                      <div>
                        {elementState === LearningElementState.SOLVED && (
                          <div className="flex flex-row gap-4 px-4 py-2 text-sm ">
                            <FontAwesomeIcon
                              className="mt-1 text-orange-500"
                              icon={faGem}
                              size="2x"
                            />
                            <div>
                              <div className="mb-1 font-bold">
                                Why is it relevant?
                              </div>
                              <Markdown className="prose prose-sm">
                                {/* {
                                  learningElement.data.learningElement.element
                                    .motivation
                                } */}
                                <div>blu</div>
                              </Markdown>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className={twMerge(
                        'flex w-80 flex-col gap-4 text-sm',
                        elementState === LearningElementState.SOLVED
                          ? 'order-1'
                          : 'order-2'
                      )}
                    >
                      {/* {learningElement.data.learningElement.element.options.map(
                        (option, ix) => (
                          <Button
                            key={ix}
                            disabled={
                              elementState === LearningElementState.SOLVED
                            }
                            className={{
                              root: twMerge(
                                'prose prose-sm p-3',
                                activeElements?.includes(ix) &&
                                  elementState ===
                                    LearningElementState.SOLVED &&
                                  'border-green-200 bg-green-100'
                              ),
                            }}
                            active={activeElements?.includes(ix)}
                            onClick={() =>
                              setActiveElements((prevState) => {
                                if (prevState.includes(ix)) {
                                  return without([ix], prevState)
                                }
                                // FIXME: multiple choice logic
                                // return [...activeElements, ix]

                                // FIXME: single choice logic
                                return [ix]
                              })
                            }
                          >
                            <Markdown className="prose prose-sm">
                              {option.content}
                            </Markdown>
                          </Button>
                        )
                      )} */}
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-between border-t p-8">
                    <div>
                      {elementState !== LearningElementState.SOLVED && (
                        <Button
                          disabled={activeElements.length === 0}
                          onClick={() => attemptLearningElement()}
                        >
                          {elementState === LearningElementState.ATTEMPTED
                            ? 'Try Again'
                            : 'Submit'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Modal>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LearningElements
