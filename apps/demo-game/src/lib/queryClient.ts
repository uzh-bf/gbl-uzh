import { QueryClient } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient()
}

let browserQueryClient: QueryClient

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }

  return browserQueryClient
}
