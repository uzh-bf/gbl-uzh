import { Action } from '@gbl-uzh/platform'
import {
  computePercentChange,
  debugLog,
  withPercentChange,
} from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { PrismaClient } from '@prisma/client'
import * as R from 'ramda'

export enum ActionTypes {
  SEGMENT_RESULTS_INITIALIZE = 'SEGMENT_RESULTS_INITIALIZE',
  SEGMENT_RESULTS_START = 'SEGMENT_RESULTS_START',
  SEGMENT_RESULTS_END = 'SEGMENT_RESULTS_END',
}

type Assets = {
  bank: number
  bonds: number
  stocks: number
}
type AssetsTotal = Assets & { totalAssets: number }

type AssetsReturn = {
  bankReturn: number
  bondsReturn: number
  stocksReturn: number
}
type AssetsTotalReturn = AssetsReturn & { totalAssetsReturn: number }

type State = {
  assets: AssetsTotal
  decisions: Assets
  // TODO(Jakob): It actually should be with AssetsTotalReturn
  assetsWithReturns?: ({ ix: number } & AssetsTotal)[]
  returns?: AssetsTotal
}

type PayloadType = {
  periodFacts: PeriodFacts
  segmentFacts: PeriodSegmentFacts
  segmentIx: number
}

type Actions =
  | Action<ActionTypes.SEGMENT_RESULTS_INITIALIZE, {}, PrismaClient>
  | Action<ActionTypes.SEGMENT_RESULTS_START, PayloadType, PrismaClient>
  | Action<ActionTypes.SEGMENT_RESULTS_END, PayloadType, PrismaClient>

export function apply(state: State, action: Actions) {
  let newState = {
    type: action.type,
    isDirty: true,
    result: state,
  }

  switch (action.type) {
    case ActionTypes.SEGMENT_RESULTS_END:
      const segmentFacts = action.payload.segmentFacts
      const numInvestedBuckets = R.sum(
        Object.values(state.decisions).map(Number)
      )
      const totalAssets =
        state.assets.bank + state.assets.bonds + state.assets.stocks

      const invNumInvestedBuckets = 1 / numInvestedBuckets
      const targetAsset = invNumInvestedBuckets * totalAssets
      const targetAssets = {
        bank: state.decisions.bank ? targetAsset : 0,
        bonds: state.decisions.bonds ? targetAsset : 0,
        stocks: state.decisions.stocks ? targetAsset : 0,
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

      newState = {
        ...newState,
        result: {
          ...state,
          assetsWithReturns,
          assets: {
            ...R.pick(['bank', 'bonds', 'stocks', 'totalAssets'], finalAssets),
          },
          returns: {
            bank: computePercentChange(finalAssets.bank, targetAssets.bank),
            bonds: computePercentChange(finalAssets.bonds, targetAssets.bonds),
            stocks: computePercentChange(
              finalAssets.stocks,
              targetAssets.stocks
            ),
            totalAssets: computePercentChange(
              finalAssets.totalAssets,
              state.assets.bank
            ),
          },
        },
      }
      break

    case ActionTypes.SEGMENT_RESULTS_INITIALIZE:
    case ActionTypes.SEGMENT_RESULTS_START:
    default:
      break
  }

  debugLog('SegmentResultReducer', state, action, newState)

  return newState
}
