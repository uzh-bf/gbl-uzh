import { OutputFacts, PayloadSegmentResult } from '@gbl-uzh/platform'
import {
  computePercentChange,
  debugLog,
  withPercentChange,
} from '@gbl-uzh/platform/dist/lib/util'
import { produce } from 'immer'
import * as R from 'ramda'
import { PlayerRole } from '../settings/Constants'
import type { PeriodFacts, PeriodSegmentFacts } from '../types/Period'
import {
  Assets,
  AssetsWithReturns,
  OutputResultFacts,
  ResultFacts,
  ResultFactsInit,
} from '../types/facts'

type SegmentResultFactsInit = ResultFactsInit & {
  returns?: Assets
  assetsWithReturns?: AssetsWithReturns[]
}

type OutputSegmentResultFactsInit = OutputFacts<
  SegmentResultFactsInit,
  any,
  any
>

export function initialize(
  facts: SegmentResultFactsInit,
  payload: PayloadSegmentResult<PeriodFacts, PeriodSegmentFacts, PlayerRole>
): OutputSegmentResultFactsInit {
  const basefacts: OutputSegmentResultFactsInit = {
    resultFacts: facts,
  }

  const resultFacts: OutputSegmentResultFactsInit = produce(
    basefacts,
    (draft: OutputSegmentResultFactsInit) => {}
  )

  debugLog('SegmentResultInitialize', facts, payload, resultFacts)
  return resultFacts
}

export function start(
  facts: ResultFacts,
  payload: PayloadSegmentResult<PeriodFacts, PeriodSegmentFacts, PlayerRole>
): OutputResultFacts {
  const basefacts: OutputResultFacts = {
    resultFacts: facts,
  }

  const resultFacts: OutputResultFacts = produce(
    basefacts,
    (draft: OutputResultFacts) => {}
  )

  debugLog('SegmentResultStart', facts, payload, resultFacts)
  return resultFacts
}

export function end(
  facts: ResultFacts,
  payload: PayloadSegmentResult<PeriodFacts, PeriodSegmentFacts, PlayerRole>
): OutputResultFacts {
  const basefacts: OutputResultFacts = {
    resultFacts: facts,
  }

  const resultFacts: OutputResultFacts = produce(
    basefacts,
    (draft: OutputResultFacts) => {
      const segmentFacts = payload.segmentFacts
      const numInvestedBuckets = R.sum(
        Object.values(facts.decisions).map(Number)
      )
      const totalAssets =
        facts.assets.bank + facts.assets.bonds + facts.assets.stocks

      const invNumInvestedBuckets = 1 / numInvestedBuckets
      const targetAsset = invNumInvestedBuckets * totalAssets
      const targetAssets = {
        bank: facts.decisions.bank ? targetAsset : 0,
        bonds: facts.decisions.bonds ? targetAsset : 0,
        stocks: facts.decisions.stocks ? targetAsset : 0,
      }
      const benchmarks = {
        bank: facts.benchmarks.bank,
        bonds: facts.benchmarks.bonds,
        stocks: facts.benchmarks.stocks,
      }

      const initialCapital = facts.initialCapital

      const assetsWithReturns = segmentFacts.returns.reduce(
        (acc, returns, ix) => {
          const last = acc[acc.length - 1]

          const bankWithReturn = withPercentChange(last.bank, returns.bank)
          const bondsWithReturn = withPercentChange(last.bonds, returns.bonds)
          const stocksWithReturn = withPercentChange(
            last.stocks,
            returns.stocks
          )

          const totalAssetsWithReturn =
            bankWithReturn + bondsWithReturn + stocksWithReturn
          const totalAssetsReturn = computePercentChange(
            totalAssetsWithReturn,
            last.totalAssets
          )

          const bankBenchmark = withPercentChange(
            last.bankBenchmark,
            returns.bank
          )
          const bondsBenchmark = withPercentChange(
            last.bondsBenchmark,
            returns.bonds
          )
          const stocksBenchmark = withPercentChange(
            last.stocksBenchmark,
            returns.stocks
          )

          const accBankBenchmarkReturn = computePercentChange(
            bankBenchmark,
            initialCapital
          )
          const accBondsBenchmarkReturn = computePercentChange(
            bondsBenchmark,
            initialCapital
          )
          const accStocksBenchmarkReturn = computePercentChange(
            stocksBenchmark,
            initialCapital
          )

          const accTotalAssetsReturn = computePercentChange(
            totalAssetsWithReturn,
            initialCapital
          )

          return [
            ...acc,
            {
              ix: ix + 1,
              bank: bankWithReturn,
              bankReturn: returns.bank,
              bankBenchmark,
              accBankBenchmarkReturn,
              bonds: bondsWithReturn,
              bondsReturn: returns.bonds,
              bondsBenchmark,
              accBondsBenchmarkReturn,
              stocks: stocksWithReturn,
              stocksReturn: returns.stocks,
              stocksBenchmark,
              accStocksBenchmarkReturn,
              totalAssets: totalAssetsWithReturn,
              totalAssetsReturn,
              accTotalAssetsReturn,
            },
          ]
        },
        [
          {
            ix: 0,
            ...targetAssets,
            bankBenchmark: benchmarks.bank,
            bondsBenchmark: benchmarks.bonds,
            stocksBenchmark: benchmarks.stocks,
            totalAssets,
          },
        ]
      )

      const finalAssets = R.omit(
        ['ix'],
        assetsWithReturns[assetsWithReturns.length - 1]
      )

      draft.resultFacts.assetsWithReturns = assetsWithReturns
      draft.resultFacts.assets = {
        ...R.pick(['bank', 'bonds', 'stocks', 'totalAssets'], finalAssets),
      }
      draft.resultFacts.returns = {
        // TODO(JJ): Not sure about these either..., rather facts.assets.bank, etc.
        bank: computePercentChange(finalAssets.bank, targetAssets.bank),
        bonds: computePercentChange(finalAssets.bonds, targetAssets.bonds),
        stocks: computePercentChange(finalAssets.stocks, targetAssets.stocks),
        totalAssets: computePercentChange(
          finalAssets.totalAssets,
          facts.assets.bank // TODO(JJ): I don't think this is correct... -> totalAssets
        ),
      }
      draft.resultFacts.benchmarks = {
        bank: finalAssets.bankBenchmark,
        bonds: finalAssets.bondsBenchmark,
        stocks: finalAssets.stocksBenchmark,
      }
    }
  )

  debugLog('SegmentResultEnd', facts, payload, resultFacts)
  return resultFacts
}
