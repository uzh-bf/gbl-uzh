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
      const {
        // segmentIx,
        // segmentCount,
        // periodFacts = {} as PeriodSegmentFacts,
        previousSegmentFacts = {} as PeriodSegmentFacts,
        // periodIx,
      } = action.payload

      const result = {
        ...state,
        dieMonth1: {
          bonds: Math.ceil(Math.random() * 6),
          stock: Math.ceil(Math.random() * 6),
          bondsAndStock: Math.ceil(Math.random() * 6),
        },
        dieMonth2: {
          bonds: Math.ceil(Math.random() * 6),
          stock: Math.ceil(Math.random() * 6),
          bondsAndStock: Math.ceil(Math.random() * 6),
        },
        dieMonth3: {
          bonds: Math.ceil(Math.random() * 6),
          stock: Math.ceil(Math.random() * 6),
          bondsAndStock: Math.ceil(Math.random() * 6),
        },
        portfolio: {
          bank: 3333.33,
          bonds: 3333.33,
          stock: 3333.33,
        },
        previousInvestmentDecisions: previousSegmentFacts?.investmentDecision,
      }

      return {
        type: ActionTypes.SEGMENT_INITIALIZE,
        result: result,
      }
    })
    .exhaustive()
}
