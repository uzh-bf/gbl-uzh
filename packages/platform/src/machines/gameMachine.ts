import * as DB from '@prisma/client'
import { setup } from 'xstate'
import type { GameTransitionContext } from '../services/GameTransitions.js'

/**
 * XState v5 model of the game lifecycle.
 *
 * This is the explicit, visualizable form of the implicit machine in
 * `GameService.activateNextPeriod` / `activateNextSegment`. It mirrors the
 * declarative `GAME_TRANSITIONS` table one-to-one (a unit test enforces the
 * equivalence), so the two never drift.
 *
 * The state node keys ARE the `DB.GameStatus` enum values, so a machine state
 * value can be compared directly against `game.status`.
 *
 * Context note: the guard context (period/segment counts and flags) is volatile
 * — it changes as segments are added and advanced. It is therefore re-derived
 * from the database on every hydration (see GameMachineService) rather than
 * accumulated through machine actions. The machine itself defines no actions and
 * never mutates context; this also makes persisted snapshots safe to restore
 * (XState does not re-run actions on restore).
 */

export type GameMachineContext = GameTransitionContext

export type GameMachineEvent =
  | { type: 'ACTIVATE_NEXT_PERIOD' }
  | { type: 'ACTIVATE_NEXT_SEGMENT' }

/**
 * Default context for a freshly created actor. Actors are always hydrated to a
 * concrete state + context via `resolveState({ value, context })` (see
 * GameMachineService), so this default is only the starting point before
 * hydration and is never relied upon for guard decisions.
 */
export const DEFAULT_GAME_CONTEXT: GameMachineContext = {
  activePeriodIx: -1,
  totalPeriods: 0,
  segmentCount: 0,
  hasActiveSegment: false,
  hasNextSegment: false,
}

export const gameMachine = setup({
  types: {
    context: {} as GameMachineContext,
    events: {} as GameMachineEvent,
  },
  guards: {
    // activePeriod.segments.length > 0 (GameService activateNextSegment)
    hasSegments: ({ context }) => context.segmentCount > 0,
    // activePeriod.activeSegment.nextSegment exists (RUNNING -> PAUSED)
    hasNextSegment: ({ context }) => context.hasNextSegment,
    // activePeriod.activeSegment exists (RUNNING -> CONSOLIDATION -> RESULTS)
    hasActiveSegment: ({ context }) => context.hasActiveSegment,
    // a further period exists (RESULTS -> PREPARATION)
    hasNextPeriod: ({ context }) =>
      context.activePeriodIx < context.totalPeriods - 1,
  },
}).createMachine({
  id: 'game',
  // static default; the concrete context is supplied at hydration time via
  // resolveState({ value, context }), re-synced from the database
  context: DEFAULT_GAME_CONTEXT,
  initial: DB.GameStatus.SCHEDULED,
  states: {
    [DB.GameStatus.SCHEDULED]: {
      on: {
        ACTIVATE_NEXT_PERIOD: { target: DB.GameStatus.PREPARATION },
      },
    },
    [DB.GameStatus.PREPARATION]: {
      on: {
        ACTIVATE_NEXT_SEGMENT: {
          target: DB.GameStatus.RUNNING,
          guard: 'hasSegments',
        },
      },
    },
    [DB.GameStatus.PAUSED]: {
      on: {
        ACTIVATE_NEXT_SEGMENT: {
          target: DB.GameStatus.RUNNING,
          guard: 'hasSegments',
        },
      },
    },
    [DB.GameStatus.RUNNING]: {
      on: {
        ACTIVATE_NEXT_SEGMENT: {
          target: DB.GameStatus.PAUSED,
          guard: 'hasNextSegment',
        },
        ACTIVATE_NEXT_PERIOD: {
          target: DB.GameStatus.CONSOLIDATION,
          guard: 'hasActiveSegment',
        },
      },
    },
    [DB.GameStatus.CONSOLIDATION]: {
      on: {
        ACTIVATE_NEXT_PERIOD: {
          target: DB.GameStatus.RESULTS,
          guard: 'hasActiveSegment',
        },
      },
    },
    [DB.GameStatus.RESULTS]: {
      on: {
        ACTIVATE_NEXT_PERIOD: {
          target: DB.GameStatus.PREPARATION,
          guard: 'hasNextPeriod',
        },
        // last period -> COMPLETED is added in a later slice (needs a dedicated
        // event/guard); today the switch loops back to PREPARATION.
      },
    },
    [DB.GameStatus.COMPLETED]: {
      type: 'final',
    },
  },
})
