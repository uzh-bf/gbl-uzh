import { httpBatchLink, httpSubscriptionLink, splitLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import superjson from 'superjson'

import type { AppRouter } from '../server/trpc/router'

function getUrl() {
  if (typeof window !== 'undefined') return '/api/trpc'

  const fallbackApiUrl = process.env.NEXT_PUBLIC_API_URL
  if (fallbackApiUrl) {
    return new URL('/api/trpc', fallbackApiUrl).toString()
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/trpc`
  }
  return 'http://localhost:3000/api/trpc'
}

export const trpc = createTRPCNext<AppRouter>({
  transformer: superjson,
  config() {
    return {
      links: [
        splitLink({
          condition: (op) => op.type === 'subscription',
          true: httpSubscriptionLink({
            url: getUrl(),
            transformer: superjson,
          }),
          false: httpBatchLink({
            url: getUrl(),
            transformer: superjson,
            maxItems: 10,
            maxURLLength: 2083,
          }),
        }),
      ],
    }
  },
  ssr: false,
})
