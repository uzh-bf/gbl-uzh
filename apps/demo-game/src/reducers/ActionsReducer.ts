import { Action } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PrismaClient } from '@prisma/client'
import decisionMachine from 'src/machines/decisionMachine'
import { createActor } from 'xstate'

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

export async function apply(state: any, action: Actions) {
  const { decision } = action.payload.playerArgs

  const actor = createActor(decisionMachine, {
    input: {
      result: state,
    },
  })

  actor.start()

  // TODO(Jakob): Redundant (only theoretically)
  actor.send({ type: 'preparationDone' })
  actor.send({
    type: 'updateInvestment',
    values: {
      actionType: action.type,
      decision: decision,
      result: state,
      isDirty: true,
    },
  })
  // TODO(Jakob): Redundant (only theoretically)
  // - Maybe this is needed to make sure we have the latest update
  actor.send({ type: 'submit' })

  const newState = actor.getSnapshot().context

  debugLog('ActionsReducer', state, action, newState)

  return newState
}
