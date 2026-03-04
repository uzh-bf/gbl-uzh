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

export let pubSub = getOrCreatePubSub()

/**
 * Replace the default in-memory pubSub with one backed by a custom event target
 * (e.g. Redis). Must be called before the first GraphQL request is handled.
 */
export function configurePubSub(eventTarget: EventTarget) {
  pubSub = createPubSub<PubSubChannels>({ eventTarget })
  if (process.env.NODE_ENV !== 'production') {
    ;(globalThis as any)[PUBSUB_KEY] = pubSub
  }
}
