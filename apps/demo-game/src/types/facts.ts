import { OutputFacts } from '@gbl-uzh/platform'

type Assets = {
  bank: number
  bonds: number
  stocks: number
  totalAssets: number
}

type Decisions = {
  bank: boolean
  bonds: boolean
  stocks: boolean
}

type AssetsWithReturns = Assets & {
  ix: number
  bankReturn?: number
  bondsReturn?: number
  stocksReturn?: number
  totalAssetsReturn?: number
}

export type PeriodResultFactsInit = {
  decisions: Decisions
  assets: Assets
}

export type ResultFacts = PeriodResultFactsInit & {
  returns: Assets
  assetsWithReturns: AssetsWithReturns[]
}

export type SegmentResultFactsInit = PeriodResultFactsInit & {
  returns?: Assets
  assetsWithReturns?: AssetsWithReturns[]
}

export type OutputPeriodResultFactsInit = OutputFacts<
  PeriodResultFactsInit,
  any,
  any
>

export type OutputResultFacts = OutputFacts<ResultFacts, any, any>

export type OutputSegmentResultFactsInit = OutputFacts<
  SegmentResultFactsInit,
  any,
  any
>
