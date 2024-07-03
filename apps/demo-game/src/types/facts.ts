import { OutputFacts } from '@gbl-uzh/platform'

export type Assets = {
  bank: number
  bonds: number
  stocks: number
  totalAssets: number
}

export type StateInit = {
  decisions: {
    bank: boolean
    bonds: boolean
    stocks: boolean
  }
  assets: Assets
}

export type OutputStateInit = OutputFacts<StateInit, any, any>

export type State = StateInit & {
  returns: Assets
  assetsWithReturns: (Assets & {
    ix: number
    bankReturn?: number
    bondsReturn?: number
    stocksReturn?: number
    totalAssetsReturn?: number
  })[]
}

export type OutputState = OutputFacts<State, any, any>
