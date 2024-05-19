import { MachineContext, assign, createActor, setup } from 'xstate'

type PrepareStateMachineArgs<TInput, TContext> = {
  initializeContext: (input: TInput) => TContext
}

export function prepareGameStateMachine<
  TInput extends {},
  TContext extends MachineContext | undefined
>({ initializeContext }: PrepareStateMachineArgs<TInput, TContext>) {
  return setup({
    types: {
      input: {} as TInput,
      context: {} as TContext,
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
    context: ({ input }) => initializeContext(input),
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
}
