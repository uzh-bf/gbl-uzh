import type { OutputFacts, PayloadSegment } from '@gbl-uzh/platform'
import { debugLog, diceRoll } from '@gbl-uzh/platform/dist/lib/util'
import { produce } from 'immer'
import type { GameFacts } from '../types/Game'
import type { PeriodFacts, PeriodSegmentFacts } from '../types/Period'

type InputSegmentFacts = { shockOverride?: number | null }
type OutputSegmentFacts = OutputFacts<
  InputSegmentFacts & PeriodSegmentFacts,
  any,
  any
>

// Precompute the period's economic environment at AUTHORING time (the admin
// adds the segment), so the shock is fixed and reproducible before anyone
// plays. Two seeded dice give a symmetric shock in [-1, 1] · shockScale:
// shock = scale · ((d1 + d2) − 7) / 5      (2d6, mean 7, max deviation 5)
export function initialize(
  facts: InputSegmentFacts,
  payload: PayloadSegment<GameFacts, PeriodFacts, PeriodSegmentFacts>
): OutputSegmentFacts {
  const baseFacts: OutputSegmentFacts = {
    resultFacts: {
      ...facts,
      defaultShock: 0,
      realizedDefaultRate: 0,
      diceRolls: [],
    },
  }

  const resultFacts: OutputSegmentFacts = produce(
    baseFacts,
    (draft: OutputSegmentFacts) => {
      const scenario = payload.periodFacts.scenario
      const { periodIx, segmentIx } = payload

      const d1 = diceRoll([scenario.seed, periodIx, segmentIx, 0])
      const d2 = diceRoll([scenario.seed, periodIx, segmentIx, 1])
      const seededShock = (scenario.shockScale * (d1 + d2 - 7)) / 5

      const shock =
        facts.shockOverride !== null && facts.shockOverride !== undefined
          ? facts.shockOverride
          : seededShock

      const realized = Math.min(
        25,
        Math.max(0, scenario.baseDefaultRate + shock)
      )

      draft.resultFacts.diceRolls = [d1, d2]
      draft.resultFacts.defaultShock = shock
      draft.resultFacts.realizedDefaultRate = realized
    }
  )

  debugLog('SegmentInitialize', facts, payload, resultFacts)
  return resultFacts
}
