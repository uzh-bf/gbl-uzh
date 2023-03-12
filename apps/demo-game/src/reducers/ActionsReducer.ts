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
  const newState = match(action)
    .with({ type: ActionTypes.DECIDE_BANK }, () => {
      const { decision } = action.payload.playerArgs

      return {
        type: action.type,
        result: {
          ...state,
          decisions: {
            ...state.decisions,
            bank: decision,
          },
        },
        isDirty: true,
      }
    })
    .with({ type: ActionTypes.DECIDE_BONDS }, () => {
      const { decision } = action.payload.playerArgs

      return {
        type: action.type,
        result: {
          ...state,
          decisions: {
            ...state.decisions,
            bonds: decision,
          },
        },
        isDirty: true,
      }
    })
    .with({ type: ActionTypes.DECIDE_STOCK }, () => {
      const { decision } = action.payload.playerArgs

      return {
        type: action.type,
        result: {
          ...state,
          decisions: {
            ...state.decisions,
            stocks: decision,
          },
        },
        isDirty: true,
      }
    })
    .exhaustive()

  debugLog('ActionsReducer', state, action, newState)

  return newState
}
