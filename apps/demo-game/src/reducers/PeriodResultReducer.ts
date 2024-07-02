import { PayloadPeriodResult, PayloadPeriodResultEnd } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { produce } from 'immer'
import { PlayerRole } from '../settings/Constants'

const INITIAL_CAPITAL = 10000

// TODO(JJ): Double-check if all defined fns have the same input type
type State = {
  decisions: {
    bank: boolean
    bonds: boolean
    stocks: boolean
  }
  assets: {
    bank: number
    bonds: number
    stocks: number
    totalAssets: number
  }
}

// TODO(JJ): Example output
type OutputState = State & {
  // additional variables
}

export function initialize(
  state: State,
  payload: PayloadPeriodResult<PlayerRole, PeriodFacts>
) {
  const baseState = {
    result: state,
    isDirty: false,
  }

  const newState = produce(baseState, (draft) => {
    draft.result.decisions = {
      bank: true,
      bonds: false,
      stocks: false,
    }
    draft.result.assets = {
      bank: INITIAL_CAPITAL,
      bonds: 0,
      stocks: 0,
      totalAssets: INITIAL_CAPITAL,
    }
  })

  const resultState = produce(newState, (draft) => {
    draft.isDirty = baseState !== newState
  })

  debugLog('PeriodResultInitialize', state, payload, resultState)
  return resultState
}

export function start(
  state: State,
  payload: PayloadPeriodResult<PlayerRole, PeriodFacts>
) {
  const baseState = {
    result: state,
    isDirty: false,
  }
  const newState = produce(baseState, (draft) => {})
  const resultState = produce(newState, (draft) => {
    draft.isDirty = baseState !== newState
  })

  debugLog('PeriodResultStart', state, payload, resultState)
  return resultState
}

export function end(
  state: State,
  payload: PayloadPeriodResultEnd<PeriodFacts, PeriodSegmentFacts, PlayerRole>
) {
  const baseState = {
    result: state,
    isDirty: false,
  }

  const newState = produce(baseState, (draft) => {})

  const resultState = produce(newState, (draft) => {
    draft.isDirty = baseState !== newState
  })

  debugLog('PeriodResultEnd', state, payload, resultState)
  return resultState
}
