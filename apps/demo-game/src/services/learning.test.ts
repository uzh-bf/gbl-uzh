import { EventService, PlayService } from '@gbl-uzh/platform'
import { getPubSub } from '@gbl-uzh/platform/dist/lib/pubsub'
import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'

const levels = [
  { index: 0, requiredXP: 0 },
  { index: 1, requiredXP: 100 },
  { index: 2, requiredXP: 250 },
]
test('XP validation and level calculation cover invalid rewards, multiple levels and maximum level', () => {
  for (const reward of [
    null,
    {},
    { xp: '20' },
    { xp: -1 },
    { xp: 1.5 },
    { xp: Infinity },
    { xp: 2147483648 },
  ])
    expect(EventService.rewardXP(reward)).toBe(0)
  expect(EventService.rewardXP({ xp: 20 })).toBe(20)
  expect(EventService.rewardXP({ xp: 0 })).toBe(0)
  for (const [experience, xp, level, next] of [
    [0, 20, 0, 100],
    [80, 20, 1, 250],
    [0, 300, 2, 0],
    [300, 20, 2, 0],
  ]) {
    const update = EventService.experienceUpdate(
      { experience, levelIx: experience >= 250 ? 2 : 0 },
      xp,
      levels
    )
    expect(update.level.connect.index).toBe(level)
    expect(update.experienceToNext).toBe(next)
  }
})

