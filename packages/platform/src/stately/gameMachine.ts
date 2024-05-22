import * as DB from '@prisma/client'
import { and, assign, fromPromise, setup } from 'xstate'

export type Events =
  | { type: 'onNext' }
  | { type: 'onAddPeriod' }
  | { type: 'onAddSegment' }

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

// TODO(Jakob):
// - Add type for game
// - Move some functions to a util.ts file or something
// - replace updateDatabase

type PrepareStateMachineArgs<TInput, TUserContext extends {}> = {
  initializeUserContext: (input: TInput) => TUserContext
  transitionFn?: (
    transitionName: Transitions,
    context: BaseContext<TUserContext>,
    game: any
  ) => TUserContext
}

const updateDatabase = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data) {
        console.log(data)
        resolve({ success: true, data })
      } else {
        console.log(data)
        reject(new Error('Failed to update database'))
      }
    }, 1000)
  })
}

function mapAction({ ctx, gameId, activePeriodIx, playerId }) {
  return (action) =>
    ctx.prisma.playerAction.create({
      data: {
        type: action.type,
        facts: action.facts,
        game: {
          connect: { id: gameId },
        },
        player: {
          connect: { id: playerId },
        },
        periodIx: activePeriodIx,
        period: {
          connect: {
            gameId_index: {
              gameId,
              index: activePeriodIx,
            },
          },
        },
        segmentIx:
          typeof action.segment === 'number' ? action.segment : undefined,
        segment:
          typeof action.segment === 'number'
            ? {
                connect: {
                  gameId_periodIx_index: {
                    gameId,
                    periodIx: activePeriodIx,
                    index: action.segment,
                  },
                },
              }
            : undefined,
      },
    })
}

const initPlayerResults = (players, activePeriodIx, gameId, results, ctx) => {
  const nextPeriodIx = activePeriodIx + 1
  let extras: any[] = []
  const outputResults = players.map((player, ix, allPlayers) => {
    const facts = results[ix].facts
    const actions = results[ix].actions
    if (actions && actions.length > 0) {
      const mapper = mapAction({
        ctx,
        gameId,
        activePeriodIx: nextPeriodIx,
        playerId: player.id,
      })
      extras = [...extras, ...actions.map(mapper)]
    }

    return {
      type: DB.PlayerResultType.PERIOD_START,
      periodIx: nextPeriodIx,
      facts,
      player: {
        connect: {
          id: player.id,
        },
      },
      game: {
        connect: {
          id: gameId,
        },
      },
    }
  })

  return {
    results: outputResults,
    extras,
  }
}

const updateDBPeriodResults = async ({ context, event }) => {
  const activePeriodIx = context.game.activePeriodIx
  const gameId = event.game.gameId
  const ctx = event.ctx

  let extras: any[] = []
  let results: any
  if (activePeriodIx < 0) {
    ;({ results, extras } = initPlayerResults(
      event.game.players,
      activePeriodIx,
      gameId,
      event.results,
      ctx
    ))
  } else {
    // If the game is running, transform previous results to next
    results = event.results
      // TODO(Jakob): We already filter when we compute the facts -> remove
      // ensure that we only work on PERIOD_END results of the preceding period
      // .filter((result) => result.type === DB.PlayerResultType.PERIOD_END)
      .map((result, ix, allResults) => {
        if (result.actions && result.actions.length > 0) {
          const mapper = mapAction({
            ctx,
            gameId,
            activePeriodIx: activePeriodIx,
            playerId: result.player.id,
          })
          extras = [...extras, ...result.actions.map(mapper)]
        }
        const facts = result.facts
        return {
          type: DB.PlayerResultType.PERIOD_START,
          periodIx: activePeriodIx,
          facts,
          player: {
            connect: {
              id: result.player.id ?? result.player.connect.id,
            },
          },
          game: {
            connect: {
              id: gameId,
            },
          },
        }
      })
  }

  // update the status and active period of the current game
  // and prepare PERIOD_START results

  const nextPeriodIx = activePeriodIx + 1
  const result = await ctx.prisma.$transaction([
    ctx.prisma.game.update({
      where: {
        id: gameId,
      },
      include: {
        periods: {
          include: {
            segments: true,
          },
        },
      },
      data: {
        status: DB.GameStatus.PREPARATION,
        activePeriodIx: nextPeriodIx,
        activePeriod: {
          connect: {
            gameId_index: {
              gameId,
              index: nextPeriodIx,
            },
          },
        },
      },
    }),

    ctx.prisma.period.update({
      where: {
        gameId_index: {
          gameId,
          index: nextPeriodIx,
        },
      },
      data: {
        results: {
          create: results,
        },
      },
    }),

    ...extras,
  ])

  // TODO(Jakob): Check what the return value is needed for
  // in activateNextPeriod in GameService.ts
  return result
}

export function prepareGameStateMachine<
  TInput extends BaseInput,
  TUserContext extends {}
