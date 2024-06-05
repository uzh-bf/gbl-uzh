import { Action } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { PrismaClient } from '@prisma/client'

export enum ActionTypes {
  PERIOD_INITIALIZE = 'PERIOD_INITIALIZE',
  PERIOD_CONSOLIDATE = 'PERIOD_CONSOLIDATE',
}

type Actions =
  | Action<
      ActionTypes.PERIOD_INITIALIZE,
      {
        periodIx: number
        periodFacts: PeriodFacts
        previousPeriodFacts?: PeriodFacts
        previousSegmentFacts?: PeriodSegmentFacts
      },
      PrismaClient
    >
  | Action<
      ActionTypes.PERIOD_CONSOLIDATE,
      {
        periodIx: number
        previousSegmentFacts?: PeriodSegmentFacts
      },
      PrismaClient
    >

export function apply(state: any, action: Actions) {
  let newState = {
    type: action.type,
    result: state,
    isDirty: true,
  }

  switch (action.type) {
    case ActionTypes.PERIOD_CONSOLIDATE:
      newState.isDirty = false
      break

    case ActionTypes.PERIOD_INITIALIZE:
    default:
      break
  }

  debugLog('PeriodReducer', state, action, newState)

  return newState
}
