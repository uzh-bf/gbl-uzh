import { Action } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { PrismaClient } from '@prisma/client'
import { match } from 'ts-pattern'

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
  const newState = match(action)
    .with({ type: ActionTypes.PERIOD_INITIALIZE }, () => {
      return {
        type: action.type,
        result: {
          ...state,
        },
        isDirty: true,
      }
    })
    .with({ type: ActionTypes.PERIOD_CONSOLIDATE }, () => {
      return {
        type: action.type,
        result: state,
        events: [],
        notification: [],
        isDirty: false,
      }
    })
    .exhaustive()

  debugLog('PeriodReducer', state, action, newState)

  return newState
}
