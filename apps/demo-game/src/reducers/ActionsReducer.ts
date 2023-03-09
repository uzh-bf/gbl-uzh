import { Action } from '@gbl-uzh/platform'
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
        segmentFacts: {
          spotPrice: number
        }
      },
      PrismaClient
    >
  | Action<
      ActionTypes.DECIDE_BONDS,
      {
        playerArgs: {
          decision: boolean
        }
        segmentFacts: {
          futuresPrice: number
        }
        periodFacts: any
      },
      PrismaClient
    >
  | Action<
      ActionTypes.DECIDE_STOCK,
      {
        playerArgs: {
          decision: boolean
        }
        segmentFacts: any
        periodFacts: any
      },
      PrismaClient
    >

export function apply(state: any, action: Actions) {
  console.log('action', state, action)

  return match(action)
    .with({ type: ActionTypes.DECIDE_BANK }, () => {
      const { decision } = action.payload.playerArgs

      return {
        type: action.type,
        result: {
          ...state,
          bankDecision: decision,
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
          bondDecision: decision,
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
          stockDecision: decision,
        },
        isDirty: true,
      }
    })
    .exhaustive()
}
