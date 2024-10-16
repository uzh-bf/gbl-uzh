import { OutputFacts } from '@gbl-uzh/platform'

export type AssetsBenchmark = {
  bank: number
  bonds: number
  stocks: number
}

export type Assets = AssetsBenchmark & {
  totalAssets: number
}

export type Decisions = {
  bank: boolean
  bonds: boolean
  stocks: boolean
}

export type AssetsWithReturns = Assets & {
  ix: number
  bankReturn?: number
  bondsReturn?: number
  stocksReturn?: number
  totalAssetsReturn?: number
}

export type ResultFactsInit = {
  decisions: Decisions
  assets: Assets
  benchmarks: AssetsBenchmark
}

export type ResultFacts = ResultFactsInit & {
  returns: Assets
  assetsWithReturns: AssetsWithReturns[]
}

export type OutputResultFacts = OutputFacts<ResultFacts, any, any>
