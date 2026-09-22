import { useMutation } from '@apollo/client'
import { useLearningActivities } from '@gbl-uzh/ui'
import { useEffect, useMemo, useState } from 'react'
import {
  AttemptLearningElementDocument,
  LearningElementDocument,
  MarkStoryElementDocument,
  ResultDocument,
  type ResultQuery,
} from '~/graphql/generated/ops'
import {
  sortStories,
  storyLibrary,
  type StoryEntry,
  type StorySequence,
} from '~/lib/team'
import { useToast } from '../ui/use-toast'
import LearningSheet from './LearningSheet'
import StorySheet from './StorySheet'
import TeamPanel from './TeamPanel'

type Reading = {
  sequence: StorySequence
  startIndex: number
  automatic: boolean
}

export default function TeamContent({
  data,
  active,
  expiresAt,
}: {
  data: ResultQuery
  active: boolean
  expiresAt: Date | null
}) {
  const game = data.result?.currentGame
  const self = data.self
  const segment = game?.activePeriod?.activeSegment
  const { toast } = useToast()
  const [markStory] = useMutation(MarkStoryElementDocument, {
    refetchQueries: [ResultDocument],
  })
  const visitedIds = self.visitedStoryElementIds
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(
    () => new Set()
  )
  const [reading, setReading] = useState<Reading | null>(null)
  const [openedIds, setOpenedIds] = useState<ReadonlySet<string>>(
    () => new Set()
  )
  const [openedAsNew, setOpenedAsNew] = useState(false)
  const storageKey = `gbl:learning-opened:${game.id}:${self.id}`
  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem(storageKey) ?? '[]'
      )
      if (Array.isArray(stored))
        setOpenedIds(
          new Set(stored.filter((id): id is string => typeof id === 'string'))
        )
    } catch {
      /* Browser storage is optional; the in-memory state remains usable. */
    }
  }, [storageKey])

  const learning = useLearningActivities({
    learningElementDocument: LearningElementDocument,
    attemptLearningElementDocument: AttemptLearningElementDocument,
    resultDocument: ResultDocument,
    completedLearningElementIds: self?.completedLearningElementIds ?? [],
    activeSegmentLearningElements: segment?.learningElements ?? [],
    allPeriods: game?.periods ?? [],
    preserveDrafts: true,
    toast,
  })
  const stories = useMemo(() => storyLibrary(data), [data])
  const automaticSequence = useMemo<StorySequence | null>(
    () =>
      segment
        ? {
            id: segment.id,
            year: 2026 + game.activePeriod.index,
            quarter: segment.index + 1,
            stories: sortStories(segment.storyElements),
          }
        : null,
    [segment, game.activePeriod]
  )
  const firstUnread =
    automaticSequence?.stories.findIndex(
      (story) => !visitedIds.includes(story.id)
    ) ?? -1
  const pendingAutomatic =
    automaticSequence &&
    !dismissed.has(automaticSequence.id) &&
    firstUnread >= 0
  const selectLearning = learning.setActiveLearningId
  useEffect(() => {
    if (!pendingAutomatic || reading?.sequence.id === automaticSequence.id)
      return
    selectLearning(null)
    setReading({
      sequence: automaticSequence,
      startIndex: firstUnread,
      automatic: true,
    })
  }, [
    pendingAutomatic,
    automaticSequence,
    firstUnread,
    reading?.sequence.id,
    selectLearning,
  ])

  const closeStories = () => {
    if (reading?.automatic)
      setDismissed((previous) => new Set([...previous, reading.sequence.id]))
    setReading(null)
  }
  const openLearning = (id: string) => {
    if (reading || pendingAutomatic) return
    setOpenedAsNew(!openedIds.has(id))
    const next = new Set([...openedIds, id])
    setOpenedIds(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify([...next]))
    } catch {
      /* Keep the in-memory viewed state. */
    }
    learning.setActiveLearningId(id)
  }
  const openStory = (entry: StoryEntry) => {
    learning.setActiveLearningId(null)
    setReading({
      sequence: entry.sequence,
      startIndex: entry.index,
      automatic: false,
    })
  }
  const activeActivity = [
    ...learning.openLearningElements,
    ...learning.completedLearningElements,
  ].find((activity) => activity.id === learning.activeLearningId)
  return (
    <>
      <div hidden={!active} className={!active ? 'hidden' : undefined}>
        <TeamPanel
          data={data}
          stories={stories}
          openActivities={learning.openLearningElements}
          completedActivities={learning.completedLearningElements}
          openedIds={openedIds}
          onLearning={openLearning}
          onStory={openStory}
        />
      </div>
      {reading && (
        <StorySheet
          key={`${reading.sequence.id}:${reading.startIndex}:${reading.automatic}`}
          {...reading}
          visitedIds={visitedIds}
          role={self.role}
          onClose={closeStories}
          onMark={async (id) => {
            const result = await markStory({ variables: { elementId: id } })
            if (!result.data?.markStoryElement)
              throw new Error('Story progress was not saved')
          }}
        />
      )}
      {!reading && !pendingAutomatic && learning.activeLearningId && (
        <LearningSheet
          key={learning.activeLearningId}
          title={activeActivity?.title ?? 'Learning activity'}
          element={learning.learningElementData?.learningElement?.element}
          isNew={openedAsNew}
          state={learning.learningElementState}
          selection={learning.activeLearningOptions}
          onSelect={learning.setActiveLearningOptions}
          onSubmit={learning.handleAttemptLearning}
          onClose={() => learning.setActiveLearningId(null)}
          loading={learning.learningElementLoading}
          saving={learning.attemptingLearning}
          queryError={!!learning.learningElementError}
          attemptError={learning.learningAttemptError}
          onRetry={() => {
            void learning.retryLearningElement().catch(() => {})
          }}
          expiresAt={expiresAt}
        />
      )}
    </>
  )
}
