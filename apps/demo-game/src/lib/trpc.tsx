import { QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import type { ReactNode } from 'react'
import { useState } from 'react'
import superjson from 'superjson'

import type { AppRouter } from '../server/trpc/router'
import { getQueryClient } from './queryClient'

export const trpc = createTRPCReact<AppRouter>()

function getUrl() {
  if (typeof window !== 'undefined') {
    return '/api/trpc'
  }

  const fallbackApiUrl = process.env.NEXT_PUBLIC_API_URL
  if (fallbackApiUrl) {
    return new URL('/api/trpc', fallbackApiUrl).toString()
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/trpc`
  }

  return 'http://localhost:3000/api/trpc'
}

export function TRPCProvider({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const queryClient = getQueryClient()

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: getUrl(),
          transformer: superjson,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include',
            })
          },
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
