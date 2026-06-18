import { setup } from 'xstate'

/**
 * XState v5 model of the game lifecycle.
 *
 * The state node keys intentionally match the persisted game status strings, so
 * a machine state value can be compared directly against `game.status`.
 *
 * Context is derived from the database row on hydration. The machine defines no
 * side-effecting actions and never mutates context; service code owns writes
 * and external effects.
 */

export const GAME_STATUS = {
  SCHEDULED: 'SCHEDULED',
  PREPARATION: 'PREPARATION',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  CONSOLIDATION: 'CONSOLIDATION',
  RESULTS: 'RESULTS',
  COMPLETED: 'COMPLETED',
} as const

export const GAME_STATUS_VALUES = Object.values(GAME_STATUS)

export type GameStatusValue =
  (typeof GAME_STATUS)[keyof typeof GAME_STATUS]

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

export const LIFECYCLE_WORK_ORDER_TYPES = [
  'startNextPeriod',
  'startNextSegment',
  'finishCurrentSegment',
  'finishGame',
  'runSegmentBeforeActivationHook',
  'consolidateCurrentPeriod',
  'createPeriodStartResults',
  'createPeriodEndResults',
  'createSegmentStartResults',
  'createSegmentEndResults',
  'createPlayerActions',
  'createPostCommitPlayerEvents',
  'resetPlayerReadiness',
  'publishAfterActivateNextPeriod',
  'publishAfterActivateNextSegment',
  'publishAfterFinishGame',
] as const

export type LifecycleWorkOrderType =
  (typeof LIFECYCLE_WORK_ORDER_TYPES)[number]

export interface LifecycleWorkOrder {
  type: LifecycleWorkOrderType
}

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

const noopWorkOrderAction = () => {}

const WORK_ORDER_ACTIONS = Object.fromEntries(
  LIFECYCLE_WORK_ORDER_TYPES.map((type) => [type, noopWorkOrderAction])
) as Record<LifecycleWorkOrderType, typeof noopWorkOrderAction>

export function toLifecycleWorkOrders(
  actions: readonly { type: string }[]
): LifecycleWorkOrder[] {
  return actions.map((action) => {
    const type = action.type as LifecycleWorkOrderType
    if (!LIFECYCLE_WORK_ORDER_TYPES.includes(type)) {
      throw new Error(`Unknown lifecycle work order: ${action.type}`)
    }

    return { type }
  })
}

export const gameMachine = setup({
  types: {
    context: {} as GameMachineContext,
    events: {} as GameMachineEvent,
    tags: {} as GameTag,
    meta: {} as GameStateMeta,
  },
  actions: WORK_ORDER_ACTIONS,
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
  initial: GAME_STATUS.SCHEDULED,
  states: {
    [GAME_STATUS.SCHEDULED]: {
      tags: ['admin-controlled'],
      meta: {
        phase: 'setup',
        label: 'Scheduled',
      },
      on: {
        ACTIVATE_NEXT_PERIOD: {
          target: GAME_STATUS.PREPARATION,
          actions: [
            'startNextPeriod',
            'createPeriodStartResults',
            'createPlayerActions',
            'publishAfterActivateNextPeriod',
          ],
        },
      },
    },
    [GAME_STATUS.PREPARATION]: {
      tags: ['admin-controlled', 'active-period', 'segment-workflow'],
      meta: {
        phase: 'period-preparation',
        label: 'Period preparation',
      },
      on: {
        ACTIVATE_NEXT_SEGMENT: {
          target: GAME_STATUS.RUNNING,
          guard: 'hasSegments',
          actions: [
            'startNextSegment',
            'createSegmentStartResults',
            'createPlayerActions',
            'resetPlayerReadiness',
            'publishAfterActivateNextSegment',
          ],
        },
      },
    },
    [GAME_STATUS.PAUSED]: {
      tags: ['admin-controlled', 'active-period', 'segment-workflow'],
      meta: {
        phase: 'between-segments',
        label: 'Between segments',
      },
      on: {
        ACTIVATE_NEXT_SEGMENT: {
          target: GAME_STATUS.RUNNING,
          guard: 'hasSegments',
          actions: [
            'startNextSegment',
            'createSegmentStartResults',
            'createPlayerActions',
            'resetPlayerReadiness',
            'publishAfterActivateNextSegment',
          ],
        },
      },
    },
    [GAME_STATUS.RUNNING]: {
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
          target: GAME_STATUS.PAUSED,
          guard: 'hasNextSegment',
          actions: [
            'finishCurrentSegment',
            'createSegmentEndResults',
            'createPlayerActions',
            'resetPlayerReadiness',
            'publishAfterActivateNextSegment',
          ],
        },
        ACTIVATE_NEXT_PERIOD: {
          target: GAME_STATUS.CONSOLIDATION,
          guard: 'hasActiveSegment',
          actions: [
            'runSegmentBeforeActivationHook',
            'finishCurrentSegment',
            'consolidateCurrentPeriod',
            'createSegmentEndResults',
            'createPlayerActions',
            'resetPlayerReadiness',
            'publishAfterActivateNextPeriod',
          ],
        },
      },
    },
    [GAME_STATUS.CONSOLIDATION]: {
      tags: ['admin-controlled', 'active-period'],
      meta: {
        phase: 'period-consolidation',
        label: 'Period consolidation',
      },
      on: {
        ACTIVATE_NEXT_PERIOD: {
          target: GAME_STATUS.RESULTS,
          guard: 'hasActiveSegment',
          actions: [
            'createPeriodEndResults',
            'createPlayerActions',
            'createPostCommitPlayerEvents',
            'resetPlayerReadiness',
            'publishAfterActivateNextPeriod',
          ],
        },
      },
    },
    [GAME_STATUS.RESULTS]: {
      tags: ['admin-controlled', 'results-visible'],
      meta: {
        phase: 'period-results',
        label: 'Period results',
      },
      on: {
        ACTIVATE_NEXT_PERIOD: {
          target: GAME_STATUS.PREPARATION,
          guard: 'hasNextPeriod',
          actions: [
            'createPeriodStartResults',
            'createPlayerActions',
            'resetPlayerReadiness',
            'publishAfterActivateNextPeriod',
          ],
        },
        FINISH_GAME: {
          target: GAME_STATUS.COMPLETED,
          guard: 'noNextPeriod',
          actions: ['finishGame', 'publishAfterFinishGame'],
        },
      },
    },
    [GAME_STATUS.COMPLETED]: {
      tags: ['terminal'],
      meta: {
        phase: 'completed',
        label: 'Completed',
      },
      type: 'final',
    },
  },
})
