export enum ActionTypes {
  PERIOD_RESULTS_INITIALIZE = 'PERIOD_RESULTS_INITIALIZE',
  PERIOD_RESULTS_START = 'PERIOD_RESULTS_START',
  PERIOD_RESULTS_END = 'PERIOD_RESULTS_END',
}

export function apply(state: any, action: any) {
  console.log('periodResult', state, action)
  return state
}
