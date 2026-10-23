import {
  OutputFacts,
  PayloadPeriodResult,
  PayloadPeriodResultEnd,
} from '@gbl-uzh/platform'
import { debugLog, standardDeviation } from '@gbl-uzh/platform/dist/lib/util'
import { produce } from 'immer'
import { PlayerResult } from 'src/graphql/generated/ops'
import { INITIAL_CAPITAL, NUM_MONTHS } from '../lib/constants'
import { PlayerRole } from '../settings/Constants'
import { GameFacts } from '../types/Game'
import { PeriodFacts, PeriodSegmentFacts } from '../types/Period'
import { OutputResultFacts, ResultFacts, ResultFactsInit } from '../types/facts'

type InputPeriodResultFactsInit = {}
type OutputPeriodResultFactsInit = OutputFacts<
  InputPeriodResultFactsInit & ResultFactsInit,
  any,
  any
>

export function initialize(
  facts: InputPeriodResultFactsInit,
  payload: PayloadPeriodResult<GameFacts, PeriodFacts, PlayerRole>
): OutputPeriodResultFactsInit {
  const baseFacts: OutputPeriodResultFactsInit = {
    resultFacts: {
      ...facts,
      initialCapital: INITIAL_CAPITAL,
      decisions: { bank: 100, bonds: 0, stocks: 0 },
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
        bank: 100,
        bonds: 0,
        stocks: 0,
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
  payload: PayloadPeriodResult<GameFacts, PeriodFacts, PlayerRole>
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
  payload: PayloadPeriodResultEnd<
    PlayerResult[],
    GameFacts,
    PeriodFacts,
    PeriodSegmentFacts,
    PlayerRole
  >
): OutputResultFacts {
  const baseFacts: OutputResultFacts = {
    resultFacts: facts,
    events: [],
  }

  const {
    returns: totalAssetsReturnsPA,
    risk,
    sharpeRatio,
  } = computeRiskAndReturnOfPlayer(payload.segmentEndResults)

  const resultFacts: OutputResultFacts = produce(
    baseFacts,
    (draft: OutputResultFacts) => {
      draft.resultFacts.totalAssetsReturnsPA = totalAssetsReturnsPA
      draft.resultFacts.risk = risk
      draft.resultFacts.sharpeRatio = sharpeRatio
    }
  )

  debugLog('PeriodResultEnd', facts, payload, resultFacts)
  return resultFacts
}

const computeRiskAndReturnOfPlayer = (
  segmentEndResultsOfPlayer: PlayerResult[]
) => {
  const totalAssetsReturns = segmentEndResultsOfPlayer.flatMap(({ facts }) => {
    const assetsWithReturns = facts?.assetsWithReturns.slice(1) || []
    return assetsWithReturns.map(({ totalAssetsReturn }) => totalAssetsReturn)
  })

  const num = totalAssetsReturns.length

  const numResults = segmentEndResultsOfPlayer.length
  const lastResult = segmentEndResultsOfPlayer[numResults - 1]
  const assetsWithReturns = lastResult.facts?.assetsWithReturns

  const bankReturnPA: number =
    Math.pow(
      1 + assetsWithReturns.slice(-1)[0].accBankBenchmarkReturn,
      NUM_MONTHS / num
    ) - 1

  const lastAccReturn = assetsWithReturns.slice(-1)[0].accTotalAssetsReturn

  const risk = standardDeviation(totalAssetsReturns) * Math.sqrt(NUM_MONTHS)
  const returns = Math.pow(1 + lastAccReturn, NUM_MONTHS / num) - 1
  const sharpeRatio =
    risk > 0.0001 ? (returns - bankReturnPA) / risk : undefined

  return {
    returns,
    risk,
    sharpeRatio,
  }
}
