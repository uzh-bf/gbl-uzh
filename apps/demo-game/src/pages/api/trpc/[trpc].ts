import { log } from '@gbl-uzh/platform'
import { createNextApiHandler } from '@trpc/server/adapters/next'

import { createContext } from '../../../server/trpc/context'
import { appRouter } from '../../../server/trpc/router'

export default createNextApiHandler({
  router: appRouter,
  createContext,
  maxBatchSize: 10,
  // Without this, server-side exceptions (incl. ones outside throwAsTRPCError,
  // e.g. context/middleware bugs) are invisible in prod. Log the full error
  // server-side; the client still gets the genericized message from the
  // router's errorFormatter.
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

// SSE subscriptions hold a long-lived streaming response. Tell Next this route
// resolves externally (so it does not buffer or warn) and lift the default
// 4MB response cap that would otherwise truncate the event stream.
export const config = {
  api: {
    externalResolver: true,
    responseLimit: false,
  },
}
