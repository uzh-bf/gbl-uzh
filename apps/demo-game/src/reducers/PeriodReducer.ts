import {
  OutputFacts,
  PayloadPeriodConsolidation,
  PayloadPeriodInitialisation,
} from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { produce } from 'immer'

type OutputPeriodFacts = OutputFacts<PeriodFacts, any, any>

// TODO(JJ):
// - Init baseFacts outside of fn and provide only draft as input
// - PrismaClient

export function initialize(
  facts: PeriodFacts,
  payload: PayloadPeriodInitialisation<PeriodFacts, PeriodSegmentFacts>
): OutputPeriodFacts {
  const baseFacts: OutputPeriodFacts = {
    result: facts,
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
    result: facts,
  }

  const resultFacts: OutputPeriodFacts = produce(
    baseFacts,
    (draft: OutputPeriodFacts) => {}
  )
  debugLog('PeriodReducerConsolidate', facts, payload, resultFacts)
  return resultFacts
}
