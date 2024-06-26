import { ActionTypes, PayloadSegment } from '@gbl-uzh/platform'
import {
  computeScenarioOutcome,
  debugLog,
  diceRoll,
} from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { produce } from 'immer'
import * as R from 'ramda'

type State = {
  diceRolls?: { bonds: number; stocks: number }[]
  returns?: { bank: number; bonds: number; stocks: number }[]
}

// TODO(JJ): baseState to platform
// -> If we move baseState to the platform code we need to add the actiontypes
// again.
export function initialize(
  state: State,
  payload: PayloadSegment<PeriodFacts, PeriodSegmentFacts>
) {
  const baseState = {
    type: ActionTypes.SEGMENT_INITIALIZE,
    result: state,
    isDirty: false,
  }

  const newState = produce(baseState, (draft) => {
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
  })

  const resultState = produce(newState, (draft) => {
    draft.isDirty = baseState !== newState
  })

  debugLog('SegmentInitialize', state, payload, resultState)
  return resultState
}
