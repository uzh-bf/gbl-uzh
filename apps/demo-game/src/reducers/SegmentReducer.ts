import { Action } from '@gbl-uzh/platform'
import { PeriodSegmentFacts } from '@graphql/index'
import { PrismaClient } from '@prisma/client'
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
      return {
        type: ActionTypes.SEGMENT_INITIALIZE,
        result: state,
      }
    })
    .exhaustive()
}
