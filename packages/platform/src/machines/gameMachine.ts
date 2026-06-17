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

export type GameLifecyclePhase =
  | 'setup'
  | 'period-preparation'
  | 'segment-running'
  | 'between-segments'
  | 'period-consolidation'
  | 'period-results'
  | 'completed'

export type GameTag =
  | 'admin-controlled'
  | 'active-period'
  | 'segment-workflow'
  | 'players-can-act'
  | 'results-visible'
  | 'terminal'

export const GAME_TAGS: readonly GameTag[] = [
  'admin-controlled',
  'active-period',
  'segment-workflow',
  'players-can-act',
  'results-visible',
  'terminal',
]

export interface GameStateMeta {
  phase: GameLifecyclePhase
  label: string
}

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
    tags: {} as GameTag,
    meta: {} as GameStateMeta,
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
      tags: ['admin-controlled'],
      meta: {
        phase: 'setup',
        label: 'Scheduled',
      },
      on: {
        ACTIVATE_NEXT_PERIOD: { target: DB.GameStatus.PREPARATION },
      },
    },
    [DB.GameStatus.PREPARATION]: {
      tags: ['admin-controlled', 'active-period', 'segment-workflow'],
      meta: {
        phase: 'period-preparation',
        label: 'Period preparation',
      },
      on: {
        ACTIVATE_NEXT_SEGMENT: {
          target: DB.GameStatus.RUNNING,
          guard: 'hasSegments',
        },
      },
    },
    [DB.GameStatus.PAUSED]: {
      tags: ['admin-controlled', 'active-period', 'segment-workflow'],
      meta: {
        phase: 'between-segments',
        label: 'Between segments',
      },
      on: {
        ACTIVATE_NEXT_SEGMENT: {
          target: DB.GameStatus.RUNNING,
          guard: 'hasSegments',
        },
      },
    },
    [DB.GameStatus.RUNNING]: {
      tags: [
        'admin-controlled',
        'active-period',
        'segment-workflow',
        'players-can-act',
      ],
      meta: {
        phase: 'segment-running',
        label: 'Segment running',
      },
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
      tags: ['admin-controlled', 'active-period'],
      meta: {
        phase: 'period-consolidation',
        label: 'Period consolidation',
      },
      on: {
        ACTIVATE_NEXT_PERIOD: {
          target: DB.GameStatus.RESULTS,
          guard: 'hasActiveSegment',
        },
      },
    },
    [DB.GameStatus.RESULTS]: {
      tags: ['admin-controlled', 'results-visible'],
      meta: {
        phase: 'period-results',
        label: 'Period results',
      },
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
      tags: ['terminal'],
      meta: {
        phase: 'completed',
        label: 'Completed',
      },
      type: 'final',
    },
  },
})
