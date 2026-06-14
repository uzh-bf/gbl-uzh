import * as DB from '@prisma/client'

/**
 * Typed transition table for the game lifecycle state machine.
 *
 * The lifecycle is implemented today as imperative `switch (game.status)`
 * blocks inside `GameService.activateNextPeriod` and
 * `GameService.activateNextSegment`. This module makes that implicit machine
 * explicit: a single, declarative source of truth for
 *
 *   - which admin event is valid in which state,
 *   - the guard that gates each transition, and
 *   - the resulting target state.
 *
 * It is intentionally framework-free (no XState, no Prisma queries) so it can
 * be used everywhere: to drive the admin control buttons, to shadow-check the
 * existing switch logic, and as the specification the XState machine mirrors.
 *
 * NOTE: this table encodes the *intended* machine, with two long-standing bugs
 * in the current switch logic corrected (see inline `BUG:` comments). Those
 * code paths are fixed in a later slice; until then a shadow comparison will
 * surface them as divergences, which is the point.
 */

export type GameEvent = 'ACTIVATE_NEXT_PERIOD' | 'ACTIVATE_NEXT_SEGMENT'

export const GAME_EVENTS: readonly GameEvent[] = [
  'ACTIVATE_NEXT_PERIOD',
  'ACTIVATE_NEXT_SEGMENT',
]

/**
 * The minimal slice of a loaded game needed to evaluate transition guards.
 * Build it from a Prisma `game` row with `buildTransitionContext`, or inline
 * from whatever shape is already loaded.
 */
export interface GameTransitionContext {
  /** Game.activePeriodIx */
  activePeriodIx: number
  /** total number of periods that have been prepared for the game */
  totalPeriods: number
  /** number of prepared segments in the active period (0 if no active period) */
  segmentCount: number
  /** activePeriod?.activeSegment != null */
  hasActiveSegment: boolean
  /** activePeriod?.activeSegment?.nextSegment != null */
  hasNextSegment: boolean
}

export interface GameTransition {
  to: DB.GameStatus
  /** when omitted the transition is always allowed from its source state */
  guard?: (ctx: GameTransitionContext) => boolean
  description: string
}

/**
 * from-state -> event -> transition.
 *
 * Mirrors GameService.activateNextPeriod (ACTIVATE_NEXT_PERIOD) and
 * GameService.activateNextSegment (ACTIVATE_NEXT_SEGMENT).
 */
export const GAME_TRANSITIONS: Record<
  DB.GameStatus,
  Partial<Record<GameEvent, GameTransition>>
