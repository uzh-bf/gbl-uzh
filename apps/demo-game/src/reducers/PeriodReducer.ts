import { Action } from '@gbl-uzh/platform'
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
  console.log('period', state, action)

  return match(action)
    .with({ type: ActionTypes.PERIOD_INITIALIZE }, () => {
      return {
        type: ActionTypes.PERIOD_INITIALIZE,
        result: state,
      }
    })
    .with({ type: ActionTypes.PERIOD_CONSOLIDATE }, () => {
      return {
        type: ActionTypes.PERIOD_INITIALIZE,
        result: state,
      }
    })
    .exhaustive()
}
