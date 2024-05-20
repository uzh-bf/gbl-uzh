import { and, assign, setup } from 'xstate'

export type Events =
  | { type: 'onNext' }
  | { type: 'ADD_PERIOD' }
  | { type: 'ADD_SEGMENT' }
  | { type: 'GAME_ACTIVE_INVOKE' }

export type Transitions =
  | 'ADD_PERIOD'
  | 'ADD_SEGMENT'
  | 'GAME_PREPARED_TO_GAME_ACTIVE'
  | 'PERIOD_SCHEDULED_TO_PERIOD_ACTIVE'
  | 'PERIOD_ACTIVE_PREPARATION_TO_RUNNING'
  | 'PERIOD_ACTIVE_RUNNING_TO_PAUSED'
  | 'PERIOD_ACTIVE_PAUSED_TO_RUNNING'
  | 'PERIOD_ACTIVE_RUNNING_TO_CONSOLIDATION'
  | 'PERIOD_ACTIVE_CONSOLIDATION_TO_PERIOD_RESULTS'
  | 'PERIOD_RESULTS_TO_PERIOD_ACTIVE'
  | 'PERIOD_RESULTS_TO_GAME_COMPLETED'

export interface BaseContext<TUserContext extends {}> {
  game: {
    activePeriodIx: number
    activeSegmentIx: number
    periodCount: number
    segmentCount: number
  }
  user: TUserContext
}

export interface BaseInput {}

type PrepareStateMachineArgs<TInput, TUserContext extends {}> = {
  initializeUserContext: (input: TInput) => TUserContext
  transitionFn?: (
    transitionName: Transitions,
    context: BaseContext<TUserContext>
  ) => TUserContext
}

export function prepareGameStateMachine<
  TInput extends BaseInput,
  TUserContext extends {}
