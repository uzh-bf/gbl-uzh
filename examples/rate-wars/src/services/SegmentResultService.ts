import { OutputFacts, PayloadSegmentResult } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { produce } from 'immer'
import { PlayerRole } from '../settings/Constants'
import { GameFacts } from '../types/Game'
import type { PeriodFacts, PeriodSegmentFacts } from '../types/Period'
import {
  OutputResultFacts,
  ResultFacts,
  ResultFactsInit,
} from '../types/facts'

// In Rate Wars the market clears at the PERIOD boundary (cross-player data is
// only available in PeriodResult.end), so segment results are thin: carry the
// player's state into the working SEGMENT_END row and, at close, lock the
// decisions and note the standalone spread as a preview.

type OutputSegmentResultFactsInit = OutputFacts<ResultFactsInit, any, any>

export function initialize(
  facts: ResultFactsInit,
  payload: PayloadSegmentResult<
    GameFacts,
    PeriodFacts,
    PeriodSegmentFacts,
    PlayerRole
  >
): OutputSegmentResultFactsInit {
  const basefacts: OutputSegmentResultFactsInit = {
    resultFacts: facts,
  }

  const resultFacts = produce(
    basefacts,
    (draft: OutputSegmentResultFactsInit) => {}
  )

  debugLog('SegmentResultInitialize', facts, payload, resultFacts)
  return resultFacts
}

export function start(
  facts: ResultFacts,
  payload: PayloadSegmentResult<
    GameFacts,
    PeriodFacts,
    PeriodSegmentFacts,
    PlayerRole
  >
): OutputResultFacts {
  const basefacts: OutputResultFacts = {
    resultFacts: facts,
  }

  const resultFacts = produce(basefacts, (draft: OutputResultFacts) => {})

  debugLog('SegmentResultStart', facts, payload, resultFacts)
  return resultFacts
}

export function end(
  facts: ResultFacts,
  payload: PayloadSegmentResult<
    GameFacts,
    PeriodFacts,
    PeriodSegmentFacts,
    PlayerRole
  >
): OutputResultFacts {
  const basefacts: OutputResultFacts = {
    resultFacts: facts,
  }

  const resultFacts = produce(basefacts, (draft: OutputResultFacts) => {
    const decisions = facts.decisions ?? { depositRate: 0, loanRate: 0 }
    draft.resultFacts.spread =
      decisions.loanRate - decisions.depositRate
  })

  debugLog('SegmentResultEnd', facts, payload, resultFacts)
  return resultFacts
}
