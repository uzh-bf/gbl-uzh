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

const PUBSUB_KEY = Symbol.for('__gbl_pubsub')

function createDefaultPubSub() {
  return createPubSub<PubSubChannels>()
}

function getOrCreatePubSub() {
  if (process.env.NODE_ENV !== 'production') {
    const cached = (globalThis as any)[PUBSUB_KEY]
    if (cached) return cached
  }
  const instance = createDefaultPubSub()
  if (process.env.NODE_ENV !== 'production') {
    ;(globalThis as any)[PUBSUB_KEY] = instance
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
const BRIDGE_KEY = Symbol.for('__gbl_realtime_pubsub_bridge')

function ensureRealtimeBridge() {
  if ((globalThis as any)[BRIDGE_KEY]) return
  ;(globalThis as any)[BRIDGE_KEY] = true

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
    const cached = (globalThis as any)[PUBSUB_KEY]
    if (cached) {
      currentPubSub = cached
      pubSub = cached
      return cached
    }
    ;(globalThis as any)[PUBSUB_KEY] = currentPubSub
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
    ;(globalThis as any)[PUBSUB_KEY] = currentPubSub
  }
}
