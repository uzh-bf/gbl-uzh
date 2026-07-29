import type { IncomeStatement, RateDecision } from '../types/facts'

// ---------------------------------------------------------------------------
// The Rate Wars market model — pure functions, no platform dependencies.
// All rates are percent numbers (2.5 === 2.5%); they are divided by 100 here.
// See project/2026-07-05-rate-wars-design.md for the hand-checked example.
// ---------------------------------------------------------------------------

export type Tunables = {
  centralBankRate: number
  depositPool: number
  loanDemand: number
  depositSensitivity: number
  loanSensitivity: number
  lossGivenDefault: number
  fixedCost: number
}

export type BankInput = {
  playerId: string
  decisions: RateDecision
  equity: number
}

export type BankOutcome = {
  playerId: string
  decisions: RateDecision
  deposits: number
  depositShare: number
  loanDemand: number
  loanShare: number
  loans: number
  excess: number
  income: IncomeStatement
  equityStart: number
  equityEnd: number
  roe: number
}

// Softmax market shares: savers chase high deposit rates, borrowers avoid
// high loan rates. Sensitivity is "per percentage point".
function shares(rates: number[], sensitivity: number, invert: boolean) {
  const weights = rates.map((r) =>
    Math.exp((invert ? -1 : 1) * sensitivity * r)
  )
  const total = weights.reduce((a, b) => a + b, 0)
  return weights.map((w) => w / total)
}

/**
 * Clear the deposit and loan markets across all banks for one period.
 * Deterministic: same inputs → same outcome for every caller (each player's
 * PeriodResult.end recomputes the identical market).
 *
 * @param realizedDefaultRate percent of loans that default this period
 */
export function clearMarket(
  banks: BankInput[],
  tunables: Tunables,
  realizedDefaultRate: number
): BankOutcome[] {
  const depositShares = shares(
    banks.map((b) => b.decisions.depositRate),
    tunables.depositSensitivity,
    false
  )
  const loanShares = shares(
    banks.map((b) => b.decisions.loanRate),
    tunables.loanSensitivity,
    true
  )

  const delta = realizedDefaultRate / 100

  return banks.map((bank, ix) => {
    const deposits = tunables.depositPool * depositShares[ix]
    const demand = tunables.loanDemand * loanShares[ix]

    // funding constraint: you cannot lend money you do not have
    const capacity = deposits + bank.equity
    const loans = Math.min(demand, capacity)
    const excess = capacity - loans

    const depositRate = bank.decisions.depositRate / 100
    const loanRate = bank.decisions.loanRate / 100
    const cbRate = tunables.centralBankRate / 100

    const interestIncome = loanRate * loans * (1 - delta)
    const treasuryIncome = cbRate * excess
    const interestExpense = depositRate * deposits
    const creditLoss = delta * loans * tunables.lossGivenDefault
    const profit =
      interestIncome +
      treasuryIncome -
      interestExpense -
      creditLoss -
      tunables.fixedCost

    return {
      playerId: bank.playerId,
      decisions: bank.decisions,
      deposits,
      depositShare: depositShares[ix],
      loanDemand: demand,
      loanShare: loanShares[ix],
      loans,
      excess,
      income: {
        interestIncome,
        treasuryIncome,
        interestExpense,
        creditLoss,
        fixedCost: tunables.fixedCost,
        profit,
      },
      equityStart: bank.equity,
      equityEnd: bank.equity + profit,
      roe: bank.equity !== 0 ? profit / bank.equity : 0,
    }
  })
}

/** Rank outcomes by end-of-period equity, descending. Rank is 1-based. */
export function rankByEquity(outcomes: BankOutcome[]) {
  const order = [...outcomes].sort((a, b) => b.equityEnd - a.equityEnd)
  const ranks = new Map(order.map((o, ix) => [o.playerId, ix + 1]))
  return ranks
}
