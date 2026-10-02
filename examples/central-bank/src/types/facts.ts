import type { OutputFacts } from '@gbl-uzh/platform'
import * as yup from 'yup'

export type Decisions = {
  rate: number
}

export const DecisionsSchema = yup.object({
  rate: yup.number().min(0).max(15).required(),
})

export type HistoryEntry = {
  segmentIx: number
  rate: number
  inflation: number
  unemployment: number
  growth: number
  penalty: number
  cumulativePenalty: number
  supplyShock: number
  demandShock: number
  eventName: string
}

export type ResultFacts = {
  decisions: Decisions
  inflation: number
  unemployment: number
  growth: number
  penalty: number
  cumulativePenalty: number
  history: HistoryEntry[]
  spilloverInflation?: number
  spilloverUnemployment?: number
  spilloverGrowth?: number
  exchangeRateIndex?: number
  tradeBalance?: number
}

export type OutputResultFacts = OutputFacts<ResultFacts, any, any>
