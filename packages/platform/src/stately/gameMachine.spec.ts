// import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import * as DB from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'
import * as R from 'ramda'
import { repeat } from 'ramda'
import { createActor, waitFor } from 'xstate'
import { Action } from '../'
import {
  computePercentChange,
  debugLog,
  withPercentChange,
} from '../../dist/lib/util'
import {
  BaseContext,
  BaseInput,
  Transitions,
  prepareGameStateMachine,
} from './gameMachine'

interface UserInput extends BaseInput {
  stockPrice: number
  results: { facts: {}; actions: {} }[]
}

interface UserContext {
  stockPrice: number
  // Of all players, per period and segment
  results: { facts: {}; actions: {} }[]
}

const INITIAL_CAPITAL = 10000

enum ActionTypes {
  PERIOD_RESULTS_INITIALIZE = 'PERIOD_RESULTS_INITIALIZE',
  PERIOD_RESULTS_START = 'PERIOD_RESULTS_START',
  PERIOD_RESULTS_END = 'PERIOD_RESULTS_END',
}

enum ActionTypesSegmentResults {
  SEGMENT_RESULTS_INITIALIZE = 'SEGMENT_RESULTS_INITIALIZE',
  SEGMENT_RESULTS_START = 'SEGMENT_RESULTS_START',
  SEGMENT_RESULTS_END = 'SEGMENT_RESULTS_END',
}

type Actions =
  | Action<ActionTypes.PERIOD_RESULTS_INITIALIZE, any, PrismaClient>
  | Action<ActionTypes.PERIOD_RESULTS_START, any, PrismaClient>
  | Action<ActionTypes.PERIOD_RESULTS_END, any, PrismaClient>

type PayloadTypeSegmentResults = {
  // periodFacts: PeriodFacts
  // segmentFacts: PeriodSegmentFacts
  periodFacts: any
  segmentFacts: any
  segmentIx: number
}

type ActionsSegmentResults =
  | Action<
      ActionTypesSegmentResults.SEGMENT_RESULTS_INITIALIZE,
      {},
      PrismaClient
    >
  | Action<
      ActionTypesSegmentResults.SEGMENT_RESULTS_START,
      PayloadTypeSegmentResults,
      PrismaClient
    >
  | Action<
      ActionTypesSegmentResults.SEGMENT_RESULTS_END,
      PayloadTypeSegmentResults,
      PrismaClient
    >

function applyPeriodResultReducer(state: any, action: Actions) {
  let newState = {
    type: action.type,
    result: state,
    events: [],
    notification: [],
    isDirty: false,
  }
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
  }

  debugLog('PeriodResultReducer', state, action, newState)

  return newState
}

function apply(state: any, action: ActionsSegmentResults) {
  let newState = {
    type: action.type,
    events: [],
    notification: [],
    isDirty: true,
    result: {
      ...state,
    },
  }
  if (action.type === ActionTypesSegmentResults.SEGMENT_RESULTS_END) {
    const numInvestedBuckets = R.sum(Object.values(state.decisions).map(Number))
    const totalAssets =
      state.assets.bank + state.assets.bonds + state.assets.stocks

    const targetAssets = {
      bank: state.decisions.bank ? (1 / numInvestedBuckets) * totalAssets : 0,
      bonds: state.decisions.bonds ? (1 / numInvestedBuckets) * totalAssets : 0,
      stocks: state.decisions.stocks
        ? (1 / numInvestedBuckets) * totalAssets
        : 0,
    }

    const assetsWithReturns = action.payload.segmentFacts.returns.reduce(
      (acc, returns, ix) => {
        const last = acc[acc.length - 1]

        const bankWithReturn = withPercentChange(last.bank, returns.bank)
        const bondsWithReturn = withPercentChange(last.bonds, returns.bonds)
        const stocksWithReturn = withPercentChange(last.stocks, returns.stocks)

        const totalAssetsWithReturn =
          bankWithReturn + bondsWithReturn + stocksWithReturn
        const totalAssetsReturn = computePercentChange(
          totalAssetsWithReturn,
          last.totalAssets
        )

        return [
          ...acc,
          {
            ix: ix + 1,
            bank: bankWithReturn,
            bankReturn: returns.bank,
            bonds: bondsWithReturn,
            bondsReturn: returns.bonds,
            stocks: stocksWithReturn,
            stocksReturn: returns.stocks,
            totalAssets: totalAssetsWithReturn,
            totalAssetsReturn,
          },
        ]
      },
      [
        {
          ix: 0,
          ...targetAssets,
          totalAssets,
        },
      ]
    )

    const finalAssets = R.omit(
      ['ix'],
      assetsWithReturns[assetsWithReturns.length - 1]
    )

    newState = {
      type: action.type,
      events: [],
      notification: [],
      isDirty: true,
      result: {
        ...state,
        assetsWithReturns,
        assets: {
          ...R.pick(['bank', 'bonds', 'stocks', 'totalAssets'], finalAssets),
        },
        returns: {
          bank: computePercentChange(finalAssets.bank, targetAssets.bank),
          bonds: computePercentChange(finalAssets.bonds, targetAssets.bonds),
          stocks: computePercentChange(finalAssets.stocks, targetAssets.stocks),
          totalAssets: computePercentChange(
            finalAssets.totalAssets,
            state.assets.bank
          ),
        },
      },
    }
  }

  debugLog('SegmentResultReducer', state, action, newState)

  return newState
}

