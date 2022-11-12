import { ApolloClient, ApolloLink, InMemoryCache, split } from '@apollo/client'
import { HttpLink } from '@apollo/client/link/http'
import { getMainDefinition } from '@apollo/client/utilities'
import assert from 'node:assert'
import { useMemo } from 'react'

import SSELink from './SSELink'

let apolloClient

function createIsomorphLink() {
  assert(typeof process.env.NEXT_PUBLIC_API_URL === 'string')

  const isBrowser = typeof window !== 'undefined'

  let httpLink: ApolloLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_API_URL,
    credentials: 'same-origin',
  })

  // on the client, differentiate between links for query/mutation and subscriptions
  if (isBrowser) {
    const sseLink = new SSELink({
      url: process.env.NEXT_PUBLIC_API_URL,
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
    cache: new InMemoryCache(),
  })
}

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

export function useApollo(initialState) {
  const store = useMemo(() => initializeApollo(initialState), [initialState])
  return store
}
