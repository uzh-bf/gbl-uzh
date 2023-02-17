import { PeriodSegmentFacts } from 'src/graphql/types/Period'
import { match } from 'ts-pattern'

export enum ActionTypes {
  SEGMENT_RESULTS_INITIALIZE = 'SEGMENT_RESULTS_INITIALIZE',
  SEGMENT_RESULTS_START = 'SEGMENT_RESULTS_START',
  SEGMENT_RESULTS_END = 'SEGMENT_RESULTS_END',
}

export function apply(state: any, action: any) {
  console.log('segmentResult', state, action)

  return match(action)
    .with({ type: ActionTypes.SEGMENT_RESULTS_INITIALIZE }, () => {
      const result = {
        ...state,
        bankDecision: false,
        bondDecision: false,
        stockDecision: false,
      }

      return {
        type: ActionTypes.SEGMENT_RESULTS_INITIALIZE,
        result: result,
    }})
    .with({ type: ActionTypes.SEGMENT_RESULTS_START }, () => {
      const result = {
        ...state,
        bankDecision: false,
        bondDecision: false,
        stockDecision: false,
      }
      
      return {
        type: ActionTypes.SEGMENT_RESULTS_START,
        result: result,
    }})
    .with({ type: ActionTypes.SEGMENT_RESULTS_END }, () => {
      const result = {
        ...state,
        bankDecision: false,
        bondDecision: false,
        stockDecision: false,
      }
      
      return {
        type: ActionTypes.SEGMENT_RESULTS_START,
        result: result,
    }})
    .exhaustive()
}
