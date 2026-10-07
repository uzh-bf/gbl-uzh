import { useEffect, useMemo, useRef, useState } from 'react'
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

function getReward(value: unknown): number | null {
  return typeof value === 'number' ? value : null
}

export function useLearningActivities({
  completedLearningElementIds,
  activeSegmentLearningElements,
  allPeriods,
  toast,
}: UseLearningActivitiesProps) {
  const utils = trpc.useUtils()

  const [activeLearningId, setActiveLearningId] = useState<string | null>(null)
  // Lets a pending attempt see whether its activity is still the open one.
  const activeLearningIdRef = useRef(activeLearningId)
  useEffect(() => {
    activeLearningIdRef.current = activeLearningId
  }, [activeLearningId])
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

  const attemptLearningElement = trpc.learning.attempt.useMutation()

  const handleAttemptLearning = async () => {
    const elementId = activeLearningId
    if (!elementId) return

    try {
      const result = await attemptLearningElement.mutateAsync({
        elementId,
        selection: activeLearningOptions,
      })
      // Refresh the submitted activity even if another one is open now. A
      // failed refresh is not a failed attempt.
      void Promise.all([
        utils.learning.byId.invalidate({ id: elementId }),
        utils.play.result.invalidate(),
        utils.play.self.invalidate(),
      ]).catch(() => {})
      // The player may have opened another activity while this one was pending.
      if (activeLearningIdRef.current !== elementId) return

      if (result?.pointsAchieved === result?.pointsMax) {
        setLearningElementState('SOLVED')
      } else if (result) {
        setLearningElementState('ATTEMPTED')
        toast({ title: 'Wrong answer', description: 'Try again!' })
      }
    } catch (error) {
      if (activeLearningIdRef.current !== elementId) return
      toast({
        title: 'Could not submit your answer',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      })
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
