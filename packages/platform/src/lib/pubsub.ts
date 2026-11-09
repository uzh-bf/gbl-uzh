import { createPubSub } from 'graphql-yoga'
import type { Event as PlatformEvent } from '../types.js'

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
 * End a subscription iterator when its HTTP request is aborted.
 *
 * With graphql-yoga 4 behind a Node server (@whatwg-node/server 0.9), an SSE
 * client disconnect aborts the request signal but never cancels the response
 * stream, so the pubsub iterator is never returned. Its event listener then
 * stays registered and queues every later event until the heap runs out.
 */
export function closeOnAbort<T>(
  iterator: AsyncIterableIterator<T>,
  signal: AbortSignal | undefined
): AsyncIterableIterator<T> {
  if (!signal) return iterator

  const close = () => {
    void iterator.return?.()
  }

  if (signal.aborted) {
    close()
  } else {
    signal.addEventListener('abort', close, { once: true })
  }

  return iterator
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
