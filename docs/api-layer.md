---
type: API Overview
title: API Layer and Realtime
description: The supported tRPC v11 Pages Router architecture, authorization, cache invalidation, and realtime events.
tags:
  - api
  - graphql
  - trpc
  - realtime
timestamp: "2026-08-10T00:00:00Z"
---

# API Layer and Realtime

The supported game API is tRPC v11 on the Next.js Pages Router. The platform
owns procedures, authorization, data transfer objects, and realtime semantics;
each game supplies its services and fact schemas, creates one router, and hosts
one `/api/trpc` route. The reference implementation is `apps/demo-game`.

Rate Wars and Central Bank still contain the deprecated GraphQL compatibility
client on the first migration layer. They are migration inputs, not templates
for new games. Public GraphQL exports remain available temporarily for unknown
external consumers, but repository code and documentation must use tRPC.

## Server contract

- Initialize tRPC once in `packages/platform/src/trpc/init.ts`. Export named
  router, procedure, and caller helpers rather than the entire `t` object.
- `createPlatformRouter({ services, schemas, roleAssigner?, extensions? })`
  composes the `auth`, `game`, `period`, `segment`, `play`, `learning`, `events`,
  `story`, and `results` routers.
- A game exports `AppRouter = typeof appRouter`; browser modules import this as
  a type so server code cannot enter the client bundle.
- Zod validates transport inputs. Yup continues to validate game-specific facts
  before service computations run.
- Known domain failures are mapped to `TRPCError`. Unexpected internal errors
  are logged server-side and returned with a generic client message.

## Authorization

`publicProcedure`, `protectedProcedure`, `adminProcedure`, and
`playerProcedure` are typed middleware layers. Role checks authenticate a role,
not resource ownership: every admin operation with a client-supplied `gameId`
also calls `assertGameOwnership`, returning `NOT_FOUND` for a different owner's
game.

The API route builds context from the NextAuth session and the app's Prisma
client. Keep that work per request; never place a user or request context in a
module singleton.

## Pages Router client pattern

Use `createTRPCNext<AppRouter>` from `@trpc/next` and export
`trpc.withTRPC(App)` from `pages/_app.tsx`. Keep `ssr: false` unless a game has a
reviewed SSR requirement. The browser URL is relative (`/api/trpc`); only a
server-side client needs an absolute origin.

The link chain has two terminating branches:

- subscriptions: `httpSubscriptionLink` over Server-Sent Events;
- queries and mutations: `httpBatchLink` with finite `maxItems` and
  `maxURLLength` bounds. Keep `maxItems` no higher than the server's
  `maxBatchSize`; `maxURLLength` independently caps the encoded request URL.

Both terminating links use the same SuperJSON transformer configured in
`initTRPC`. Same-origin browser cookies are sent automatically; add explicit
credentials only for a reviewed cross-origin deployment.

This follows the official [Pages Router setup](https://trpc.io/docs/client/nextjs/pages-router/setup),
[HTTP subscription link](https://trpc.io/docs/client/links/httpSubscriptionLink),
[HTTP batch link](https://trpc.io/docs/client/links/httpBatchLink), and
[transformer](https://trpc.io/docs/server/data-transformers) guidance.

## Cache and realtime semantics

Realtime is notify-then-refetch. The server publishes small global and per-user
events; clients filter relevant events and invalidate the narrowest affected
query with `trpc.useUtils()`. Events signal that authoritative data changed;
they are not an alternate data store.

Server subscriptions return async iterables and pass the request
`AbortSignal` to the event source so disconnects release listeners. The current
event bus is process-local, so a game must run a single app replica. There is no
cross-instance delivery, retained history, or reconnect replay. Do not use
`tracked()` until events have stable IDs and durable history that can fill a
reconnect gap.

## Verification

For an API migration, run both TypeScript compilers, lint, a production build,
the platform procedure tests, and the app's real Playwright lifecycle. A green
type check is not proof of session, ownership, cache-refresh, or subscription
behavior; retain those assertions at their stable integration or browser seam.
