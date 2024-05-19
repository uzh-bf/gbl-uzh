import { MachineContext, and, assign, createActor, setup } from 'xstate'

interface BaseContext extends MachineContext {
  activePeriodIx: number
  activeSegmentIx: number
  periodCount: number
  segmentCount: number
}

interface BaseInput {
  periodCount: number
  segmentCount: number
}

type PrepareStateMachineArgs<TInput, TContext> = {
  initializeContext: (
    input: TInput
  ) => Omit<TContext, keyof BaseContext> & BaseInput
}

export function prepareGameStateMachine<
  TInput extends BaseInput,
  TContext extends BaseContext | undefined
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
      IS_NOT_LAST_PERIOD: function ({ context, event }) {
        return context.activePeriodIx < context.periodCount - 1
      },
      IS_LAST_PERIOD: function ({ context, event }) {
        return context.activePeriodIx === context.periodCount - 1
      },
      HAS_PERIODS: function ({ context, event }) {
        return context.periodCount > 0
      },
      HAS_SEGMENTS: function ({ context, event }) {
        return context.segmentCount > 0
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
      activePeriodIx: -1,
      activeSegmentIx: -1,
      ...initializeContext(input),
    }),
    id: 'GAME_FLOW',
    initial: 'GAME_PREPARED',
    states: {
      GAME_PREPARED: {
        on: {
          onNext: {
            target: 'GAME_ACTIVE',
            guard: and(['HAS_PERIODS', 'HAS_SEGMENTS']),
          },
        },
      },
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
                    target: '#GAME_FLOW.GAME_ACTIVE.RESULTS',
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
                    type: 'IS_NOT_LAST_PERIOD',
                  },
                  actions: assign(({ context }) => ({
                    activePeriodIx: context.activePeriodIx + 1,
                  })),
                },
                {
                  target: '#GAME_FLOW.GAME_COMPLETED',
                  guard: {
                    type: 'IS_LAST_PERIOD',
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
