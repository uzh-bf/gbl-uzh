import { createPubSub } from 'graphql-yoga'
import type {
  BaseGlobalNotificationType,
  Event as PlatformEvent,
} from '../types.js'

type PubSubChannels = {
  'global:events': [event: PlatformEvent<BaseGlobalNotificationType>]
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
