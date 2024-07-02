import { PayloadPeriodResult, PayloadPeriodResultEnd } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { produce } from 'immer'
import { PlayerRole } from '../settings/Constants'

const INITIAL_CAPITAL = 10000

type Assets = {
  bank: number
  bonds: number
  stocks: number
  totalAssets: number
}

type StateInit = {
  decisions: {
    bank: boolean
    bonds: boolean
    stocks: boolean
  }
  assets: Assets
}

type OutputStateInit = {
  result: StateInit
  actions?: []
}

type State = StateInit & {
  returns: Assets
  assetsWithReturns: (Assets & {
    ix: number
    bankReturn?: number
    bondsReturn?: number
    stocksReturn?: number
    totalAssetsReturn?: number
  })[]
}

type OutputStateStart = {
  result: State
  actions?: []
}

type OutputStateEnd = OutputStateStart & {
  events: []
}

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
): OutputStateStart {
  const baseState: OutputStateStart = {
    result: state,
  }
  const resultState = produce(baseState, (draft: OutputStateStart) => {})

  debugLog('PeriodResultStart', state, payload, resultState)
  return resultState
}

export function end(
  state: State,
  payload: PayloadPeriodResultEnd<PeriodFacts, PeriodSegmentFacts, PlayerRole>
): OutputStateEnd {
  const baseState: OutputStateEnd = {
    result: state,
    events: [],
  }

  const resultState: OutputStateEnd = produce(
    baseState,
    (draft: OutputStateEnd) => {}
  )

  debugLog('PeriodResultEnd', state, payload, resultState)
  return resultState
}
