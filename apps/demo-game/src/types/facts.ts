import { OutputFacts } from '@gbl-uzh/platform'

export type Assets = {
  bank: number
  bonds: number
  stocks: number
  bankBenchmark: number
  bondsBenchmark: number
  stocksBenchmark: number
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
}

export type ResultFacts = ResultFactsInit & {
  returns: Assets
  assetsWithReturns: AssetsWithReturns[]
}

export type OutputResultFacts = OutputFacts<ResultFacts, any, any>
