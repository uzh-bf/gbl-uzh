import * as DB from '@prisma/client'
import { PrismaClient } from '@prisma/client'
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
  facts: any
  actions: any
}

// TODO(Jakob): Add facts and actions
interface UserContext {
  stockPrice: number
  facts: any
  actions: any
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
        results: undefined,
        players: game.players,
        activePeriodIx: context.game.activePeriodIx,
        // TODO(Jakob): Why 0 index?
        periodFacts: game.periods?.[0].facts,
      })

      return {
        ...context.user,
        stockPrice: context.user.stockPrice + 10,
        facts: results.facts,
        actions: results.actions,
      }

    default:
      return context.user
  }
}

const GameStateMachine = prepareGameStateMachine<UserInput, UserContext>({
  initializeUserContext: (input) => ({
    stockPrice: 100,
    facts: {},
    actions: {},
  }),
  transitionFn,
})

describe('GameStateMachine', () => {
  // TODO(Jakob):
  // - Users should only implemnt facts and actions,
  //   platform should do data handling
  let game = {
    // gameId: 0,
    // periodFacts: {},

    id: 11,
    status: 'RESULTS',
    name: '11',
    activePeriodIx: 1,
    activePeriodId: 20,
    // ownerId: '716f7632-ed33-4701-a281-0f27bd4f6e82',
    players: [
      {
        id: 'dc426b47-1dfe-4024-8c52-5df4c7aab000',
        number: 1,
        name: 'Team 1',
        avatar: '',
        location: '',
        color: 'White',
        isReady: false,
        experience: 0,
        experienceToNext: 100,
        levelIx: 0,
        tutorialCompleted: false,
        facts: {},
        role: null,
        token: 'zpN4CRT0yv3QOshY8v_-O',
        achievementKeys: [],
        achievementIds: [],
        completedLearningElementIds: [],
        visitedStoryElementIds: [],
        gameId: 11,
      },
    ],
    periods: [
      {
        id: 19,
        index: 0,
        // facts: [Object],
        facts: {},
        activeSegmentIx: 1,
        activeSegmentId: 35,
        nextPeriodId: 20,
        gameId: 11,
      },
      {
        id: 20,
        index: 1,
        // facts: [Object],
        facts: {},
        activeSegmentIx: -1,
        activeSegmentId: null,
        nextPeriodId: 28,
        gameId: 11,
      },
    ],
    activePeriod: {
      id: 20,
      index: 1,
      facts: { scenario: [Object], rollsPerSegment: 3 },
      activeSegmentIx: -1,
      activeSegmentId: null,
      nextPeriodId: 28,
      gameId: 11,
      results: [],
      nextPeriod: {
        id: 28,
        index: 2,
        // facts: [Object],
        facts: {},
        activeSegmentIx: -1,
        activeSegmentId: null,
        nextPeriodId: 29,
        gameId: 11,
      },
      previousPeriod: [[Object]],
      activeSegment: null,
      decisions: [],
    },
  }
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

  beforeEach(() => {
    actor = createActor(GameStateMachine, {
      input: {
        stockPrice: 100,
        facts: {},
        actions: {},
      },
    })

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

    // PERIOD_SCHEDULED_TO_PERIOD_ACTIVE
    actor.send({
      type: 'onNext',
      game: game,
    })
    expect(actor.getSnapshot().value).toMatchObject({
      GAME_ACTIVE: 'PERIOD_UPDATE_DB_RESULTS',
    })
    expect(actor.getSnapshot().context.game.activePeriodIx).toEqual(-1)
    expect(actor.getSnapshot().context.game.activeSegmentIx).toEqual(-1)
    expect(actor.getSnapshot().context.user).toMatchObject({
      stockPrice: 110,
      facts: {},
      actions: {},
    })

    actor.send({ type: 'onNext' })
    await waitFor(actor, (state) =>
      state.matches({
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
