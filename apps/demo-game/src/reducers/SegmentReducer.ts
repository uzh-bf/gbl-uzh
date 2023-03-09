import { Action } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
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
  debugLog('SegmentReducer', state, action)

  return match(action)
    .with({ type: ActionTypes.SEGMENT_INITIALIZE }, () => {
      return {
        type: action.type,
        result: state,
        events: [],
        notification: [],
        isDirty: false,
      }
    })
    .exhaustive()
}