> = {
  // SCHEDULED --ACTIVATE_NEXT_PERIOD--> PREPARATION
  // (GameService.ts, case SCHEDULED in activateNextPeriod)
  [DB.GameStatus.SCHEDULED]: {
    ACTIVATE_NEXT_PERIOD: {
      to: DB.GameStatus.PREPARATION,
      description: 'Initialize the first period and move to preparation.',
    },
  },

  // PREPARATION --ACTIVATE_NEXT_SEGMENT--> RUNNING
  // (GameService.ts, case PREPARATION|PAUSED in activateNextSegment)
  [DB.GameStatus.PREPARATION]: {
    ACTIVATE_NEXT_SEGMENT: {
      to: DB.GameStatus.RUNNING,
      guard: (ctx) => ctx.segmentCount > 0,
      description: 'Start the first segment of the period.',
    },
  },

  // PAUSED --ACTIVATE_NEXT_SEGMENT--> RUNNING (shared case with PREPARATION)
  [DB.GameStatus.PAUSED]: {
    ACTIVATE_NEXT_SEGMENT: {
      to: DB.GameStatus.RUNNING,
      guard: (ctx) => ctx.segmentCount > 0,
      description: 'Resume into the next segment of the period.',
    },
  },

  // RUNNING --ACTIVATE_NEXT_SEGMENT--> PAUSED   (more segments remain)
  // RUNNING --ACTIVATE_NEXT_PERIOD --> CONSOLIDATION (period is ending)
  // (GameService.ts, case RUNNING in both functions)
  [DB.GameStatus.RUNNING]: {
    ACTIVATE_NEXT_SEGMENT: {
      to: DB.GameStatus.PAUSED,
      guard: (ctx) => ctx.hasNextSegment,
      description: 'End the current segment; another segment follows.',
    },
    ACTIVATE_NEXT_PERIOD: {
      // BUG (current switch): guard is `!currentSegmentIx`, which is falsy when
      // currentSegmentIx === 0, so the first segment of a period can never be
      // consolidated. The correct guard only requires an active segment.
      to: DB.GameStatus.CONSOLIDATION,
      guard: (ctx) => ctx.hasActiveSegment,
      description: 'Begin consolidation of the (final) running segment.',
    },
  },

  // CONSOLIDATION --ACTIVATE_NEXT_PERIOD--> RESULTS
  // (GameService.ts, case CONSOLIDATION in activateNextPeriod)
  [DB.GameStatus.CONSOLIDATION]: {
    ACTIVATE_NEXT_PERIOD: {
      to: DB.GameStatus.RESULTS,
      guard: (ctx) => ctx.hasActiveSegment,
      description: 'Compute period-end results and show the results phase.',
    },
  },

  // RESULTS --ACTIVATE_NEXT_PERIOD--> PREPARATION (more periods remain)
  // (GameService.ts, case RESULTS in activateNextPeriod)
  [DB.GameStatus.RESULTS]: {
    ACTIVATE_NEXT_PERIOD: {
      // BUG (current switch): no last-period guard exists, so the game loops
      // RESULTS -> PREPARATION forever and can never reach COMPLETED. The
      // correct machine only advances while a next period exists; the
      // last-period case transitions to COMPLETED (handled in a later slice).
      to: DB.GameStatus.PREPARATION,
      guard: (ctx) => ctx.activePeriodIx < ctx.totalPeriods - 1,
      description: 'Initialize the next period and move to preparation.',
    },
  },

  // terminal
  [DB.GameStatus.COMPLETED]: {},
}

/** Build a guard context from a loaded Prisma game row (or a compatible shape). */
export function buildTransitionContext(game: {
  activePeriodIx: number
  periods?: { length: number } | unknown[]
  activePeriod?: {
    segments?: unknown[]
    segmentCount?: number | null
    activeSegment?: { nextSegment?: unknown | null } | null
  } | null
}): GameTransitionContext {
  const totalPeriods = Array.isArray(game.periods) ? game.periods.length : 0
  const segments = game.activePeriod?.segments
  const segmentCount = Array.isArray(segments)
    ? segments.length
    : (game.activePeriod?.segmentCount ?? 0)

  return {
    activePeriodIx: game.activePeriodIx,
    totalPeriods,
    segmentCount,
    hasActiveSegment: game.activePeriod?.activeSegment != null,
    hasNextSegment: game.activePeriod?.activeSegment?.nextSegment != null,
  }
}

/** The target status for an event from a state, or null if it is not allowed. */
export function nextStatus(
  status: DB.GameStatus,
  event: GameEvent,
  ctx: GameTransitionContext
): DB.GameStatus | null {
  const transition = GAME_TRANSITIONS[status]?.[event]
  if (!transition) return null
  if (transition.guard && !transition.guard(ctx)) return null
  return transition.to
}

/** Whether an event is allowed from a state given the guard context. */
export function canTransition(
  status: DB.GameStatus,
  event: GameEvent,
  ctx: GameTransitionContext
): boolean {
  return nextStatus(status, event, ctx) !== null
}

/** All events currently allowed from a state given the guard context. */
export function availableEvents(
  status: DB.GameStatus,
  ctx: GameTransitionContext
): GameEvent[] {
  return GAME_EVENTS.filter((event) => canTransition(status, event, ctx))
}
