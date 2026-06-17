import * as DB from '@prisma/client'
import { transition } from 'xstate'
import {
  GAME_EVENTS,
  GAME_TAGS,
  gameMachine,
  type GameEvent,
  type GameStateMeta,
  type GameMachineContext,
  type GameMachineEvent,
  type GameTag,
} from '../machines/gameMachine.js'

export type {
  GameEvent,
  GameLifecyclePhase,
  GameMachineContext,
  GameStateMeta,
  GameTag,
} from '../machines/gameMachine.js'

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
  return transition(gameMachine, snapshot, machineEvent)[0].value as DB.GameStatus
}

export function availableEvents(game: GameRowForMachine): GameEvent[] {
  const snapshot = getGameMachineSnapshot(game)
  return GAME_EVENTS.filter((event) => snapshot.can({ type: event }))
}

function getStateMeta(
  snapshot: ReturnType<typeof getGameMachineSnapshot>
): GameStateMeta {
  const meta = snapshot.getMeta()
  return Object.values(meta)[0] as GameStateMeta
}

export interface GameLifecycleState {
  status: DB.GameStatus
  availableEvents: GameEvent[]
  canActivateNextPeriod: boolean
  canActivateNextSegment: boolean
}

export interface GameLifecycleInsights extends GameLifecycleState {
  tags: GameTag[]
  meta: GameStateMeta
  nextStatuses: Partial<Record<GameEvent, DB.GameStatus>>
  isTerminal: boolean
}

export function getGameLifecycleInsights(
  game: GameRowForMachine
): GameLifecycleInsights {
  const snapshot = getGameMachineSnapshot(game)
  const events = GAME_EVENTS.filter((event) => snapshot.can({ type: event }))
  const nextStatuses = Object.fromEntries(
    events.map((event) => [
      event,
      transition(gameMachine, snapshot, { type: event })[0]
        .value as DB.GameStatus,
    ])
  ) as Partial<Record<GameEvent, DB.GameStatus>>

  return {
    status: game.status,
    availableEvents: events,
    canActivateNextPeriod: events.includes('ACTIVATE_NEXT_PERIOD'),
    canActivateNextSegment: events.includes('ACTIVATE_NEXT_SEGMENT'),
    tags: GAME_TAGS.filter((tag) => snapshot.hasTag(tag)),
    meta: getStateMeta(snapshot),
    nextStatuses,
    isTerminal: snapshot.status === 'done',
  }
}

export function getGameLifecycleState(game: GameRowForMachine): GameLifecycleState {
  const {
    status,
    availableEvents,
    canActivateNextPeriod,
    canActivateNextSegment,
  } = getGameLifecycleInsights(game)

  return {
    status,
    availableEvents,
    canActivateNextPeriod,
    canActivateNextSegment,
  }
}
