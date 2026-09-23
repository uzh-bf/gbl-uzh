import { OutputFacts, PayloadSegment } from '@gbl-uzh/platform'
import {
  computeScenarioOutcome,
  debugLog,
  diceRoll,
} from '@gbl-uzh/platform/dist/lib/util'
import { produce } from 'immer'
import * as R from 'ramda'
import { NUM_MONTHS_PER_SEGMENT } from '../lib/constants'
import { GameFacts } from '../types/Game'
import { PeriodFacts, PeriodSegmentFacts } from '../types/Period'

type InputSegmentFacts = {}
type OutputSegmentFacts = OutputFacts<
  InputSegmentFacts & PeriodSegmentFacts,
  any,
  any
>

export function initialize(
  facts: InputSegmentFacts,
  payload: PayloadSegment<GameFacts, PeriodFacts, PeriodSegmentFacts>
): OutputSegmentFacts {
  const baseFacts: OutputSegmentFacts = {
    resultFacts: {
      ...facts,
      revealedRollIndices: [],
      diceRolls: [],
      returns: [],
    },
  }

  const resultFacts: OutputSegmentFacts = produce(
    baseFacts,
    (draft: OutputSegmentFacts) => {
      const periodFacts = payload.periodFacts
      const scenario = periodFacts.scenario

      const seed = scenario.seed
      const periodIx = payload.periodIx
      const segmentIx = payload.segmentIx
      const seedAndIndices = [seed, periodIx, segmentIx]

      const diceRolls = R.range(0, NUM_MONTHS_PER_SEGMENT).map(
        (rollIx: number) => {
          const bondsAndStocks = diceRoll([...seedAndIndices, rollIx, 0])
          return {
            shared: bondsAndStocks,
            bonds: diceRoll([...seedAndIndices, rollIx, 1]) + bondsAndStocks,
            stocks: diceRoll([...seedAndIndices, rollIx, 2]) + bondsAndStocks,
          }
        }
      )

      const returns = diceRolls.map((rolls) => {
        return {
          bank: scenario.interestBank,
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

      draft.resultFacts.diceRolls = diceRolls
      draft.resultFacts.returns = returns
    }
  )

  debugLog('SegmentInitialize', facts, payload, resultFacts)
  return resultFacts
}
