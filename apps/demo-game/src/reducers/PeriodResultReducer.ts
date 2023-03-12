import { Action } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PrismaClient } from '@prisma/client'
import { match } from 'ts-pattern'

const INITIAL_CAPITAL = 10000

export enum ActionTypes {
  PERIOD_RESULTS_INITIALIZE = 'PERIOD_RESULTS_INITIALIZE',
  PERIOD_RESULTS_START = 'PERIOD_RESULTS_START',
  PERIOD_RESULTS_END = 'PERIOD_RESULTS_END',
}

type Actions =
  | Action<ActionTypes.PERIOD_RESULTS_INITIALIZE, any, PrismaClient>
  | Action<ActionTypes.PERIOD_RESULTS_START, any, PrismaClient>
  | Action<ActionTypes.PERIOD_RESULTS_END, any, PrismaClient>

export function apply(state: any, action: Actions) {
  const newState = match(action)
    .with({ type: ActionTypes.PERIOD_RESULTS_INITIALIZE }, () => {
      return {
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
          },
        },
        events: [],
        notification: [],
        isDirty: false,
      }
    })
    .with({ type: ActionTypes.PERIOD_RESULTS_START }, () => {
      return {
        type: action.type,
        result: state,
        events: [],
        notification: [],
        isDirty: false,
      }
    })
    .with({ type: ActionTypes.PERIOD_RESULTS_END }, () => {
      return {
        type: action.type,
        result: state,
        events: [],
        notification: [],
        isDirty: false,
      }
    })
    .exhaustive()

  debugLog('PeriodResultReducer', state, action, newState)

  return newState
}
