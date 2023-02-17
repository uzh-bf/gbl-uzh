import { match } from 'ts-pattern'

export enum ActionTypes {
  PERIOD_RESULTS_INITIALIZE = 'PERIOD_RESULTS_INITIALIZE',
  PERIOD_RESULTS_START = 'PERIOD_RESULTS_START',
  PERIOD_RESULTS_END = 'PERIOD_RESULTS_END',
}

export function apply(state: any, action: any) {
  console.log('periodResult', state, action)
  return match(action)
    .with({ type: ActionTypes.PERIOD_RESULTS_INITIALIZE }, () => {

      const result = {
        ...state,
        
      }
      return {
        type: action.type,
        result,
        events : [],
        notification : [],
        isDirty : true,
      }
    })
    .with({ type: ActionTypes.PERIOD_RESULTS_START }, () => {
      return state
    })
    .with({ type: ActionTypes.PERIOD_RESULTS_END }, () => {
      return state
    })
    .exhaustive()
}