import * as DB from '@prisma/client'
import { getNextSnapshot } from 'xstate'
import {
  GAME_EVENTS,
  gameMachine,
  type GameEvent,
  type GameMachineContext,
  type GameMachineEvent,
} from '../machines/gameMachine.js'

export type { GameEvent, GameMachineContext } from '../machines/gameMachine.js'

/**
 * Bridge between the persisted game row and the XState game machine.
 *
 * The machine is not persisted in its own column: its state value is
 * `game.status` and its guard context is derived from periods/segments.
 */

/**
 * The active-period shape varies between call sites because each Prisma include
 * loads a different subset. The body reads only these defensive fields.
 */
export type GameMachineContextInput = {
  activePeriodIx: number
  periods?: unknown[] | null
  activePeriod?: any
}

export type GameRowForMachine = {
  status: DB.GameStatus
} & GameMachineContextInput

export function buildGameMachineContext(
  game: GameMachineContextInput
): GameMachineContext {
  const totalPeriods = Array.isArray(game.periods) ? game.periods.length : 0
  const segments = game.activePeriod?.segments
  const segmentCount = Array.isArray(segments)
    ? segments.length
    : (game.activePeriod?.segmentCount ?? 0)

  return {
    activePeriodIx: game.activePeriodIx,
    totalPeriods,
    segmentCount,
    hasActiveSegment: game.activePeriod?.activeSegment != null,
    hasNextSegment: game.activePeriod?.activeSegment?.nextSegment != null,
  }
}

export function getGameMachineSnapshot(game: GameRowForMachine) {
  return gameMachine.resolveState({
    value: game.status,
    context: buildGameMachineContext(game),
  })
}

export function canTransition(
  game: GameRowForMachine,
  event: GameEvent
): boolean {
  return getGameMachineSnapshot(game).can({ type: event })
}

export function nextStatus(
  game: GameRowForMachine,
  event: GameEvent
): DB.GameStatus | null {
  const snapshot = getGameMachineSnapshot(game)
  const machineEvent: GameMachineEvent = { type: event }
  if (!snapshot.can(machineEvent)) return null
  return getNextSnapshot(
    gameMachine,
    snapshot,
    machineEvent
  ).value as DB.GameStatus
}

export function availableEvents(game: GameRowForMachine): GameEvent[] {
  const snapshot = getGameMachineSnapshot(game)
  return GAME_EVENTS.filter((event) => snapshot.can({ type: event }))
}

export interface GameLifecycleState {
  status: DB.GameStatus
  availableEvents: GameEvent[]
  canActivateNextPeriod: boolean
  canActivateNextSegment: boolean
}

export function getGameLifecycleState(game: GameRowForMachine): GameLifecycleState {
  const events = availableEvents(game)
  return {
    status: game.status,
    availableEvents: events,
    canActivateNextPeriod: events.includes('ACTIVATE_NEXT_PERIOD'),
    canActivateNextSegment: events.includes('ACTIVATE_NEXT_SEGMENT'),
  }
}
