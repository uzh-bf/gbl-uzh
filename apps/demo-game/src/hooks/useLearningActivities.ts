import { useEffect, useMemo, useState } from 'react'
import { trpc } from '~/lib/trpc'

export type LearningState = 'ATTEMPTED' | 'SOLVED' | null

interface LearningActivityListItem {
  id: string
  title: string
}

export interface UseLearningActivitiesProps {
  completedLearningElementIds: readonly string[]
  activeSegmentLearningElements: readonly LearningActivityListItem[]
  allPeriods: readonly {
    segments?: readonly {
      learningElements?: readonly LearningActivityListItem[]
    }[]
  }[]
  toast: (options: {
    title: string
    description: string
    variant?: 'default' | 'destructive'
  }) => void
}

function compareLearningTitles(
  left: LearningActivityListItem,
  right: LearningActivityListItem
) {
  return left.title < right.title ? -1 : left.title > right.title ? 1 : 0
}

function normalizeLearningState(
  state: string | null | undefined
): LearningState {
  return state === 'SOLVED' || state === 'ATTEMPTED' ? state : null
}

function parseLearningOptions(solution: string | null | undefined): number[] {
  if (!solution) return []

  try {
    const parsed: unknown = JSON.parse(solution)
    return Array.isArray(parsed) && parsed.every(Number.isInteger) ? parsed : []
  } catch {
    return []
  }
}

// The DTO exposes `reward` as an untyped JSON blob and makes `options`
// optional; the modal expects a numeric-or-null reward and a concrete
// (possibly empty) options array, so narrow both here rather than in
// GameLayout's markup.
function getReward(value: unknown): number | null {
  return typeof value === 'number' ? value : null
}

// tRPC's `learning.byId` returns the queried element's own id as the DTO's
// top-level `id` (see PlayService.getLearningElement), so comparing it
// against `activeLearningId` mirrors the old Apollo hook's
// `learningElement?.id === activeLearningId` check.
export function useLearningActivities({
  completedLearningElementIds,
  activeSegmentLearningElements,
  allPeriods,
  toast,
}: UseLearningActivitiesProps) {
  const utils = trpc.useUtils()

  const [activeLearningId, setActiveLearningId] = useState<string | null>(null)
  const [learningElementState, setLearningElementState] =
    useState<LearningState>(null)
  const [activeLearningOptions, setActiveLearningOptions] = useState<number[]>(
    []
  )

  const { data: rawLearningElementData, isLoading: learningElementLoading } =
    trpc.learning.byId.useQuery(
      { id: activeLearningId ?? '' },
      { enabled: Boolean(activeLearningId) }
    )

  useEffect(() => {
    const isActiveLearningElement =
      rawLearningElementData?.id === activeLearningId

    setLearningElementState((currentState) => {
      const nextState = normalizeLearningState(
        isActiveLearningElement ? rawLearningElementData?.state : null
      )
      // Sticky ATTEMPTED: once a player has attempted and gotten a wrong
      // answer, a stale/refetched NEW state should not flip the UI back to
      // unattempted.
      if (currentState === 'ATTEMPTED' && nextState === null) {
        return currentState
      }
      return nextState
    })

    setActiveLearningOptions(
      parseLearningOptions(
        isActiveLearningElement ? rawLearningElementData?.solution : null
      )
    )
  }, [rawLearningElementData, activeLearningId])

  const learningElementData = useMemo(() => {
    if (!rawLearningElementData) return undefined

    const element = rawLearningElementData.element

    return {
      ...rawLearningElementData,
      element: {
        ...element,
        reward: getReward(element.reward),
        options: element.options ?? [],
      },
    }
  }, [rawLearningElementData])

  const attemptLearningElement = trpc.learning.attempt.useMutation({
    async onSuccess() {
      await Promise.all([
        activeLearningId
          ? utils.learning.byId.invalidate({ id: activeLearningId })
          : Promise.resolve(),
        utils.play.result.invalidate(),
        utils.play.self.invalidate(),
      ])
    },
    onError: (err) => {
      toast({
        title: 'Could not submit your answer',
        description: err.message,
        variant: 'destructive',
      })
    },
  })

  const handleAttemptLearning = async () => {
    if (!activeLearningId) return

    try {
      const result = await attemptLearningElement.mutateAsync({
        elementId: activeLearningId,
        selection: activeLearningOptions,
      })

      if (result) {
        if (result.pointsAchieved === result.pointsMax) {
          setLearningElementState('SOLVED')
        } else {
          setLearningElementState('ATTEMPTED')
          toast({
            title: 'Wrong answer',
            description: 'Try again!',
          })
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const completedLearningElements = useMemo(() => {
    const seen = new Set<string>()
    return allPeriods
      .flatMap((period) =>
        (period.segments ?? []).flatMap(
          (segment) => segment.learningElements ?? []
        )
      )
      .filter((element) => completedLearningElementIds.includes(element.id))
      .filter((element) => {
        if (seen.has(element.id)) return false
        seen.add(element.id)
        return true
      })
      .sort(compareLearningTitles)
  }, [allPeriods, completedLearningElementIds])

  const openLearningElements = useMemo(
    () =>
      activeSegmentLearningElements
        .filter((element) => !completedLearningElementIds.includes(element.id))
        .sort(compareLearningTitles),
    [activeSegmentLearningElements, completedLearningElementIds]
  )

  return {
    activeLearningId,
    setActiveLearningId,
    learningElementState,
    activeLearningOptions,
    setActiveLearningOptions,
    learningElementData,
    learningElementLoading,
    attemptingLearning: attemptLearningElement.isPending,
    handleAttemptLearning,
    completedLearningElements,
    openLearningElements,
  }
}
