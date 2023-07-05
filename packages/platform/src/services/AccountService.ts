import type { PrismaClient } from '@prisma/client'
import JWT from 'jsonwebtoken'
import { strict as assert } from 'node:assert'
import { destroyCookie, setCookie } from 'nookies'
import { CtxWithPrisma, UserRole } from '../types'

interface CreateLoginTokenArgs {
  sub: string
  role: UserRole
  token?: string
  gameId?: number
}

export function createLoginToken({
  sub,
  role,
  ...extra
}: CreateLoginTokenArgs) {
  assert(typeof process.env.NEXTAUTH_SECRET === 'string')

  return JWT.sign({ sub, role, ...extra }, process.env.NEXTAUTH_SECRET, {
    expiresIn: '1 week',
  })
}

interface LoginAsTeamArgs {
  token: string
}

export async function loginAsTeam(
  { token }: LoginAsTeamArgs,
  ctx: CtxWithPrisma<PrismaClient>
) {
  const matchingPlayer = await ctx.prisma.player.findUnique({
    where: { token },
    include: {
      level: true,
      achievements: {
        include: {
          achievement: true,
        },
      },
    },
  })

  if (!matchingPlayer) {
    throw new Error('INVALID_TOKEN')
  }

  try {
    const jwt = createLoginToken({
      gameId: matchingPlayer.gameId,
      sub: matchingPlayer.id,
      role: UserRole.PLAYER,
      token: matchingPlayer.token,
    })

    const cookieName =
      process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'

    setCookie(ctx, cookieName, jwt, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
    })
  } catch (err) {
    console.error(err)
    return null
  }

  return matchingPlayer
}

export async function logoutAsTeam(ctx: CtxWithPrisma<PrismaClient>) {
  if (!ctx.user?.sub) return false

  const matchingPlayer = await ctx.prisma.player.findUnique({
    where: {
      id: ctx.user.sub,
    },
  })

  if (matchingPlayer) {
    const cookieName =
      process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'

    destroyCookie(ctx, cookieName)

    return true
  }

  return false
}
