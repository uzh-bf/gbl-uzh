import { useMutation } from '@apollo/client'
import { Button, Modal, Progress } from '@uzh-bf/design-system'
import Image from 'next/image'
import { sortBy } from 'ramda'
import { useEffect, useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import {
  MarkStoryElementDocument,
  StoryElementDataFragment,
  StoryElementType,
} from 'src/graphql/generated/ops'

interface Props {
  playerState: any
  player: any
}

// TODO(JJ): Check if we should fetch the story elements in the component
function StoryElements({ playerState, player }: Props) {
  const [unseenStoryElements, setUnseenStoryElements] = useState<
    StoryElementDataFragment[]
  >([])

  const activeStoryElements = useMemo(() => {
    if (
      !playerState?.data ||
      !playerState?.data?.result.currentGame.activePeriod.activeSegment
    )
      return []
    return sortBy<StoryElementDataFragment>(
      (elem) => elem.title,
      playerState?.data?.result.currentGame.activePeriod.activeSegment
        ?.storyElements ?? []
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

  const content: string = (() => {
    if (unseenStoryElements.length === 0) return ''

    const firstElement = unseenStoryElements[0]
    switch (firstElement?.type) {
      case StoryElementType.Generic:
        return firstElement.content ?? ''
      case StoryElementType.RoleBased:
        return firstElement.contentRole?.[player.role] ?? ''
      default:
        return ''
    }
  })()

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

      <div className="prose mt-4 max-w-none prose-img:max-w-xs prose-img:rounded">
        <Markdown
          components={{
            img: ({ node, src, alt, ...props }) => {
              if (!src) return null

              return (
                <Image
                  {...props}
                  src={src}
                  width={250}
                  height={250}
                  alt={alt ?? 'Visual representation of the story element'}
                  className="mt-4 rounded-lg"
                  style={{ maxWidth: '100%' }}
                />
              )
            },
          }}
        >
          {content}
        </Markdown>
      </div>
    </Modal>
  )
}

export default StoryElements
