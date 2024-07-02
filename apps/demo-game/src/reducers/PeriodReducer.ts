import {
  PayloadPeriodConsolidation,
  PayloadPeriodInitialisation,
} from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'

type State = {
  rollsPerSegment: number
  scenario: {
    seed: number
    trendStocks: number
    trendBonds: number
    gapStocks: number
    gapBonds: number
    bankReturn: number
  }
}

type OutputState = State & {}

// TODO(JJ):
// - use immer
// 1. init baseState outside of fn and provide it as input
// ->
// export function initialize(
//   baseState: BaseState<UserState>,
//   payload: PayloadPeriodInitialisation<PeriodFacts, PeriodSegmentFacts>
// ) {
//   return produce(baseState, (draft) => {})
// }
// - PrismaClient

export function initialize(
  state: State,
  payload: PayloadPeriodInitialisation<PeriodFacts, PeriodSegmentFacts>
): OutputState {
  const resultState: OutputState = {
    rollsPerSegment: state.rollsPerSegment,
    scenario: {
      ...state.scenario,
    },
  }
  debugLog('PeriodReducerInitialize', state, payload, resultState)
  return resultState
}

export function consolidate(
  state: State,
  payload: PayloadPeriodConsolidation<PeriodSegmentFacts>
): OutputState {
  const resultState: OutputState = {
    rollsPerSegment: state.rollsPerSegment,
    scenario: {
      ...state.scenario,
    },
  }
  debugLog('PeriodReducerConsolidate', state, payload, resultState)
  return resultState
}
