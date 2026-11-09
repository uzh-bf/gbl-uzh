import { createPubSub } from 'graphql-yoga'
import { describe, expect, it } from 'vitest'
import { closeOnAbort } from './pubsub.js'

describe('closeOnAbort', () => {
  it('releases the pubsub listener when the request is aborted', async () => {
    const eventTarget = new EventTarget()
    let listeners = 0
    const add = eventTarget.addEventListener.bind(eventTarget)
    const remove = eventTarget.removeEventListener.bind(eventTarget)
    eventTarget.addEventListener = (...args) => {
      listeners++
      add(...args)
    }
    eventTarget.removeEventListener = (...args) => {
      listeners--
      remove(...args)
    }

    const pubSub = createPubSub<{ topic: [value: number] }>({ eventTarget })
    const controller = new AbortController()
    const iterator = closeOnAbort(pubSub.subscribe('topic'), controller.signal)

    const pending = iterator.next()
    await new Promise((resolve) => setImmediate(resolve))
    expect(listeners).toBe(1)

    controller.abort()

    await expect(pending).resolves.toMatchObject({ done: true })
    expect(listeners).toBe(0)
  })

  it('returns an already aborted subscription immediately', async () => {
    const pubSub = createPubSub<{ topic: [value: number] }>()
    const controller = new AbortController()
    controller.abort()

    const iterator = closeOnAbort(pubSub.subscribe('topic'), controller.signal)

    await expect(iterator.next()).resolves.toMatchObject({ done: true })
  })
})
