import {
  OutputFacts,
  PayloadPeriodConsolidation,
  PayloadPeriodInitialisation,
} from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { produce } from 'immer'
import { PeriodFacts, PeriodSegmentFacts } from '../types/Period'

type OutputPeriodFacts = OutputFacts<PeriodFacts, any, any>

// TODO(JJ):
// - Init baseFacts outside of fn and provide only draft as input
// - Payload was used because of the reducer concept, maybe rename to something
//   else...
// - PrismaClient

export function initialize(
  facts: PeriodFacts,
  payload: PayloadPeriodInitialisation<PeriodFacts, PeriodSegmentFacts>
): OutputPeriodFacts {
  const baseFacts: OutputPeriodFacts = {
    resultFacts: facts,
  }

  const resultFacts: OutputPeriodFacts = produce(
    baseFacts,
    (draft: OutputPeriodFacts) => {}
  )

  debugLog('PeriodReducerInitialize', facts, payload, resultFacts)
  return resultFacts
}

export function consolidate(
  facts: PeriodFacts,
  payload: PayloadPeriodConsolidation<PeriodSegmentFacts>
): OutputPeriodFacts {
  const baseFacts: OutputPeriodFacts = {
    resultFacts: facts,
  }

  const resultFacts: OutputPeriodFacts = produce(
    baseFacts,
    (draft: OutputPeriodFacts) => {}
  )
  debugLog('PeriodReducerConsolidate', facts, payload, resultFacts)
  return resultFacts
}
