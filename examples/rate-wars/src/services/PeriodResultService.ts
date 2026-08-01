import {
  OutputFacts,
  PayloadPeriodResult,
  PayloadPeriodResultEnd,
} from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { produce } from 'immer'
import { PlayerResult } from 'src/graphql/generated/ops'
import { clearMarket, rankByEquity } from '../lib/model'
import { PlayerRole } from '../settings/Constants'
import { GameFacts } from '../types/Game'
import { PeriodFacts, PeriodSegmentFacts } from '../types/Period'
import {
  MarketEntry,
  OutputResultFacts,
  ResultFacts,
  ResultFactsInit,
} from '../types/facts'

export const INITIAL_EQUITY = 500
export const DEFAULT_DECISIONS = { depositRate: 1, loanRate: 4 }

type InputPeriodResultFactsInit = {}
type OutputPeriodResultFactsInit = OutputFacts<
  InputPeriodResultFactsInit & ResultFactsInit,
  any,
  any
>

// First period only: seed each bank's starting state.
export function initialize(
  facts: InputPeriodResultFactsInit,
  payload: PayloadPeriodResult<GameFacts, PeriodFacts, PlayerRole>
): OutputPeriodResultFactsInit {
  const baseFacts: OutputPeriodResultFactsInit = {
    resultFacts: {
      ...facts,
      equity: INITIAL_EQUITY,
      cumulativeProfit: 0,
      decisions: { ...DEFAULT_DECISIONS },
      history: [],
    },
  }

  const resultFacts = produce(
    baseFacts,
    (draft: OutputPeriodResultFactsInit) => {}
  )

  debugLog('PeriodResultInitialize', facts, payload, resultFacts)
  return resultFacts
}

// Subsequent periods: the previous PERIOD_END facts flow in unchanged —
// equity, cumulative profit, and history carry over; the previous decisions
// stay as the default for the new year (rate stickiness).
export function start(
  facts: ResultFacts,
  payload: PayloadPeriodResult<GameFacts, PeriodFacts, PlayerRole>
): OutputResultFacts {
  const baseFacts: OutputResultFacts = {
    resultFacts: facts,
  }
  const resultFacts = produce(baseFacts, (draft: OutputResultFacts) => {})

  debugLog('PeriodResultStart', facts, payload, resultFacts)
  return resultFacts
}

// The market clears here: every player's hook receives ALL banks' segment-end
// results and recomputes the identical, deterministic market outcome.
export function end(
  facts: ResultFacts,
  payload: PayloadPeriodResultEnd<
    PlayerResult[],
    GameFacts,
    PeriodFacts,
    PeriodSegmentFacts,
    PlayerRole
  >
): OutputResultFacts {
  const baseFacts: OutputResultFacts = {
    resultFacts: facts,
    events: [],
  }

  const resultFacts = produce(baseFacts, (draft: OutputResultFacts) => {
    const { periodIx, periodFacts, segmentFacts } = payload
    const scenario = periodFacts.scenario

    // segmentEndResults / otherPlayersSegmentEndResults contain rows from ALL
    // periods (ordered by period asc) — restrict to the period being closed.
    const own = (payload.segmentEndResults as any[]).filter(
      (r) => r.periodIx === periodIx
    )
    const others = (payload.otherPlayersSegmentEndResults as any[]).filter(
      (r) => r.periodIx === periodIx
    )
    const ownPlayerId = own[own.length - 1]?.playerId

    const ownBank =
      own.length > 0
        ? {
            playerId: own[own.length - 1].playerId as string,
            decisions: facts.decisions ?? { ...DEFAULT_DECISIONS },
            equity: facts.equity ?? INITIAL_EQUITY,
          }
        : null

    const otherBanks = [
      ...new Map(others.map((r) => [r.playerId, r])).values(),
    ].map((r) => ({
      playerId: r.playerId as string,
      decisions: r.facts?.decisions ?? { ...DEFAULT_DECISIONS },
      equity: r.facts?.equity ?? INITIAL_EQUITY,
    }))

    const banks = ownBank ? [ownBank, ...otherBanks] : otherBanks

    const outcomes = clearMarket(
      banks,
      {
        centralBankRate: scenario.centralBankRate,
        depositPool: scenario.depositPool,
        loanDemand: scenario.loanDemand,
        depositSensitivity: scenario.depositSensitivity,
        loanSensitivity: scenario.loanSensitivity,
        lossGivenDefault: scenario.lossGivenDefault,
        fixedCost: scenario.fixedCost,
      },
      segmentFacts.realizedDefaultRate
    )
    const ranks = rankByEquity(outcomes)

    const market: MarketEntry[] = outcomes.map((o) => ({
      playerId: o.playerId,
      depositRate: o.decisions.depositRate,
      loanRate: o.decisions.loanRate,
      deposits: o.deposits,
      loanDemand: o.loanDemand,
      loans: o.loans,
      depositShare: o.depositShare,
      loanShare: o.loanShare,
      profit: o.income.profit,
      equity: o.equityEnd,
      rank: ranks.get(o.playerId) ?? 0,
    }))

    const mine = outcomes.find((o) => o.playerId === ownPlayerId)
    if (!mine) {
      // defensive: without an own outcome there is nothing to update
      debugLog('PeriodResultEnd: own outcome missing', ownPlayerId, outcomes)
      return
    }

    draft.resultFacts.equity = mine.equityEnd
    draft.resultFacts.cumulativeProfit =
      (facts.cumulativeProfit ?? 0) + mine.income.profit
    draft.resultFacts.rank = ranks.get(mine.playerId) ?? 0
    draft.resultFacts.lastMarket = market
    draft.resultFacts.history = [
      ...(facts.history ?? []),
      {
        periodIx,
        decisions: mine.decisions,
        deposits: mine.deposits,
        loanDemand: mine.loanDemand,
        loans: mine.loans,
        excess: mine.excess,
        realizedDefaultRate: segmentFacts.realizedDefaultRate,
        income: mine.income,
        equityStart: mine.equityStart,
        equityEnd: mine.equityEnd,
        roe: mine.roe,
        rank: ranks.get(mine.playerId) ?? 0,
      },
    ]
  })

  debugLog('PeriodResultEnd', facts, payload, resultFacts)
  return resultFacts
}
