import { Action } from '@gbl-uzh/platform'
import { PeriodSegmentFacts, ValueTypes } from '@graphql/index'
import { PrismaClient } from '@prisma/client'
import { result } from 'nexus/dist/utils'
import { match } from 'ts-pattern'

export enum ActionTypes {
  SEGMENT_INITIALIZE = 'SEGMENT_INITIALIZE',
}

type Actions = Action<
  ActionTypes.SEGMENT_INITIALIZE,
  {
    segmentIx: number
    segmentCount: number
    periodIx: number
    periodFacts: PeriodSegmentFacts
    previousSegmentFacts?: PeriodSegmentFacts
  },
  PrismaClient
>

export function apply(state: any, action: Actions) {
  console.log('segment', state, action)

  return match(action)
    .with({ type: ActionTypes.SEGMENT_INITIALIZE }, () => {
      const {
        segmentIx,
        segmentCount,
        periodFacts,
        previousSegmentFacts,
        periodIx,
      } = action.payload

      const nextPeriodPortfolio : ValueTypes<number> = {
        bank: 0,
        bonds: 0,
        stock: 0
      };

      const result = {
        ...state,

      };

      return {
        type: ActionTypes.SEGMENT_INITIALIZE,
        result: result,
      }
    })
    .exhaustive()
}
