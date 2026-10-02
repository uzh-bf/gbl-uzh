import * as DB from '../generated/prisma/client.js'
import type { NextApiRequest, NextApiResponse } from 'next'
import { UserRole } from '../types.js'

export type PlatformUser = {
  sub: string
  role: UserRole | string
  gameId?: number
}

type RawPlatformUser = {
  sub?: unknown
  role?: unknown
  gameId?: unknown
}

export type PlatformContext = {
  prisma: DB.PrismaClient
  req: NextApiRequest
  res: NextApiResponse
  user?: PlatformUser
  services?: Record<string, unknown>
  schemas?: Record<string, unknown>
}

function normalizeGameId(gameId: unknown): number | undefined {
  if (typeof gameId === 'number') {
    return gameId
  }

  if (typeof gameId === 'string' && gameId.trim().length > 0) {
    const parsed = Number(gameId)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

export function createPlatformContextUser(
  user?: RawPlatformUser | null
): PlatformUser | undefined {
  if (!user || typeof user !== 'object') {
    return
  }

  if (typeof user.sub !== 'string' || user.sub.length === 0) {
    return
  }

  return {
    sub: user.sub,
    role: typeof user.role === 'string' ? user.role : '',
    gameId: normalizeGameId(user.gameId),
  }
}
