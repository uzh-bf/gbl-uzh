import superjson from 'superjson'
import { TRPCError, initTRPC } from '@trpc/server'
import { UserRole } from '../types.js'
import type { PlatformContext, PlatformUser } from './context.js'

const t = initTRPC.context<PlatformContext>().create({
  transformer: superjson,
  // Never leak raw internal error messages (Prisma/service internals) to
  // clients. Mapped errors (UNAUTHORIZED/FORBIDDEN/BAD_REQUEST) keep their
  // message; anything that fell through to INTERNAL_SERVER_ERROR is genericized.
  errorFormatter({ shape }) {
    if (shape.data.code === 'INTERNAL_SERVER_ERROR') {
      return {
        ...shape,
        message: 'Internal server error',
      }
    }

    return shape
  },
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory

function requireUser(ctx: PlatformContext): PlatformUser {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    })
  }

  return ctx.user
}

const enforceAuthenticatedUser = t.middleware(({ ctx, next }) => {
  const user = requireUser(ctx)

  return next({
    ctx: {
      ...ctx,
      user,
    },
  })
})

const enforceRole = (role: UserRole) =>
  t.middleware(({ ctx, next }) => {
    const user = requireUser(ctx)

    if (user.role !== role) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Forbidden',
      })
    }

    return next({ ctx: { ...ctx, user } })
  })

export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(enforceAuthenticatedUser)
export const adminProcedure = t.procedure.use(enforceRole(UserRole.ADMIN))
export const playerProcedure = t.procedure.use(enforceRole(UserRole.PLAYER))

// `adminProcedure` only proves the caller is *an* admin, not that they own the
// game they are acting on. Every admin route that takes a `gameId` from client
// input must additionally assert ownership, or any admin could enumerate ids and
// read/mutate another admin's game (incl. player join tokens). Games are owned via
// `Game.ownerId === user.sub` (set at creation), so scope by that. Throw NOT_FOUND
// (not FORBIDDEN) so a non-owner cannot even confirm the game exists.
export async function assertGameOwnership(
  ctx: PlatformContext,
  gameId: number
): Promise<void> {
  const user = requireUser(ctx)

  const game = await ctx.prisma.game.findFirst({
    where: { id: gameId, ownerId: user.sub },
    select: { id: true },
  })

  if (!game) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Game not found' })
  }
}
