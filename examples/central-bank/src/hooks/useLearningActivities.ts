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

const compareTitles = (
  left: LearningActivityListItem,
  right: LearningActivityListItem
) => (left.title < right.title ? -1 : left.title > right.title ? 1 : 0)

function normalizeState(state: string | null | undefined): LearningState {
  return state === 'SOLVED' || state === 'ATTEMPTED' ? state : null
}

function parseOptions(solution: string | null | undefined): number[] {
  if (!solution) return []
  try {
    const parsed: unknown = JSON.parse(solution)
    return Array.isArray(parsed) && parsed.every(Number.isInteger) ? parsed : []
  } catch {
    return []
  }
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

  const { data: rawData, isLoading: learningElementLoading } =
    trpc.learning.byId.useQuery(
      { id: activeLearningId ?? '' },
      { enabled: Boolean(activeLearningId) }
    )

  useEffect(() => {
    const isActive = rawData?.id === activeLearningId
    setLearningElementState((current) => {
      const next = normalizeState(isActive ? rawData?.state : null)
      return current === 'ATTEMPTED' && next === null ? current : next
    })
    setActiveLearningOptions(parseOptions(isActive ? rawData?.solution : null))
  }, [rawData, activeLearningId])

  const learningElementData = useMemo(() => {
    if (!rawData) return undefined
    return {
      ...rawData,
      element: {
        ...rawData.element,
        reward:
          typeof rawData.element.reward === 'number'
            ? rawData.element.reward
            : null,
        options: rawData.element.options ?? [],
      },
    }
  }, [rawData])

  const attempt = trpc.learning.attempt.useMutation()

  const handleAttemptLearning = async () => {
    const elementId = activeLearningId
    if (!elementId) return
    try {
      const result = await attempt.mutateAsync({
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
      .sort(compareTitles)
  }, [allPeriods, completedLearningElementIds])

  const openLearningElements = useMemo(
    () =>
      activeSegmentLearningElements
        .filter((element) => !completedLearningElementIds.includes(element.id))
        .sort(compareTitles),
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
    attemptingLearning: attempt.isPending,
    handleAttemptLearning,
    completedLearningElements,
    openLearningElements,
  }
}
