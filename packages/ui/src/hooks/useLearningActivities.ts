import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, type DocumentNode, type TypedDocumentNode } from '@apollo/client'

export type LearningState = 'UNOPENED' | 'OPENED' | 'ATTEMPTED' | 'SOLVED' | null

export interface UseLearningActivitiesProps {
  learningElementDocument: DocumentNode | TypedDocumentNode<any, any>
  attemptLearningElementDocument: DocumentNode | TypedDocumentNode<any, any>
  resultDocument: DocumentNode | TypedDocumentNode<any, any>
  completedLearningElementIds: string[]
  activeSegmentLearningElements: Array<{ id: string; reward: number; isOptional: boolean; title?: string }>
  allPeriods: Array<{
    segments?: Array<{
      learningElements?: Array<{ id: string }>
    }>
  }>
  toast: (options: { title: string; description: string }) => void
}

export function useLearningActivities({
  learningElementDocument,
  attemptLearningElementDocument,
  resultDocument,
  completedLearningElementIds,
  activeSegmentLearningElements,
  allPeriods,
  toast,
}: UseLearningActivitiesProps) {
  const [activeLearningId, setActiveLearningId] = useState<string | null>(null)
  const [learningElementState, setLearningElementState] = useState<LearningState>(null)
  const [activeLearningOptions, setActiveLearningOptions] = useState<number[]>([])

  const { data: learningElementData, loading: learningElementLoading } = useQuery(
    learningElementDocument,
    {
      variables: { id: activeLearningId ?? '' },
      skip: !activeLearningId,
    }
  )

  useEffect(() => {
    if (learningElementData?.learningElement) {
      setLearningElementState(learningElementData.learningElement.state as LearningState)
      try {
        if (learningElementData.learningElement.solution) {
          setActiveLearningOptions(JSON.parse(learningElementData.learningElement.solution))
        } else {
          setActiveLearningOptions([])
        }
      } catch {
        setActiveLearningOptions([])
      }
    } else {
      setLearningElementState(null)
      setActiveLearningOptions([])
    }
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
        if (resData.pointsAchieved === resData.pointsMax) {
          setLearningElementState('SOLVED')
        } else {
          setLearningElementState('ATTEMPTED')
          toast({
            title: 'Wrong answer',
            description: 'Try again!',
          })
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const completedLearningElements = useMemo(() => {
    const seen = new Set<string>()
    return allPeriods
      .flatMap((period: any) =>
        (period.segments || []).flatMap((segment: any) => segment.learningElements || [])
      )
      .filter((elem: any) => completedLearningElementIds.includes(elem.id))
      .filter((elem: any) => {
        if (seen.has(elem.id)) return false
        seen.add(elem.id)
        return true
      })
  }, [allPeriods, completedLearningElementIds])

  const openLearningElements = useMemo(
    () => (activeSegmentLearningElements || []).filter(
      (elem: any) => !completedLearningElementIds.includes(elem.id)
    ),
    [activeSegmentLearningElements, completedLearningElementIds]
  )

  return {
    activeLearningId,
    setActiveLearningId,
    learningElementState,
    setLearningElementState,
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
