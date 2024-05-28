import * as DB from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import { repeat } from 'ramda'
import { createActor, waitFor } from 'xstate'
import { Action } from '../'
import { debugLog } from '../../dist/lib/util'
import {
  BaseContext,
  BaseInput,
  Transitions,
  prepareGameStateMachine,
} from './gameMachine'

interface UserInput extends BaseInput {
  stockPrice: number
  results: any
}

interface UserContext {
  stockPrice: number
  // NOTE(Jakob): results includes facts and actions of all players
  results: any
}

const INITIAL_CAPITAL = 10000

enum ActionTypes {
  PERIOD_RESULTS_INITIALIZE = 'PERIOD_RESULTS_INITIALIZE',
  PERIOD_RESULTS_START = 'PERIOD_RESULTS_START',
  PERIOD_RESULTS_END = 'PERIOD_RESULTS_END',
}

type Actions =
  | Action<ActionTypes.PERIOD_RESULTS_INITIALIZE, any, PrismaClient>
  | Action<ActionTypes.PERIOD_RESULTS_START, any, PrismaClient>
  | Action<ActionTypes.PERIOD_RESULTS_END, any, PrismaClient>

function apply(state: any, action: Actions) {
  let newState
  if (action.type === ActionTypes.PERIOD_RESULTS_INITIALIZE) {
    newState = {
      type: action.type,
      result: {
        decisions: {
          bank: true,
          bonds: false,
          stocks: false,
        },
        assets: {
          bank: INITIAL_CAPITAL,
          bonds: 0,
          stocks: 0,
          totalAssets: INITIAL_CAPITAL,
        },
      },
      events: [],
      notification: [],
      isDirty: false,
    }
  } else if (action.type === ActionTypes.PERIOD_RESULTS_START) {
    newState = {
      type: action.type,
      result: state,
      events: [],
      notification: [],
      isDirty: false,
    }
  } else if (action.type === ActionTypes.PERIOD_RESULTS_END) {
    newState = {
      type: action.type,
      result: state,
      events: [],
      notification: [],
      isDirty: false,
    }
  }

  debugLog('PeriodResultReducer', state, action, newState)

  return newState
}

function computePeriodStartResults({
  results,
  players,
  activePeriodIx,
  periodFacts,
}) {
  const currentPeriodIx = activePeriodIx
  const nextPeriodIx = currentPeriodIx + 1

  // if the game is running, transform previous results to next
  if (currentPeriodIx >= 0) {
    const result = results
      // ensure that we only work on PERIOD_END results of the preceding period
      .filter((result) => result.type === DB.PlayerResultType.PERIOD_END)
      .map((result, ix, allResults) => {
        const { result: facts, actions } = apply(result, {
          type: ActionTypes.PERIOD_RESULTS_START,
          payload: {
            playerRole: result.player.role ?? result.player.connect.role,
            periodFacts,
          },
        })

        return {
          facts: facts,
          actions: actions,
        }
      })
    return {
      results: result,
    }
  }

  // if the game has not started yet, generate initial PERIOD_START results
  const result = players.map((player, ix, allPlayers) => {
    const { result: facts, actions } = apply(
      {},
      {
        type: ActionTypes.PERIOD_RESULTS_INITIALIZE,
        payload: {
          playerRole: player.role,
          periodFacts,
        },
      }
    )

    return {
      facts: facts,
      actions: actions,
    }
  })

  return {
    results: result,
  }
}

function transitionFn(
  transitionName: Transitions,
  context: BaseContext<UserContext>,
  game: any
): UserContext {
  switch (transitionName) {
    case 'PERIOD_SCHEDULED_TO_PERIOD_ACTIVE':
      const { results } = computePeriodStartResults({
        // TODO(Jakob): Read results from DB?
        results: context.user.results,
        players: game.players,
        activePeriodIx: context.game.activePeriodIx,
        // TODO(Jakob): Why 0 index?
        periodFacts: game.periods?.[0].facts,
      })

      return {
        ...context.user,
        stockPrice: context.user.stockPrice + 10,
        results: results,
      }

    default:
      return context.user
  }
}

const GameStateMachine = prepareGameStateMachine<UserInput, UserContext>({
  initializeUserContext: (input) => ({
    stockPrice: 100,
    results: {},
  }),
  transitionFn,
})

