import { PayloadSegment } from '@gbl-uzh/platform'
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

type OutputState = State & {}

export function initialize(
  state: State,
  payload: PayloadSegment<PeriodFacts, PeriodSegmentFacts>
): OutputState {
  const baseState: OutputState = {
    diceRolls: state.diceRolls?.slice(0),
    returns: state.returns?.slice(0),
  }

  const resultState: OutputState = produce(baseState, (draft: OutputState) => {
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

    draft.diceRolls = diceRolls
    draft.returns = returns
  })

  debugLog('SegmentInitialize', state, payload, resultState)
  return resultState
}
