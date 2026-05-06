import * as DB from '@prisma/client'

export interface ResultPeriodDto {
  id: number
  index: number
  facts?: unknown
  segmentCount?: number | null
}

export interface ResultSegmentDto {
  id: number
  index: number
  facts?: unknown
}

export interface ResultPlayerDto {
  id: string
  name: string
}

export interface ResultPlayerDetailedDto {
  id: string
  name: string
  role?: string | null
  facts?: unknown
  experience?: number
  experienceToNext?: number
  level?: {
    id: number
    index: number
  }
  completedLearningElementIds?: string[]
  visitedStoryElementIds?: string[]
}

export interface PlayerResultCoreDto {
  id: number
  type: DB.PlayerResultType
  facts: unknown
  period: {
    id: number
    index: number
    facts?: unknown
  }
  segment?: {
    id: number
    index: number
    facts?: unknown
  } | null
}

export interface PlayerTransactionDto {
  id: number
  periodIx: number
  segmentIx: number | null
  type: string
  facts?: unknown
}

export interface PlayerResultDto {
  currentGame: {
    id: number
    status: DB.GameStatus
    nextAutoContinueAt?: Date | null
    periods: ResultPeriodSummaryDto[]
    activePeriod?: ResultPeriodSummaryDto & {
      activeSegment?: {
        id: number
        index: number
        facts?: unknown
        countdownExpiresAt?: Date | null
        countdownDurationMs?: number | null
        learningElements?: { id: string; title: string }[]
        storyElements?: { id: string; title: string }[]
      } | null
    }
  }
  playerResult: PlayerResultCoreDto | null
  previousResults: PlayerResultCoreDto[]
  transactions: PlayerTransactionDto[]
}

export interface SpecificResultDto {
  id: number
  type: DB.PlayerResultType
  facts: unknown
  period: {
    id: number
    index: number
  }
  segment?: {
    id: number
    index: number
  } | null
  player: ResultPlayerDto
}

export interface PastResultDto extends Omit<SpecificResultDto, 'player'> {
  period: {
    id: number
    index: number
    facts: unknown
  }
  segment?: {
    id: number
    index: number
    facts: unknown
  } | null
  player: {
    id: string
    name: string
    role?: string | null
    facts?: unknown
    experience?: number
    experienceToNext?: number
    level?: {
      id: number
      index: number
    }
    completedLearningElementIds?: string[]
    visitedStoryElementIds?: string[]
  }
}

interface ResultPeriodSummaryDto {
  id: number
  index: number
  activeSegmentIx: number | null
  facts: unknown
  segmentCount?: number | null
}

interface ActiveSegmentSummaryDto {
  id: number
  index: number
  facts: unknown
  countdownExpiresAt?: Date | null
  countdownDurationMs?: number | null
  learningElements?: { id: string; title: string }[]
  storyElements?: { id: string; title: string }[]
}

function toResultPeriodSummaryDto(
  period: {
    id?: number
    index?: number
    activeSegmentIx?: number | null
    facts?: unknown
    segmentCount?: number | null
    segments?: unknown
  } | null
): ResultPeriodSummaryDto | null {
  if (!period?.id || typeof period.id !== 'number') return null

  return {
    id: period.id,
    index: period.index ?? 0,
    activeSegmentIx: period.activeSegmentIx ?? null,
    facts: period.facts,
    segmentCount: period.segmentCount ?? null,
  }
}

function toResultSegmentSummaryDto(
  segment: {
    id?: number
    index?: number
    facts?: unknown
    countdownExpiresAt?: Date | string | null
    countdownDurationMs?: number | null
    learningElements?: unknown
    storyElements?: unknown
  } | null
): ActiveSegmentSummaryDto | null {
  if (!segment?.id || typeof segment.id !== 'number') return null

  return {
    id: segment.id,
    index: segment.index ?? 0,
    facts: segment.facts,
    countdownExpiresAt: segment.countdownExpiresAt
      ? new Date(segment.countdownExpiresAt)
      : null,
    countdownDurationMs:
      typeof segment.countdownDurationMs === 'number'
        ? segment.countdownDurationMs
        : undefined,
    learningElements:
      Array.isArray(segment.learningElements)
        ? segment.learningElements
            .map((item: any) => {
              if (!item?.id || typeof item.title !== 'string') return null

              return { id: String(item.id), title: item.title }
            })
            .filter((item): item is { id: string; title: string } => item !== null)
        : undefined,
    storyElements:
      Array.isArray(segment.storyElements)
        ? segment.storyElements
            .map((item: any) => {
              if (!item?.id || typeof item.title !== 'string') return null

              return { id: String(item.id), title: item.title }
            })
            .filter((item): item is { id: string; title: string } => item !== null)
        : undefined,
  }
}

export function toPlayerResultCoreDto(
  source:
    | {
        id?: number
        type?: DB.PlayerResultType
        facts?: unknown
        period?: { id?: number; index?: number; facts?: unknown }
        segment?: { id?: number; index?: number; facts?: unknown } | null
      }
    | null
): PlayerResultCoreDto | null {
  if (!source?.id || !source?.type) return null

  if (!source.period?.id || typeof source.period.id !== 'number') return null

  return {
    id: source.id,
    type: source.type,
    facts: source.facts,
    period: {
      id: source.period.id,
      index: source.period.index ?? 0,
      facts: source.period.facts,
    },
    segment:
      source.segment?.id && typeof source.segment.id === 'number'
        ? {
            id: source.segment.id,
            index: source.segment.index ?? 0,
            facts: source.segment.facts,
          }
        : null,
  }
}

