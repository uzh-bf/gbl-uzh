import { Action, ResultState } from '@gbl-uzh/platform'
import {
  computeScenarioOutcome,
  debugLog,
  diceRoll,
} from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { PrismaClient } from '@prisma/client'
import { produce } from 'immer'
import * as R from 'ramda'
import { P, match } from 'ts-pattern'

export enum ActionTypes {
  SEGMENT_INITIALIZE = 'SEGMENT_INITIALIZE',
}

type State = {
  diceRolls?: { bonds: number; stocks: number }[]
  returns?: { bank: number; bonds: number; stocks: number }[]
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

export function apply(
  state: State,
  action: Actions
): ResultState<ActionTypes, State> {
  const baseState: ResultState<ActionTypes, State> = {
    type: action.type,
    result: state,
    isDirty: false,
  }

  const newState = produce(baseState, (draft) => {
    match(action)
      .with(
        { type: ActionTypes.SEGMENT_INITIALIZE, payload: P.select() },
        (payload) => {
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
            const scenario = payload.periodFacts.scenario
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

          draft.result.diceRolls = diceRolls
          draft.result.returns = returns
        }
      )
      .exhaustive()
  })

  const resultState = produce(newState, (draft) => {
    draft.isDirty = baseState !== newState
  })

  debugLog('SegmentReducer', state, action, newState, resultState)

  return resultState
}
