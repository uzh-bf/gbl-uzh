import { useMutation } from '@apollo/client'
import { Button, Modal, Progress } from '@uzh-bf/design-system'
import { sortBy } from 'ramda'
import { useEffect, useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import { MarkStoryElementDocument } from 'src/graphql/generated/ops'

interface Props {
  playerState: any
  player: any
}

// TODO(JJ): Check if we should fetch the story elements in the component
function StoryElements({ playerState, player }: Props) {
  const [unseenStoryElements, setUnseenStoryElements] = useState([])

  const activeStoryElements = useMemo(() => {
    if (!playerState?.data) return []
    return sortBy(
      (elem) => elem.title,
      playerState?.data?.result.currentGame.activePeriod.activeSegment
        ?.storyElements
    )
  }, [playerState?.data])

  const visitedStoryElements =
    playerState?.data?.result?.playerResult?.player.visitedStoryElementIds

  useEffect(() => {
    if (activeStoryElements?.length > 0) {
      const unseenStoryElements = activeStoryElements.filter(
        (elem) => !visitedStoryElements?.includes(elem.id)
      )
      setUnseenStoryElements(unseenStoryElements)
    }
  }, [activeStoryElements, playerState, visitedStoryElements])

  const [markStoryElement, { loading }] = useMutation(MarkStoryElementDocument)

  return (
    <Modal
      className={{ content: 'max-w-4xl overflow-y-auto' }}
      // disabled={loading}
      open={unseenStoryElements.length > 0}
      onClose={() => {
        setUnseenStoryElements((elem) => elem.slice(1))
      }}
      onPrimaryAction={
        <Button
          onClick={() => {
            markStoryElement({
              variables: {
                elementId: unseenStoryElements[0]?.id,
              },
              // optimisticResponse: {
              //   markStoryElement: {
              //     id: unseenStoryElements[0]?.id,
              //     visitedStoryElementIds: [unseenStoryElements[0]?.id],
              //     __typename: 'Player',
              //   },
              // },
            })
          }}
        >
          Continue
        </Button>
      }
      title={unseenStoryElements[0]?.title}
    >
      <div>
        <Progress
          max={activeStoryElements?.length}
          value={activeStoryElements?.length - unseenStoryElements?.length + 1}
          formatter={Number}
        />
      </div>

      <div className="prose prose-img:max-w-xs prose-img:rounded mt-4 max-w-none">
        <Markdown>
          {(unseenStoryElements[0]?.type === 'GENERIC' &&
            unseenStoryElements[0]?.content) ||
            (unseenStoryElements[0]?.type === 'ROLE_BASED' &&
              unseenStoryElements[0]?.contentRole?.[player.role])}
        </Markdown>
      </div>
    </Modal>
  )
}

export default StoryElements
