import {
  OutputFacts,
  PayloadPeriodConsolidation,
  PayloadPeriodInitialisation,
} from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { produce } from 'immer'

type OutputState = OutputFacts<PeriodFacts, any, any>

// TODO(JJ):
// - Init baseState outside of fn and provide only draft as input
// - PrismaClient

export function initialize(
  state: PeriodFacts,
  payload: PayloadPeriodInitialisation<PeriodFacts, PeriodSegmentFacts>
): OutputState {
  const baseState: OutputState = {
    result: state,
  }

  const resultState: OutputState = produce(
    baseState,
    (draft: OutputState) => {}
  )

  debugLog('PeriodReducerInitialize', state, payload, resultState)
  return resultState
}

export function consolidate(
  state: PeriodFacts,
  payload: PayloadPeriodConsolidation<PeriodSegmentFacts>
): OutputState {
  const baseState: OutputState = {
    result: state,
  }

  const resultState: OutputState = produce(
    baseState,
    (draft: OutputState) => {}
  )
  debugLog('PeriodReducerConsolidate', state, payload, resultState)
  return resultState
}
