export enum ActionTypes {
  SEGMENT_RESULTS_INITIALIZE = 'SEGMENT_RESULTS_INITIALIZE',
  SEGMENT_RESULTS_START = 'SEGMENT_RESULTS_START',
  SEGMENT_RESULTS_END = 'SEGMENT_RESULTS_END',
}

export function apply(state: any, action: any) {
  console.log('segmentResult', state, action)
  return state
}
