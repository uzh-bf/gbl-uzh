import { OutputFacts } from '@gbl-uzh/platform'

// All rates are stored as percent numbers (2.5 === 2.5%) and divided by 100
// only inside computations.

export type RateDecision = {
  depositRate: number
  loanRate: number
}

export type IncomeStatement = {
  interestIncome: number
  treasuryIncome: number
  interestExpense: number
  creditLoss: number
  fixedCost: number
  profit: number
}

// One row of the cross-bank market overview, stored identically for every
// player at period end (playerId is resolved to a display name client-side —
// the platform does not include player relations in result payloads).
export type MarketEntry = {
  playerId: string
  depositRate: number
  loanRate: number
  deposits: number
  loanDemand: number
  loans: number
  depositShare: number
  loanShare: number
  profit: number
  equity: number
  rank: number
}

// Per-period snapshot kept in the player's history for charts/reports.
export type PeriodSnapshot = {
  periodIx: number
  decisions: RateDecision
  deposits: number
  loanDemand: number
  loans: number
  excess: number
  realizedDefaultRate: number
  income: IncomeStatement
  equityStart: number
  equityEnd: number
  roe: number
  rank: number
}

export type ResultFactsInit = {
  equity: number
  cumulativeProfit: number
  decisions: RateDecision
  history: PeriodSnapshot[]
}

export type ResultFacts = ResultFactsInit & {
  // segment-end preview (no market data available before period end)
  spread?: number
  // period-end market outcome
  lastMarket?: MarketEntry[]
  rank?: number
}

export type OutputResultFacts = OutputFacts<ResultFacts, any, any>