describe('GameStateMachine', () => {
  // [
  //   ('ActionsReducer',
  // // state === facts ----------------------------------------------------------
  //   {
  //     assets: { bank: 10000, bonds: 0, stocks: 0, totalAssets: 10000 },
  //     decisions: { bank: true, bonds: true, stocks: false },
  //   },
  // // action -------------------------------------------------------------------
  //   {
  //     type: 'DECIDE_BONDS',
  //     payload: {
  //       playerArgs: { decision: false },
  //       segmentFacts: {
  //         returns: [
  //           { bank: 0.002, bonds: -0.0019, stocks: 0.0065 },
  //           { bank: 0.002, bonds: 0.0081, stocks: -0.0935 },
  //           { bank: 0.002, bonds: -0.0019, stocks: 0.0065 },
  //         ],
  //         diceRolls: [
  //           { bonds: 6, stocks: 7 },
  //           { bonds: 8, stocks: 3 },
  //           { bonds: 6, stocks: 7 },
  //         ],
  //       },
  //       periodFacts: {
  //         scenario: {
  //           seed: 0,
  //           gapBonds: 0.005,
  //           gapStocks: 0.025,
  //           bankReturn: 0.002,
  //           trendBonds: 0.0031,
  //           trendStocks: 0.0065,
  //         },
  //         rollsPerSegment: 3,
  //       },
  //     },
  //   },
  // // new state ----------------------------------------------------------------
  //   {
  //     type: 'DECIDE_BONDS',
  //     result: {
  //       assets: { bank: 10000, bonds: 0, stocks: 0, totalAssets: 10000 },
  //       decisions: { bank: true, bonds: false, stocks: false },
  //     },
  //     isDirty: true,
  //   })
  // ]

  // 'SegmentResultReducer',
  // // state === facts ----------------------------------------------------------
  // {
  //   assets: { bank: 10000, bonds: 0, stocks: 0, totalAssets: 10000 },
  //   decisions: { bank: true, bonds: true, stocks: true },
  // },
  // // action -------------------------------------------------------------------
  // {
  //   type: 'SEGMENT_RESULTS_END',
  //   payload: {
  //     playerRole: null,
  //     periodFacts: {
  //       scenario: {
  //         seed: 0,
  //         gapBonds: 0.005,
  //         gapStocks: 0.025,
  //         bankReturn: 0.002,
  //         trendBonds: 0.0031,
  //         trendStocks: 0.0065,
  //       },
  //       rollsPerSegment: 3,
  //     },
  //     segmentFacts: {
  //       returns: [
  //         { bank: 0.002, bonds: -0.0019, stocks: 0.0065 },
  //         { bank: 0.002, bonds: 0.0081, stocks: -0.0935 },
  //         { bank: 0.002, bonds: -0.0019, stocks: 0.0065 },
  //       ],
  //       diceRolls: [
  //         { bonds: 6, stocks: 7 },
  //         { bonds: 8, stocks: 3 },
  //         { bonds: 6, stocks: 7 },
  //       ],
  //     },
  //     segmentIx: 0,
  //   },
  // },
  // // new state ----------------------------------------------------------------
  // {
  //   type: 'SEGMENT_RESULTS_END',
  //   events: [],
  //   notification: [],
  //   isDirty: true,
  //   result: {
  //     assets: {
  //       bank: 3353.3733599999996,
  //       bonds: 3347.5761974699994,
  //       stocks: 3061.075998749999,
  //       totalAssets: 9762.025556219998,
  //     },
  //     decisions: { bank: true, bonds: true, stocks: true },
  // // TODO(Jakob): The new state has more data: assetsWithReturns & returns,
  // // -> state is not consistent! Either name is misleading or we should
  // // have a consistent in- and output
  //     assetsWithReturns: [
  //       {
  //         ix: 0,
  //         bank: 3333.333333333333,
  //         bonds: 3333.333333333333,
  //         stocks: 3333.333333333333,
  //         totalAssets: 10000,
  //       },
  //       {
  //         ix: 1,
  //         bank: 3339.9999999999995,
  //         bankReturn: 0.002,
  //         bonds: 3326.9999999999995,
  //         bondsReturn: -0.0019,
  //         stocks: 3354.9999999999995,
  //         stocksReturn: 0.0065,
  //         totalAssets: 10021.999999999998,
  //         totalAssetsReturn: 0.002199999999999818,
  //       },
  //       {
  //         ix: 2,
  //         bank: 3346.6799999999994,
  //         bankReturn: 0.002,
  //         bonds: 3353.9486999999995,
  //         bondsReturn: 0.0081,
  //         stocks: 3041.3074999999994,
  //         stocksReturn: -0.0935,
  //         totalAssets: 9741.936199999998,
  //         totalAssetsReturn: -0.027944901217321887,
  //       },
  //       {
  //         ix: 3,
  //         bank: 3353.3733599999996,
  //         bankReturn: 0.002,
  //         bonds: 3347.5761974699994,
  //         bondsReturn: -0.0019,
  //         stocks: 3061.075998749999,
  //         stocksReturn: 0.0065,
  //         totalAssets: 9762.025556219998,
  //         totalAssetsReturn: 0.0020621523080801844,
  //       },
  //     ],
  //     returns: {
  //       bank: 0.00601200799999997,
  //       bonds: 0.004272859240999924,
  //       stocks: -0.08167720037500018,
  //       totalAssets: -0.02379744437800018,
  //     },
  //   },
  // }

  let actor
  let prismaClient
  let game
  const createNewGame = false
  const gameId = 11
  const playerCount = 1
  const userSub = '716f7632-ed33-4701-a281-0f27bd4f6e82'
  const name = 'TestGame'

  beforeEach(async () => {
    actor = createActor(GameStateMachine, {
      input: {
        stockPrice: 100,
        results: {},
      },
    })

    prismaClient = new PrismaClient()

    if (createNewGame) {
      // TODO(Jakob):
      // - Maybe use the createGame fn from GameService.ts
      // - Maybe automate:
      //    1. game creation
      //    2. add periods and segments
      //    3. go to a certain period and certain segment
      game = await prismaClient.game.create({
        data: {
          name,
          owner: {
            connect: {
              id: userSub,
            },
          },
          players: {
            create: repeat(0, playerCount).map((_, ix) => {
              return {
                facts: {},
                token: nanoid(),
                role: null,
                number: playerCount - ix,
                name: `Team ${playerCount - ix}`,
                level: {
                  connect: {
                    index: 0,
                  },
                },
              }
            }),
          },
        },
        include: {
          players: true,
          periods: true,
        },
      })
    } else {
      game = await prismaClient.game.findUnique({
        where: {
          id: gameId,
        },
        include: {
          players: true,
          periods: true,
          activePeriod: {
            include: {
              results: {
                include: {
                  player: true,
                },
              },
              nextPeriod: true,
              previousPeriod: {
                include: {
                  results: {
                    include: {
                      player: true,
                    },
                  },
                },
              },
              activeSegment: {
                include: {
                  results: {
                    include: {
                      player: true,
                    },
                  },
                },
              },
              decisions: {
                include: {
                  player: true,
                },
              },
            },
          },
        },
      })
    }

    actor.start()
  })

  it('supports basic workflow', async () => {
    // actor.send({ type: 'addPeriod' })
    // actor.send({ type: 'addSegment' })
    // actor.send({ type: 'addSegment' })
    // actor.send({ type: 'addPeriod' })

    expect(actor.getSnapshot().value).toEqual('GAME_PREPARED')
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(-1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)
    expect(actor.getSnapshot().context.user).toMatchObject({
      stockPrice: 100,
    })

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: 'PERIOD_SCHEDULED',
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(-1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)
    expect(actor.getSnapshot().context.user).toMatchObject({
      stockPrice: 100,
    })

    // PERIOD_SCHEDULED_TO_PERIOD_UPDATE_DB_RESULTS
    actor.send({ type: 'onNext', game: game, prisma: prismaClient })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: 'PERIOD_UPDATE_DB_RESULTS',
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(-1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)
    // expect(actor.getSnapshot().context.user).toMatchObject({
    //   stockPrice: 110,
    //   results: null,
    // })

    // TODO(Jakob): Do also an example where it fails
    await waitFor(actor, (snapshot) =>
      snapshot.matches({
        GAME_ACTIVE: { PERIOD_ACTIVE: 'PREPARATION' },
      })
    )
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'PREPARATION' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)
    expect(actor.getSnapshot().context.user).toMatchObject({
      stockPrice: 110,
      results: null,
    })

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'RUNNING' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(0)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'PAUSED' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(0)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'RUNNING' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'CONSOLIDATION' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: 'PERIOD_RESULTS',
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(0)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'PREPARATION' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'RUNNING' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(0)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'PAUSED' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(0)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'RUNNING' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: { PERIOD_ACTIVE: 'CONSOLIDATION' },
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: 'PERIOD_RESULTS',
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toEqual('GAME_COMPLETED')
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(-1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)

    actor.send({ type: 'onNext' })
    expect(actor.getSnapshot().value).toEqual('GAME_COMPLETED')
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(-1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)
  })
})

export {}
