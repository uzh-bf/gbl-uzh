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
export const gameStateMachine = setup({
  types: {
    input: {} as GameStateContext,
    context: {} as GameStateContext,
    events: {} as { type: 'onNext' },
  },
  guards: {
    'not last segment': function ({ context, event }) {
      return context.activeSegmentIx < context.segmentCount
    },
    'last segment': function ({ context, event }) {
      return context.activeSegmentIx === context.segmentCount
    },
    'more periods remaining': function ({ context, event }) {
      return context.activePeriodIx < context.periodCount
    },
    'last period completed': function ({ context, event }) {
      return context.activePeriodIx === context.periodCount
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
    ...input,
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
                },
              },
            },
            RUNNING: {
              on: {
                onNext: [
                  {
                    target: 'PAUSED',
                    guard: {
                      type: 'not last segment',
                    },
                  },
                  {
                    target: '#Game.GAME_ACTIVE.CONSOLIDATION',
                    guard: {
                      type: 'last segment',
                    },
                  },
                ],
              },
            },
            PAUSED: {
              on: {
                onNext: {
                  target: 'RUNNING',
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
                  type: 'more periods remaining',
                },
              },
              {
                target: '#Game.GAME_COMPLETED',
                guard: {
                  type: 'last period completed',
                },
              },
            ],
          },
        },
        CONSOLIDATION: {
          on: {
            onNext: {
              target: 'RESULTS',
            },
          },
        },
      },
    },
    GAME_COMPLETED: {},
  },
})
// }

const actor = createActor(gameStateMachine, {
  input: {
    activePeriodIx: 0,
    activeSegmentIx: 0,
    periodCount: 3,
    segmentCount: 3,
  },
})

actor.start()

actor.send({ type: 'onNext' })

console.log(actor)
