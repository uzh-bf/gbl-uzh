import { Action } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PrismaClient } from '@prisma/client'
import { match } from 'ts-pattern'

const INITIAL_CAPITAL = 10000

export enum ActionTypes {
  SEGMENT_RESULTS_INITIALIZE = 'SEGMENT_RESULTS_INITIALIZE',
  SEGMENT_RESULTS_START = 'SEGMENT_RESULTS_START',
  SEGMENT_RESULTS_END = 'SEGMENT_RESULTS_END',
}

type Actions =
  | Action<ActionTypes.SEGMENT_RESULTS_INITIALIZE, any, PrismaClient>
  | Action<ActionTypes.SEGMENT_RESULTS_START, any, PrismaClient>
  | Action<ActionTypes.SEGMENT_RESULTS_END, any, PrismaClient>

export function apply(state: any, action: Actions) {
  debugLog('SegmentResultReducer', state, action)

  return match(action)
    .with({ type: ActionTypes.SEGMENT_RESULTS_INITIALIZE }, () => {
      return {
        type: action.type,
        events: [],
        notification: [],
        isDirty: true,
        result: {
          ...state,
          decisions: {
            bank: true,
            bonds: true,
            stocks: true,
          },
          assets: {
            bank: INITIAL_CAPITAL,
            bonds: 0,
            stocks: 0,
          },
        },
      }
    })
    .with({ type: ActionTypes.SEGMENT_RESULTS_START }, () => {
      return {
        type: action.type,
        events: [],
        notification: [],
        isDirty: true,
        result: {
          ...state,
        },
      }
    })
    .with({ type: ActionTypes.SEGMENT_RESULTS_END }, () => {
      const diceRolls =
        action.payload.periodFacts.diceRolls[action.payload.segmentIx]

      const returns = {
        bank: action.payload.periodFacts.bankReturn,
        bonds:
          action.payload.periodFacts.trendBonds +
          (diceRolls.bonds - 7) * action.payload.periodFacts.gapBonds,
        stocks:
          action.payload.periodFacts.trendStocks +
          (diceRolls.stocks - 7) * action.payload.periodFacts.gapStocks,
      }

      return {
        type: action.type,
        events: [],
        notification: [],
        isDirty: true,
        result: {
          ...state,
          returns,
        },
      }
    })
    .exhaustive()
}
