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
        segmentIx,
        segmentCount,
        periodFacts,
        previousSegmentFacts,
        periodIx,
      } = action.payload

      const t = 1 - segmentIx / segmentCount

      let spotPrice = periodFacts.initialSpotPrice
      let dice1
      let dice2
      if (previousSegmentFacts?.spotPrice) {
        const seededSpotPrice = SEEDED_SPOT_PRICE({
          previousSpotPrice: previousSegmentFacts.spotPrice,
          randomSeed: periodFacts.randomSeed,
          distribution: trend.distribution,
          segmentIx,
          periodIx,
        })

        dice1 = seededSpotPrice.dice1
        dice2 = seededSpotPrice.dice2
        spotPrice = seededSpotPrice.spotPrice
      }
      
      return {
        type: ActionTypes.SEGMENT_INITIALIZE,
        result: state,
      }
    })
    .exhaustive()
}
