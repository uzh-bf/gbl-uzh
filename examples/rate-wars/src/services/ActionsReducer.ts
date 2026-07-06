import { Action } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PrismaClient } from '@prisma/client'
import { produce } from 'immer'
import { RateDecision } from '../types/facts'
import { GameFacts, PeriodFacts, PeriodSegmentFacts } from '../types/index'

export const MIN_DEPOSIT_RATE = 0
export const MAX_DEPOSIT_RATE = 8
export const MIN_LOAN_RATE = 0
export const MAX_LOAN_RATE = 15

export enum ActionTypes {
  SET_RATES = '',
}

type PayloadType = {
  playerArgs: RateDecision
  segmentFacts: PeriodSegmentFacts
  periodFacts: PeriodFacts
  gameFacts: GameFacts
}

type State = {
  decisions: RateDecision
}

type Actions = Action<ActionTypes.SET_RATES, PayloadType, PrismaClient>

export function apply(state: State, action: Actions) {
  const baseState = {
    result: state,
    isDirty: false,
  }

  const newState = produce(baseState, (draft) => {
    const { depositRate, loanRate } = action.payload.playerArgs

    if (
      typeof depositRate !== 'number' ||
      Number.isNaN(depositRate) ||
      typeof loanRate !== 'number' ||
      Number.isNaN(loanRate)
    ) {
      throw new Error('Both rates must be numbers')
    }
    if (depositRate < MIN_DEPOSIT_RATE || depositRate > MAX_DEPOSIT_RATE) {
      throw new Error(
        `Deposit rate must be between ${MIN_DEPOSIT_RATE} and ${MAX_DEPOSIT_RATE} percent`
      )
    }
    if (loanRate < MIN_LOAN_RATE || loanRate > MAX_LOAN_RATE) {
      throw new Error(
        `Loan rate must be between ${MIN_LOAN_RATE} and ${MAX_LOAN_RATE} percent`
      )
    }

    // an inverted spread (deposit > loan) is allowed on purpose — losing
    // money on it is one of the lessons, not an input error

    draft.result.decisions = {
      depositRate: Math.round(depositRate * 100) / 100,
      loanRate: Math.round(loanRate * 100) / 100,
    }
  })

  const resultState = produce(newState, (draft) => {
    draft.isDirty =
      newState.result.decisions.depositRate !== state.decisions?.depositRate ||
      newState.result.decisions.loanRate !== state.decisions?.loanRate
  })

  debugLog('ActionsReducer', state, action, resultState)

  return resultState
}
