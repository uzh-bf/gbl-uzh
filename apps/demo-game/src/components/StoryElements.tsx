import { Modal, Progress } from '@uzh-bf/design-system'
import Image from 'next/image'
import { sortBy } from 'ramda'
import { useEffect, useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import { trpc } from '~/lib/trpc'
import type { RouterOutputs } from '~/server/trpc/router'

type PlayerResult = NonNullable<RouterOutputs['play']['result']>
type PlayerResultWithStoryProgress = PlayerResult & {
  playerResult?:
    | (NonNullable<PlayerResult['playerResult']> & {
        player?: {
          visitedStoryElementIds?: string[]
        }
      })
    | null
}

type StoryElement = {
  id: string
  type?: string
  title: string
  content?: string | null
  contentRole?: Record<string, string> | null
}

const EMPTY_VISITED_STORY_ELEMENT_IDS: string[] = []

function StoryElements({
  playerResult,
  playerRole,
}: {
  playerResult?: PlayerResultWithStoryProgress
  playerRole?: string | null
}) {
  const [unseenStoryElements, setUnseenStoryElements] = useState<
    StoryElement[]
  >([])
  const utils = trpc.useUtils()

  const markStoryElement = trpc.story.markVisited.useMutation({
    async onSuccess() {
      await Promise.all([
        utils.play.result.invalidate(),
        utils.play.self.invalidate(),
      ])
    },
  })

  const activeStoryElements = useMemo(() => {
    const activeSegment = playerResult?.currentGame?.activePeriod?.activeSegment
    if (!activeSegment) return []

    return sortBy<StoryElement>(
      (elem) => elem.title,
      (activeSegment.storyElements ?? []) as StoryElement[]
    )
  }, [playerResult?.currentGame?.activePeriod?.activeSegment])

  const visitedStoryElements =
    playerResult?.playerResult?.player?.visitedStoryElementIds ??
    EMPTY_VISITED_STORY_ELEMENT_IDS

  useEffect(() => {
    setUnseenStoryElements(
      activeStoryElements.filter(
        (elem) => !visitedStoryElements.includes(elem.id)
      )
    )
  }, [activeStoryElements, visitedStoryElements])

  const content: string = (() => {
    if (unseenStoryElements.length === 0) return ''

    const firstElement = unseenStoryElements[0]
    switch (firstElement?.type) {
      case 'GENERIC':
        return firstElement.content ?? ''
      case 'ROLE_BASED':
        return firstElement.contentRole?.[playerRole ?? ''] ?? ''
      default:
        return ''
    }
  })()

  return (
    <Modal
      className={{ content: 'max-w-4xl overflow-y-auto' }}
      open={unseenStoryElements.length > 0}
      onClose={() => {
        setUnseenStoryElements((elem) => elem.slice(1))
      }}
      onPrimaryAction={() => {
        const elementId = unseenStoryElements[0]?.id
        if (!elementId) return

        markStoryElement.mutate({
          elementId,
        })
      }}
      primaryLabel="Continue"
      title={unseenStoryElements[0]?.title}
    >
      <div>
        <Progress
          max={activeStoryElements?.length}
          value={activeStoryElements?.length - unseenStoryElements?.length + 1}
          formatter={(value) => String(value)}
        />
      </div>

      <div className="prose prose-img:max-w-xs prose-img:rounded mt-4 max-w-none">
        <Markdown
          components={{
            img: ({ node, ...props }) => {
              return (
                <Image
                  {...props}
                  width={250}
                  height={250}
                  alt="Visual representation of the story element"
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
