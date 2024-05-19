import { MachineContext, assign, createActor, setup } from 'xstate'

type GameStateContext = {
  activePeriodIx: number
  activeSegmentIx: number
  periodCount: number
  segmentCount: number
}

// export function prepareGameStateMachine<TContext extends MachineContext>(
//   onNextA: Function
// ) {
export const GameStateMachine = setup({
  types: {
    input: {} as GameStateContext,
    context: {} as GameStateContext,
    events: {} as { type: 'onNext' },
  },
  guards: {
    IS_NOT_LAST_SEGMENT: function ({ context, event }) {
      return context.activeSegmentIx < context.segmentCount - 1
    },
    IS_LAST_SEGMENT: function ({ context, event }) {
      return context.activeSegmentIx === context.segmentCount - 1
    },
    MORE_PERIODS_REMAINING: function ({ context, event }) {
      return context.activePeriodIx < context.periodCount - 1
    },
    NO_PERIODS_REMAINING: function ({ context, event }) {
      return context.activePeriodIx === context.periodCount - 1
    },
  },
  schemas: {
    events: {
      onNext: {
        type: 'object',
        properties: {},
      },
    },
  },
}).createMachine({
  context: ({ input }) => ({
    activePeriodIx: input.activePeriodIx,
    activeSegmentIx: input.activeSegmentIx,
    periodCount: input.periodCount,
    segmentCount: input.segmentCount,
  }),
  id: 'Game',
  initial: 'GAME_ACTIVE',
  states: {
    GAME_ACTIVE: {
      initial: 'SCHEDULED',
      states: {
        SCHEDULED: {
          on: {
            onNext: {
              target: 'PERIOD_ACTIVE',
              actions: assign(({ context }) => ({
                activePeriodIx: context.activePeriodIx + 1,
              })),
            },
          },
        },
        PERIOD_ACTIVE: {
          initial: 'PREPARATION',
          states: {
            PREPARATION: {
              on: {
                onNext: {
                  target: 'RUNNING',
                  actions: assign(({ context }) => ({
                    activeSegmentIx: context.activeSegmentIx + 1,
                  })),
                },
              },
            },
            RUNNING: {
              on: {
                onNext: [
                  {
                    target: 'PAUSED',
                    guard: {
                      type: 'IS_NOT_LAST_SEGMENT',
                    },
                  },
                  {
                    target: 'CONSOLIDATION',
                    guard: {
                      type: 'IS_LAST_SEGMENT',
                    },
                    actions: assign(({ context }) => ({
                      activeSegmentIx: -1,
                    })),
                  },
                ],
              },
            },
            PAUSED: {
              on: {
                onNext: {
                  target: 'RUNNING',
                  actions: assign(({ context }) => ({
                    activeSegmentIx: context.activeSegmentIx + 1,
                  })),
                },
              },
            },
            CONSOLIDATION: {
              on: {
                onNext: {
                  target: '#Game.GAME_ACTIVE.RESULTS',
                },
              },
            },
          },
        },
        RESULTS: {
          on: {
            onNext: [
              {
                target: 'PERIOD_ACTIVE',
                guard: {
                  type: 'MORE_PERIODS_REMAINING',
                },
                actions: assign(({ context }) => ({
                  activePeriodIx: context.activePeriodIx + 1,
                })),
              },
              {
                target: '#Game.GAME_COMPLETED',
                guard: {
                  type: 'NO_PERIODS_REMAINING',
                },
                actions: assign(({ context }) => ({
                  activePeriodIx: -1,
                })),
              },
            ],
          },
        },
      },
    },
    GAME_COMPLETED: {},
  },
})
// }
