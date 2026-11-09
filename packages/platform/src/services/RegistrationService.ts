import { nanoid } from 'nanoid'
import { createHash } from 'node:crypto'
import { parseCookies, setCookie } from 'nookies'
import type * as yup from 'yup'
import type { Prisma, PrismaClient } from '../generated/prisma/client.js'
import type { CtxWithPrisma } from '../types.js'
import { isSecureRequest, loginAsTeam } from './AccountService.js'
import * as EventService from './EventService.js'

type Context = CtxWithPrisma<PrismaClient>
const COOKIE = 'gbl-enrollment'

export function isGameManager(
  user: Context['user'] | undefined,
  ownerId: string
) {
  return Boolean(
    user &&
    (String(user.role) === 'MASTER' ||
      (user.role === 'ADMIN' && user.sub === ownerId))
  )
}

export function assertGameManager(ctx: Context, ownerId: string) {
  if (!isGameManager(ctx.user, ownerId)) throw new Error('FORBIDDEN')
}

export async function registrationTransaction<T>(
  prisma: PrismaClient,
  work: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      // Callers take the game row lock first (lockGame). Under read committed,
      // concurrent enrollments and the initial start then queue on that row and
      // each sees the roster committed before it, instead of aborting each other
      // as serializable snapshots do when a whole class joins at once. maxWait
      // covers the queue for a pooled connection during such a burst.
      return await prisma.$transaction(work, {
        isolationLevel: 'ReadCommitted',
        maxWait: 30000,
        timeout: 15000,
      })
    } catch (error) {
      if ((error as { code?: string }).code !== 'P2034' || attempt >= 4)
        throw error
      await new Promise((resolve) =>
        setTimeout(resolve, 20 * 2 ** attempt + Math.random() * 30)
      )
    }
  }
}

// Serializes all roster changes of one game: enrollment, opening or closing
// registration, and the initial start. Take it as the first statement of a
// registrationTransaction so every later read sees the latest committed roster.
export async function lockGame(
  tx: Prisma.TransactionClient,
  where: { id: number } | { registrationToken: string }
) {
  const rows =
    'id' in where
      ? await tx.$queryRaw<{ id: number }[]>`
          SELECT id FROM "Game" WHERE id = ${where.id} FOR UPDATE`
      : await tx.$queryRaw<{ id: number }[]>`
          SELECT id FROM "Game" WHERE "registrationToken" = ${where.registrationToken} FOR UPDATE`
  return rows[0]?.id ?? null
}

function browserIdentity(ctx: Context) {
  const value = parseCookies(ctx)[COOKIE]
  return value && /^[\w-]{32}$/.test(value) ? value : null
}

function enrollmentKey(ctx: Context, gameId: number) {
  const identity = browserIdentity(ctx)
  return identity
    ? createHash('sha256').update(`${gameId}:${identity}`).digest('hex')
    : null
}

export async function registrationInfo(token: string, ctx: Context) {
  const game = await ctx.prisma.game.findUnique({
    where: { registrationToken: token },
    select: {
      name: true,
      status: true,
      registrationMode: true,
      registrationOpen: true,
      maxPlayers: true,
      _count: { select: { players: true } },
    },
  })
  if (!game || game.registrationMode !== 'SHARED_LINK') return null
  return {
    name: game.name,
    status: game.status,
    availability:
      game.status !== 'SCHEDULED' || !game.registrationOpen
        ? 'CLOSED'
        : game.maxPlayers !== null && game._count.players >= game.maxPlayers
          ? 'FULL'
          : 'OPEN',
  }
}

export async function prepareRegistration(token: string, ctx: Context) {
  const info = await registrationInfo(token, ctx)
  if (!info) throw new Error('INVALID_REGISTRATION_LINK')
  if (!browserIdentity(ctx)) {
    setCookie(ctx, COOKIE, nanoid(32), {
      path: '/',
      httpOnly: true,
      secure: isSecureRequest(ctx),
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    })
  }
  return info
}

