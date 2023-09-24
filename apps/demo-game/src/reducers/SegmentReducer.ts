import { Action } from '@gbl-uzh/platform'
import {
  computeScenarioOutcome,
  debugLog,
  diceRoll,
} from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { PrismaClient } from '@prisma/client'
import * as R from 'ramda'
import { P, match } from 'ts-pattern'

export enum ActionTypes {
  SEGMENT_INITIALIZE = 'SEGMENT_INITIALIZE',
}

type Actions = Action<
  ActionTypes.SEGMENT_INITIALIZE,
  {
    segmentIx: number
    segmentCount: number
    periodIx: number
    periodFacts: PeriodFacts
    previousSegmentFacts?: PeriodSegmentFacts
  },
  PrismaClient
>

export function apply(state: any, action: Actions) {
  const newState = match(action)
    .with(
      { type: ActionTypes.SEGMENT_INITIALIZE, payload: P.select() },
      ({ periodFacts, segmentIx }) => {
        // rollsPerSegment can be configured on a period level
        // this will allow, e.g., to use quarters (3x) in the first period and years (12x) thereafter
        const diceRolls = R.range(0, periodFacts.rollsPerSegment).map(
          (rollIx) => {
            const bondsAndStocks = diceRoll([
              periodFacts.scenario.seed,
              segmentIx,
              rollIx,
              0,
            ])
            return {
              bonds:
                diceRoll([periodFacts.scenario.seed, segmentIx, rollIx, 1]) +
                bondsAndStocks,
              stocks:
                diceRoll([periodFacts.scenario.seed, segmentIx, rollIx, 2]) +
                bondsAndStocks,
            }
          }
        )

        const returns = diceRolls.map((rolls) => ({
          bank: action.payload.periodFacts.scenario.bankReturn,
          bonds: computeScenarioOutcome(
            action.payload.periodFacts.scenario.trendBonds,
            action.payload.periodFacts.scenario.gapBonds,
            rolls.bonds
          ),
          stocks: computeScenarioOutcome(
            action.payload.periodFacts.scenario.trendStocks,
            action.payload.periodFacts.scenario.gapStocks,
            rolls.stocks
          ),
        }))

        return {
          type: action.type,
          result: {
            ...state,
            diceRolls,
            returns,
          },
          events: [],
          notification: [],
          isDirty: false,
        }
      }
    )
    .exhaustive()

  debugLog('SegmentReducer', state, action, newState)

  return newState
}
