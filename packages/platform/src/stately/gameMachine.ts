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
  // TODO(Jakob): Add PERIOD_SCHEDULED_TO_PERIOD_UPDATE_DB_RESULTS
  | 'PERIOD_SCHEDULED_TO_PERIOD_ACTIVE'
  | 'PERIOD_ACTIVE_PREPARATION_TO_RUNNING'
  | 'PERIOD_ACTIVE_RUNNING_TO_PAUSED'
  | 'PERIOD_ACTIVE_PAUSED_TO_RUNNING'
  | 'PERIOD_ACTIVE_RUNNING_TO_CONSOLIDATION'
  | 'PERIOD_ACTIVE_CONSOLIDATION_TO_PERIOD_RESULTS'
  | 'PERIOD_RESULTS_TO_PERIOD_ACTIVE'
  | 'PERIOD_RESULTS_TO_GAME_COMPLETED'

export interface BaseContext<TUserContext> {
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
// 0. Currently in GameService we have activateNextPeriod and activateNextSegment
//    consider both to adopt them to our state machine. Both check the current
//    game status and depend which fn you call (by clicking a buuton), different things happen
// 1. Read results from DB in computePeriodStartResults?
// 2. We currently added computePeriodStartResults, continue with
//    computePeriodEndResults
//
// - Users should only implemnt facts and actions,
//   platform should do data handling
// - Add type for game
// - Move some functions to a util.ts file or something

type PrepareStateMachineArgs<TInput, TUserContext> = {
  initializeUserContext: (input: TInput) => TUserContext
  transitionFn?: (
    transitionName: Transitions,
    context: BaseContext<TUserContext>,
    game: any
  ) => TUserContext
}

function mapAction({ prisma, gameId, activePeriodIx, playerId }) {
  return (action) =>
    prisma.playerAction.create({
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

const initPlayersResults = async (
  players,
  results,
  activePeriodIx,
  gameId,
  prisma
) => {
  const nextPeriodIx = activePeriodIx + 1
  let extras: any[] = []
  // TODO(Jakob): Make sure results and players have same size
  const resultsOut = await Promise.all(
    players.map(async (player, ix, allPlayers) => {
      const facts = results[ix].facts
      const actions = results[ix].actions
      if (actions && actions.length > 0) {
        const mapper = mapAction({
          prisma,
          gameId,
          activePeriodIx: nextPeriodIx,
          playerId: player.id,
        })
        // TODO(Jakob): replace promise.all with prisma transaction
        const mapped = await Promise.all(actions.map(mapper))
        extras = [...extras, ...mapped]
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
  )

  return {
    results: resultsOut,
    extras,
  }
}

const updateDBPeriodResults = async (game, prisma, results, activePeriodIx) => {
  const gameId = game.id
  let extras: any[] = []
  let resultsOut: any
  if (activePeriodIx < 0) {
    console.log('initPlayerResults')
    ;({ results: resultsOut, extras } = await initPlayersResults(
      game.players,
      results,
      activePeriodIx,
      gameId,
      prisma
    ))
  } else {
    console.log('existingResults')
    // If the game is running, transform previous results to next
    resultsOut = await Promise.all(
      results
        // TODO(Jakob): We already filter when we compute the facts -> remove
        // ensure that we only work on PERIOD_END results of the preceding period
        // .filter((result) => result.type === DB.PlayerResultType.PERIOD_END)
        .map(async (result, ix, allResults) => {
          if (result.actions && result.actions.length > 0) {
            const mapper = mapAction({
              prisma,
              gameId,
              activePeriodIx: activePeriodIx,
              playerId: result.player.id,
            })
            const mapped = await Promise.all(result.actions.map(mapper))
            extras = [...extras, ...mapped]
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
    )
  }

  // update the status and active period of the current game
  // and prepare PERIOD_START results

  // TODO(Jakob): Check what the return value is needed for
  // in activateNextPeriod in GameService.ts
  const nextPeriodIx = activePeriodIx + 1
  return prisma.$transaction([
    prisma.game.update({
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

    prisma.period.update({
      where: {
        gameId_index: {
          gameId,
          index: nextPeriodIx,
        },
      },
      data: {
        results: {
          create: resultsOut,
        },
      },
    }),

    ...extras,
  ])
}

// TODO(Jakob):
// I needed to add: TUserContext extends { results: any } -> ask Roli
export function prepareGameStateMachine<
  TInput extends BaseInput,
  TUserContext extends { results: any }
>({
  initializeUserContext,
  transitionFn = (transitionName, context, game) => context.user,
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
        prisma: any
      },
    },
    actors: {
      updateDBPeriodResults: fromPromise(
        // TODO(Jakob): Complete type of game and prisma
        async ({
          input,
        }: {
          input: {
            game: any
            prisma: any
            results: any
            activePeriodIx: number
          }
        }) => {
          const results = await updateDBPeriodResults(
            input.game,
            input.prisma,
            input.results,
            input.activePeriodIx
          )
          return {
            user: {
              // TODO(Jakob): check for the rest of context.user,
              // maybe provide context as input
              results: results,
            },
          }
        }
      ),
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
              input: ({ context, event }) => ({
                game: event.game,
                prisma: event.prisma,
                results: context.user.results,
                activePeriodIx: context.game.activePeriodIx,
              }),
              onDone: {
                target: 'PERIOD_ACTIVE',
                actions: assign(({ context }) => {
                  console.log('success')
                  return {
                    game: {
                      ...context.game,
                      activePeriodIx: context.game.activePeriodIx + 1,
                    },
                    user: {
                      ...context.user,
                      results: null,
                    },
                  }
                }),
              },
              onError: {
                target: 'PERIOD_SCHEDULED',
                // TODO(Jakob): Add additional error msg
                actions: assign(({ context }) => {
                  console.log('fail')
                  return {
                    game: context.game,
                    user: {
                      ...context.user,
                      results: null,
                    },
                  }
                }),
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
                    actions: assign(({ context, event }) => ({
                      game: {
                        ...context.game,
                        activeSegmentIx: context.game.activeSegmentIx + 1,
                      },
                      user: transitionFn(
                        'PERIOD_ACTIVE_PREPARATION_TO_RUNNING',
                        context,
                        event.game
                      ),
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
