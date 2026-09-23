import type { CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getServerSession } from 'next-auth/next'

import {
  createPlatformContextUser,
  type PlatformContext,
} from '@gbl-uzh/platform'
import { authOptions } from '../../lib/authOptions'
import prisma from '../../lib/prisma'

type SessionUser = {
  sub?: unknown
  role?: unknown
  gameId?: unknown
}

export async function createContext({ req, res }: CreateNextContextOptions) {
  const session = await getServerSession(req, res, authOptions)

  return {
    // Demo-game and platform each generate their own Prisma 7 client from the
    // same schema; the generated types are structurally distinct even though
    // the runtime clients are interchangeable. Cast to the platform's expected
    // client type so PlatformContext accepts this context.
    prisma: prisma as unknown as PlatformContext['prisma'],
    req,
    res,
    user: createPlatformContextUser(session?.user as SessionUser | undefined),
  } satisfies Omit<PlatformContext, 'schemas' | 'services'>
}

export type Context = Awaited<ReturnType<typeof createContext>>
