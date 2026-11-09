import {
  activateNextPeriod,
  activateNextSegment,
  addGamePeriod,
  addPeriodSegment,
} from '@gbl-uzh/platform/dist/services/GameService'
import { performActionWithRetry } from '@gbl-uzh/platform/dist/services/PlayService'
import * as Registration from '@gbl-uzh/platform/dist/services/RegistrationService'
import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { AVATARS } from '../lib/constants'
import prisma from '../lib/prisma'
import { RegistrationSchema } from '../lib/registration'
import { PeriodFactsSchema, PeriodSegmentFactsSchema } from '../types'
import * as services from './index'

// Explicit opt-in: uses the configured local DB and deletes only its own games.
describe.skipIf(process.env.GAMEPLAY_DATABASE_TESTS !== '1')(
  'gameplay database transactions',
  () => {
    const CLASS_SIZE = 100
    const gameIds: number[] = []
    const userId = randomUUID()
    function context(user?: Record<string, unknown>) {
      const headers = new Map<string, unknown>()
      return {
        prisma,
        user,
        req: {
          headers: {
            cookie: `gbl-enrollment=${randomUUID().replaceAll('-', '')}`,
            'x-forwarded-proto': 'http',
          },
        },
        res: {
          getHeader: (name: string) => headers.get(name),
          setHeader: (name: string, value: unknown) => {
            headers.set(name, value)
          },
        },
      } as never
    }
    const admin = () => context({ sub: userId, role: 'ADMIN' })

    async function runningGame() {
      const row = await prisma.game.create({
        data: {
          name: `Gameplay test ${randomUUID()}`,
          facts: {},
          ownerId: userId,
          registrationOpen: true,
          registrationToken: randomUUID(),
        },
      })
      gameIds.push(row.id)
      await addGamePeriod(
        {
          gameId: row.id,
          segmentCount: 1,
          facts: {
            scenario: {
              seed: 1,
              interestBank: 0.002,
              trendBonds: 0.005,
              gapBonds: 0.0025,
              trendStocks: 0.0075,
              gapStocks: 0.0025,
            },
          },
        } as never,
        admin(),
        { schema: PeriodFactsSchema, services } as never
      )
      await addPeriodSegment(
        { gameId: row.id, periodIx: 0, facts: {} } as never,
        admin(),
        { schema: PeriodSegmentFactsSchema, services } as never
      )
      await Promise.all(
        Array.from({ length: CLASS_SIZE }, (_, ix) =>
          Registration.registerPlayer(
            {
              token: row.registrationToken!,
              name: `Bank ${ix}`,
              facts: {
                avatar: AVATARS.sparbaer,
                location: 'ZH',
                color: 'Blue',
              },
            },
            context(),
            { schema: RegistrationSchema }
          )
        )
      )
      await activateNextPeriod({ gameId: row.id }, admin(), {
        services,
      } as never)
      await activateNextSegment({ gameId: row.id }, admin(), {
        services,
      } as never)
      const game = await prisma.game.findUniqueOrThrow({
        where: { id: row.id },
        include: { activePeriod: true, players: true },
      })
      expect(game.status).toBe('RUNNING')
      return game
    }

    type Game = Awaited<ReturnType<typeof runningGame>>
    const allocation = (ix: number) =>
      ix % 2
        ? { bank: 20, bonds: 30, stocks: 50 }
        : { bank: 50, bonds: 25, stocks: 25 }
    const submit = (game: Game, ix: number) =>
      performActionWithRetry(
        {
          gameId: game.id,
          actionType: '' as never,
          playerId: game.players[ix].id,
          periodIx: game.activePeriodIx,
          segmentIx: game.activePeriod!.activeSegmentIx!,
          facts: allocation(ix),
        },
        context({
          sub: game.players[ix].id,
          role: 'PLAYER',
          gameId: game.id,
        }),
        { services }
      )

    beforeAll(async () => {
      vi.stubEnv('NEXTAUTH_SECRET', 'gameplay-test-only-secret')
      await prisma.user.create({
        data: { id: userId, email: `${userId}@gameplay.test` },
      })
      if (!(await prisma.playerLevel.findUnique({ where: { index: 0 } })))
        throw new Error('Seed the local database before running gameplay tests')
    })
    afterAll(async () => {
      await prisma.achievementInstance.deleteMany({
        where: { gameId: { in: gameIds } },
      })
      await prisma.game.deleteMany({ where: { id: { in: gameIds } } })
      await prisma.user.delete({ where: { id: userId } })
      vi.unstubAllEnvs()
      await prisma.$disconnect()
    })

    test(
      'a whole class submitting at once stores every allocation',
      { timeout: 120_000 },
      async () => {
        const game = await runningGame()
        const outcomes = await Promise.allSettled(
          game.players.map((_, ix) => submit(game, ix))
        )
        expect(outcomes.filter((r) => r.status === 'rejected')).toEqual([])
        expect(
          await prisma.playerAction.count({ where: { gameId: game.id } })
        ).toBe(CLASS_SIZE)
      }
    )

    test(
      'an allocation racing the end of the segment is kept or cleanly rejected',
      { timeout: 120_000 },
      async () => {
        const game = await runningGame()
        const [ended, ...outcomes] = await Promise.allSettled([
          activateNextPeriod({ gameId: game.id }, admin(), {
            services,
          } as never),
          ...game.players.map((_, ix) => submit(game, ix)),
        ])
        expect(ended.status).toBe('fulfilled')
        for (const outcome of outcomes)
          if (outcome.status === 'rejected')
            expect(outcome.reason.message).toBe('ACTIONS_NOT_ALLOWED')
        const results = await prisma.playerResult.findMany({
          where: { gameId: game.id, periodIx: 0, type: 'SEGMENT_END' },
        })
        const actions = await prisma.playerAction.findMany({
          where: { gameId: game.id },
        })
        expect(actions).toHaveLength(
          outcomes.filter((r) => r.status === 'fulfilled').length
        )
        for (const action of actions) {
          const result = results.find((r) => r.playerId === action.playerId)
          const { bank, bonds, stocks } = action.facts as Record<string, number>
          expect((result?.facts as { decisions?: unknown })?.decisions).toEqual(
            { bank, bonds, stocks }
          )
        }
      }
    )
  }
)
