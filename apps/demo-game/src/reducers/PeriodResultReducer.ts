import { PayloadPeriodResult, PayloadPeriodResultEnd } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { produce } from 'immer'
import { PlayerRole } from '../settings/Constants'
import {
  OutputPeriodResultFactsInit,
  OutputResultFacts,
  PeriodResultFactsInit,
  ResultFacts,
} from '../types/facts'

const INITIAL_CAPITAL = 10000

export function initialize(
  facts: PeriodResultFactsInit,
  payload: PayloadPeriodResult<PlayerRole, PeriodFacts>
): OutputPeriodResultFactsInit {
  const baseFacts: OutputPeriodResultFactsInit = {
    result: facts,
  }

  const resultFacts: OutputPeriodResultFactsInit = produce(
    baseFacts,
    (draft: OutputPeriodResultFactsInit) => {
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

  debugLog('PeriodResultInitialize', facts, payload, resultFacts)
  return resultFacts
}

export function start(
  facts: ResultFacts,
  payload: PayloadPeriodResult<PlayerRole, PeriodFacts>
): OutputResultFacts {
  const baseFacts: OutputResultFacts = {
    result: facts,
  }
  const resultFacts = produce(baseFacts, (draft: OutputResultFacts) => {})

  debugLog('PeriodResultStart', facts, payload, resultFacts)
  return resultFacts
}

export function end(
  facts: ResultFacts,
  payload: PayloadPeriodResultEnd<PeriodFacts, PeriodSegmentFacts, PlayerRole>
): OutputResultFacts {
  const baseFacts: OutputResultFacts = {
    result: facts,
    events: [],
  }

  const resultFacts: OutputResultFacts = produce(
    baseFacts,
    (draft: OutputResultFacts) => {}
  )

  debugLog('PeriodResultEnd', facts, payload, resultFacts)
  return resultFacts
}
