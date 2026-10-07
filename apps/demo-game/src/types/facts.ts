import { OutputFacts } from '@gbl-uzh/platform'

// TODO: replace these hand-written fact types with zod schemas once the
// design-system upgrade removes the Formik forms that consume them.

// Lives here (not in services/ActionsReducer) so client pages can reference
// action types without pulling the Prisma-importing reducer into the bundle.
export enum ActionTypes {
  NONE = '',
}

export type AssetsBenchmark = {
  bank: number
  bonds: number
  stocks: number
}

export type Assets = AssetsBenchmark & {
  totalAssets: number
}

export type Decisions = {
  bank: number
  bonds: number
  stocks: number
}

export type AssetsWithReturns = Assets & {
  ix: number
  bankReturn?: number
  bondsReturn?: number
  stocksReturn?: number
  totalAssetsReturn?: number

  bankBenchmark?: number
  bondsBenchmark?: number
  stocksBenchmark?: number

  accTotalAssetsReturn?: number
  accBankBenchmarkReturn?: number
  accBondsBenchmarkReturn?: number
  accStocksBenchmarkReturn?: number
}

export type ResultFactsInit = {
  allocationSubmitted?: boolean
  decisions: Decisions
  assets: Assets
  benchmarks: AssetsBenchmark
  initialCapital: number
}

export type ResultFacts = ResultFactsInit & {
  returns: Assets
  assetsWithReturns: AssetsWithReturns[]
  totalAssetsReturnsPA: number
  risk: number
  sharpeRatio?: number
}

export type OutputResultFacts = OutputFacts<ResultFacts, any, any>
