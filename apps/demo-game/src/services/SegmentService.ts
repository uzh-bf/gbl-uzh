import { OutputFacts, PayloadSegment } from '@gbl-uzh/platform'
import {
  computeScenarioOutcome,
  debugLog,
  diceRoll,
} from '@gbl-uzh/platform/dist/lib/util'
import { produce } from 'immer'
import * as R from 'ramda'
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
      diceRolls: [],
      returns: [],
    },
  }

  const resultFacts: OutputSegmentFacts = produce(
    baseFacts,
    (draft: OutputSegmentFacts) => {
      const periodFacts = payload.periodFacts
      const segmentIx = payload.segmentIx

      // TODO(JJ): Should also take periodIx into account?
      const diceRolls = R.range(0, periodFacts.rollsPerSegment).map(
        (rollIx: number) => {
          const seed = periodFacts.scenario.seed
          const bondsAndStocks = diceRoll([seed, segmentIx, rollIx, 0])
          return {
            shared: bondsAndStocks,
            bonds: diceRoll([seed, segmentIx, rollIx, 1]) + bondsAndStocks,
            stocks: diceRoll([seed, segmentIx, rollIx, 2]) + bondsAndStocks,
          }
        }
      )

      const returns = diceRolls.map((rolls) => {
        const scenario = payload.periodFacts.scenario
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

export async function updateDBBeforeActivation(tx, payload): Promise<void> {}
export async function updateDBAfterInitialize(
  tx,
  facts,
  payload
): Promise<void> {}
