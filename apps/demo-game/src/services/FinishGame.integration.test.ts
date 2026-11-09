import { getPubSub } from '@gbl-uzh/platform/dist/lib/pubsub'
import {
  activateNextPeriod,
  finishGame,
} from '@gbl-uzh/platform/dist/services/GameService'
import { randomUUID } from 'node:crypto'
import { expect, test, vi } from 'vitest'
import prisma from '../lib/prisma'

test.skipIf(process.env.FINISH_GAME_DATABASE_TESTS !== '1')(
  'only the manager can finish from RESULTS, and a duplicate or competing advance cannot settle twice',
  async () => {
    const owner = await prisma.user.create({
      data: { email: `${randomUUID()}@finish.test` },
    })
    const game = await prisma.game.create({
      data: {
        name: 'Finish game test',
        ownerId: owner.id,
        facts: {},
        periods: {
          create: [0, 1].map((index) => ({
            index,
            segmentCount: 1,
            facts: {},
          })),
        },
        players: { create: { facts: {}, levelIx: 0, token: randomUUID() } },
      },
      include: { periods: { orderBy: { index: 'asc' } }, players: true },
    })
    const admin = { prisma, user: { sub: owner.id, role: 'ADMIN' } }
    const publish = vi.spyOn(getPubSub(), 'publish')
    try {
      await expect(finishGame(game.id, admin as never)).rejects.toThrow(
        'period results'
      )
      const [settled, upcoming] = game.periods
      await prisma.period.update({
        where: { id: settled.id },
        data: { nextPeriodId: upcoming.id },
      })
      const end = await prisma.playerResult.create({
        data: {
          gameId: game.id,
          playerId: game.players[0].id,
          periodId: settled.id,
          periodIx: 0,
          type: 'PERIOD_END',
          facts: { balance: 42 },
        },
      })
      await prisma.game.update({
        where: { id: game.id },
        data: {
          status: 'RESULTS',
          activePeriodIx: 1,
          activePeriodId: upcoming.id,
        },
      })
      for (const user of [
        undefined,
        { sub: owner.id, role: 'PLAYER' },
      ]) {
        await expect(
          finishGame(game.id, { prisma, user } as never)
        ).rejects.toThrow('FORBIDDEN')
      }

      // Finish after Next Period reads RESULTS but before its transaction writes.
      const racingClient = prisma.$extends({
        query: {
          game: {
            async findUnique({ args, query }) {
              const snapshot = await query(args)
              const master = {
                prisma,
                user: { sub: randomUUID(), role: 'MASTER' },
              }
              const completions = await Promise.all([
                finishGame(game.id, admin as never),
                finishGame(game.id, master as never),
              ])
              for (const completed of completions)
                expect(completed).toMatchObject({
                  status: 'COMPLETED',
                  version: 1,
                  activePeriodId: null,
                })
              return snapshot
            },
          },
        },
      })
      await expect(
        activateNextPeriod(
          { gameId: game.id },
          { ...admin, prisma: racingClient } as never,
          {
            services: {
              PeriodResult: {
                start: (facts: unknown) => ({ resultFacts: facts }),
              },
            },
          } as never
        )
      ).rejects.toMatchObject({ code: 'P2025' })

      await expect(finishGame(game.id, admin as never)).resolves.toMatchObject({
        status: 'COMPLETED',
        version: 1,
      })
      expect(publish).toHaveBeenCalledTimes(1)
      expect(publish).toHaveBeenCalledWith('global:events', {
        type: 'GAME_COMPLETED',
        facts: {
          gameId: game.id,
          status: 'COMPLETED',
          version: 1,
          activePeriodIx: 1,
          activeSegmentIx: null,
        },
      })
      expect(
        await prisma.playerResult.findMany({ where: { gameId: game.id } })
      ).toEqual([end])
    } finally {
      publish.mockRestore()
      await prisma.game.delete({ where: { id: game.id } })
      await prisma.user.delete({ where: { id: owner.id } })
    }
  }
)
