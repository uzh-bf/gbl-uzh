import { Action } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PrismaClient } from '@prisma/client'

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
  segmentFacts: {}
  periodFacts: {}
}

type Actions =
  | Action<ActionTypes.DECIDE_BANK, PayloadType, PrismaClient>
  | Action<ActionTypes.DECIDE_BONDS, PayloadType, PrismaClient>
  | Action<ActionTypes.DECIDE_STOCK, PayloadType, PrismaClient>

export function apply(state: any, action: Actions) {
  const newState = {
    type: action.type,
    result: state,
    isDirty: true,
  }

  const { decision } = action.payload.playerArgs

  switch (action.type) {
    case ActionTypes.DECIDE_BANK:
      newState.result.decisions.bank = decision
      break
    case ActionTypes.DECIDE_BONDS:
      newState.result.decisions.bonds = decision
      break
    case ActionTypes.DECIDE_STOCK:
      newState.result.decisions.stocks = decision
      break
    default:
      break
  }

  debugLog('ActionsReducer', state, action, newState)

  return newState
}