async function existingPlayer(
  ctx: Context,
  gameId: number,
  prisma: Prisma.TransactionClient | PrismaClient
) {
  // A private-link login may already identify this browser without enrollment.
  if (ctx.user?.role === 'PLAYER' && Number(ctx.user.gameId) === gameId) {
    const player = await prisma.player.findFirst({
      where: { id: ctx.user.sub, gameId },
    })
    if (player) return player
  }
  const key = enrollmentKey(ctx, gameId)
  return key
    ? prisma.player.findUnique({
        where: { gameId_enrollmentKey: { gameId, enrollmentKey: key } },
      })
    : null
}

export async function resumeRegistration(token: string, ctx: Context) {
  const game = await ctx.prisma.game.findUnique({
    where: { registrationToken: token },
  })
  if (!game || game.registrationMode !== 'SHARED_LINK')
    throw new Error('INVALID_REGISTRATION_LINK')
  const player = await existingPlayer(ctx, game.id, ctx.prisma)
  if (!player) return false
  await loginAsTeam({ token: player.token }, ctx)
  return true
}

export async function registerPlayer(
  { token, name, facts }: { token: string; name: string; facts: unknown },
  ctx: Context,
  {
    schema,
    roleAssigner,
  }: {
    schema: yup.Schema<any>
    roleAssigner?: (ix: number, facts: any) => any
  }
) {
  if (!browserIdentity(ctx)) throw new Error('REGISTRATION_SESSION_REQUIRED')
  const result = await registrationTransaction(ctx.prisma, async (tx) => {
    await lockGame(tx, { registrationToken: token })
    const game = await tx.game.findUnique({
      where: { registrationToken: token },
    })
    if (!game || game.registrationMode !== 'SHARED_LINK')
      throw new Error('INVALID_REGISTRATION_LINK')
    const existing = await existingPlayer(ctx, game.id, tx)
    if (existing)
      return {
        player: existing,
        created: false,
      }
    if (game.status !== 'SCHEDULED' || !game.registrationOpen)
      throw new Error('REGISTRATION_CLOSED')
    const count = await tx.player.count({ where: { gameId: game.id } })
    if (game.maxPlayers !== null && count >= game.maxPlayers)
      throw new Error('REGISTRATION_FULL')
    const validated = schema.validateSync(
      { name, facts },
      { abortEarly: false, stripUnknown: true }
    )
    await tx.game.update({
      where: { id: game.id },
      data: { version: { increment: 1 } },
    })
    const player = await tx.player.create({
      data: {
        gameId: game.id,
        name: validated.name,
        facts: validated.facts,
        number: count + 1,
        token: nanoid(),
        enrollmentKey: enrollmentKey(ctx, game.id),
        levelIx: 0,
        setupEventPending: true,
        role: roleAssigner?.(count, game.facts),
      },
    })
    return { player, created: true }
  })
  if (result.created) publishRegistrationChanged(result.player.gameId)
  await loginAsTeam({ token: result.player.token }, ctx)
  return true
}

function publishRegistrationChanged(gameId: number) {
  EventService.publishGlobalNotification({
    type: 'REGISTRATION_CHANGED',
    facts: { gameId },
  })
}

export async function setRegistrationOpen(
  gameId: number,
  open: boolean,
  ctx: Context
) {
  const game = await registrationTransaction(ctx.prisma, async (tx) => {
    await lockGame(tx, { id: gameId })
    const game = await tx.game.findUnique({ where: { id: gameId } })
    if (!game) throw new Error('GAME_NOT_FOUND')
    assertGameManager(ctx, game.ownerId)
    if (game.registrationMode !== 'SHARED_LINK' || game.status !== 'SCHEDULED')
      throw new Error('REGISTRATION_CLOSED')
    return tx.game.update({
      where: { id: gameId },
      data: { registrationOpen: open, version: { increment: 1 } },
    })
  })
  publishRegistrationChanged(gameId)
  return game
}
