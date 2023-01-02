import { Action } from '@gbl-uzh/platform'
import { PeriodSegmentFacts } from '@graphql/index'
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
        periodFacts = {} as PeriodSegmentFacts,
        previousSegmentFacts = {} as PeriodSegmentFacts,
        periodIx,
      } = action.payload

      periodFacts.dieMonth1.bonds = Math.ceil(Math.random() * 6);
      periodFacts.dieMonth1.stock = Math.ceil(Math.random() * 6);
      periodFacts.dieMonth1.bondsAndStock = Math.ceil(Math.random() * 6);
      periodFacts.dieMonth2.bonds = Math.ceil(Math.random() * 6);
      periodFacts.dieMonth2.stock = Math.ceil(Math.random() * 6);
      periodFacts.dieMonth2.bondsAndStock = Math.ceil(Math.random() * 6);
      periodFacts.dieMonth3.bonds = Math.ceil(Math.random() * 6);
      periodFacts.dieMonth3.stock = Math.ceil(Math.random() * 6);
      periodFacts.dieMonth3.bondsAndStock = Math.ceil(Math.random() * 6);

      periodFacts.portfolio.bank = 0.0;//previousSegmentFacts.portfolio.bank;
      periodFacts.portfolio.bonds = 0.0;//previousSegmentFacts.portfolio.bonds;
      periodFacts.portfolio.stock = 0.0;//previousSegmentFacts.portfolio.stock;

      periodFacts.investmentDecision.bank = Math.random();
      periodFacts.investmentDecision.bonds = Math.random();
      periodFacts.investmentDecision.stock = Math.random();
      
      const result = {
          ...state,
          periodFacts
      }

      return {
        type: ActionTypes.SEGMENT_INITIALIZE,
        result: result,
      }
    })
    .exhaustive()
}
