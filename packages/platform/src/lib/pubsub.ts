import { createPubSub } from 'graphql-yoga'
import type { Event as PlatformEvent } from '../types.js'
import { bridgeRealtimeEvents } from './realtime.js'

// We use a string instead of BaseGlobalNotificationType for PlatformEvent to
// make it more flexible with Custom Notifications as these are anyway enum
// strings.
type PubSubChannels = {
  'global:events': [event: PlatformEvent<string>]
  'user:events': [userId: string, events: any]
}

function createDefaultPubSub() {
  return createPubSub<PubSubChannels>()
}

declare global {
  var __gbl_pubsub: ReturnType<typeof createDefaultPubSub> | undefined
  var __gbl_realtime_pubsub_bridge: boolean | undefined
}

function getOrCreatePubSub() {
  if (process.env.NODE_ENV !== 'production') {
    const cached = globalThis.__gbl_pubsub
    if (cached) return cached
  }
  const instance = createDefaultPubSub()
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__gbl_pubsub = instance
  }
  return instance
}

let currentPubSub = getOrCreatePubSub()

export let pubSub = currentPubSub

// EventService publishes to the shared realtime bus only; mirror those events
// into the GraphQL pubsub so nexus subscriptions in the example games still
// fire. Guarded on globalThis so dev HMR re-evaluation cannot double-publish,
// and resolved through getPubSub() so a later setPubSub() swap (e.g. Redis)
// keeps receiving bridged events.
function ensureRealtimeBridge() {
  if (globalThis.__gbl_realtime_pubsub_bridge) return
  globalThis.__gbl_realtime_pubsub_bridge = true

  bridgeRealtimeEvents({
    onGlobal: (event) => {
      getPubSub().publish('global:events', event)
    },
    onUser: (userId, events) => {
      getPubSub().publish('user:events', userId, events)
    },
  })
}

ensureRealtimeBridge()

export function getPubSub() {
  if (process.env.NODE_ENV !== 'production') {
    const cached = globalThis.__gbl_pubsub
    if (cached) {
      currentPubSub = cached
      pubSub = cached
      return cached
    }
    globalThis.__gbl_pubsub = currentPubSub
  }

  return currentPubSub
}

/**
 * Replace the default in-memory pubSub with one backed by a custom event target
 * (e.g. Redis). Must be called before the first GraphQL request is handled.
 */
export function configurePubSub(eventTarget: EventTarget) {
  currentPubSub = createPubSub<PubSubChannels>({ eventTarget })
  pubSub = currentPubSub
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__gbl_pubsub = currentPubSub
  }
}