>({
  initializeUserContext,
  transitionFn = (_, context) => context.user,
}: PrepareStateMachineArgs<TInput, TUserContext>) {
  return setup({
    actions: {
      ADD_PERIOD: assign(({ context }) => ({
        game: {
          ...context.game,
          periodCount: context.game.periodCount + 1,
        },
        user: transitionFn('ADD_PERIOD', context),
      })),

      ADD_SEGMENT: assign(({ context }) => ({
        game: {
          ...context.game,
          segmentCount: context.game.segmentCount + 1,
        },
        user: transitionFn('ADD_SEGMENT', context),
      })),

      GAME_ACTIVE_INVOKE: async ({ context, event }) => {},
    },

    types: {
      input: {} as TInput,
      context: {} as BaseContext<TUserContext>,
      events: {} as Events,
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
        ADD_PERIOD: {
          type: 'object',
          properties: {},
        },
        ADD_SEGMENT: {
          type: 'object',
          properties: {},
        },
        GAME_ACTIVE_INVOKE: {
          type: 'object',
          properties: {},
        },
        onNext: {
          type: 'object',
          properties: {},
        },
      },
    },
  }).createMachine({
    id: 'GAME_FLOW',
    initial: 'GAME_PREPARED',

    context: ({ input }) => ({
      game: {
        periodCount: 0,
        segmentCount: 0,
        activePeriodIx: -1,
        activeSegmentIx: -1,
      },
      user: initializeUserContext(input) ?? {},
    }),

    on: {
      ADD_PERIOD: {
        target: '#GAME_FLOW',
        actions: [{ type: 'ADD_PERIOD' }],
      },

      ADD_SEGMENT: {
        target: '#GAME_FLOW',
        actions: [{ type: 'ADD_SEGMENT' }],
      },
    },

    states: {
      GAME_PREPARED: {
        on: {
          onNext: {
            target: 'GAME_ACTIVE',
            guard: and(['HAS_PERIODS', 'HAS_SEGMENTS']),
            actions: [
              assign(({ context }) => ({
                game: context.game,
                user: transitionFn('GAME_PREPARED_TO_GAME_ACTIVE', context),
              })),
            ],
          },
        },
      },

      // GAME_ACTIVE_INVOKE: {
      //   invoke: {
      //     input: ({ context, event }) => ({}),
      //     onDone: {
      //       target: 'GAME_ACTIVE',
      //     },
      //     onError: {
      //       target: 'GAME_ACTIVE',
      //     },
      //   },
      // },

      GAME_ACTIVE: {
        initial: 'PERIOD_SCHEDULED',

        states: {
          PERIOD_SCHEDULED: {
            on: {
              onNext: {
                target: 'PERIOD_ACTIVE',
                actions: [
                  assign(({ context }) => ({
                    game: {
                      ...context.game,
                      activePeriodIx: context.game.activePeriodIx + 1,
                    },
                    user: transitionFn(
                      'PERIOD_SCHEDULED_TO_PERIOD_ACTIVE',
                      context
                    ),
                  })),
                ],
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
                    actions: [
                      assign(({ context }) => ({
                        game: {
                          ...context.game,
                          activeSegmentIx: context.game.activeSegmentIx + 1,
                        },
                        user: transitionFn(
                          'PERIOD_ACTIVE_PREPARATION_TO_RUNNING',
                          context
                        ),
                      })),
                    ],
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
                      actions: [
                        assign(({ context }) => ({
                          game: context.game,
                          user: transitionFn(
                            'PERIOD_ACTIVE_RUNNING_TO_PAUSED',
                            context
                          ),
                        })),
                      ],
                    },
                    {
                      target: 'CONSOLIDATION',
                      guard: {
                        type: 'IS_LAST_SEGMENT',
                      },
                      actions: [
                        assign(({ context }) => ({
                          game: context.game,
                          user: transitionFn(
                            'PERIOD_ACTIVE_RUNNING_TO_CONSOLIDATION',
                            context
                          ),
                        })),
                      ],
                    },
                  ],
                },
              },

              PAUSED: {
                on: {
                  onNext: {
                    target: 'RUNNING',
                    actions: [
                      assign(({ context }) => ({
                        game: {
                          ...context.game,
                          activeSegmentIx: context.game.activeSegmentIx + 1,
                        },
                        user: transitionFn(
                          'PERIOD_ACTIVE_PAUSED_TO_RUNNING',
                          context
                        ),
                      })),
                    ],
                  },
                },
              },

              CONSOLIDATION: {
                on: {
                  onNext: {
                    target: '#GAME_FLOW.GAME_ACTIVE.PERIOD_RESULTS',
                    actions: [
                      assign(({ context }) => ({
                        game: {
                          ...context.game,
                          activeSegmentIx: -1,
                        },
                        user: transitionFn(
                          'PERIOD_ACTIVE_CONSOLIDATION_TO_PERIOD_RESULTS',
                          context
                        ),
                      })),
                    ],
                  },
                },
              },
            },
          },

          PERIOD_RESULTS: {
            on: {
              onNext: [
                {
                  target: 'PERIOD_ACTIVE',
                  guard: {
                    type: 'IS_NOT_LAST_PERIOD',
                  },
                  actions: [
                    assign(({ context }) => ({
                      game: {
                        ...context.game,
                        activePeriodIx: context.game.activePeriodIx + 1,
                      },
                      user: transitionFn(
                        'PERIOD_RESULTS_TO_PERIOD_ACTIVE',
                        context
                      ),
                    })),
                  ],
                },
                {
                  target: '#GAME_FLOW.GAME_COMPLETED',
                  guard: {
                    type: 'IS_LAST_PERIOD',
                  },
                  actions: [
                    assign(({ context }) => ({
                      game: {
                        ...context.game,
                        activePeriodIx: -1,
                      },
                      user: transitionFn(
                        'PERIOD_RESULTS_TO_GAME_COMPLETED',
                        context
                      ),
                    })),
                  ],
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
