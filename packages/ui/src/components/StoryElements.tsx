import { Modal, Progress } from '@uzh-bf/design-system'
import { sortBy } from 'ramda'
import { useMemo, useState } from 'react'
import Markdown from 'react-markdown'

export type StoryElementType = 'GENERIC' | 'ROLE_BASED'

export interface StoryElementData {
  id: string
  title: string
  type: StoryElementType
  content?: string | null
  contentRole?: Record<string, string> | null
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
  const [dismissedElementIds, setDismissedElementIds] = useState<Set<string>>(
    () => new Set()
  )

  const sortedElements = useMemo(() => {
    return sortBy((elem) => elem.title, activeStoryElements || [])
  }, [activeStoryElements])

  const unseenStoryElements = useMemo(() => {
    if (sortedElements.length === 0) return []
    return sortedElements.filter(
      (elem) =>
        !visitedStoryElementIds?.includes(elem.id) &&
        !dismissedElementIds.has(elem.id)
    )
  }, [dismissedElementIds, sortedElements, visitedStoryElementIds])

  const visibleElements = unseenStoryElements

  const content: string = useMemo(() => {
    if (visibleElements.length === 0) return ''

    const firstElement = visibleElements[0]
    switch (firstElement?.type) {
      case 'GENERIC':
        return firstElement.content ?? ''
      case 'ROLE_BASED':
        return playerRole && firstElement.contentRole
          ? firstElement.contentRole[playerRole] ?? ''
          : ''
      default:
        return ''
    }
  }, [visibleElements, playerRole])

  const dismissElement = (elementId: string) => {
    setDismissedElementIds((current) => {
      const next = new Set(current)
      next.add(elementId)
      return next
    })
  }

  const handleClose = () => {
    const visibleElement = visibleElements[0]
    if (visibleElement) dismissElement(visibleElement.id)
  }

  const handlePrimaryAction = async () => {
    const visibleElement = visibleElements[0]
    if (!visibleElement) return

    await onMarkElementVisited(visibleElement.id)
    dismissElement(visibleElement.id)
  }

  return (
    <Modal
      className={{ content: 'max-w-4xl overflow-y-auto' }}
      open={visibleElements.length > 0}
      onClose={handleClose}
      onPrimaryAction={handlePrimaryAction}
      primaryLabel="Continue"
      title={visibleElements[0]?.title}
    >
      <div>
        <Progress
          max={sortedElements.length}
          value={Math.min(
            sortedElements.length,
            sortedElements.length - unseenStoryElements.length + 1
          )}
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
