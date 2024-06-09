import { Action, ResultState } from '@gbl-uzh/platform'
import {
  computePercentChange,
  debugLog,
  withPercentChange,
} from '@gbl-uzh/platform/dist/lib/util'
import type { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { PrismaClient } from '@prisma/client'
import { produce } from 'immer'
import * as R from 'ramda'
import { P, match } from 'ts-pattern'

export enum ActionTypes {
  SEGMENT_RESULTS_INITIALIZE = 'SEGMENT_RESULTS_INITIALIZE',
  SEGMENT_RESULTS_START = 'SEGMENT_RESULTS_START',
  SEGMENT_RESULTS_END = 'SEGMENT_RESULTS_END',
}

type State = {
  assets: { bank: number; bonds: number; stocks: number; totalAssets: number }
  decisions: { bank: boolean; bonds: boolean; stocks: boolean }
  assetsWithReturns?: {
    ix: number
    bank: number
    bonds: number
    stocks: number
    totalAssets: number
  }[]
  returns?: {
    bank: number
    bonds: number
    stocks: number
    totalAssets: number
  }
}

type Actions =
  | Action<ActionTypes.SEGMENT_RESULTS_INITIALIZE, {}, PrismaClient>
  | Action<
      ActionTypes.SEGMENT_RESULTS_START,
      {
        periodFacts: PeriodFacts
        segmentFacts: PeriodSegmentFacts
        segmentIx: number
      },
      PrismaClient
    >
  | Action<
      ActionTypes.SEGMENT_RESULTS_END,
      {
        periodFacts: PeriodFacts
        segmentFacts: PeriodSegmentFacts
        segmentIx: number
      },
      PrismaClient
    >

export function apply(
  state: State,
  action: Actions
): ResultState<ActionTypes, State> {
  const baseState: ResultState<ActionTypes, State> = {
    type: action.type,
    isDirty: false,
    result: state,
  }

  const newState = produce(baseState, (draft) => {
    match(action)
      .with(
        { type: ActionTypes.SEGMENT_RESULTS_INITIALIZE, payload: P.select() },
        (payload) => {}
      )
      .with(
        { type: ActionTypes.SEGMENT_RESULTS_START, payload: P.select() },
        (payload) => {}
      )
      .with(
        { type: ActionTypes.SEGMENT_RESULTS_END, payload: P.select() },
        (payload) => {
          const segmentFacts = payload.segmentFacts
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
              const bondsWithReturn = withPercentChange(
                last.bonds,
                returns.bonds
              )
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
            stocks: computePercentChange(
              finalAssets.stocks,
              targetAssets.stocks
            ),
            totalAssets: computePercentChange(
              finalAssets.totalAssets,
              state.assets.bank
            ),
          }
        }
      )
      .exhaustive()
  })

  const resultState = produce(newState, (draft) => {
    draft.isDirty = baseState !== newState
  })

  debugLog('SegmentResultReducer', state, action, newState, resultState)

  return newState
}
