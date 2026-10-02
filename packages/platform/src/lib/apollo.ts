import { ApolloClient, ApolloLink, InMemoryCache, split } from '@apollo/client'
import { HttpLink } from '@apollo/client/link/http'
import { getMainDefinition } from '@apollo/client/utilities'
import { useMemo } from 'react'

import SSELink from './SSELink.js'

let apolloClient

function createIsomorphLink() {
  const isBrowser = typeof window !== 'undefined'

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (typeof apiUrl !== 'string' || !apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not set')
  }

  let httpLink: ApolloLink = new HttpLink({
    uri: apiUrl,
    credentials: 'include',
  })

  // on the client, differentiate between links for query/mutation and subscriptions
  if (isBrowser) {
    const sseLink = new SSELink({
      url: apiUrl,
      credentials: 'include',
    })

    // swap out the http link with a split based on operation type
    // use websocket link for subscriptions, http link for remainder
    httpLink = split(
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query) as any
        return kind === 'OperationDefinition' && operation === 'subscription'
      },
      sseLink,
      httpLink
    )
  }

  return httpLink
}

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: createIsomorphLink(),
    cache: new InMemoryCache({
      typePolicies: {
        PlayerState: {
          merge: true,
        },
        Query: {
          fields: {
            result: {
              merge: true,
            },
          },
        },
      },
    }),
  })
}

/**
 * @deprecated New games use their app-local tRPC client. Retained only for
 * published GraphQL compatibility; see packages/platform/README.md.
 */
export function initializeApollo(initialState = null) {
  const _apolloClient = apolloClient ?? createApolloClient()

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    _apolloClient.cache.restore(initialState)
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient

  return _apolloClient
}

/**
 * @deprecated New games use their app-local tRPC hooks. Retained only for
 * published GraphQL compatibility; see packages/platform/README.md.
 */
export function useApollo(initialState) {
  const store = useMemo(() => initializeApollo(initialState), [initialState])
  return store
}
