import { resolveAdminOidcConfig, UserRole } from '@gbl-uzh/platform/dist/index'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import JWT from 'jsonwebtoken'
import type { DefaultSession, NextAuthOptions } from 'next-auth'
import type { DefaultJWT } from 'next-auth/jwt'
import Auth0Provider from 'next-auth/providers/auth0'

import prisma from './prisma'

const oidcConfig = resolveAdminOidcConfig()

interface ExtendedSession extends DefaultSession {
  user?: DefaultSession['user'] & {
    sub?: string
    role?: string
    gameId?: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [Auth0Provider(oidcConfig)],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    // Custom JWT handling also supports manually created team-login cookies.
    async encode({ token, secret }) {
      return JWT.sign(token as object, secret)
    },
    async decode({ token, secret }) {
      if (!token) return null
      return JWT.verify(token, secret) as DefaultJWT
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // if there are a user and account on the first invocation, we are logging in an admin user
      // otherwise, the role has already been set to be a PLAYER
      if (user && account) {
        token.role = UserRole.ADMIN
      }
      return token
    },
    async session({
      token,
      session,
    }: {
      token: DefaultJWT
      session: ExtendedSession
    }) {
      if (session?.user) {
        session.user.sub = token.sub
        session.user.role = token.role as string
        session.user.gameId = token.gameId as string
      }

      return session
    },
  },
}
