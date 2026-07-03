# API Layer and Realtime

The platform owns the entire client↔server transport; a game app only plugs its `services` object and facts schemas into a platform-provided builder and hosts one API route. **The transport is being replaced**: today (branch `dev`) it is GraphQL; a completed tRPC rewrite exists on the branch `codex/trpc-migration-work-packages` and is intended to replace GraphQL entirely.

**How to tell what a checkout runs:** `apps/<game>/src/pages/api/trpc/` exists → tRPC; `apps/<game>/src/pages/api/graphql.ts` exists → GraphQL. Do not assume from this wiki — check.

## Transport-independent semantics

These hold in both worlds and are what game code should rely on:

- **One aggregate "result" query** drives the player cockpit (player result + game + active period/segment + content + self). The admin panel polls/queries a game-detail operation.
- **Mutations map 1:1 to platform service calls**: create game, add period/segment, activate next period/segment, perform action, save decisions, update ready state, add countdown, attempt learning element, mark story element, login as team, update player data.
- **Realtime is notify-then-refetch.** The server publishes small events on two channels — global (game-wide: `GAME_STATE_UPDATED`, `PERIOD_ACTIVATED`, `SEGMENT_ACTIVATED`, `COUNTDOWN_UPDATED`, `ACTION_PERFORMED`, `SWITCH_TOGGLED`, `RESET_READY_STATE`) and per-user (`LEARNING_ELEMENT_SOLVED`, `LEARNING_ELEMENT_INCORRECT`, `ACHIEVEMENT_RECEIVED`, `LEVEL_UP`) — enums in `packages/platform/src/types.ts`. Clients treat events as a signal to refetch/invalidate the aggregate query, never as a data source. Transport is Server-Sent Events in both worlds (no websockets).
- **Realtime is in-process** (single server replica). There is no Redis/cross-instance bus; the GraphQL side has a `configurePubSub` hook to swap one in, the tRPC side documents single-replica as a known limitation.

## Current on `dev`: GraphQL (kept brief — being replaced)

- Schema: code-first via nexus in `packages/platform/src/types/` (`Query`, `Mutation`, `Subscription`, object types); served by graphql-yoga from the game app at `/api/graphql` (`apps/demo-game/src/pages/api/graphql.ts`), with `prisma`, session user, and `pubSub` in context.
- Game wiring: `generateBaseMutations({ services, schemas, inputTypes })` from the platform, called in `apps/demo-game/src/graphql/index.ts`.
- Client: Apollo Client with a split link — subscriptions over `graphql-sse` (`packages/platform/src/lib/SSELink.ts`), everything else over HTTP. Shared operation documents ship with the platform (`packages/platform/public/ops/*.graphql`); each game runs codegen against them for typed hooks.
- If you are building a new game while this is still current: copy the demo game's `src/graphql/` + `codegen.ts` wholesale and do not invest in custom GraphQL; it will be removed when the tRPC branch merges.

## Upcoming: tRPC (branch `codex/trpc-migration-work-packages`, not merged)

A complete tRPC v11 rewrite of platform + demo game; GraphQL/Apollo/nexus/codegen are fully removed there. The developer experience for a new game becomes:

- **Server**: the platform exports `createPlatformRouter({ services, schemas, roleAssigner?, extensions? })` (`packages/platform/src/trpc/createPlatformRouter.ts` on that branch), composing sub-routers `auth`, `game`, `period`, `segment`, `play`, `learning`, `events`, `story`, `results`. The game app calls it with its services + yup facts schemas and exports `AppRouter`, `RouterInputs`, `RouterOutputs` (`apps/demo-game/src/server/trpc/router.ts`).
- **Endpoint**: one Pages-Router route `src/pages/api/trpc/[trpc].ts` with `externalResolver: true` and `responseLimit: false` (required for long-lived SSE subscription responses).
- **Client**: `createTRPCReact<AppRouter>` + React Query; a split link sends subscriptions over `httpSubscriptionLink` (SSE) and the rest over `httpBatchLink`, both with superjson.
- **Types**: no codegen. UI types derive from the router, e.g. `NonNullable<RouterOutputs['play']['result']>`, collected in a per-app `src/types/api.ts`.
- **Realtime**: `trpc.events.global.useSubscription(..., { onData: e => /* filter by gameId+type */ utils.play.result.invalidate() })` — same notify-then-refetch pattern, now via React Query invalidation. Server side is an async-iterable over a `globalThis`-cached Node `EventEmitter` (`packages/platform/src/lib/realtime.ts` on that branch).
- **Validation split**: zod validates shapes at the RPC boundary (`packages/platform/src/trpc/schemas.ts`); yup keeps validating game-domain facts inside services — games keep authoring yup schemas exactly as before.
- **Authz**: `publicProcedure` / `protectedProcedure` / `adminProcedure` / `playerProcedure`, plus `assertGameOwnership(ctx, gameId)` on every admin procedure that takes a game id — stricter than the GraphQL layer ever was.

Known deferred gaps on that branch (check before relying): no cross-instance realtime bus, no SSE reconnect replay, no rate limiting on `auth.loginAsTeam`, no behavioral test coverage of procedures beyond the Playwright E2E suite.

## Guidance for doc/agent consumers

When the tRPC branch merges to `dev`, the GraphQL section above becomes historical and should be deleted; until then, treat tRPC details as a preview of the intended architecture, sourced from that branch (read files with `git show codex/trpc-migration-work-packages:<path>` — do not expect them on `dev`).
