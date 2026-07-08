import { OutputFactsGame, PayloadGame } from '@gbl-uzh/platform'
import { debugLog } from '@gbl-uzh/platform/dist/lib/util'
import { produce } from 'immer'
import { GameFacts } from '../types/Game'

type OutputGameFacts = OutputFactsGame<GameFacts, any, any>

export function update(
  facts: GameFacts,
  payload: PayloadGame
): OutputGameFacts {
  const baseFacts: OutputGameFacts = {
    updatedGameFacts: undefined,
  }

  const updatedFacts: OutputGameFacts = produce(
    baseFacts,
    (draft: OutputGameFacts) => {
      draft.updatedGameFacts = {
        ...facts,
        myInt: facts.myInt + 1,
      }
    }
  )

  debugLog('GameFactsUpdate', facts, payload, updatedFacts)
  return updatedFacts
}
