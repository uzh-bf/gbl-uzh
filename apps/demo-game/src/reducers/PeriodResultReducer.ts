import { PayloadPeriodResult, PayloadPeriodResultEnd } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { produce } from 'immer'
import { PlayerRole } from '../settings/Constants'
import { OutputState, OutputStateInit, State, StateInit } from '../types/facts'

const INITIAL_CAPITAL = 10000

export function initialize(
  state: StateInit,
  payload: PayloadPeriodResult<PlayerRole, PeriodFacts>
): OutputStateInit {
  const baseState: OutputStateInit = {
    result: state,
  }

  const resultState: OutputStateInit = produce(
    baseState,
    (draft: OutputStateInit) => {
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
    }
  )

  debugLog('PeriodResultInitialize', state, payload, resultState)
  return resultState
}

export function start(
  state: State,
  payload: PayloadPeriodResult<PlayerRole, PeriodFacts>
): OutputState {
  const baseState: OutputState = {
    result: state,
  }
  const resultState = produce(baseState, (draft: OutputState) => {})

  debugLog('PeriodResultStart', state, payload, resultState)
  return resultState
}

export function end(
  state: State,
  payload: PayloadPeriodResultEnd<PeriodFacts, PeriodSegmentFacts, PlayerRole>
): OutputState {
  const baseState: OutputState = {
    result: state,
    events: [],
  }

  const resultState: OutputState = produce(
    baseState,
    (draft: OutputState) => {}
  )

  debugLog('PeriodResultEnd', state, payload, resultState)
  return resultState
}
