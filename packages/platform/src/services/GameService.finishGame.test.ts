import * as DB from '@prisma/client'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { finishGame } from './GameService.js'
import { BaseGlobalNotificationType } from '../types.js'

/**
 * Demonstrates the injectable-publish seam (S3): finishGame is now unit-testable
 * with a tiny Prisma fake and a spy publisher — no real database, no pubsub
 * singleton, and no second realtime read (the default publisher, which would do
 * that read, is replaced by the spy).
 */

function fakePrisma(game: any, captured: { update?: any }) {
  return {
    game: {
      findUnique: async () => game,
      update: async (arg: any) => {
        captured.update = arg
        return { id: game.id, status: DB.GameStatus.COMPLETED }
      },
    },
  }
}

test('finishGame: RESULTS -> COMPLETED commits with OCC and calls the injected publisher', async () => {
  // activePeriodIx (2) >= periods.length (2) => FINISH_GAME guard satisfied
  const game = {
    id: 1,
    status: DB.GameStatus.RESULTS,
    activePeriodIx: 2,
    periods: [{}, {}],
  }
  const captured: { update?: any } = {}
  const publishCalls: Array<[number, BaseGlobalNotificationType]> = []

  const ctx: any = {
    user: { sub: 'admin', role: 'ADMIN' },
    prisma: fakePrisma(game, captured),
  }

  const result = await finishGame({ gameId: 1 }, ctx, {
    publish: (gameId, type) => {
      publishCalls.push([gameId, type])
    },
  })

  assert.equal(result!.status, DB.GameStatus.COMPLETED)
  // optimistic-concurrency guard: only writes if status is still RESULTS
  assert.deepEqual(captured.update.where, {
    id: 1,
    status: DB.GameStatus.RESULTS,
  })
  assert.deepEqual(captured.update.data, {
    status: DB.GameStatus.COMPLETED,
    version: { increment: 1 },
  })
  // the injected publisher ran instead of the default realtime read
  assert.deepEqual(publishCalls, [[1, BaseGlobalNotificationType.GAME_STATE_UPDATED]])
})

test('finishGame: no-op (returns null, never publishes) when the transition is invalid', async () => {
  // still mid-game: activePeriodIx (1) < periods.length (2) => FINISH_GAME blocked
  const game = {
    id: 1,
    status: DB.GameStatus.RESULTS,
    activePeriodIx: 1,
    periods: [{}, {}],
  }
  const captured: { update?: any } = {}
  const publishCalls: any[] = []

  const ctx: any = {
    user: { sub: 'admin', role: 'ADMIN' },
    prisma: fakePrisma(game, captured),
  }

  const result = await finishGame({ gameId: 1 }, ctx, {
    publish: (gameId, type) => {
      publishCalls.push([gameId, type])
    },
  })

  assert.equal(result, null)
  assert.equal(captured.update, undefined)
  assert.equal(publishCalls.length, 0)
})
