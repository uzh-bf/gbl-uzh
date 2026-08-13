import { describe, expect, it } from '@jest/globals'
import {
  bridgeRealtimeEvents,
  publishGlobalNotificationRealtime,
  subscribeToGlobalEvents,
} from '../src/lib/realtime.js'
import { publishGlobalNotification } from '../src/services/EventService.js'
import { createCallerFactory } from '../src/trpc/init.js'
import { createPlatformRouter } from '../src/trpc/createPlatformRouter.js'
import { UserRole } from '../src/types.js'
import { createTestContext } from './helpers.js'

const router = createPlatformRouter({})
const createCaller = createCallerFactory(router)

describe('game-scoped realtime events', () => {
  it('preserves the published one-argument GraphQL compatibility call', async () => {
    const aggregateEvent = new Promise((resolve) => {
      bridgeRealtimeEvents({
        onGlobal: resolve,
        onUser: () => undefined,
      })
    })
    const event = { type: 'LEGACY_EVENT', facts: {} }

    publishGlobalNotification(event)

    await expect(aggregateEvent).resolves.toEqual(event)
  })

  it('also game-scopes a legacy call when its facts contain a valid game', async () => {
    const controller = new AbortController()
    const gameEvents = subscribeToGlobalEvents(3, controller.signal)[
      Symbol.asyncIterator
    ]()
    const nextEvent = gameEvents.next()
    const event = { type: 'LEGACY_GAME_EVENT', facts: { gameId: 3 } }

    publishGlobalNotification(event)

    await expect(nextEvent).resolves.toEqual({ done: false, value: event })
    controller.abort()
  })

  it('rejects a player subscription without a server-derived game', async () => {
    const caller = createCaller(
      createTestContext({
        user: { sub: 'player-without-game', role: UserRole.PLAYER },
      })
    )

    await expect(caller.events.global()).rejects.toMatchObject({
      code: 'FORBIDDEN',
    })
  })

  it("does not deliver one game's event to another game", async () => {
    const gameAController = new AbortController()
    const gameBController = new AbortController()
    const gameAEvents = subscribeToGlobalEvents(1, gameAController.signal)[
      Symbol.asyncIterator
    ]()
    const gameBEvents = subscribeToGlobalEvents(2, gameBController.signal)[
      Symbol.asyncIterator
    ]()

    const nextForA = gameAEvents.next()
    const nextForB = gameBEvents.next()
    publishGlobalNotificationRealtime(1, {
      type: 'GAME_A_UPDATED',
      facts: { gameId: 1 },
    })
    publishGlobalNotificationRealtime(2, {
      type: 'GAME_B_UPDATED',
      facts: { gameId: 2 },
    })

    await expect(nextForA).resolves.toEqual({
      done: false,
      value: { type: 'GAME_A_UPDATED', facts: { gameId: 1 } },
    })
    await expect(nextForB).resolves.toEqual({
      done: false,
      value: { type: 'GAME_B_UPDATED', facts: { gameId: 2 } },
    })

    gameAController.abort()
    gameBController.abort()
  })
})