describe.skipIf(process.env.GBL_TEST_DATABASE !== '1')(
  'learning awards are transactional and repeat-safe',
  { concurrent: false, timeout: 30_000 },
  () => {
    const tag = `xp-test-${randomUUID()}`
    let prisma: typeof import('../lib/prisma').default
    let user: { id: string }
    let game: { id: number }
    let element: { id: string; options: { correct: boolean }[] }
    let correct: string
    let incorrect: string
    let createdEvent = false
    const pubsub = getPubSub()
    const originalPublish = pubsub.publish
    const notifications: { type: string }[] = []

    beforeAll(async () => {
      prisma = (await import('../lib/prisma')).default
      user = await prisma.user.create({ data: { name: tag } })
      game = await prisma.game.create({
        data: { name: tag, facts: {}, ownerId: user.id, activePeriodIx: 0 },
      })
      await prisma.period.create({
        data: { gameId: game.id, index: 0, segmentCount: 1, facts: {} },
      })
      element = await prisma.learningElement.create({
        data: {
          id: tag,
          title: tag,
          question: 'Correct?',
          reward: { xp: 20 },
          options: {
            create: [
              { content: 'Yes', correct: true },
              { content: 'No', correct: false },
            ],
          },
        },
        include: { options: true },
      })
      correct = JSON.stringify([
        element.options.findIndex((option) => option.correct),
      ])
      incorrect = JSON.stringify([
        element.options.findIndex((option) => !option.correct),
      ])
      pubsub.publish = (channel, ...args) => {
        if (channel === 'user:events') notifications.push(...args[1])
        return originalPublish.call(pubsub, channel, ...args)
      }
    }, 30_000)

    const newPlayer = () =>
      prisma.player.create({
        data: {
          gameId: game.id,
          name: tag,
          token: randomUUID(),
          facts: {},
          levelIx: 0,
        },
      })
    const context = (id: string, client: unknown = prisma) =>
      ({
        prisma: client,
        user: { sub: id, gameId: game.id, role: 'PLAYER' },
      }) as Parameters<typeof PlayService.attemptLearningElement>[1]
    const solve = (id: string, client?: unknown) =>
      PlayService.attemptLearningElement(
        { elementId: element.id, selection: correct },
        context(id, client)
      )
    beforeEach(async () => {
      notifications.length = 0
      await prisma.learningElement.update({
        where: { id: element.id },
        data: { reward: { xp: 20 } },
      })
    }, 30_000)
    test('incorrect answers award nothing; concurrent correct answers award exactly once', async () => {
      const player = await newPlayer()
      await PlayService.attemptLearningElement(
        { elementId: element.id, selection: incorrect },
        context(player.id)
      )
      expect(
        (
          await prisma.player.findUniqueOrThrow({
            where: { id: player.id },
          })
        ).experience
      ).toBe(0)
      const results = await Promise.all(
        Array.from({ length: 4 }, () => solve(player.id))
      )
      expect(
        results.every((result) => result?.player?.experience === 20)
      ).toBeTruthy()
      await solve(player.id)
      const saved = await prisma.player.findUniqueOrThrow({
        where: { id: player.id },
      })
      expect(saved.experience).toBe(20)
      expect(saved.completedLearningElementIds).toStrictEqual([element.id])
      expect(
        notifications.filter(
          (event) => event.type === 'LEARNING_ELEMENT_SOLVED'
        )
      ).toHaveLength(1)
    })
    test('transaction failure rolls back completion, XP and notifications', async () => {
      const player = await newPlayer()
      const client = {
        learningElement: prisma.learningElement,
        $transaction: (fn, options) =>
          prisma.$transaction(
            (tx) =>
              fn(
                new Proxy(tx, {
                  get(target, key) {
                    if (key === 'event')
                      return {
                        findMany() {
                          throw new Error('Injected achievement lookup failure')
                        },
                      }
                    return target[key]
                  },
                })
              ),
            options
          ),
      }
      expect(await solve(player.id, client)).toBe(null)
      const saved = await prisma.player.findUniqueOrThrow({
        where: { id: player.id },
        include: { completedLearningElements: true },
      })
      expect(saved.experience).toBe(0)
      expect(saved.completedLearningElementIds).toStrictEqual([])
      expect(saved.completedLearningElements).toStrictEqual([])
      expect(notifications).toStrictEqual([])
    })
    test('serialization failures retry without duplicate rewards', async () => {
      const player = await newPlayer()
      let attempts = 0
      const client = {
        learningElement: prisma.learningElement,
        $transaction: (fn, options) => {
          if (++attempts < 3)
            throw Object.assign(new Error('Conflict'), { code: 'P2034' })
          return prisma.$transaction(fn, options)
        },
      }
      expect((await solve(player.id, client))?.player?.experience).toBe(20)
      expect(attempts).toBe(3)
    })
    test('invalid and absent rewards do not prevent completion', async () => {
      for (const reward of [
        {},
        { xp: -1 },
        { xp: 1.5 },
        { xp: '20' },
        { xp: 0 },
      ]) {
        await prisma.learningElement.update({
          where: { id: element.id },
          data: { reward },
        })
        const player = await newPlayer()
        const result = await solve(player.id)
        expect(result?.player?.experience).toBe(0)
        expect(result?.player?.completedLearningElementIds).toStrictEqual([
          element.id,
        ])
      }
    })
    test('achievement XP is additional, atomic and awarded only on first solve', async () => {
      const event = await prisma.event.findUnique({
        where: { id: 'LEARNING_ELEMENT_SOLVED' },
      })
      if (!event) {
        await prisma.event.create({
          data: { id: 'LEARNING_ELEMENT_SOLVED' },
        })
        createdEvent = true
      }
      await prisma.achievement.create({
        data: {
          id: tag,
          name: tag,
          description: tag,
          when: 'EACH',
          scope: 'GAME',
          onEventId: 'LEARNING_ELEMENT_SOLVED',
          reward: { xp: 90 },
          conditions: [{ fact: 'elementId', op: 'eq', value: element.id }],
        },
      })
      const player = await newPlayer()
      const result = await solve(player.id)
      expect(result?.player?.experience).toBe(110)
      expect(result?.player?.levelIx).toBe(1)
      expect(
        notifications.filter((event) => event.type === 'LEVEL_UP')
      ).toHaveLength(1)
      expect((await solve(player.id))?.player?.experience).toBe(110)
      const award = await prisma.achievementInstance.findFirstOrThrow({
        where: { playerId: player.id, achievementId: tag },
      })
      expect(award.count).toBe(1)
    })
    test('legacy completions in either representation preserve existing XP and never award again', async () => {
      for (const completion of [
        { completedLearningElementIds: [element.id, element.id] },
        { completedLearningElements: { connect: { id: element.id } } },
      ]) {
        const player = await newPlayer()
        await prisma.player.update({
          where: { id: player.id },
          data: { experience: 95, ...completion },
        })
        notifications.length = 0
        expect((await solve(player.id))?.player?.experience).toBe(95)
        expect((await solve(player.id))?.player?.experience).toBe(95)
        expect(notifications).toStrictEqual([])
        expect(
          await prisma.achievementInstance.count({
            where: { playerId: player.id },
          })
        ).toBe(0)
      }
    })
    afterAll(async () => {
      pubsub.publish = originalPublish
      if (!prisma) return
      try {
        if (game) {
          await prisma.achievementInstance.deleteMany({
            where: { gameId: game.id },
          })
        }
        await prisma.achievement.deleteMany({ where: { id: tag } })
        if (createdEvent) {
          await prisma.event.delete({
            where: { id: 'LEARNING_ELEMENT_SOLVED' },
          })
        }
        if (game) await prisma.game.delete({ where: { id: game.id } })
        if (user) await prisma.user.delete({ where: { id: user.id } })
        await prisma.learningAnswerOption.deleteMany({
          where: { learningElementSlug: tag },
        })
        await prisma.learningElement.deleteMany({ where: { id: tag } })
      } finally {
        await prisma.$disconnect()
      }
    }, 30_000)
  }
)
