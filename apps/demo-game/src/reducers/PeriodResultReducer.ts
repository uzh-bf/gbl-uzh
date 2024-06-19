import { Action, ResultState } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PrismaClient } from '@prisma/client'
import { produce } from 'immer'
import { match } from 'ts-pattern'

const INITIAL_CAPITAL = 10000

export enum ActionTypes {
  PERIOD_RESULTS_INITIALIZE = 'PERIOD_RESULTS_INITIALIZE',
  PERIOD_RESULTS_START = 'PERIOD_RESULTS_START',
  PERIOD_RESULTS_END = 'PERIOD_RESULTS_END',
}

type State = {
  decisions: {
    bank: boolean
    bonds: boolean
    stocks: boolean
  }
  assets: {
    bank: number
    bonds: number
    stocks: number
    totalAssets: number
  }
}

type Actions =
  | Action<ActionTypes.PERIOD_RESULTS_INITIALIZE, void, PrismaClient>
  | Action<ActionTypes.PERIOD_RESULTS_START, void, PrismaClient>
  | Action<ActionTypes.PERIOD_RESULTS_END, void, PrismaClient>

export function apply(
  state: State,
  action: Actions
): ResultState<ActionTypes, State> {
  const baseState: ResultState<ActionTypes, State> = {
    type: action.type,
    result: state,
    isDirty: false,
  }

  const newState = produce(baseState, (draft) => {
    match(action)
      .with({ type: ActionTypes.PERIOD_RESULTS_INITIALIZE }, () => {
        draft.result.decisions = {
          bank: true,
          bonds: false,
          stocks: false,
        }
        draft.result.assets = {
          bank: INITIAL_CAPITAL,
          bonds: 0,
          stocks: 0,
          totalAssets: INITIAL_CAPITAL,
        }
      })
      .with({ type: ActionTypes.PERIOD_RESULTS_START }, () => {})
      .with({ type: ActionTypes.PERIOD_RESULTS_END }, () => {})
      .exhaustive()
  })

  const resultState = produce(newState, (draft) => {
    draft.isDirty = baseState !== newState
  })

  debugLog('PeriodResultReducer', state, action, resultState)

  return resultState
}
