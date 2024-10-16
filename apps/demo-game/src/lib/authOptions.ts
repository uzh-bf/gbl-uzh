import { UserRole } from '@gbl-uzh/platform/dist/index'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { DefaultSession, NextAuthOptions } from 'next-auth'
import type { DefaultJWT } from 'next-auth/jwt'
import Auth0Provider from 'next-auth/providers/auth0'

// we use our own decode and encode to allow manual cookie creation in the team login scenario
import { decode, encode } from './jwt'

import prisma from './prisma'

interface ExtendedSession extends DefaultSession {
  user?: DefaultSession['user'] & {
    sub?: string
    role?: string
    gameId?: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID as string,
      clientSecret: process.env.AUTH0_CLIENT_SECRET as string,
      issuer: process.env.AUTH0_ISSUER,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    encode,
    decode,
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
