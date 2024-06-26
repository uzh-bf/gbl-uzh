import {
  ActionTypes,
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

// TODO(JJ):
// - use immer
// 1. init baseState outside of fn and provide it as input
// 2. isDirty is outside of fn
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
) {
  const resultState = {
    type: ActionTypes.PERIOD_INITIALIZE,
    result: state,
    isDirty: false,
  }
  debugLog('PeriodReducerInitialize', state, payload, resultState)
  return resultState
}

export function consolidate(
  state: State,
  payload: PayloadPeriodConsolidation<PeriodSegmentFacts>
) {
  const resultState = {
    type: ActionTypes.PERIOD_CONSOLIDATE,
    result: state,
    isDirty: false,
  }
  debugLog('PeriodReducerConsolidate', state, payload, resultState)
  return resultState
}
