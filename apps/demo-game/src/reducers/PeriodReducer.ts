import { Action } from '@gbl-uzh/platform'
import { debugLog, diceRoll } from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { PrismaClient } from '@prisma/client'
import * as R from 'ramda'
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
  debugLog('PeriodReducer', state, action)

  return match(action)
    .with({ type: ActionTypes.PERIOD_INITIALIZE }, () => {
      const diceRolls = R.range(0, 3).map(() => {
        const bondsAndStocks = diceRoll()
        return {
          bonds: diceRoll() + bondsAndStocks,
          stocks: diceRoll() + bondsAndStocks,
        }
      })

      return {
        type: action.type,
        result: {
          ...state,
          diceRolls,
          scenario: {
            // TODO: replace with input values from period creation
            trendStocks: 0.0067,
            trendBonds: 0.0033,
            gapStocks: 0.0025,
            gapBonds: 0.005,
            bankReturn: 0.002,
          },
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
}
