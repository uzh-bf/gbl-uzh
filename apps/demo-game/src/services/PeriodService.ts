import {
  OutputFacts,
  PayloadPeriodConsolidation,
  PayloadPeriodInitialisation,
} from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { produce } from 'immer'
import { GameFacts } from '../types/Game'
import { PeriodFacts, PeriodSegmentFacts } from '../types/Period'

type InputPeriodFacts = PeriodFacts
type OutputPeriodFacts = OutputFacts<InputPeriodFacts, GameFacts, any, any>

// TODO(JJ):
// - Init baseFacts outside of fn and provide only draft as input
// - Payload was used because of the reducer concept, maybe rename to something
//   else...
// - PrismaClient

export function initialize(
  facts: InputPeriodFacts,
  payload: PayloadPeriodInitialisation<
    GameFacts,
    PeriodFacts,
    PeriodSegmentFacts
  >
): OutputPeriodFacts {
  const baseFacts: OutputPeriodFacts = {
    resultFacts: facts,
  }

  const resultFacts: OutputPeriodFacts = produce(
    baseFacts,
    (draft: OutputPeriodFacts) => {}
  )

  debugLog('PeriodInitialize', facts, payload, resultFacts)
  return resultFacts
}

export function consolidate(
  facts: InputPeriodFacts,
  payload: PayloadPeriodConsolidation<GameFacts, PeriodSegmentFacts>
): OutputPeriodFacts {
  const baseFacts: OutputPeriodFacts = {
    resultFacts: facts,
  }

  const resultFacts: OutputPeriodFacts = produce(
    baseFacts,
    (draft: OutputPeriodFacts) => {}
  )
  debugLog('PeriodConsolidate', facts, payload, resultFacts)
  return resultFacts
}
