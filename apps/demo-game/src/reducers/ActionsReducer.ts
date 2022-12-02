import { match } from 'ts-pattern'

export enum ActionTypes {
  DECIDE_BANK = 'DECIDE_BANK',
  DECIDE_BONDS = 'DECIDE_BONDS',
  DECIDE_STOCK = 'DECIDE_STOCK',
}

export function apply(state: any, action: Actions) {
  console.log('segment', state, action)

  return match(action)
    .with({ type: ActionTypes.DECIDE_BANK }, () => {
      const {
        segmentIx,
        segmentCount,
        periodFacts,
        previousSegmentFacts,
        periodIx,
      } = action.payload

      //periodFacts.
      return {
        type: action.type,
        result: state,
      }
    })
    .with({ type: ActionTypes.DECIDE_BONDS }, () => {

      return {
        type: action.type,
        result: state,
      }
    })
    .with({ type: ActionTypes.DECIDE_BANK }, () => {
      
      return {
        type: action.type,
        result: state,
      }
    })
    .exhaustive()
}
