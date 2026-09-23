import { log } from '@gbl-uzh/platform'
import { createNextApiHandler } from '@trpc/server/adapters/next'

import { createContext } from '../../../server/trpc/context'
import { appRouter } from '../../../server/trpc/router'

export default createNextApiHandler({
  router: appRouter,
  createContext,
  maxBatchSize: 10,
  onError({ error, path, type }) {
    log.error(`tRPC ${type} ${path ?? '<no-path>'} failed: ${error.message}`, {
      code: error.code,
      stack: error.stack,
    })
    if (process.env.NODE_ENV !== 'production') {
      console.error(error)
    }
  },
})

export const config = {
  api: {
    externalResolver: true,
    responseLimit: false,
  },
}
