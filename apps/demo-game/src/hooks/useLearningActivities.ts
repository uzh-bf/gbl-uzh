import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type SetStateAction,
} from 'react'
import { trpc } from '~/lib/trpc'

export type LearningState = 'ATTEMPTED' | 'SOLVED' | null

type LearningDraft = {
  options?: number[]
  state?: LearningState
  error?: string
}

interface LearningActivityListItem {
  id: string
  title: string
  reward?: unknown
}

function compareLearningTitles(
  left: LearningActivityListItem,
  right: LearningActivityListItem
) {
  return left.title < right.title ? -1 : left.title > right.title ? 1 : 0
}

export interface UseLearningActivitiesProps {
  completedLearningElementIds: readonly string[]
  activeSegmentLearningElements: readonly LearningActivityListItem[]
  allPeriods: readonly {
    segments?: readonly {
      learningElements?: readonly LearningActivityListItem[]
    }[]
  }[]
  preserveDrafts?: boolean
  toast: (options: { title: string; description: string }) => void
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

export function useLearningActivities({
  completedLearningElementIds,
  activeSegmentLearningElements,
  allPeriods,
  preserveDrafts = false,
  toast,
}: UseLearningActivitiesProps) {
  const utils = trpc.useUtils()
  // Query data owns persisted progress; this map contains only local edits
  // and attempt feedback. No effect is needed to copy query data into state.
  const [drafts, setDrafts] = useState<Record<string, LearningDraft>>({})
  const [selection, setSelection] = useState<{ id: string | null }>({
    id: null,
  })
  const currentSelection = useRef(selection)
  const inFlight = useRef(false)
  const activeLearningId = selection.id

  const updateDraft = (id: string, change: Partial<LearningDraft>) => {
    setDrafts((previous) => ({
      ...previous,
      [id]: { ...previous[id], ...change },
    }))
  }

  const setActiveLearningId = useCallback(
    (value: SetStateAction<string | null>) => {
      const previousId = currentSelection.current.id
      const id = typeof value === 'function' ? value(previousId) : value
      if (id === previousId) return
      const next = { id }
      currentSelection.current = next
      setSelection(next)
      setDrafts((previous) => {
        const nextDrafts = { ...previous }
        if (!preserveDrafts && previousId) delete nextDrafts[previousId]
        if (id && nextDrafts[id]?.error) {
          nextDrafts[id] = { ...nextDrafts[id], error: undefined }
        }
        return nextDrafts
      })
    },
    [preserveDrafts]
  )

  const {
    data,
    isLoading: learningElementLoading,
    error: learningElementError,
    refetch: retryLearningElement,
  } = trpc.learning.byId.useQuery(
    { id: activeLearningId ?? '' },
    { enabled: Boolean(activeLearningId) }
  )
  // `learning.byId` returns the queried element's id as the top-level `id`;
  // ignore data that belongs to a previously selected element.
  const learningElementData = data?.id === activeLearningId ? data : undefined
  const element = learningElementData
  const serverState = normalizeLearningState(element?.state)
  const draft = activeLearningId ? drafts[activeLearningId] : undefined
  const learningElementState =
    serverState === 'SOLVED' ? serverState : (draft?.state ?? serverState)
  const activeLearningOptions =
    serverState === 'SOLVED'
      ? parseLearningOptions(element?.solution)
      : (draft?.options ?? parseLearningOptions(element?.solution))
  const learningAttemptError = draft?.error ?? null

  const setActiveLearningOptions = (value: SetStateAction<number[]>) => {
    const id = activeLearningId
    if (!id || learningElementState === 'SOLVED') return
    setDrafts((previous) => ({
      ...previous,
      [id]: {
        ...previous[id],
        options:
          typeof value === 'function'
            ? value(previous[id]?.options ?? activeLearningOptions)
            : value,
        error: undefined,
      },
    }))
  }

  const attemptLearningElement = trpc.learning.attempt.useMutation()
  const attemptingLearning = attemptLearningElement.isPending

  const handleAttemptLearning = async () => {
    const requestSelection = currentSelection.current
    const id = requestSelection.id
    if (
      !id ||
      inFlight.current ||
      !activeLearningOptions.length ||
      learningElementState === 'SOLVED'
    )
      return
    inFlight.current = true
    updateDraft(id, { error: undefined })
    try {
      const attempt = await attemptLearningElement.mutateAsync({
        elementId: id,
        selection: activeLearningOptions,
      })
      // Refresh the submitted activity even if another one is now open. A
      // failed refresh must not be reported as a failed attempt.
      void Promise.all([
        utils.learning.byId.invalidate({ id }),
        utils.play.result.invalidate(),
        utils.play.self.invalidate(),
      ]).catch(() => {})
      if (
        !attempt ||
        typeof attempt.pointsAchieved !== 'number' ||
        typeof attempt.pointsMax !== 'number'
      ) {
        throw new Error('No attempt result returned')
      }
      const state =
        attempt.pointsAchieved === attempt.pointsMax ? 'SOLVED' : 'ATTEMPTED'
      // Completion belongs to this activity even after switching away. Only
      // transient feedback depends on the original selection still being open.
      if (state === 'SOLVED') {
        updateDraft(id, { state, options: activeLearningOptions })
      } else if (currentSelection.current === requestSelection) {
        updateDraft(id, { state })
        toast({ title: 'Wrong answer', description: 'Try again!' })
      }
    } catch {
      if (currentSelection.current === requestSelection) {
        updateDraft(id, {
          error: 'Could not submit your answer. Please try again.',
        })
      }
    } finally {
      inFlight.current = false
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
    learningElementError,
    learningAttemptError,
    retryLearningElement,
    attemptingLearning,
    handleAttemptLearning,
    completedLearningElements,
    openLearningElements,
  }
}
