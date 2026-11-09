---
type: API Overview
title: API Layer and Realtime
description: Transport-independent API semantics, the current GraphQL layer, and the upcoming tRPC architecture with realtime events.
tags:
  - api
  - graphql
  - trpc
  - realtime
timestamp: "2026-11-02T13:20:00Z"
---

# API Layer and Realtime

The platform owns the entire client↔server transport; a game app only plugs its `services` object and facts schemas into a platform-provided builder and hosts one API route. **The transport is being replaced**: today (branch `dev`) it is GraphQL; a completed tRPC rewrite exists on the branch `codex/trpc-migration-work-packages` and is intended to replace GraphQL entirely.

**How to tell what a checkout runs:** `apps/<game>/src/pages/api/trpc/` exists → tRPC; `apps/<game>/src/pages/api/graphql.ts` exists → GraphQL. Do not assume from this wiki — check.

## Transport-independent semantics

These hold in both worlds and are what game code should rely on:

- **One aggregate "result" query** drives the player cockpit (player result + game + active period/segment + content + self). The admin panel polls/queries a game-detail operation.
- **Mutations map 1:1 to platform service calls**: create game, add period/segment, activate next period/segment, perform action, save decisions, update ready state, add countdown, attempt learning element, mark story element, login as team, update player data.
- **Realtime is notify-then-refetch.** The server publishes small events on two channels — global (game-wide: `GAME_STATE_UPDATED`, `PERIOD_ACTIVATED`, `GAME_COMPLETED`, `SEGMENT_ACTIVATED`, `COUNTDOWN_UPDATED`, `ACTION_PERFORMED`, `SWITCH_TOGGLED`, `RESET_READY_STATE`) and per-user (`LEARNING_ELEMENT_SOLVED`, `LEARNING_ELEMENT_INCORRECT`, `ACHIEVEMENT_RECEIVED`, `LEVEL_UP`) — enums in `packages/platform/src/types.ts`. Clients treat events as a signal to refetch/invalidate the aggregate query, never as a data source. Transport is Server-Sent Events in both worlds (no websockets).
- **Realtime is in-process** (single server replica). There is no Redis/cross-instance bus; the GraphQL side has a `configurePubSub` hook to swap one in, the tRPC side documents single-replica as a known limitation.

## Current on `dev`: GraphQL (kept brief — being replaced)

- Schema: code-first via nexus in `packages/platform/src/types/` (`Query`, `Mutation`, `Subscription`, object types); served by graphql-yoga from the game app at `/api/graphql` (`apps/demo-game/src/pages/api/graphql.ts`), with `prisma`, session user, and `pubSub` in context.
- Admin reports: `packages/platform/src/services/PlayService.ts:getSpecificResults` includes player, period, and segment relations. Quarter metadata must accompany `SEGMENT_END` facts so clients can place monthly samples on the settled timeline; period-level results may have a null segment.
- Game wiring: `generateBaseMutations({ services, schemas, inputTypes })` from the platform, called in `apps/demo-game/src/graphql/index.ts`.
- Client: Apollo Client with a split link — subscriptions over `graphql-sse` (`packages/platform/src/lib/SSELink.ts`), everything else over HTTP. Shared operation documents ship with the platform (`packages/platform/public/ops/*.graphql`); each game runs codegen against them for typed hooks.
- If you are building a new game while this is still current: copy the demo game's `src/graphql/` + `codegen.ts` wholesale and do not invest in custom GraphQL; it will be removed when the tRPC branch merges.

The demo game extends the base GraphQL schema with ADMIN/MASTER-only `marketDice(segmentId)` and `revealMarketRoll(segmentId, rollIndex)` fields (`apps/demo-game/src/graphql/market.ts`). The query reads authoritative precomputed outcomes; the mutation persists reveal indices without rerolling. Its `MARKET_ROLL_REVEALED` global event carries only `gameId`; the player refetches its existing aggregate result. Game-local operation documents in `src/graphql/ops/` are included alongside platform operations by the demo-game codegen config.

### Shared registration API

The GraphQL platform adds `registrationInfo`, `prepareRegistration`, `registerPlayer`, `resumeRegistration`, and `setRegistrationOpen`. `prepareRegistration` establishes the HttpOnly browser cookie before final submission; `registerPlayer` validates completed setup and issues the existing player session after commit. `resumeRegistration` works after closure or game start for a recognized entry. The join page combines prepare and resume into one GraphQL request; enrollment is a later request, after the browser has received its identity cookie. Request and response are explicitly passed in the demo-game GraphQL context for cookie access.

`generateBaseMutations` accepts an optional `schemas.RegistrationSchema` for `{ name, facts }`; the demo shares its bank setup rules with the welcome form. Existing `createGame` callers retain fixed-count behavior; `registrationMode: SHARED_LINK` creates no players and accepts optional `maxPlayers`. Registration controls and initial start require an admin or master, as other game controls do; games may have several instructors. Public registration information contains only game name, status, and availability. Private player tokens resolve only for that player or an admin/master; registration tokens resolve only for an admin/master. Self queries request return credentials without adding them to co-player fragments.

Apply the additive shared-registration migration before deploying new application code; other games follow [Upgrading a game to shared registration](deploying-a-game.md#upgrading-a-game-to-shared-registration). It adds `registrationToken`, `registrationOpen` and `maxPlayers` to `Game` and `enrollmentKey` to `Player`. Existing games have no registration token, so they stay `FIXED` and keep their private player links.

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
