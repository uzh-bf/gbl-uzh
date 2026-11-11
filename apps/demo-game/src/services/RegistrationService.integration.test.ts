import { activateNextPeriod } from '@gbl-uzh/platform/dist/services/GameService'
import {
  lockGameForShare,
  lockGameForUpdate,
} from '@gbl-uzh/platform/dist/services/GameTransaction'
import * as Registration from '@gbl-uzh/platform/dist/services/RegistrationService'
import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { AVATARS } from '../lib/constants'
import prisma from '../lib/prisma'
import { RegistrationSchema } from '../lib/registration'
import { gameLockOperation, waitForBlocker } from './testing/gameLockOperation'

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
      user?: { sub: string; role: string; gameId?: number },
      client = prisma
    ) {
      const headers = new Map<string, unknown>()
      return {
        prisma: client,
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
    const admin = (client = prisma) =>
      context(undefined, { sub: userId, role: 'ADMIN' }, client)
    async function game(maxPlayers: number | null = null) {
      const row = await prisma.game.create({
        data: {
          name: `Registration test ${randomUUID()}`,
          facts: {},
          ownerId: userId,
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

    test.each([100, 300, 500])(
      '%i simultaneous registrations succeed',
      { timeout: 60_000 },
      async (size) => {
        const row = await game(size)
        const outcomes = await Promise.allSettled(
          Array.from({ length: size }, (_, ix) =>
            join(row.registrationToken!, context(), `Bank ${ix}`)
          )
        )
        expect(outcomes.filter((r) => r.status === 'rejected')).toEqual([])
        const players = await prisma.player.findMany({
          where: { gameId: row.id },
          select: { number: true },
          orderBy: { number: 'asc' },
        })
        expect(players).toHaveLength(size)
        expect(players.map((player) => player.number)).toEqual(
          Array.from({ length: size }, (_, ix) => ix + 1)
        )
        await expect(join(row.registrationToken!)).rejects.toThrow(
          'REGISTRATION_FULL'
        )
      }
    )

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

    test.each(['registration', 'start'] as const)(
      '%s acquires the lock first in the join/start race',
      { timeout: 30_000 },
      async (first) => {
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
        const operations = {
          registration: (client: typeof prisma) =>
            join(row.registrationToken!, context(undefined, undefined, client)),
          start: (client: typeof prisma) =>
            activateNextPeriod({ gameId: row.id }, admin(client), {
              services,
            } as never),
        }
        const winner = gameLockOperation(prisma, operations[first])
        let loser: ReturnType<typeof gameLockOperation> | undefined
        try {
          const holderPid = await winner.acquired()
          loser = gameLockOperation(
            prisma,
            operations[first === 'registration' ? 'start' : 'registration'],
            false
          )
          await waitForBlocker(prisma, await loser.attempted(), [holderPid])
        } finally {
          winner.release()
          await Promise.all([winner.result, loser?.result])
        }
        expect(await winner.result).toMatchObject({ status: 'fulfilled' })
        expect(await loser!.result).toMatchObject(
          first === 'registration'
            ? { status: 'fulfilled' }
            : { status: 'rejected', reason: { message: 'REGISTRATION_CLOSED' } }
        )
        const players = await prisma.player.findMany({
          where: { gameId: row.id },
          select: { id: true },
          orderBy: { id: 'asc' },
        })
        expect(players).toHaveLength(first === 'registration' ? 2 : 1)
        const [results, actions] = await Promise.all([
          prisma.playerResult.findMany({
            where: { gameId: row.id, type: 'PERIOD_START' },
            select: { playerId: true },
            orderBy: { playerId: 'asc' },
          }),
          prisma.playerAction.findMany({
            where: { gameId: row.id, type: 'INITIALIZED' },
            select: { playerId: true },
            orderBy: { playerId: 'asc' },
          }),
        ])
        const playerIds = players.map((player) => player.id)
        expect(results.map((result) => result.playerId)).toEqual(playerIds)
        expect(actions.map((action) => action.playerId)).toEqual(playerIds)
        expect(
          (await prisma.game.findUniqueOrThrow({ where: { id: row.id } }))
            .registrationOpen
        ).toBe(false)
        await expect(
          Registration.setRegistrationOpen(row.id, true, admin())
        ).rejects.toThrow('REGISTRATION_CLOSED')
      }
    )

    test.each([
      ['SHARE', 'commit'],
      ['SHARE', 'rollback'],
      ['UPDATE', 'commit'],
      ['UPDATE', 'rollback'],
    ] as const)(
      '%s locks block exclusive requests until %s',
      { timeout: 30_000 },
      async (mode, ending) => {
        const row = await game()
        const rollback = new Error('Intentional lock-test rollback')
        // Two shared holders must both acquire their locks before either releases.
        const holders = Array.from({ length: mode === 'SHARE' ? 2 : 1 }, () =>
          gameLockOperation(prisma, (client) =>
            client.$transaction(
              async (tx) => {
                const id =
                  mode === 'SHARE'
                    ? await lockGameForShare(tx as never, row.id)
                    : await lockGameForUpdate(tx as never, { id: row.id })
                if (ending === 'rollback') throw rollback
                return id
              },
              { isolationLevel: 'ReadCommitted', timeout: 15000 }
            )
          )
        )
        let exclusive: ReturnType<typeof gameLockOperation> | undefined
        try {
          const holderPids = await Promise.all(
            holders.map((holder) => holder.acquired())
          )
          exclusive = gameLockOperation(
            prisma,
            (client) =>
              client.$transaction(
                (tx) => lockGameForUpdate(tx as never, { id: row.id }),
                { isolationLevel: 'ReadCommitted', timeout: 15000 }
              ),
            false
          )
          const waiterPid = await exclusive.attempted()
          // PostgreSQL can wait on shared holders one at a time.
          const blocker = await waitForBlocker(prisma, waiterPid, holderPids)
          const holder = holders[holderPids.indexOf(blocker)]!
          holder.release()
          await holder.result
          // Releasing just one shared holder must not unblock the exclusive lock.
          const remaining = holderPids.filter((pid) => pid !== blocker)
          if (remaining.length)
            await waitForBlocker(prisma, waiterPid, remaining)
        } finally {
          holders.forEach((holder) => holder.release())
          await Promise.all([
            ...holders.map((holder) => holder.result),
            exclusive?.result,
          ])
        }
        for (const holder of holders) {
          expect(await holder.result).toEqual(
            ending === 'commit'
              ? { status: 'fulfilled', value: row.id }
              : { status: 'rejected', reason: rollback }
          )
        }
        expect(await exclusive!.result).toEqual({
          status: 'fulfilled',
          value: row.id,
        })
        // The contender's exclusive lock must also release after commit.
        await expect(
          prisma.$transaction((tx) => lockGameForShare(tx as never, row.id))
        ).resolves.toBe(row.id)
      }
    )

    test('lock lookups return null for missing games', async () => {
      await prisma.$transaction(async (tx) => {
        expect(await lockGameForUpdate(tx as never, { id: -1 })).toBeNull()
        expect(
          await lockGameForUpdate(tx as never, {
            registrationToken: randomUUID(),
          })
        ).toBeNull()
        expect(await lockGameForShare(tx as never, -1)).toBeNull()
      })
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
      await expect(join(row.registrationToken!)).resolves.toBe(true)
    })

    test('rejects unauthorized control, invalid setup, missing cookies and empty starts', async () => {
      const row = await game()
      await expect(
        Registration.setRegistrationOpen(row.id, false, context())
      ).rejects.toThrow('FORBIDDEN')
      // Any instructor may manage a game, not only its owner.
      await expect(
        Registration.setRegistrationOpen(
          row.id,
          true,
          context(undefined, { sub: randomUUID(), role: 'ADMIN' })
        )
      ).resolves.toMatchObject({ registrationOpen: true })
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
