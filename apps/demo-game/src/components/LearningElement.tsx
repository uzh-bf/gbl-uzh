import { useMutation, useQuery } from '@apollo/client'
import { faGem } from '@fortawesome/free-regular-svg-icons'
import {
  faBookOpenReader,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LearningElementState } from '@gbl-uzh/platform'
import { Button } from '@uzh-bf/design-system'
import { without } from 'ramda'
import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import {
  AttemptLearningElementDocument,
  LearningElementDocument,
} from 'src/graphql/generated/ops'
import { twMerge } from 'tailwind-merge'
import { useToast } from './ui/use-toast'

function LearningElement({ elementId }: { elementId: string }) {
  console.log('LearningElement', elementId)
  const [activeElements, setActiveElements] = useState([])

  const [elementState, setElementState] = useState(null)

  useEffect(() => {
    setActiveElements([])
  }, [elementId])

  const { toast } = useToast()

  const learningElement = useQuery(LearningElementDocument, {
    variables: {
      id: elementId,
    },
    onCompleted({ learningElement }) {
      setElementState(learningElement.state as any)
      try {
        if (learningElement.solution) {
          setActiveElements(JSON.parse(learningElement.solution))
        }
      } catch (e) {}
    },
  })

  // TODO(JJ): Experience points are not updated...
  const [attemptLearningElement, { loading }] = useMutation(
    AttemptLearningElementDocument,
    {
      variables: {
        elementId: elementId,
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

  if (loading) return <div>Loading...</div>

  if (!learningElement.data || elementState == null) {
    return null
  }

  return (
    <div className="m-auto flex w-full max-w-5xl flex-col rounded border">
      <div
        className={twMerge(
          'px-2 py-1 text-xs font-bold text-gray-600',
          elementState === LearningElementState.SOLVED
            ? 'bg-green-100'
            : 'bg-orange-100'
        )}
      >
        {elementState}
      </div>
      <div className="flex flex-row items-start gap-4 border-b px-8 py-4">
        <div className="flex-1">
          <h1 className="mb-1 text-lg font-bold">
            {learningElement.data.learningElement.element.title}
          </h1>
          <Markdown className="prose prose-lg max-w-full">
            {learningElement.data.learningElement.element.question}
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
            elementState === LearningElementState.SOLVED ? 'order-2' : 'order-1'
          )}
        >
          <div>
            {elementState === LearningElementState.SOLVED &&
              learningElement.data.learningElement.element.feedback && (
                <div className="flex max-w-none flex-row gap-4 px-4 py-2 text-sm">
                  <FontAwesomeIcon
                    className="mt-1 text-gray-400"
                    icon={faInfoCircle}
                    size="2x"
                  />
                  <div>
                    <div className="mb-1 font-bold">Explanation</div>
                    <Markdown className="prose prose-sm">
                      {learningElement.data.learningElement.element.feedback}
                    </Markdown>
                  </div>
                </div>
              )}
          </div>
          <div>
            {elementState === LearningElementState.SOLVED && (
              <div className="flex flex-row gap-4 px-4 py-2 text-sm ">
                <FontAwesomeIcon
                  className="mt-1 text-orange-500"
                  // className="text--400"
                  icon={faGem}
                  size="2x"
                />
                <div>
                  <div className="mb-1 font-bold">Why is it relevant?</div>
                  <Markdown className="prose prose-sm">
                    {learningElement.data.learningElement.element.motivation}
                  </Markdown>
                </div>
              </div>
            )}
          </div>

          {/* <div className="italic text-gray-500">Get a hint?</div> */}
        </div>
        <div
          className={twMerge(
            'flex w-80 flex-col gap-4 text-sm',
            elementState === LearningElementState.SOLVED ? 'order-1' : 'order-2'
          )}
        >
          {learningElement.data.learningElement.element.options.map(
            (option, ix) => (
              <Button
                key={ix}
                disabled={elementState === LearningElementState.SOLVED}
                className={{
                  root: twMerge(
                    'prose prose-sm p-3',
                    activeElements?.includes(ix) &&
                      elementState === LearningElementState.SOLVED &&
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
                <Markdown className="prose prose-sm">{option.content}</Markdown>
              </Button>
            )
          )}
        </div>
      </div>
      <div className="flex flex-row items-center justify-end border-t p-8">
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
  )
}

export default LearningElement
