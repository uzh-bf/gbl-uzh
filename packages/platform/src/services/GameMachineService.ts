import * as DB from '@prisma/client'
import { createActor, type AnyStateMachine } from 'xstate'
import { gameMachine } from '../machines/gameMachine.js'
import {
  availableEvents,
  buildTransitionContext,
  canTransition,
  type GameEvent,
} from './GameTransitions.js'

/**
 * Bridge between the persisted game row and the XState game machine.
 *
 * The machine is intentionally NOT persisted in its own column: its state value
 * is exactly `game.status` and its guard context is fully derived from the
 * game's periods/segments. The database row therefore already IS the machine's
 * persisted state, and the snapshot is reconstructed on demand here. This keeps
 * the schema unchanged and removes any risk of a stored snapshot drifting from
 * the canonical `game.status`.
 */

/** The minimal game-row shape needed to reconstruct the machine. */
export type GameRowForMachine = {
  status: DB.GameStatus
} & Parameters<typeof buildTransitionContext>[0]

/**
 * Reconstruct the machine snapshot for a game from its database row. Pass the
 * result to `createActor(gameMachine, { snapshot })` (e.g. to feed the
 * inspector) or read its `.value` / `.can()` directly.
 */
export function getGameMachineSnapshot(game: GameRowForMachine) {
  return (gameMachine as AnyStateMachine).resolveState({
    value: game.status,
    context: buildTransitionContext(game),
  })
}

/**
 * Create and start an actor reflecting the game's current state. The caller is
 * responsible for calling `.stop()` when finished.
 */
export function hydrateGameActor(game: GameRowForMachine) {
  const actor = createActor(gameMachine, {
    snapshot: getGameMachineSnapshot(game),
  })
  actor.start()
  return actor
}

export interface GameLifecycleState {
  status: DB.GameStatus
  /** events that are currently valid from this state */
  availableEvents: GameEvent[]
  canActivateNextPeriod: boolean
  canActivateNextSegment: boolean
}

/**
 * The lifecycle view used to drive admin controls: which transitions are valid
 * right now. Derived from the transition table (the machine's single source of
 * truth), so it is cheap and needs no actor instance.
 */
export function getGameLifecycleState(game: GameRowForMachine): GameLifecycleState {
  const ctx = buildTransitionContext(game)
  return {
    status: game.status,
    availableEvents: availableEvents(game.status, ctx),
    canActivateNextPeriod: canTransition(game.status, 'ACTIVATE_NEXT_PERIOD', ctx),
    canActivateNextSegment: canTransition(
      game.status,
      'ACTIVATE_NEXT_SEGMENT',
      ctx
    ),
  }
}
