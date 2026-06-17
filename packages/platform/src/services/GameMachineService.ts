import * as DB from '@prisma/client'
import { gameMachine } from '../machines/gameMachine.js'
import { buildTransitionContext } from './GameTransitions.js'

/**
 * Bridge between the persisted game row and the XState game machine.
 *
 * The machine is not persisted in its own column: its state value is
 * `game.status` and its guard context is derived from periods/segments.
 */

export type GameRowForMachine = {
  status: DB.GameStatus
} & Parameters<typeof buildTransitionContext>[0]

export function getGameMachineSnapshot(game: GameRowForMachine) {
  return gameMachine.resolveState({
    value: game.status,
    context: buildTransitionContext(game),
  })
}
