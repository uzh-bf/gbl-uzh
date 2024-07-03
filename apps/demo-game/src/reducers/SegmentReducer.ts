import { OutputFacts, PayloadSegment } from '@gbl-uzh/platform'
import {
  computeScenarioOutcome,
  debugLog,
  diceRoll,
} from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { produce } from 'immer'
import * as R from 'ramda'

type SegmentFacts = {
  diceRolls?: { bonds: number; stocks: number }[]
  returns?: { bank: number; bonds: number; stocks: number }[]
}

type OutputSegmentFacts = OutputFacts<SegmentFacts, any, any>

export function initialize(
  facts: SegmentFacts,
  payload: PayloadSegment<PeriodFacts, PeriodSegmentFacts>
): OutputSegmentFacts {
  const baseFacts: OutputSegmentFacts = {
    result: facts,
  }

  const resultFacts: OutputSegmentFacts = produce(
    baseFacts,
    (draft: OutputSegmentFacts) => {
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

  debugLog('SegmentInitialize', facts, payload, resultFacts)
  return resultFacts
}