export function toPlayerTransactionDto(
  action:
    | {
        id?: number
        periodIx?: number
        segmentIx?: number | null
        type?: string
        facts?: unknown
      }
    | null
): PlayerTransactionDto | null {
  if (!action?.id || typeof action.id !== 'number') return null

  return {
    id: action.id,
    periodIx: action.periodIx ?? 0,
    segmentIx:
      action.segmentIx == null ? null : Number(action.segmentIx),
    type: action.type ?? '',
    facts: action.facts,
  }
}

export function toPlayerResultDto(
  source:
    | {
        currentGame?: {
          id?: number
          status?: DB.GameStatus
          nextAutoContinueAt?: Date | null
          periods?: unknown
          activePeriod?: {
            id?: number
            index?: number
            activeSegmentIx?: number | null
            facts?: unknown
            segmentCount?: number | null
            activeSegment?: unknown
          } | null
          activePeriodIx?: number
          activeSegmentIx?: number
        } | null
        playerResult?: any
        previousResults?: any
        transactions?: any
      }
    | null
    | undefined
): PlayerResultDto | null {
  if (!source?.currentGame?.id) return null

  const rawCurrentGame = source.currentGame
  const currentGameId = rawCurrentGame.id
  const currentGameStatus = rawCurrentGame.status
  if (typeof currentGameId !== 'number' || !currentGameStatus) {
    return null
  }

  const currentGamePeriods = toResultPeriodSummaryDto(
    rawCurrentGame.activePeriod as any
  )
  const periods = Array.isArray(rawCurrentGame.periods)
    ? rawCurrentGame.periods
        .map((period: any) => toResultPeriodSummaryDto(period))
        .filter((period): period is ResultPeriodSummaryDto => period !== null)
    : []

  return {
    currentGame: {
      id: currentGameId,
      status: currentGameStatus,
      nextAutoContinueAt: rawCurrentGame.nextAutoContinueAt,
      periods,
      activePeriod: currentGamePeriods
        ? {
            ...currentGamePeriods,
            activeSegment: toResultSegmentSummaryDto(
              (rawCurrentGame.activePeriod as any)?.activeSegment as any
            ),
          }
        : undefined,
    },
    playerResult: toPlayerResultCoreDto(source.playerResult) as
      | PlayerResultCoreDto
      | null,
    previousResults: Array.isArray(source.previousResults)
      ? source.previousResults
          .map((result: any) => toPlayerResultCoreDto(result))
          .filter((result): result is PlayerResultCoreDto => result !== null)
      : [],
    transactions: Array.isArray(source.transactions)
      ? source.transactions
          .map((action: any) => toPlayerTransactionDto(action))
          .filter((action): action is PlayerTransactionDto => action !== null)
      : [],
  }
}

export function toSpecificResultDto(
  source:
    | {
        id?: number
        type?: DB.PlayerResultType
        facts?: unknown
        period?: { id?: number; index?: number }
        segment?: { id?: number; index?: number } | null
        player?: { id?: string; name?: string }
      }
    | null
): SpecificResultDto | null {
  if (
    !source?.id ||
    !source?.type ||
    !source?.player?.id ||
    !source?.player?.name ||
    !source?.period?.id
  ) {
    return null
  }

  return {
    id: source.id,
    type: source.type,
    facts: source.facts,
    period: {
      id: source.period.id,
      index: source.period.index ?? 0,
    },
    segment: source.segment?.id
      ? {
          id: source.segment.id,
          index: source.segment.index ?? 0,
        }
      : null,
    player: {
      id: source.player.id,
      name: source.player.name,
    },
  }
}

export function toPastResultDto(
  source:
    | {
        id?: number
        type?: DB.PlayerResultType
        facts?: unknown
        period?: { id?: number; index?: number; facts?: unknown }
        segment?: { id?: number; index?: number; facts?: unknown } | null
        player?: {
          id?: string
          name?: string
          role?: string | null
          facts?: unknown
          experience?: number
          experienceToNext?: number
          level?: { id?: number; index?: number }
          completedLearningElementIds?: string[]
          visitedStoryElementIds?: string[]
        }
      }
    | null
): PastResultDto | null {
  if (!source?.id || !source?.type || !source?.player?.id || !source?.period?.id)
    return null

  return {
    id: source.id,
    type: source.type,
    facts: source.facts,
    period: {
      id: source.period.id,
      index: source.period.index ?? 0,
      facts: source.period.facts,
    },
    segment: source.segment?.id
      ? {
          id: source.segment.id,
          index: source.segment.index ?? 0,
          facts: source.segment.facts,
        }
      : null,
    player: {
      id: source.player.id,
      name: source.player.name ?? '',
      role: source.player.role ?? null,
      facts: source.player.facts,
      experience: source.player.experience,
      experienceToNext: source.player.experienceToNext,
      level:
        source.player.level?.id && source.player.level.index !== undefined
          ? {
              id: source.player.level.id,
              index: source.player.level.index,
            }
          : undefined,
      completedLearningElementIds: source.player.completedLearningElementIds,
      visitedStoryElementIds: source.player.visitedStoryElementIds,
    },
  }
}
