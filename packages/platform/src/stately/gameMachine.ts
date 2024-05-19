import { MachineContext, and, assign, setup } from 'xstate'

export enum Transitions {
  'SCHEDULED_TO_PERIOD_ACTIVE' = 'SCHEDULED_TO_PERIOD_ACTIVE',
}

export interface BaseContext<TUserContext extends {}> extends MachineContext {
  game: {
    activePeriodIx: number
    activeSegmentIx: number
    periodCount: number
    segmentCount: number
  }
  user: TUserContext
}

export interface BaseInput {
  periodCount: number
  segmentCount: number
}

type PrepareStateMachineArgs<TInput, TUserContext extends {}> = {
  initializeUserContext: (input: TInput) => TUserContext
  transitionFn?: (
    transitionName: string,
    context: BaseContext<TUserContext>
  ) => TUserContext
}

export function prepareGameStateMachine<
  TInput extends BaseInput,
  TUserContext extends {}
>({
  initializeUserContext,
  transitionFn = (transitionName, context) => context?.userContext,
}: PrepareStateMachineArgs<TInput, TUserContext>) {
  return setup({
    types: {
      input: {} as TInput,
      context: {} as BaseContext<TUserContext>,
      events: {} as { type: 'onNext' },
    },
    guards: {
      IS_NOT_LAST_SEGMENT: function ({ context, event }) {
        return context.game.activeSegmentIx < context.game.segmentCount - 1
      },
      IS_LAST_SEGMENT: function ({ context, event }) {
        return context.game.activeSegmentIx === context.game.segmentCount - 1
      },
      IS_NOT_LAST_PERIOD: function ({ context, event }) {
        return context.game.activePeriodIx < context.game.periodCount - 1
      },
      IS_LAST_PERIOD: function ({ context, event }) {
        return context.game.activePeriodIx === context.game.periodCount - 1
      },
      HAS_PERIODS: function ({ context, event }) {
        return context.game.periodCount > 0
      },
      HAS_SEGMENTS: function ({ context, event }) {
        return context.game.segmentCount > 0
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
      game: {
        activePeriodIx: -1,
        activeSegmentIx: -1,
        periodCount: input.periodCount,
        segmentCount: input.segmentCount,
      },
      user: initializeUserContext(input) ?? {},
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
                  game: {
                    ...context.game,
                    activePeriodIx: context.game.activePeriodIx + 1,
                  },
                  user: transitionFn(
                    Transitions.SCHEDULED_TO_PERIOD_ACTIVE,
                    context
                  ),
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
                      game: {
                        ...context.game,
                        activeSegmentIx: context.game.activeSegmentIx + 1,
                      },
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
                        game: {
                          ...context.game,
                          activeSegmentIx: -1,
                        },
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
                      game: {
                        ...context.game,
                        activeSegmentIx: context.game.activeSegmentIx + 1,
                      },
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
                    game: {
                      ...context.game,
                      activePeriodIx: context.activePeriodIx + 1,
                    },
                  })),
                },
                {
                  target: '#GAME_FLOW.GAME_COMPLETED',
                  guard: {
                    type: 'IS_LAST_PERIOD',
                  },
                  actions: assign(({ context }) => ({
                    game: {
                      ...context.game,
                      activePeriodIx: -1,
                    },
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