>({
  initializeUserContext,
  transitionFn = (transitionName, context, game) => context?.user,
}: PrepareStateMachineArgs<TInput, TUserContext>) {
  return setup({
    types: {
      input: {} as TInput,
      context: {} as BaseContext<TUserContext>,
      // TODO(Jakob): Some events don't need game input
      // -> maybe use multiple events
      events: {} as {
        type: 'onNext'
        // TODO(Jakob): Add type
        game: any
      },
    },
    actors: {
      updateDBPeriodResults: fromPromise(async ({ input }) => {
        return updateDatabase(input)
      }),
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
        // onAddPeriod: {
        //   type: 'object',
        //   properties: {},
        // },
        // onAddSegment: {
        //   type: 'object',
        //   properties: {},
        // },
        // onNext: {
        //   type: 'object',
        //   properties: {},
        // },
      },
    },
  }).createMachine({
    id: 'GAME_FLOW',
    initial: 'GAME_PREPARED',

    context: ({ input }) => ({
      game: {
        periodCount: 2,
        segmentCount: 2,
        activePeriodIx: -1,
        activeSegmentIx: -1,
      },
      user: initializeUserContext(input) ?? {},
    }),

    // on: {
    //   onAddPeriod: {
    //     target: '#GAME_FLOW',
    //     actions: assign(({ context }) => ({
    //       game: {
    //         ...context.game,
    //         periodCount: context.game.periodCount + 1,
    //       },
    //       // user: transitionFn('ADD_PERIOD', context),
    //     })),
    //   },

    //   onAddSegment: {
    //     target: '#GAME_FLOW',
    //     actions: assign(({ context }) => ({
    //       game: {
    //         ...context.game,
    //         segmentCount: context.game.segmentCount + 1,
    //       },
    //       // user: transitionFn('ADD_SEGMENT', context),
    //     })),
    //   },
    // },

    states: {
      GAME_PREPARED: {
        on: {
          onNext: {
            target: 'GAME_ACTIVE',
            guard: and(['HAS_PERIODS', 'HAS_SEGMENTS']),
            actions: assign(({ context }) => ({
              game: context.game,
              // user: transitionFn('GAME_PREPARED_TO_GAME_ACTIVE', context),
            })),
          },
        },
      },

      GAME_ACTIVE: {
        initial: 'PERIOD_SCHEDULED',

        states: {
          PERIOD_SCHEDULED: {
            on: {
              onNext: {
                target: 'PERIOD_UPDATE_DB_RESULTS',
                actions: assign(({ context, event }) => ({
                  game: {
                    ...context.game,
                    // activePeriodIx: context.game.activePeriodIx + 1,
                  },
                  user: transitionFn(
                    'PERIOD_SCHEDULED_TO_PERIOD_ACTIVE',
                    context,
                    event.game
                  ),
                })),
              },
            },
          },

          PERIOD_UPDATE_DB_RESULTS: {
            invoke: {
              id: 'periodUpdateDBResults',
              src: 'updateDBPeriodResults',
              // TODO(Jakob): Only add relevant input
              input: ({ context, event }) => ({
                context: context,
                event: event,
              }),
              onDone: {
                target: 'PERIOD_ACTIVE',
                actions: assign(({ context }) => ({
                  game: {
                    ...context.game,
                    activePeriodIx: context.game.activePeriodIx + 1,
                  },
                  user: {
                    ...context.user,
                    facts: {},
                    actions: {},
                  },
                })),
              },
              onError: {
                target: 'PERIOD_SCHEDULED',
                // TODO(Jakob): Add additional error msg
                actions: assign(({ context }) => ({
                  game: context.game,
                  user: {
                    ...context.user,
                    facts: {},
                    actions: {},
                  },
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
                      // user: transitionFn(
                      //   'PERIOD_ACTIVE_PREPARATION_TO_RUNNING',
                      //   context
                      // ),
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
                      actions: assign(({ context }) => ({
                        game: context.game,
                        // user: transitionFn(
                        //   'PERIOD_ACTIVE_RUNNING_TO_PAUSED',
                        //   context
                        // ),
                      })),
                    },
                    {
                      target: 'CONSOLIDATION',
                      guard: {
                        type: 'IS_LAST_SEGMENT',
                      },
                      actions: assign(({ context }) => ({
                        game: context.game,
                        // user: transitionFn(
                        //   'PERIOD_ACTIVE_RUNNING_TO_CONSOLIDATION',
                        //   context
                        // ),
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
                      // user: transitionFn(
                      //   'PERIOD_ACTIVE_PAUSED_TO_RUNNING',
                      //   context
                      // ),
                    })),
                  },
                },
              },

              CONSOLIDATION: {
                on: {
                  onNext: {
                    target: '#GAME_FLOW.GAME_ACTIVE.PERIOD_RESULTS',
                    actions: assign(({ context }) => ({
                      game: {
                        ...context.game,
                        activeSegmentIx: -1,
                      },
                      // user: transitionFn(
                      //   'PERIOD_ACTIVE_CONSOLIDATION_TO_PERIOD_RESULTS',
                      //   context
                      // ),
                    })),
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
                  actions: assign(({ context }) => ({
                    game: {
                      ...context.game,
                      activePeriodIx: context.game.activePeriodIx + 1,
                    },
                    // user: transitionFn(
                    //   'PERIOD_RESULTS_TO_PERIOD_ACTIVE',
                    //   context
                    // ),
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
                    // user: transitionFn(
                    //   'PERIOD_RESULTS_TO_GAME_COMPLETED',
                    //   context
                    // ),
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
