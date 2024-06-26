import { PayloadSegmentResult } from '@gbl-uzh/platform'
import {
  computePercentChange,
  debugLog,
  withPercentChange,
} from '@gbl-uzh/platform/dist/lib/util'
import type { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { produce } from 'immer'
import * as R from 'ramda'

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
  decisions: { bank: boolean; bonds: boolean; stocks: boolean }
  // TODO(JJ): It actually should be with AssetsTotalReturn
  assetsWithReturns?: ({ ix: number } & AssetsTotal)[]
  returns?: AssetsTotal
}

// TODO(JJ): Define somewhere else
enum PlayerRole {
  PLAYER = 'PLAYER',
  ADMIN = 'ADMIN',
}

// TODO(JJ): baseState to platform
// - isDirty is only used in PlayService => only the ActionReducer needs this
// currently => Discuss with RS if we would like to add it
// Also e.g. the Derivative Game sets isDirty to true for some reducers
// But since it's not used, is has no purpose yet =? bug?
export function initialize(
  state: State,
  payload: PayloadSegmentResult<PeriodFacts, PeriodSegmentFacts, PlayerRole>
) {
  const baseState = {
    result: state,
    isDirty: false,
  }

  const newState = produce(baseState, (draft) => {})

  const resultState = produce(newState, (draft) => {
    draft.isDirty = baseState !== newState
  })

  debugLog('SegmentResultInitialize', state, payload, resultState)
  return resultState
}

export function start(
  state: State,
  payload: PayloadSegmentResult<PeriodFacts, PeriodSegmentFacts, PlayerRole>
) {
  const baseState = {
    result: state,
    isDirty: false,
  }

  const newState = produce(baseState, (draft) => {})

  const resultState = produce(newState, (draft) => {
    draft.isDirty = baseState !== newState
  })

  debugLog('SegmentResultStart', state, payload, resultState)
  return resultState
}

export function end(
  state: State,
  payload: PayloadSegmentResult<PeriodFacts, PeriodSegmentFacts, PlayerRole>
) {
  const baseState = {
    result: state,
    isDirty: false,
  }

  const newState = produce(baseState, (draft) => {
    const segmentFacts = payload.segmentFacts
    const numInvestedBuckets = R.sum(Object.values(state.decisions).map(Number))
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
        const stocksWithReturn = withPercentChange(last.stocks, returns.stocks)

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
        state.assets.bank
      ),
    }
  })

  const resultState = produce(newState, (draft) => {
    draft.isDirty = baseState !== newState
  })

  debugLog('SegmentResultEnd', state, payload, resultState)
  return resultState
}
