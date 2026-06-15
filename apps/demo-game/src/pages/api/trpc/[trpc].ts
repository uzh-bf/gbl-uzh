import { createNextApiHandler } from '@trpc/server/adapters/next'

import { createContext } from '../../../server/trpc/context'
import { appRouter } from '../../../server/trpc/router'

export default createNextApiHandler({
  router: appRouter,
  createContext,
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
