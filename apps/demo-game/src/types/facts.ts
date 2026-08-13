import { OutputFacts } from '@gbl-uzh/platform'
import * as yup from 'yup'

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

const allocation = (label: string) =>
  yup
    .number()
    .typeError(`${label} must be a number`)
    .integer(`${label} must be an integer`)
    .min(0, `${label} must be between 0 and 100`)
    .max(100, `${label} must be between 0 and 100`)
    .required(`${label} is required`)

// Validates the performAction payload at the tRPC boundary so bad player
// input fails as BAD_REQUEST before it reaches the ActionsReducer.
export const DecisionsSchema = yup
  .object({
    bank: allocation('Bank'),
    bonds: allocation('Bonds'),
    stocks: allocation('Stocks'),
  })
  .test(
    'sums-to-100',
    'Bank + Bonds + Stocks must equal 100',
    (value) =>
      (value.bank ?? 0) + (value.bonds ?? 0) + (value.stocks ?? 0) === 100
  )

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
