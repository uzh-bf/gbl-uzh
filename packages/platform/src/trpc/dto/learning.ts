import { LearningElementState } from '../../types.js'

const LEARNING_ELEMENT_STATES = new Set<string>(
  Object.values(LearningElementState)
)

// Runtime guard: the source column is a plain string, so an unexpected value
// must fall back instead of leaking through a type assertion.
function toLearningElementState(
  value: string | null | undefined
): LearningElementState {
  return value && LEARNING_ELEMENT_STATES.has(value)
    ? (value as LearningElementState)
    : LearningElementState.NEW
}

export interface LearningElementOptionDto {
  id?: string | number
  content: string
}

export interface LearningElementListDto {
  id: string
  title: string
  question: string
  reward: unknown
  motivation: string | null
  feedback: string | null
}

export interface LearningElementStateDto {
  id: string
  element: LearningElementListDto & {
    options?: LearningElementOptionDto[]
  }
  state: LearningElementState
  solution: string | null
}

export interface LearningElementAttemptDto {
  id: string
  pointsAchieved: number
  pointsMax: number
  element?: {
    id?: string
    feedback?: string | null
  }
  player?: {
    id: string
    completedLearningElementIds: string[]
  }
}

function toLearningElementOptionDto(option: unknown): LearningElementOptionDto | null {
  if (!option || typeof option !== 'object') return null

  const candidate = option as {
    id?: string | number
    content?: unknown
  }

  if (typeof candidate.content !== 'string' || candidate.content.length === 0) return null

  return {
    id: candidate.id,
    content: candidate.content,
  }
}

export function toLearningElementListDto(
  element: {
    id: string
    title: string
    question: string
    reward?: unknown
    motivation?: string | null
    feedback?: string | null
  } | null
): LearningElementListDto | null {
  if (!element) return null

  return {
    id: element.id,
    title: element.title,
    question: element.question,
    reward: element.reward,
    motivation: element.motivation ?? null,
    feedback: element.feedback ?? null,
  }
}

export function toLearningElementStateDto(
  state: {
    id?: string
    element?: {
      id?: string
      title?: string
      question?: string
      reward?: unknown
      motivation?: string | null
      feedback?: string | null
      options?: unknown
    } | null
    state?: string | null
    solution?: string | null
  } | null
): LearningElementStateDto | null {
  if (!state?.id) return null

  return {
    id: state.id,
    element: {
      id: state.element?.id ?? '',
      title: state.element?.title ?? '',
      question: state.element?.question ?? '',
      reward: state.element?.reward ?? null,
      motivation: state.element?.motivation ?? null,
      feedback: state.element?.feedback ?? null,
      options: Array.isArray(state.element?.options)
        ? state.element.options
            .map((option) => toLearningElementOptionDto(option))
            .filter(
              (option): option is LearningElementOptionDto => option !== null
            )
        : undefined,
    },
    state: toLearningElementState(state.state),
    solution: state.solution ?? null,
  }
}

export function toLearningElementAttemptDto(
  attempt:
    | {
        id?: string
        pointsAchieved?: number
        pointsMax?: number
        element?: { id?: string; feedback?: string | null }
        player?: { id?: string; completedLearningElementIds?: string[] }
      }
    | null
): LearningElementAttemptDto | null {
  if (!attempt?.id) return null

  return {
    id: attempt.id,
    pointsAchieved: attempt.pointsAchieved ?? 0,
    pointsMax: attempt.pointsMax ?? 0,
    element: attempt.element
      ? {
          id: attempt.element.id,
          feedback: attempt.element.feedback ?? null,
        }
      : undefined,
    player: attempt.player
      ? {
          id: attempt.player.id ?? '',
          completedLearningElementIds:
            attempt.player.completedLearningElementIds ?? [],
        }
      : undefined,
  }
}
