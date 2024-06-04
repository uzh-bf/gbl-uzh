import { Action } from '@gbl-uzh/platform'
import {
  computeScenarioOutcome,
  debugLog,
  diceRoll,
} from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { PrismaClient } from '@prisma/client'
import * as R from 'ramda'

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
  let newState = {
    type: action.type,
    result: {},
    events: [],
    notifiaction: [],
    isDirty: false,
  }

  switch (action.type) {
    case ActionTypes.SEGMENT_INITIALIZE:
      const payload = action.payload
      const periodFacts = payload.periodFacts
      const segmentIx = payload.segmentIx

      const diceRolls = R.range(0, periodFacts.rollsPerSegment).map(
        (rollIx: number) => {
          const seed = periodFacts.scenario.seed
          const bondsAndStocks = diceRoll([seed, segmentIx, rollIx, 0])
          return {
            bonds: diceRoll([seed, segmentIx, rollIx, 1]) + bondsAndStocks,
            stocks: diceRoll([seed, segmentIx, rollIx, 2]) + bondsAndStocks,
          }
        }
      )

      const returns = diceRolls.map((rolls) => {
        const scenario = action.payload.periodFacts.scenario
        return {
          bank: scenario.bankReturn,
          bonds: computeScenarioOutcome(
            scenario.trendBonds,
            scenario.gapBonds,
            rolls.bonds
          ),
          stocks: computeScenarioOutcome(
            scenario.trendStocks,
            scenario.gapStocks,
            rolls.stocks
          ),
        }
      })

      newState = {
        ...newState,
        result: {
          ...state,
          diceRolls,
          returns,
        },
      }
      break

    default:
      break
  }

  debugLog('SegmentReducer', state, action, newState)

  return newState
}