function computePeriodStartResults({
  results,
  players,
  activePeriodIx,
  periodFacts,
}) {
  // if the game has not started yet, generate initial PERIOD_START results
  if (activePeriodIx < 0) {
    const result = players.map((player, ix, allPlayers) => {
      // NOTE(Jakob): Other games may have actions that come from the reducer
      const actions = null
      const { result: facts } = applyPeriodResultReducer(
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

  // if the game is running, transform previous results to next
  const result = results
    // ensure that we only work on PERIOD_END results of the preceding period
    .filter((result) => result.type === DB.PlayerResultType.PERIOD_END)
    .map((result, ix, allResults) => {
      const actions = null
      const { result: facts } = applyPeriodResultReducer(result, {
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

function computeSegmentEndResults(game) {
  const results = game.activePeriod.activeSegment.results
    .filter((result) => result.type === DB.PlayerResultType.SEGMENT_END)
    .map((result, ix, allResults) => {
      const actions = null
      const { result: facts } = apply(result.facts, {
        type: ActionTypesSegmentResults.SEGMENT_RESULTS_END,
        payload: {
          // playerRole: result.player.role,
          periodFacts: game.activePeriod.facts,
          segmentFacts: game.activePeriod.activeSegment.facts,
          segmentIx: game.activePeriod.activeSegmentIx,
        },
      })

      return {
        where: {
          periodIx_segmentIx_playerId_type: {
            periodIx: game.activePeriodIx,
            segmentIx: game.activePeriod.activeSegmentIx,
            playerId: result.playerId,
            type: DB.PlayerResultType.SEGMENT_END,
          },
        },
        data: {
          facts,
          game: {
            connect: {
              id: game.id,
            },
          },
        },
      }
    })

  return {
    results: results,
  }
}

function transitionFn(
  transitionName: Transitions,
  context: BaseContext<UserContext>,
  game: any
): UserContext {
  switch (transitionName) {
    case 'PERIOD_SCHEDULED_TO_PERIOD_ACTIVE': {
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
    }

    case 'PERIOD_ACTIVE_PREPARATION_TO_RUNNING': {
      // if (!game.activePeriod?.activeSegment || !currentSegmentIx) return null
      const { results } = computeSegmentEndResults(game)
      return {
        ...context.user,
        results: results,
      }
    }

    default:
      return context.user
  }
}

const GameStateMachine = prepareGameStateMachine<UserInput, UserContext>({
  initializeUserContext: (input) => ({
    stockPrice: 100,
    results: [],
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
  let prisma
  let game
  // To take an existing game
  const gameId = 11
  // To create a new game
  const createNewGame = false
  const playerCount = 1
  const userSub = '716f7632-ed33-4701-a281-0f27bd4f6e82'
  const name = 'TestGame'

  beforeEach(async () => {
    actor = createActor(GameStateMachine, {
      input: {
        stockPrice: 100,
        results: [],
      },
    })

    prisma = new PrismaClient()

    if (createNewGame) {
      // TODO(Jakob):
      // - Maybe use the createGame fn from GameService.ts
      // - Maybe automate:
      //    1. game creation
      //    2. add periods and segments
      //    3. go to a certain period and certain segment
      game = await prisma.game.create({
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
      game = await prisma.game.findUnique({
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
    actor.send({ type: 'onNext', game: game, prisma: prisma })
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

    actor.send({ type: 'onNext', game: game })
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

    actor.send({ type: 'onNext', game: game })
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

    actor.send({ type: 'onNext', game: game })
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
