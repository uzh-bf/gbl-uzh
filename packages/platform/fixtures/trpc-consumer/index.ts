import {
  createPlatformContextUser,
  createPlatformRouter,
  UserRole,
} from '@gbl-uzh/platform'

const router = createPlatformRouter({})
const user = createPlatformContextUser({
  role: UserRole.PLAYER,
  sub: 'fixture-player',
  gameId: 1,
})

if (!router._def || user?.role !== UserRole.PLAYER) {
  throw new Error('Platform tRPC consumer fixture failed')
}
