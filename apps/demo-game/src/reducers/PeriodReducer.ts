import { Action, ResultState } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { PeriodFacts, PeriodSegmentFacts } from '@graphql/index'
import { PrismaClient } from '@prisma/client'
import { produce } from 'immer'
import { P, match } from 'ts-pattern'

export enum ActionTypes {
  PERIOD_INITIALIZE = 'PERIOD_INITIALIZE',
  PERIOD_CONSOLIDATE = 'PERIOD_CONSOLIDATE',
}

type State = {}

type Actions =
  | Action<
      ActionTypes.PERIOD_INITIALIZE,
      {
        periodIx: number
        periodFacts: PeriodFacts
        previousPeriodFacts?: PeriodFacts
        previousSegmentFacts?: PeriodSegmentFacts
      },
      PrismaClient
    >
  | Action<
      ActionTypes.PERIOD_CONSOLIDATE,
      {
        periodIx: number
        previousSegmentFacts?: PeriodSegmentFacts
      },
      PrismaClient
    >

export function apply(
  state: State,
  action: Actions
): ResultState<ActionTypes, State> {
  const baseState: ResultState<ActionTypes, State> = {
    type: action.type,
    result: state,
    isDirty: false,
  }

  const newState = produce(baseState, (draft) => {
    match(action)
      .with(
        { type: ActionTypes.PERIOD_CONSOLIDATE, payload: P.select() },
        (payload) => {}
      )
      .with(
        { type: ActionTypes.PERIOD_INITIALIZE, payload: P.select() },
        (payload) => {}
      )
      .exhaustive()
  })

  const resultState = produce(newState, (draft) => {
    draft.isDirty = baseState !== newState
  })

  debugLog('PeriodReducer', state, action, resultState)

  return resultState
}
