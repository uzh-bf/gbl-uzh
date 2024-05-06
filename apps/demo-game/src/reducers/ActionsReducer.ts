import { Action } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PrismaClient } from '@prisma/client'
import { match } from 'ts-pattern'

export enum ActionTypes {
  DECIDE_BANK = 'DECIDE_BANK',
  DECIDE_BONDS = 'DECIDE_BONDS',
  DECIDE_STOCK = 'DECIDE_STOCK',
}

type Actions =
  | Action<
      ActionTypes.DECIDE_BANK,
      {
        playerArgs: {
          decision: boolean
        }
        segmentFacts: {}
        periodFacts: {}
      },
      PrismaClient
    >
  | Action<
      ActionTypes.DECIDE_BONDS,
      {
        playerArgs: {
          decision: boolean
        }
        segmentFacts: {}
        periodFacts: {}
      },
      PrismaClient
    >
  | Action<
      ActionTypes.DECIDE_STOCK,
      {
        playerArgs: {
          decision: boolean
        }
        segmentFacts: {}
        periodFacts: {}
      },
      PrismaClient
    >

export function apply(state: any, action: Actions) {
  const output = {
    type: action.type,
    result: state,
    isDirty: true,
  }

  const { decision } = action.payload.playerArgs

  const newState = match(action)
    .with({ type: ActionTypes.DECIDE_BANK }, () => {
      output.result.decisions.bank = decision
      return output
    })
    .with({ type: ActionTypes.DECIDE_BONDS }, () => {
      output.result.decisions.bonds = decision
      return output
    })
    .with({ type: ActionTypes.DECIDE_STOCK }, () => {
      output.result.decisions.stocks = decision
      return output
    })
    .exhaustive()

  debugLog('ActionsReducer', state, action, newState)

  return newState
}
