import { Modal, Progress } from '@uzh-bf/design-system'
import { sortBy } from 'ramda'
import { useEffect, useMemo, useState } from 'react'
import Markdown from 'react-markdown'

export interface StoryElementData {
  id: string
  title: string
  type: string
  content: string
  contentRole?: Record<string, string>
}

interface StoryElementsProps {
  activeStoryElements: StoryElementData[]
  visitedStoryElementIds: string[]
  playerRole?: string
  onMarkElementVisited: (elementId: string) => Promise<void>
}

function StoryElements({
  activeStoryElements,
  visitedStoryElementIds,
  playerRole,
  onMarkElementVisited,
}: StoryElementsProps) {
  const [unseenStoryElements, setUnseenStoryElements] = useState<StoryElementData[]>([])

  const sortedElements = useMemo(() => {
    return sortBy((elem) => elem.title, activeStoryElements || [])
  }, [activeStoryElements])

  useEffect(() => {
    if (sortedElements.length > 0) {
      const unseen = sortedElements.filter(
        (elem) => !visitedStoryElementIds?.includes(elem.id)
      )
      setUnseenStoryElements(unseen)
    }
  }, [sortedElements, visitedStoryElementIds])

  const content: string = (() => {
    if (unseenStoryElements.length === 0) return ''

    const firstElement = unseenStoryElements[0]
    switch (firstElement?.type) {
      case 'GENERIC':
        return firstElement.content
      case 'ROLE_BASED':
        return playerRole && firstElement.contentRole
          ? firstElement.contentRole[playerRole] ?? ''
          : ''
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
      onPrimaryAction={async () => {
        if (unseenStoryElements.length > 0) {
          await onMarkElementVisited(unseenStoryElements[0].id)
        }
      }}
      primaryLabel="Continue"
      title={unseenStoryElements[0]?.title}
    >
      <div>
        <Progress
          max={sortedElements.length}
          value={sortedElements.length - unseenStoryElements.length + 1}
          formatter={(value) => String(value)}
        />
      </div>

      <div className="prose prose-img:max-w-xs prose-img:rounded prose-img:mt-4 prose-img:rounded-lg mt-4 max-w-none">
        <Markdown>
          {content}
        </Markdown>
      </div>
    </Modal>
  )
}

export { StoryElements }
