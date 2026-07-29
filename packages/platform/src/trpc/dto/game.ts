import * as DB from '@prisma/client'

export interface StoryElementRefDto {
  id: string
  title: string
}

export interface ActiveSegmentDto {
  id: number
  index: number
  countdownExpiresAt: Date | null
  countdownDurationMs: number | null
  facts: unknown
  learningElements?: StoryElementRefDto[]
  storyElements?: StoryElementRefDto[]
}

export interface PeriodDto {
  id: number
  index: number
  activeSegmentIx: number | null
  facts: unknown
  segmentCount?: number | null
  segments: ActiveSegmentDto[]
  activeSegment?: ActiveSegmentDto | null
}

export interface AdminPlayerDto {
  id: string
  isReady: boolean
  role: string | null
  number: number
  name: string
  facts: unknown
  experience: number
  experienceToNext: number
  token: string
}

export interface GameListItemDto {
  id: number
  status: DB.GameStatus
  name: string
  activePeriodIx: number
  activeSegmentIx: number | null
  facts: unknown
  playersCount: number
}

export interface AdminGameDto {
  id: number
  status: DB.GameStatus
  name: string
  version: number
  facts: unknown
  activePeriodIx: number
  activeSegmentIx: number | null
  players: AdminPlayerDto[]
  periods: PeriodDto[]
  activePeriod: PeriodDto | null
}

function asId(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number') {
    return `${value}`
  }

  return null
}

export function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value
  // Explicit missing-value check: `!value` would also drop epoch 0.
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'string' && typeof value !== 'number') return null

  const maybeDate = new Date(value)
  return Number.isNaN(maybeDate.getTime()) ? null : maybeDate
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  return null
}

function toStoryElementRef(
  element: unknown
): StoryElementRefDto | null {
  if (!element || typeof element !== 'object') return null

  const id = asId((element as { id?: unknown }).id)
  const title = (element as { title?: unknown }).title

  if (!id || typeof title !== 'string') {
    return null
  }

  return { id, title }
}

function toStoryElementRefs(elements: unknown): StoryElementRefDto[] | undefined {
  if (!Array.isArray(elements) || elements.length === 0) {
    return undefined
  }

  const refs = elements
    .map((item) => toStoryElementRef(item))
    .filter((item): item is StoryElementRefDto => item !== null)

  return refs.length > 0 ? refs : undefined
}

export function toActiveSegmentDto(
  segment:
    | {
        id?: unknown
        index?: unknown
        countdownExpiresAt?: unknown
        countdownDurationMs?: unknown
        facts?: unknown
        learningElements?: unknown
        storyElements?: unknown
      }
    | null
    | undefined
): ActiveSegmentDto | null {
  if (!segment || typeof segment !== 'object') {
    return null
  }

  const id = normalizeNumber(segment.id)
  if (id === null) return null

  return {
    id,
    index: normalizeNumber(segment.index) ?? 0,
    countdownExpiresAt: toDate(segment.countdownExpiresAt),
    countdownDurationMs: normalizeNumber(segment.countdownDurationMs),
    facts: segment.facts,
    learningElements: toStoryElementRefs(segment.learningElements),
    storyElements: toStoryElementRefs(segment.storyElements),
  }
}

export function toPeriodDto(
  period:
    | {
        id?: unknown
        index?: unknown
        activeSegmentIx?: unknown
        facts?: unknown
        segmentCount?: unknown
        segments?: unknown
        activeSegment?: unknown
      }
    | null
    | undefined
): PeriodDto | null {
  if (!period || typeof period !== 'object') return null

  const id = normalizeNumber(period.id)
  if (id === null) return null

  const segments = Array.isArray(period.segments)
    ? period.segments
        .map((item) => toActiveSegmentDto(item as any))
        .filter((item): item is ActiveSegmentDto => item !== null)
    : []

  return {
    id,
    index: normalizeNumber(period.index) ?? 0,
    activeSegmentIx:
      period.activeSegmentIx === null
        ? null
        : normalizeNumber(period.activeSegmentIx) ?? null,
    facts: period.facts,
    segmentCount:
      period.segmentCount === null ? null : normalizeNumber(period.segmentCount),
    segments,
    activeSegment: toActiveSegmentDto(period.activeSegment as any),
  }
}

function mapAdminPlayer(player: {
  id?: string
  isReady?: boolean
  role?: string | null
  number?: number
  name?: string
  facts?: unknown
  experience?: number
  experienceToNext?: number
  token?: string
}): AdminPlayerDto {
  return {
    id: player.id ?? '',
    isReady: Boolean(player.isReady),
    role: player.role ?? null,
    number: player.number ?? 0,
    name: player.name ?? '',
    facts: player.facts,
    experience: player.experience ?? 0,
    experienceToNext: player.experienceToNext ?? 0,
    token: player.token ?? '',
  }
}

export function toGameListItemDto(
  game: {
    id: number
    status: DB.GameStatus
    name: string
    activePeriodIx: number
    facts: unknown
    activeSegmentIx?: unknown
    activePeriod?: { activeSegmentIx?: number | null }
    _count?: { players?: number }
  } | null
): GameListItemDto | null {
  if (!game) return null

  return {
    id: game.id,
    status: game.status,
    name: game.name,
    activePeriodIx: game.activePeriodIx,
    activeSegmentIx:
      normalizeNumber(game.activeSegmentIx) ??
      normalizeNumber(game.activePeriod?.activeSegmentIx) ??
      null,
    facts: game.facts,
    playersCount: game._count?.players ?? 0,
  }
}

export function toAdminGameDto(
  game:
    | {
        id: number
        status: DB.GameStatus
        name: string
        version: number
        facts: unknown
        activePeriodIx: number
        activeSegmentIx?: unknown
        activePeriod?: unknown
        periods?: unknown
        players?: unknown
      }
    | null
    | undefined
): AdminGameDto | null {
  if (!game || typeof game !== 'object') return null

  const periods = Array.isArray(game.periods)
    ? game.periods
        .map((period) => toPeriodDto(period as any))
        .filter((period): period is PeriodDto => period !== null)
    : []

  return {
    id: game.id,
    status: game.status,
    name: game.name,
    version: game.version,
    facts: game.facts,
    activePeriodIx: game.activePeriodIx,
    activeSegmentIx:
      game.activeSegmentIx === null
        ? null
        : normalizeNumber(game.activeSegmentIx) ??
          normalizeNumber((game.activePeriod as any)?.activeSegmentIx) ??
          null,
    players: Array.isArray(game.players)
      ? game.players
          .map((player) =>
            mapAdminPlayer(
              typeof player === 'object' && player !== null ? (player as any) : {}
            )
          )
      : [],
    periods,
    activePeriod: toPeriodDto(game.activePeriod as any),
  }
}
