import { PayloadSegmentResult } from '@gbl-uzh/platform'
import {
  computePercentChange,
  debugLog,
  withPercentChange,
} from '@gbl-uzh/platform/dist/lib/util'
import type { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { produce } from 'immer'
import * as R from 'ramda'
import { PlayerRole } from '../settings/Constants'
import {
  OutputResultFacts,
  OutputSegmentResultFactsInit,
  ResultFacts,
  SegmentResultFactsInit,
} from '../types/facts'

// TODO(JJ):
// for all separate functions
// - Rename result to resultFacts

export function initialize(
  facts: SegmentResultFactsInit,
  payload: PayloadSegmentResult<PeriodFacts, PeriodSegmentFacts, PlayerRole>
): OutputSegmentResultFactsInit {
  const basefacts: OutputSegmentResultFactsInit = {
    result: facts,
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
    result: facts,
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
    result: facts,
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

          return [
            ...acc,
            {
              ix: ix + 1,
              bank: bankWithReturn,
              bankReturn: returns.bank,
              bonds: bondsWithReturn,
              bondsReturn: returns.bonds,
              stocks: stocksWithReturn,
              stocksReturn: returns.stocks,
              totalAssets: totalAssetsWithReturn,
              totalAssetsReturn,
            },
          ]
        },
        [
          {
            ix: 0,
            ...targetAssets,
            totalAssets,
          },
        ]
      )

      const finalAssets = R.omit(
        ['ix'],
        assetsWithReturns[assetsWithReturns.length - 1]
      )

      draft.result.assetsWithReturns = assetsWithReturns
      draft.result.assets = {
        ...R.pick(['bank', 'bonds', 'stocks', 'totalAssets'], finalAssets),
      }
      draft.result.returns = {
        bank: computePercentChange(finalAssets.bank, targetAssets.bank),
        bonds: computePercentChange(finalAssets.bonds, targetAssets.bonds),
        stocks: computePercentChange(finalAssets.stocks, targetAssets.stocks),
        totalAssets: computePercentChange(
          finalAssets.totalAssets,
          facts.assets.bank
        ),
      }
    }
  )

  debugLog('SegmentResultEnd', facts, payload, resultFacts)
  return resultFacts
}
