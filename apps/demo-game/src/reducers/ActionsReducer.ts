import { Action } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/types'
import { PrismaClient } from '@prisma/client'
import { produce } from 'immer'
import { match } from 'ts-pattern'

export enum ActionTypes {
  DECIDE_BANK = 'DECIDE_BANK',
  DECIDE_BONDS = 'DECIDE_BONDS',
  DECIDE_STOCK = 'DECIDE_STOCK',
}

// TODO(Jakob):
// - Ponder: Make input (state) and output (newState) always having consistent
//   properties (with optional values) vs like it is now (each case could
//   deliver a different output
// - For the ActionReducer it is trivial and consistent
//   (always the same properties as output)

type PayloadType = {
  playerArgs: {
    decision: boolean
  }
  segmentFacts: PeriodSegmentFacts
  periodFacts: PeriodFacts
}

type State = {
  decisions: {
    bank: boolean
    bonds: boolean
    stocks: boolean
  }
}

type ResultState = {
  type: ActionTypes
  result: State
  isDirty: boolean
}

type Actions =
  | Action<ActionTypes.DECIDE_BANK, PayloadType, PrismaClient>
  | Action<ActionTypes.DECIDE_BONDS, PayloadType, PrismaClient>
  | Action<ActionTypes.DECIDE_STOCK, PayloadType, PrismaClient>

export function apply(state: State, action: Actions): ResultState {
  // TODO: move this to platform? -> reducer should not have to care about isDirty and other non-user-logicstuff
  const baseState = {
    type: action.type,
    result: state,
    isDirty: false,
  }

  // TODO: the user reducer could just get the "draft" inside this function as first parameter
  // TODO: and platform would do all code around it
  const newState = produce(baseState, (draft) => {
    const { decision } = action.payload.playerArgs

    match(action)
      .with({ type: ActionTypes.DECIDE_BANK }, () => {
        draft.result.decisions.bank = decision
      })
      .with({ type: ActionTypes.DECIDE_BONDS }, () => {
        draft.result.decisions.bonds = decision
      })
      .with({ type: ActionTypes.DECIDE_STOCK }, () => {
        draft.result.decisions.stocks = decision
      })
      .exhaustive()
  })

  // this computes the isDirty flag based on whether there were changes in state from baseState to newState
  // can try it by commenting the decision changes/match, after which isDirty will log false
  // TODO: move this to platform code
  // TODO: -> goal: no isDirty computation anymore inside the reducers, instead just derive it from the state changes (or no changes)
  // TODO: after this change, we could maybe make sure that input state and output state are the same
  const resultState = produce(newState, (draft) => {
    draft.isDirty = baseState !== newState
  })

  debugLog('ActionsReducer', state, action, newState, resultState)

  return resultState
}
