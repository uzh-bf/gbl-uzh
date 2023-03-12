import { Action } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { PrismaClient } from '@prisma/client'
import * as R from 'ramda'
import { match, P } from 'ts-pattern'

export enum ActionTypes {
  SEGMENT_RESULTS_INITIALIZE = 'SEGMENT_RESULTS_INITIALIZE',
  SEGMENT_RESULTS_START = 'SEGMENT_RESULTS_START',
  SEGMENT_RESULTS_END = 'SEGMENT_RESULTS_END',
}

type State = {
  assets: {
    bank: number
    bonds: number
    stocks: number
  }
  decisions: {
    bank: boolean
    bonds: boolean
    stocks: boolean
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

export function apply(state: State, action: Actions) {
  const newState = match(action)
    .with(
      { type: ActionTypes.SEGMENT_RESULTS_INITIALIZE, payload: P.select() },
      ({}) => {
        return {
          type: action.type,
          events: [],
          notification: [],
          isDirty: true,
          result: {
            ...state,
          },
        }
      }
    )
    .with(
      { type: ActionTypes.SEGMENT_RESULTS_START, payload: P.select() },
      ({}) => {
        return {
          type: action.type,
          events: [],
          notification: [],
          isDirty: true,
          result: {
            ...state,
          },
        }
      }
    )
    .with(
      { type: ActionTypes.SEGMENT_RESULTS_END, payload: P.select() },
      ({ segmentFacts }) => {
        const assets = state.assets
        const decisions = state.decisions

        const numInvestedBuckets = R.sum(Object.values(decisions).map(Number))
        const totalAssets = R.sum(Object.values(assets))

        const targetAssets = {
          bank: decisions.bank ? (1 / numInvestedBuckets) * totalAssets : 0,
          bonds: decisions.bonds ? (1 / numInvestedBuckets) * totalAssets : 0,
          stocks: decisions.stocks ? (1 / numInvestedBuckets) * totalAssets : 0,
        }

        const assetsWithReturns = segmentFacts.returns.reduce(
          (acc, returns, ix) => {
            const last = acc[acc.length - 1]
            const bankWithReturn = last.bank * (1 + returns.bank)
            const bondsWithReturn = last.bonds * (1 + returns.bonds)
            const stocksWithReturn = last.stocks * (1 + returns.stocks)
            const totalAssetsWithReturn =
              bankWithReturn + bondsWithReturn + stocksWithReturn
            const totalAssetsReturn =
              (totalAssetsWithReturn - totalAssets) / totalAssets
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

        return {
          type: action.type,
          events: [],
          notification: [],
          isDirty: true,
          result: {
            ...state,
            assetsWithReturns,
            assets: finalAssets,
          },
        }
      }
    )
    .exhaustive()

  debugLog('SegmentResultReducer', state, action, newState)

  return newState
}
