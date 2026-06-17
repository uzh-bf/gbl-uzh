import * as DB from '@prisma/client'
import { setup } from 'xstate'

/**
 * XState v5 model of the game lifecycle.
 *
 * The state node keys are the `DB.GameStatus` enum values, so a machine state
 * value can be compared directly against `game.status`.
 *
 * Context is derived from the database row on hydration. The machine defines no
 * actions and never mutates context; service code owns DB writes and side
 * effects.
 */

export type GameEvent =
  | 'ACTIVATE_NEXT_PERIOD'
  | 'ACTIVATE_NEXT_SEGMENT'
  | 'FINISH_GAME'

export const GAME_EVENTS: readonly GameEvent[] = [
  'ACTIVATE_NEXT_PERIOD',
  'ACTIVATE_NEXT_SEGMENT',
  'FINISH_GAME',
]

export interface GameMachineContext {
  activePeriodIx: number
  totalPeriods: number
  segmentCount: number
  hasActiveSegment: boolean
  hasNextSegment: boolean
}

export type GameMachineEvent = { type: GameEvent }

const DEFAULT_GAME_CONTEXT: GameMachineContext = {
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
    hasSegments: ({ context }) => context.segmentCount > 0,
    hasNextSegment: ({ context }) => context.hasNextSegment,
    hasActiveSegment: ({ context }) => context.hasActiveSegment,
    hasNextPeriod: ({ context }) =>
      context.activePeriodIx < context.totalPeriods,
    noNextPeriod: ({ context }) =>
      context.activePeriodIx >= context.totalPeriods,
  },
}).createMachine({
  id: 'game',
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
        FINISH_GAME: {
          target: DB.GameStatus.COMPLETED,
          guard: 'noNextPeriod',
        },
      },
    },
    [DB.GameStatus.COMPLETED]: {
      type: 'final',
    },
  },
})
