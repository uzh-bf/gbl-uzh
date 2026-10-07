import { httpBatchLink, httpSubscriptionLink, splitLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import superjson from 'superjson'

import type { AppRouter } from '../server/trpc/router'

export const trpc = createTRPCNext<AppRouter>({
  transformer: superjson,
  config() {
    return {
      links: [
        splitLink({
          condition: (op) => op.type === 'subscription',
          true: httpSubscriptionLink({
            url: '/api/trpc',
            transformer: superjson,
          }),
          false: httpBatchLink({
            url: '/api/trpc',
            transformer: superjson,
            maxItems: 10,
            maxURLLength: 2083,
          }),
        }),
      ],
    }
  },
})
