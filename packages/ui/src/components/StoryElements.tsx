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
  // Track dismissed elements by id (not a positional offset): the unseen list is
  // derived from server props and shrinks when an element is marked visited, so a
  // positional counter would double-advance and silently skip elements.
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set())

  const sortedElements = useMemo(() => {
    return sortBy((elem) => elem.title, activeStoryElements || [])
  }, [activeStoryElements])

  const unseenStoryElements = useMemo(() => {
    if (sortedElements.length === 0) return []
    return sortedElements.filter(
      (elem) => !visitedStoryElementIds?.includes(elem.id)
    )
  }, [sortedElements, visitedStoryElementIds])

  const visibleElements = useMemo(
    () => unseenStoryElements.filter((elem) => !dismissedIds.has(elem.id)),
    [unseenStoryElements, dismissedIds]
  )

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

  const dismissCurrent = (id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const handleClose = () => {
    const current = visibleElements[0]
    if (current) dismissCurrent(current.id)
  }

  const handlePrimaryAction = async () => {
    const current = visibleElements[0]
    if (!current) return
    await onMarkElementVisited(current.id)
    // Marking visited removes the element from unseenStoryElements after the
    // refetch; dismissing by id as well advances immediately without waiting and
    // is idempotent (filtering the same id twice cannot skip a different element).
    dismissCurrent(current.id)
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
          value={sortedElements.length - visibleElements.length + 1}
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
