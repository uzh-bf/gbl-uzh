import {
  OutputFacts,
  PayloadPeriodResult,
  PayloadPeriodResultEnd,
} from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { produce } from 'immer'
import { PlayerRole } from '../settings/Constants'
import { PeriodFacts, PeriodSegmentFacts } from '../types/Period'
import { OutputResultFacts, ResultFacts, ResultFactsInit } from '../types/facts'

const INITIAL_CAPITAL = 10000

type InputPeriodResultFactsInit = {}
type OutputPeriodResultFactsInit = OutputFacts<
  InputPeriodResultFactsInit & ResultFactsInit,
  any,
  any
>

export function initialize(
  facts: InputPeriodResultFactsInit,
  payload: PayloadPeriodResult<PlayerRole, PeriodFacts>
): OutputPeriodResultFactsInit {
  const baseFacts: OutputPeriodResultFactsInit = {
    resultFacts: {
      ...facts,
      initialCapital: INITIAL_CAPITAL,
      decisions: { bank: false, bonds: false, stocks: false },
      assets: {
        bank: 0,
        bonds: 0,
        stocks: 0,
        totalAssets: 0,
      },
      benchmarks: {
        bank: 0,
        bonds: 0,
        stocks: 0,
      },
    },
  }

  const resultFacts: OutputPeriodResultFactsInit = produce(
    baseFacts,
    (draft: OutputPeriodResultFactsInit) => {
      draft.resultFacts.decisions = {
        bank: true,
        bonds: false,
        stocks: false,
      }
      draft.resultFacts.assets = {
        bank: INITIAL_CAPITAL,
        bonds: 0,
        stocks: 0,
        totalAssets: INITIAL_CAPITAL,
      }
      draft.resultFacts.benchmarks = {
        bank: INITIAL_CAPITAL,
        bonds: INITIAL_CAPITAL,
        stocks: INITIAL_CAPITAL,
      }
      draft.resultFacts.initialCapital = INITIAL_CAPITAL
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
    resultFacts: facts,
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
    resultFacts: facts,
    events: [],
  }

  const resultFacts: OutputResultFacts = produce(
    baseFacts,
    (draft: OutputResultFacts) => {}
  )

  debugLog('PeriodResultEnd', facts, payload, resultFacts)
  return resultFacts
}
