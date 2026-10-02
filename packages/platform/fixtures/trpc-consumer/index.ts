import {
  createPlatformContextUser,
  createPlatformRouter,
  createTRPCRouter,
  publicProcedure,
  UserRole,
} from '@gbl-uzh/platform'
import type { inferRouterOutputs } from '@trpc/server'

const router = createPlatformRouter({
  extensions: {
    custom: createTRPCRouter({
      ping: publicProcedure.query(() => 'pong' as const),
    }),
  },
})
// Fails the type check if extension routers drop out of the router type.
const extensionOutput: inferRouterOutputs<typeof router>['custom']['ping'] =
  'pong'
const user = createPlatformContextUser({
  role: UserRole.PLAYER,
  sub: 'fixture-player',
  gameId: 1,
})

if (
  !router._def ||
  extensionOutput !== 'pong' ||
  user?.role !== UserRole.PLAYER
) {
  throw new Error('Platform tRPC consumer fixture failed')
}
