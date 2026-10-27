import { activateNextPeriod } from '@gbl-uzh/platform/dist/services/GameService'
import * as Registration from '@gbl-uzh/platform/dist/services/RegistrationService'
import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { AVATARS } from '../lib/constants'
import prisma from '../lib/prisma'
import { RegistrationSchema } from '../lib/registration'

// Explicit opt-in: uses the configured local DB and deletes only its own games.
describe.skipIf(process.env.REGISTRATION_DATABASE_TESTS !== '1')(
  'registration database transactions',
  () => {
    const gameIds: number[] = []
    const userId = randomUUID()
    const facts = { avatar: AVATARS.sparbaer, location: 'ZH', color: 'Blue' }
    const schema = RegistrationSchema
    function context(
      identity = randomUUID().replaceAll('-', ''),
      user?: { sub: string; role: string; gameId?: number }
    ) {
      const headers = new Map<string, unknown>()
      return {
        prisma,
        user,
        req: {
          headers: {
            cookie: `gbl-enrollment=${identity}`,
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
    const admin = () => context(undefined, { sub: userId, role: 'ADMIN' })
    async function game(maxPlayers: number | null = null) {
      const row = await prisma.game.create({
        data: {
          name: `Registration test ${randomUUID()}`,
          facts: {},
          ownerId: userId,
          registrationMode: 'SHARED_LINK',
          registrationOpen: true,
          registrationToken: randomUUID(),
          maxPlayers,
        },
      })
      gameIds.push(row.id)
      return row
    }
    const join = (token: string, ctx = context(), name = 'Test bank') =>
      Registration.registerPlayer({ token, name, facts }, ctx, { schema })
    beforeAll(async () => {
      vi.stubEnv('NEXTAUTH_SECRET', 'registration-test-only-secret')
      await prisma.user.create({
        data: { id: userId, email: `${userId}@registration.test` },
      })
      if (!(await prisma.playerLevel.findUnique({ where: { index: 0 } })))
        throw new Error(
          'Seed the local database before running registration tests'
        )
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

    test('simultaneous retries create one entry, survive lost responses and resume after closure', async () => {
      const row = await game()
      const identity = randomUUID().replaceAll('-', '')
      await Promise.all([
        join(row.registrationToken!, context(identity)),
        join(row.registrationToken!, context(identity)),
      ])
      expect(await prisma.player.count({ where: { gameId: row.id } })).toBe(1)
      await Registration.setRegistrationOpen(row.id, false, admin())
      expect(
        await join(row.registrationToken!, context(identity), 'Changed name')
      ).toBe(true)
      expect(
        (await prisma.player.findFirstOrThrow({ where: { gameId: row.id } }))
          .name
      ).toBe('Test bank')
      expect(
        await Registration.resumeRegistration(
          row.registrationToken!,
          context(identity)
        )
      ).toBe(true)
      expect(
        await Registration.resumeRegistration(row.registrationToken!, context())
      ).toBe(false)
    })

    test('only one of two simultaneous newcomers takes the last slot', async () => {
      const row = await game(1)
      const outcomes = await Promise.allSettled([
        join(row.registrationToken!),
        join(row.registrationToken!),
      ])
      expect(outcomes.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
      expect(outcomes.find((r) => r.status === 'rejected')).toMatchObject({
        reason: { message: 'REGISTRATION_FULL' },
      })
      expect(await prisma.player.count({ where: { gameId: row.id } })).toBe(1)
    })

    test('manual closure and concurrent enrollment commit a consistent roster', async () => {
      const row = await game()
      const [joined] = await Promise.allSettled([
        join(row.registrationToken!),
        Registration.setRegistrationOpen(row.id, false, admin()),
      ])
      expect(
        (await prisma.game.findUniqueOrThrow({ where: { id: row.id } }))
          .registrationOpen
      ).toBe(false)
      expect(await prisma.player.count({ where: { gameId: row.id } })).toBe(
        joined.status === 'fulfilled' ? 1 : 0
      )
      await expect(join(row.registrationToken!)).rejects.toThrow(
        'REGISTRATION_CLOSED'
      )
    })

    test('joining versus starting includes every accepted player and initial action', async () => {
      const row = await game()
      await join(row.registrationToken!)
      const period = await prisma.period.create({
        data: { gameId: row.id, index: 0, facts: {}, segmentCount: 1 },
      })
      await prisma.periodSegment.create({
        data: {
          gameId: row.id,
          periodId: period.id,
          periodIx: 0,
          index: 0,
          facts: {},
        },
      })
      const services = {
        PeriodResult: {
          initialize: () => ({
            resultFacts: { balance: 100 },
            actions: [{ type: 'INITIALIZED', facts: {} }],
          }),
        },
      }
      const [joined, started] = await Promise.allSettled([
        join(row.registrationToken!),
        activateNextPeriod({ gameId: row.id }, admin(), { services } as never),
      ])
      expect(started.status).toBe('fulfilled')
      if (joined.status === 'rejected')
        expect(joined.reason.message).toBe('REGISTRATION_CLOSED')
      const players = await prisma.player.findMany({
        where: { gameId: row.id },
      })
      expect(players).toHaveLength(joined.status === 'fulfilled' ? 2 : 1)
      expect(
        await prisma.playerResult.count({
          where: { gameId: row.id, type: 'PERIOD_START' },
        })
      ).toBe(players.length)
      expect(
        await prisma.playerAction.count({
          where: { gameId: row.id, type: 'INITIALIZED' },
        })
      ).toBe(players.length)
      expect(players.every((p) => !p.setupEventPending)).toBe(true)
      expect(
        (await prisma.game.findUniqueOrThrow({ where: { id: row.id } }))
          .registrationOpen
      ).toBe(false)
      await expect(
        Registration.setRegistrationOpen(row.id, true, admin())
      ).rejects.toThrow('REGISTRATION_CLOSED')
    })

    test('failed initialization rolls back the start and leaves registration usable', async () => {
      const row = await game()
      await join(row.registrationToken!)
      const period = await prisma.period.create({
        data: { gameId: row.id, index: 0, facts: {}, segmentCount: 1 },
      })
      await prisma.periodSegment.create({
        data: {
          gameId: row.id,
          periodId: period.id,
          periodIx: 0,
          index: 0,
          facts: {},
        },
      })
      await expect(
        activateNextPeriod({ gameId: row.id }, admin(), {
          services: {
            PeriodResult: {
              initialize: () => {
                throw new Error('Initialization failed')
              },
            },
          },
        } as never)
      ).rejects.toThrow('Initialization failed')
      expect(
        await prisma.game.findUniqueOrThrow({ where: { id: row.id } })
      ).toMatchObject({
        status: 'SCHEDULED',
        registrationOpen: true,
        activePeriodIx: -1,
      })
      expect(
        await prisma.playerResult.count({ where: { gameId: row.id } })
      ).toBe(0)
      expect(
        await prisma.playerAction.count({ where: { gameId: row.id } })
      ).toBe(0)
      expect(
        await prisma.player.findFirstOrThrow({ where: { gameId: row.id } })
      ).toMatchObject({ setupEventPending: true })
      await expect(join(row.registrationToken!)).resolves.toBe(true)
    })

    test('rejects unauthorized control, invalid setup, missing cookies and empty starts', async () => {
      const row = await game()
      await expect(
        Registration.setRegistrationOpen(row.id, false, context())
      ).rejects.toThrow('FORBIDDEN')
      await expect(
        Registration.setRegistrationOpen(
          row.id,
          false,
          context(undefined, { sub: randomUUID(), role: 'ADMIN' })
        )
      ).rejects.toThrow('FORBIDDEN')
      await expect(
        join(row.registrationToken!, context(), 'x')
      ).rejects.toThrow()
      await expect(
        Registration.registerPlayer(
          {
            token: row.registrationToken!,
            name: 'Bank',
            facts: { ...facts, avatar: 'invalid' },
          },
          context(),
          { schema }
        )
      ).rejects.toThrow()
      const noCookie = { prisma, req: { headers: {} }, res: {} } as never
      await expect(join(row.registrationToken!, noCookie)).rejects.toThrow(
        'REGISTRATION_SESSION_REQUIRED'
      )
      await expect(join('invalid')).rejects.toThrow('INVALID_REGISTRATION_LINK')
      await expect(
        activateNextPeriod({ gameId: row.id }, admin(), {
          services: {},
        } as never)
      ).rejects.toThrow('NO_PLAYERS')
      expect(await prisma.player.count({ where: { gameId: row.id } })).toBe(0)
      expect(
        await Registration.registrationInfo(row.registrationToken!, context())
      ).toEqual({ name: row.name, status: 'SCHEDULED', availability: 'OPEN' })
    })
  }
)
