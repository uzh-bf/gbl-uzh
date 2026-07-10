import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, type DocumentNode, type TypedDocumentNode } from '@apollo/client'

export type LearningState = 'ATTEMPTED' | 'SOLVED' | null

interface LearningElementQueryData {
  learningElement?: {
    id?: string | null
    state?: string | null
    solution?: string | null
  } | null
}

interface LearningElementQueryVariables {
  id: string
}

interface AttemptLearningElementData {
  attemptLearningElement?: {
    pointsAchieved?: number | null
    pointsMax?: number | null
  } | null
}

interface AttemptLearningElementVariables {
  elementId: string
  selection: string
}

interface LearningActivityListItem {
  id: string
  title: string
}

function compareLearningTitles(
  left: LearningActivityListItem,
  right: LearningActivityListItem
) {
  return left.title < right.title ? -1 : left.title > right.title ? 1 : 0
}

export interface UseLearningActivitiesProps<
  TLearningElementData extends LearningElementQueryData,
> {
  learningElementDocument: TypedDocumentNode<
    TLearningElementData,
    LearningElementQueryVariables
  >
  attemptLearningElementDocument: TypedDocumentNode<
    AttemptLearningElementData,
    AttemptLearningElementVariables
  >
  resultDocument: DocumentNode
  completedLearningElementIds: readonly string[]
  activeSegmentLearningElements: readonly LearningActivityListItem[]
  allPeriods: readonly {
    segments?: readonly {
      learningElements?: readonly LearningActivityListItem[]
    }[]
  }[]
  toast: (options: { title: string; description: string }) => void
}

function normalizeLearningState(state: string | null | undefined): LearningState {
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

export function useLearningActivities<
  TLearningElementData extends LearningElementQueryData,
>({
  learningElementDocument,
  attemptLearningElementDocument,
  resultDocument,
  completedLearningElementIds,
  activeSegmentLearningElements,
  allPeriods,
  toast,
}: UseLearningActivitiesProps<TLearningElementData>) {
  const [activeLearningId, setActiveLearningId] = useState<string | null>(null)
  const [learningElementState, setLearningElementState] = useState<LearningState>(null)
  const [activeLearningOptions, setActiveLearningOptions] = useState<number[]>([])

  const { data: learningElementData, loading: learningElementLoading } = useQuery<
    TLearningElementData,
    LearningElementQueryVariables
  >(learningElementDocument, {
    variables: { id: activeLearningId ?? '' },
    skip: !activeLearningId,
  })

  useEffect(() => {
    const learningElement = learningElementData?.learningElement
    const isActiveLearningElement = learningElement?.id === activeLearningId
    setLearningElementState(
      normalizeLearningState(isActiveLearningElement ? learningElement.state : null)
    )
    setActiveLearningOptions(
      parseLearningOptions(isActiveLearningElement ? learningElement.solution : null)
    )
  }, [learningElementData, activeLearningId])

  const [attemptLearningElement, { loading: attemptingLearning }] = useMutation(
    attemptLearningElementDocument,
    {
      refetchQueries: [resultDocument, learningElementDocument],
    }
  )

  const handleAttemptLearning = async () => {
    if (!activeLearningId) return
    try {
      const result = await attemptLearningElement({
        variables: {
          elementId: activeLearningId,
          selection: JSON.stringify(activeLearningOptions),
        },
      })
      const resData = result.data?.attemptLearningElement
      if (resData) {
        if (
          typeof resData.pointsAchieved === 'number' &&
          typeof resData.pointsMax === 'number' &&
          resData.pointsAchieved === resData.pointsMax
        ) {
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
        (period.segments ?? []).flatMap((segment) => segment.learningElements ?? [])
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
      activeSegmentLearningElements.filter(
        (element) => !completedLearningElementIds.includes(element.id)
      ).sort(compareLearningTitles),
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
    attemptingLearning,
    handleAttemptLearning,
    completedLearningElements,
    openLearningElements,
  }
}
