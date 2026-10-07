import { EventEmitter, on } from 'node:events'
import type { Event as PlatformEvent } from '../types.js'

const GLOBAL_EVENT_AGGREGATE_CHANNEL = 'global:events'
const GAME_EVENT_CHANNEL_PREFIX = 'game:events:'
const USER_EVENT_CHANNEL_PREFIX = 'user:events:'
// Aggregate channel carrying (userId, events) tuples so a bridge can observe
// every user's events without knowing the per-user channel names.
const USER_EVENT_AGGREGATE_CHANNEL = 'user:events'

declare global {
  var __gbl_realtime_event_bus: EventEmitter | undefined
}

// Cache the emitter on globalThis so Next.js dev HMR (which re-evaluates this
// module) does not split publishers and subscribers across separate emitter
// instances, which would silently drop realtime events after a hot reload.
function getOrCreateEventBus(): EventEmitter {
  if (globalThis.__gbl_realtime_event_bus) {
    return globalThis.__gbl_realtime_event_bus
  }

  const instance = new EventEmitter()
  // One listener per active SSE subscription. Use a high finite cap (not 0 =
  // unlimited) so a runaway subscribe loop still trips MaxListenersExceededWarning
  // as an early leak canary instead of silently growing until memory degrades.
  instance.setMaxListeners(1000)
  globalThis.__gbl_realtime_event_bus = instance
  return instance
}

const eventBus = getOrCreateEventBus()

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

export function publishGlobalNotificationRealtime(
  gameId: number,
  event: PlatformEvent<string>
): void {
  eventBus.emit(`${GAME_EVENT_CHANNEL_PREFIX}${gameId}`, event)
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

  eventBus.emit(`${USER_EVENT_CHANNEL_PREFIX}${userId}`, events)
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

// Yields each payload emitted on the channel until the signal aborts.
function subscribe<T>(channel: string, signal?: AbortSignal): AsyncIterable<T> {
  const iterator = on(eventBus, channel, signal ? { signal } : undefined)

  return (async function* () {
    try {
      for await (const [payload] of iterator) {
        yield payload as T
      }
    } catch (error) {
      if (!isAbortError(error)) throw error
    }
  })()
}

export function subscribeToGlobalEvents(
  gameId: number,
  signal?: AbortSignal
): AsyncIterable<PlatformEvent<string>> {
  return subscribe(`${GAME_EVENT_CHANNEL_PREFIX}${gameId}`, signal)
}

export function subscribeToUserEvents(
  userId: string,
  signal?: AbortSignal
): AsyncIterable<PlatformEvent<string>[]> {
  return subscribe(`${USER_EVENT_CHANNEL_PREFIX}${userId}`, signal)
}
