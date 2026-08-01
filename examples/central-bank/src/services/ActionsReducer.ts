import { Action } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PrismaClient } from '@prisma/client'
import { produce } from 'immer'
import { Decisions } from '../types/facts'
import { GameFacts, PeriodFacts, PeriodSegmentFacts } from '../types/index'

export enum ActionTypes {
  NONE = '',
}

type PayloadType = {
  playerArgs: Decisions
  segmentFacts: PeriodSegmentFacts
  periodFacts: PeriodFacts
  gameFacts: GameFacts
}

type State = {
  decisions: Decisions
}

type Actions = Action<ActionTypes.NONE, PayloadType, PrismaClient>

export function apply(state: State, action: Actions) {
  const baseState = {
    result: state,
    isDirty: false,
  }

  const newState = produce(baseState, (draft) => {
    const { rate } = action.payload.playerArgs
    if (rate === undefined || rate === null) {
      throw new Error('Policy interest rate must be specified')
    }
    if (rate < 0 || rate > 15) {
      throw new Error('Policy interest rate must be between 0% and 15%')
    }

    draft.result.decisions = action.payload.playerArgs
  })

  const resultState = produce(newState, (draft) => {
    draft.isDirty = baseState !== newState
  })

  debugLog('ActionsReducer', state, action, resultState)

  return resultState
}
