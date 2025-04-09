import { Action } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PrismaClient } from '@prisma/client'
import { produce } from 'immer'
import { Decisions } from '../types/facts'
import { PeriodFacts, PeriodSegmentFacts } from '../types/index'

export enum ActionTypes {
  NONE = '',
}

type PayloadType = {
  playerArgs: Decisions
  segmentFacts: PeriodSegmentFacts
  periodFacts: PeriodFacts
  gameFacts?: any
}

type State = {
  decisions: Decisions
}

type Actions = Action<ActionTypes.NONE, PayloadType, PrismaClient>

export function apply(state: State, action: Actions) {
  // TODO: move this to platform? -> reducer should not have to care about isDirty and other non-user-logicstuff
  const baseState = {
    result: state,
    isDirty: false,
    updatedGameFacts: action.payload.gameFacts,
  }

  // TODO: the user reducer could just get the "draft" inside this function as first parameter
  // TODO: and platform would do all code around it
  const newState = produce(baseState, (draft) => {
    const { bank, bonds, stocks } = action.payload.playerArgs
    if (bank < 0 || bank > 100)
      throw new Error('Bank must be between 0 and 100')
    if (bonds < 0 || bonds > 100)
      throw new Error('Bonds must be between 0 and 100')
    if (stocks < 0 || stocks > 100)
      throw new Error('Stocks must be between 0 and 100')
    if (bank + bonds + stocks !== 100)
      throw new Error('Bank + Bonds + Stocks must equal 100')

    draft.result.decisions = action.payload.playerArgs

    // This is only to test the game facts
    let counter = action.payload.gameFacts.actionCounter || 0
    counter += 1
    draft.updatedGameFacts = {
      actionCounter: counter,
    }
  })

  // this computes the isDirty flag based on whether there were changes in state from baseState to newState
  // can try it by commenting the decision changes/match, after which isDirty will log false
  // TODO: move this to platform code
  // TODO: -> goal: no isDirty computation anymore inside the reducers, instead just derive it from the state changes (or no changes)
  // TODO: after this change, we could maybe make sure that input state and output state are the same
  const resultState = produce(newState, (draft) => {
    draft.isDirty = baseState !== newState
  })

  debugLog('ActionsReducer', state, action, resultState)

  return resultState
}
