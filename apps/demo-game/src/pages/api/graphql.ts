import { createYoga } from 'graphql-yoga'
import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'

import { schema } from '../../graphql/nexus'
import prisma from '../../lib/prisma'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default createYoga<{
  req: NextApiRequest
  res: NextApiResponse
}>({
  graphqlEndpoint: '/api/graphql',
  schema,
  async context({ req, res, ...ctx }) {
    const session = await unstable_getServerSession(req, res, authOptions)

    return {
      ...ctx,
      prisma,
      res,
      user: session?.user,
    }
  },
})
