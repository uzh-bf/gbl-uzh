import { EventEmitter, on } from 'node:events'
import type { Event as PlatformEvent } from '../types.js'

const GLOBAL_EVENT_AGGREGATE_CHANNEL = 'global:events'
const GAME_EVENT_CHANNEL_PREFIX = 'game:events:'
const USER_EVENT_CHANNEL_PREFIX = 'user:events:'
// Aggregate channel carrying (userId, events) tuples so a bridge can observe
// every user's events without knowing the per-user channel names.
const USER_EVENT_AGGREGATE_CHANNEL = 'user:events'

// Cache the emitter on globalThis so Next.js dev HMR (which re-evaluates this
// module) does not split publishers and subscribers across separate emitter
// instances, which would silently drop realtime events after a hot reload.
const REALTIME_EVENT_BUS_KEY = Symbol.for('__gbl_realtime_event_bus')

function getOrCreateEventBus(): EventEmitter {
  const cached = (globalThis as Record<symbol, unknown>)[
    REALTIME_EVENT_BUS_KEY
  ] as EventEmitter | undefined
  if (cached) return cached

  const instance = new EventEmitter()
  // One listener per active SSE subscription. Use a high finite cap (not 0 =
  // unlimited) so a runaway subscribe loop still trips MaxListenersExceededWarning
  // as an early leak canary instead of silently growing until memory degrades.
  instance.setMaxListeners(1000)
  ;(globalThis as Record<symbol, unknown>)[REALTIME_EVENT_BUS_KEY] = instance
  return instance
}

const eventBus = getOrCreateEventBus()

function userChannel(userId: string): string {
  return `${USER_EVENT_CHANNEL_PREFIX}${userId}`
}

function gameChannel(gameId: number): string {
  return `${GAME_EVENT_CHANNEL_PREFIX}${gameId}`
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

export function publishGlobalNotificationRealtime(
  gameId: number,
  event: PlatformEvent<string>
): void {
  eventBus.emit(gameChannel(gameId), event)
  publishGlobalNotificationAggregateRealtime(event)
}

export function publishGlobalNotificationAggregateRealtime(
  event: PlatformEvent<string>
): void {
  // GraphQL compatibility still consumes one aggregate stream. tRPC clients
  // subscribe to game-scoped channels and never receive this stream.
  eventBus.emit(GLOBAL_EVENT_AGGREGATE_CHANNEL, event)
}

export function publishUserNotificationRealtime(
  userId: string,
  events: PlatformEvent<string>[]
): void {
  if (!events.length) return

  eventBus.emit(userChannel(userId), events)
  eventBus.emit(USER_EVENT_AGGREGATE_CHANNEL, userId, events)
}

// Lets the GraphQL pubsub (loaded only by the example games) mirror the
// realtime bus, so EventService can stay transport-agnostic and the tRPC apps
// never have to import graphql-yoga.
export function bridgeRealtimeEvents(handlers: {
  onGlobal: (event: PlatformEvent<string>) => void
  onUser: (userId: string, events: PlatformEvent<string>[]) => void
}): void {
  eventBus.on(GLOBAL_EVENT_AGGREGATE_CHANNEL, handlers.onGlobal)
  eventBus.on(USER_EVENT_AGGREGATE_CHANNEL, (userId, events) =>
    handlers.onUser(userId as string, events as PlatformEvent<string>[])
  )
}

export function subscribeToGlobalEvents(
  gameId: number,
  signal?: AbortSignal
): AsyncIterable<PlatformEvent<string>> {
  const iterator = on(
    eventBus,
    gameChannel(gameId),
    signal ? { signal } : undefined
  )

  return (async function* () {
    try {
      for await (const [event] of iterator) {
        yield event as PlatformEvent<string>
      }
    } catch (error) {
      if (!isAbortError(error)) throw error
    }
  })()
}

export function subscribeToUserEvents(
  userId: string,
  signal?: AbortSignal
): AsyncIterable<PlatformEvent<string>[]> {
  const iterator = on(
    eventBus,
    userChannel(userId),
    signal ? { signal } : undefined
  )

  return (async function* () {
    try {
      for await (const [events] of iterator) {
        yield events as PlatformEvent<string>[]
      }
    } catch (error) {
      if (!isAbortError(error)) throw error
    }
  })()
}
