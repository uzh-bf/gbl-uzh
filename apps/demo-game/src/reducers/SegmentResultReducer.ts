import { PayloadSegmentResult } from '@gbl-uzh/platform'
import {
computePercentChange,
debugLog,
withPercentChange,
} from '@gbl-uzh/platform/dist/lib/util'
import type { PeriodFacts,PeriodSegmentFacts } from '@graphql/index'
import { produce } from 'immer'
import * as R from 'ramda'
import { PlayerRole } from '../settings/Constants'

// TODO(JJ):
// - move States out to another file - Period result reducer has similar types
//   -> merge
// - rename state to facts?
type Assets = {
  bank: number
  bonds: number
  stocks: number
  totalAssets: number
}

type AssetsWithReturns = Assets & {
  ix: number
  bankReturn?: number
  bondsReturn?: number
  stocksReturn?: number
  totalAssetsReturn?: number
}

type StateInit = {
  assets: Assets
  decisions: { bank: boolean; bonds: boolean; stocks: boolean }
  returns?: Assets
  assetsWithReturns?: AssetsWithReturns[]
}

type State = {
  assets: Assets
  decisions: { bank: boolean; bonds: boolean; stocks: boolean }
  returns: Assets
  assetsWithReturns: AssetsWithReturns[]
}

type OutputStateInit = {
  result: StateInit
}

type OutputState = {
  result: State
  actions?: []
}

// TODO(JJ): baseState to platform
// - isDirty is only used in PlayService => only the ActionReducer needs this
// currently => Discuss with RS if we would like to add it
// Also e.g. the Derivative Game sets isDirty to true for some reducers
// But since it's not used, is has no purpose yet =? bug?
export function initialize(
  state: StateInit,
  payload: PayloadSegmentResult<PeriodFacts, PeriodSegmentFacts, PlayerRole>
): OutputStateInit {
  const baseState: OutputStateInit = {
    result: state,
  }

  const resultState: OutputStateInit = produce(
    baseState,
    (draft: OutputStateInit) => {}
  )

  debugLog('SegmentResultInitialize', state, payload, resultState)
  return resultState
}

export function start(
  state: State,
  payload: PayloadSegmentResult<PeriodFacts, PeriodSegmentFacts, PlayerRole>
): OutputState {
  const baseState: OutputState = {
    result: state,
  }

  const resultState: OutputState = produce(
    baseState,
    (draft: OutputState) => {}
  )

  debugLog('SegmentResultStart', state, payload, resultState)
  return resultState
}

export function end(
  state: State,
  payload: PayloadSegmentResult<PeriodFacts, PeriodSegmentFacts, PlayerRole>
): OutputState {
  const baseState: OutputState = {
    result: state,
  }

  const resultState: OutputState = produce(baseState, (draft: OutputState) => {
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

  debugLog('SegmentResultEnd', state, payload, resultState)
  return resultState
}
