import superjson from 'superjson'
import { TRPCError, initTRPC } from '@trpc/server'
import { UserRole } from '../types.js'
import {
  type PlatformContext,
  ensurePlatformContextUser,
} from './context.js'

const t = initTRPC.create<{
  ctx: PlatformContext
}>({
  transformer: superjson,
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory

const enforceAuthenticatedUser = t.middleware(({ ctx, next }) => {
  const user = ensurePlatformContextUser(ctx)

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user,
    },
  })
})

const enforceRole = (role: UserRole | string) =>
  t.middleware(({ ctx, next }) => {
    const user = ensurePlatformContextUser(ctx)

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      })
    }

    if (user.role !== role && user.role !== String(role)) {
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
