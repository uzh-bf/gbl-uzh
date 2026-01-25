import type { PrismaClient } from '@prisma/client'
import JWT from 'jsonwebtoken'
import { destroyCookie, setCookie } from 'nookies'
import { CtxWithPrisma, UserRole } from '../types.js'

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
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is not set')
  }

  return JWT.sign({ sub, role, ...extra }, process.env.NEXTAUTH_SECRET, {
    expiresIn: '1 week',
  })
}

function isSecureRequest(ctx: { req?: { headers?: Record<string, unknown> } }) {
  const forwardedProto = ctx.req?.headers?.['x-forwarded-proto']
  if (Array.isArray(forwardedProto)) return forwardedProto[0] === 'https'
  if (typeof forwardedProto === 'string') return forwardedProto === 'https'

  const nextAuthUrl = process.env.NEXTAUTH_URL
  return typeof nextAuthUrl === 'string' && nextAuthUrl.startsWith('https://')
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
      game: {
        include: {
          activePeriod: true,
        },
      },
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

    const secure = isSecureRequest(ctx)
    const cookieName = secure
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'

    setCookie(ctx, cookieName, jwt, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure,
      sameSite: 'lax',
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
    destroyCookie(ctx, '__Secure-next-auth.session-token', { path: '/' })
    destroyCookie(ctx, 'next-auth.session-token', { path: '/' })

    return true
  }

  return false
}
