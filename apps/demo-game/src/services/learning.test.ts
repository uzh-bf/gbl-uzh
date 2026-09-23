import { EventService, PlayService } from '@gbl-uzh/platform'
import { getPubSub } from '@gbl-uzh/platform/dist/lib/pubsub'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { test } from 'node:test'
import prisma from '../lib/prisma'

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
    assert.equal(EventService.rewardXP(reward), 0)
  assert.equal(EventService.rewardXP({ xp: 20 }), 20)
  assert.equal(EventService.rewardXP({ xp: 0 }), 0)
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
    assert.equal(update.level.connect.index, level)
    assert.equal(update.experienceToNext, next)
  }
})

test(
  'learning awards are transactional and repeat-safe',
  {
    skip: process.env.GBL_TEST_DATABASE !== '1',
  },
  async (t) => {
    const tag = `xp-test-${randomUUID()}`
    const user = await prisma.user.create({ data: { name: tag } })
    const game = await prisma.game.create({
      data: { name: tag, facts: {}, ownerId: user.id, activePeriodIx: 0 },
    })
    await prisma.period.create({
      data: { gameId: game.id, index: 0, segmentCount: 1, facts: {} },
    })
    const element = await prisma.learningElement.create({
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
    const correct = JSON.stringify([
      element.options.findIndex((option) => option.correct),
    ])
    const incorrect = JSON.stringify([
      element.options.findIndex((option) => !option.correct),
    ])
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
    const pubsub = getPubSub()
    const originalPublish = pubsub.publish
    const notifications: { type: string }[] = []
    pubsub.publish = (channel, ...args) => {
      if (channel === 'user:events') notifications.push(...args[1])
      return originalPublish.call(pubsub, channel, ...args)
    }
    let createdEvent = false
    try {
      await t.test(
        'incorrect answers award nothing; concurrent correct answers award exactly once',
        async () => {
          const player = await newPlayer()
          await PlayService.attemptLearningElement(
            { elementId: element.id, selection: incorrect },
            context(player.id)
          )
          assert.equal(
            (
              await prisma.player.findUniqueOrThrow({
                where: { id: player.id },
              })
            ).experience,
            0
          )
          const results = await Promise.all(
            Array.from({ length: 4 }, () => solve(player.id))
          )
          assert.ok(
            results.every((result) => result?.player?.experience === 20)
          )
          await solve(player.id)
          const saved = await prisma.player.findUniqueOrThrow({
            where: { id: player.id },
          })
          assert.equal(saved.experience, 20)
          assert.deepEqual(saved.completedLearningElementIds, [element.id])
          assert.equal(
            notifications.filter(
              (event) => event.type === 'LEARNING_ELEMENT_SOLVED'
            ).length,
            1
          )
        }
      )
      await t.test(
        'transaction failure rolls back completion, XP and notifications',
        async () => {
          const player = await newPlayer()
          notifications.length = 0
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
                              throw new Error(
                                'Injected achievement lookup failure'
                              )
                            },
                          }
                        return target[key]
                      },
                    })
                  ),
                options
              ),
          }
          assert.equal(await solve(player.id, client), null)
          const saved = await prisma.player.findUniqueOrThrow({
            where: { id: player.id },
            include: { completedLearningElements: true },
          })
          assert.equal(saved.experience, 0)
          assert.deepEqual(saved.completedLearningElementIds, [])
          assert.deepEqual(saved.completedLearningElements, [])
          assert.deepEqual(notifications, [])
        }
      )
      await t.test(
        'serialization failures retry without duplicate rewards',
        async () => {
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
          assert.equal((await solve(player.id, client))?.player?.experience, 20)
          assert.equal(attempts, 3)
        }
      )
      await t.test(
        'invalid and absent rewards do not prevent completion',
        async () => {
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
            assert.equal(result?.player?.experience, 0)
            assert.deepEqual(result?.player?.completedLearningElementIds, [
              element.id,
            ])
          }
          await prisma.learningElement.update({
            where: { id: element.id },
            data: { reward: { xp: 20 } },
          })
        }
      )
      await t.test(
        'achievement XP is additional, atomic and awarded only on first solve',
        async () => {
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
          notifications.length = 0
          const result = await solve(player.id)
          assert.equal(result?.player?.experience, 110)
          assert.equal(result?.player?.levelIx, 1)
          assert.equal(
            notifications.filter((event) => event.type === 'LEVEL_UP').length,
            1
          )
          assert.equal((await solve(player.id))?.player?.experience, 110)
          const award = await prisma.achievementInstance.findFirstOrThrow({
            where: { playerId: player.id, achievementId: tag },
          })
          assert.equal(award.count, 1)
        }
      )
      await t.test(
        'legacy completions in either representation preserve existing XP and never award again',
        async () => {
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
            assert.equal((await solve(player.id))?.player?.experience, 95)
            assert.equal((await solve(player.id))?.player?.experience, 95)
            assert.deepEqual(notifications, [])
            assert.equal(
              await prisma.achievementInstance.count({
                where: { playerId: player.id },
              }),
              0
            )
          }
        }
      )
    } finally {
      pubsub.publish = originalPublish
      await prisma.achievementInstance.deleteMany({
        where: { gameId: game.id },
      })
      await prisma.achievement.deleteMany({ where: { id: tag } })
      if (createdEvent)
        await prisma.event.delete({ where: { id: 'LEARNING_ELEMENT_SOLVED' } })
      await prisma.game.delete({ where: { id: game.id } })
      await prisma.user.delete({ where: { id: user.id } })
      await prisma.learningAnswerOption.deleteMany({
        where: { learningElementSlug: element.id },
      })
      await prisma.learningElement.delete({ where: { id: element.id } })
      await prisma.$disconnect()
    }
  }
)
