import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getMarketDice, revealMarketRoll } from './MarketRevealService'

function fixture() {
  let segment = {
    id: 1,
    gameId: 1,
    index: 0,
    periodIx: 0,
    period: { activeSegmentIx: 0 },
    game: { activePeriodIx: 0 },
    facts: {
      diceRolls: [
        { shared: 2, bonds: 4, stocks: 8 },
        { shared: 5, bonds: 6, stocks: 9 },
      ],
      returns: [
        { bank: 0.002, bonds: -0.1, stocks: 0.3 },
        { bank: 0.002, bonds: 0.1, stocks: 0.3 },
      ],
      revealedRollIndices: [],
      custom: 'keep',
    },
  }
  let version = 0
  const events = []
  const ctx = {
    user: { role: 'ADMIN' },
    pubSub: {
      publish: async (_channel, event) => {
        events.push(event)
      },
    },
    prisma: {
      periodSegment: { findUnique: async () => segment },
      $transaction: async (fn, options) => {
        assert.equal(options.isolationLevel, 'Serializable')
        const startingVersion = version
        const snapshot = structuredClone(segment)
        let updated = false
        const result = await fn({
          periodSegment: {
            findUnique: async () => snapshot,
            update: async ({ data }) => {
              updated = true
              return { ...snapshot, ...data }
            },
          },
        })
        if (updated) {
          if (startingVersion !== version)
            throw Object.assign(new Error('Conflict'), { code: 'P2034' })
          segment = result
          version++
        }
        return result
      },
    },
  } as unknown as Parameters<typeof revealMarketRoll>[2]
  return {
    ctx,
    events,
    get segment() {
      return segment
    },
  }
}

test('reveals merge under concurrent requests and replay never changes outcomes', async () => {
  const f = fixture()
  const initial = structuredClone(f.segment.facts)
  await Promise.all([
    revealMarketRoll(1, 0, f.ctx),
    revealMarketRoll(1, 1, f.ctx),
  ])
  await revealMarketRoll(1, 0, f.ctx)
  assert.deepEqual(f.segment.facts, { ...initial, revealedRollIndices: [0, 1] })
  assert.equal(f.events.length, 3)
  assert.deepEqual(f.events[0], {
    type: 'MARKET_ROLL_REVEALED',
    facts: { gameId: 1 },
  })
})

test('rejects non-admins, missing/invalid rolls and future segments', async () => {
  const f = fixture()
  for (const role of ['PLAYER', undefined]) {
    f.ctx.user = role ? { role } : undefined
    await assert.rejects(revealMarketRoll(1, 0, f.ctx), /Only admins/)
    await assert.rejects(getMarketDice(1, f.ctx), /Only admins/)
  }
  f.ctx.user = { role: 'MASTER' }
  for (const index of [-1, 0.5, 2])
    await assert.rejects(revealMarketRoll(1, index, f.ctx), /Invalid/)
  f.segment.index = 1
  await assert.rejects(revealMarketRoll(1, 0, f.ctx), /Future/)
  f.segment.index = 0
  f.segment.periodIx = 1
  await assert.rejects(revealMarketRoll(1, 0, f.ctx), /Future/)
  assert.equal(f.events.length, 0)
})

test('failed notification can be retried without changing a persisted reveal', async () => {
  const f = fixture()
  const publish = f.ctx.pubSub.publish
  f.ctx.pubSub.publish = () => {
    throw new Error('Disconnected')
  }
  await assert.rejects(revealMarketRoll(1, 0, f.ctx), /Disconnected/)
  assert.deepEqual(f.segment.facts.revealedRollIndices, [0])
  f.ctx.pubSub.publish = publish
  await revealMarketRoll(1, 0, f.ctx)
  assert.deepEqual(f.segment.facts.revealedRollIndices, [0])
  assert.equal(f.events.length, 1)
})
