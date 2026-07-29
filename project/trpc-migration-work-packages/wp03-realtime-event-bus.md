# WP3: Realtime Event Bus and tRPC Events Router

Status: foundation, parallelizable with `WP2` after `WP1`.

Depends on: `WP1`.

Unblocks: `WP9`.

## Goal

Decouple realtime events from GraphQL Yoga and expose equivalent tRPC subscriptions, while keeping the existing GraphQL subscription path working during migration.

## Graphify Sanity Check

Graphify ranks `EventService.ts` as the third-largest architecture hub and `pubsub.ts` as a focused integration hub. This package should isolate realtime changes around those files and avoid touching gameplay service behavior.

## Write Scope

Allowed:

- `packages/platform/src/lib/pubsub.ts`
- `packages/platform/src/lib/realtime.ts` or equivalent new helper
- `packages/platform/src/services/EventService.ts`
- `packages/platform/src/trpc/routers/events.ts`
- `packages/platform/src/trpc/createPlatformRouter.ts` only to register `eventsRouter` if it exists

Avoid:

- Demo-game client subscription changes. `WP9` owns those.
- Removing `graphql-yoga` pubSub.
- Changing event payload shapes unless unavoidable.

## Inputs to Inspect

- `packages/platform/src/lib/pubsub.ts`
- `packages/platform/src/types/Subscription.ts`
- `packages/platform/src/services/EventService.ts`
- `apps/demo-game/src/pages/play/cockpit.tsx`
- `packages/platform/public/ops/SGlobalEvents.graphql`
- `packages/platform/public/ops/SUserEvents.graphql`

## Existing Behavior to Preserve

Global events:

- GraphQL subscription field: `eventsGlobal`
- Channel: `global:events`
- Active client: cockpit listens, filters by `event.facts.gameId`, refetches result.

User events:

- GraphQL subscription field: `eventsUser`
- Channel: `user:events`
- Currently not prominent in demo-game client, but preserve parity.

## Implementation Plan

1. Add a GraphQL-independent event bus.

   Preferred shape:

   ```text
   packages/platform/src/lib/realtime.ts
   ```

   Responsibilities:

   - Publish global events.
   - Publish user events.
   - Subscribe to global events as async iterable.
   - Subscribe to user events as async iterable.
   - Clean up listeners on abort.

2. Choose event primitive.

   Acceptable options:

   - `EventTarget`
   - Node `EventEmitter`

   Keep it dependency-free unless tRPC docs require a small helper.

3. Bridge publishing.

   Update `EventService.publishGlobalNotification` and `publishUserNotification` so they publish to:

   - Existing GraphQL Yoga pubSub.
   - New realtime bus.

   Do not publish duplicate payloads to the same bus.

4. Keep existing GraphQL subscription intact.

   `packages/platform/src/lib/pubsub.ts` can keep using `createPubSub` during the migration. If the file becomes mixed-purpose, keep exports backward-compatible:

   - `pubSub`
   - `getPubSub`
   - `configurePubSub`

5. Implement `eventsRouter`.

   Procedures:

   - `events.global`
   - `events.user`

   Use tRPC subscription procedures and return async iterables according to current tRPC docs.

6. Abort and cleanup.

   Use request/subscription abort signal to remove event listeners. Document fallback behavior if the adapter does not provide a signal in the exact implementation version.

7. Reconnect semantics.

   If no stable tracked event ID exists, implement best-effort live events and document that missed events still require query invalidation/refetch on reconnect. If event version exists in payload facts, consider using it as tracked ID.

8. Build.

   ```bash
   pnpm --filter @gbl-uzh/platform build
   ```

## Acceptance Criteria

- Platform builds.
- Existing GraphQL pubSub exports remain available.
- Existing GraphQL subscriptions are not intentionally broken.
- tRPC `events.global` and `events.user` exist.
- Publish functions bridge to both old and new event systems.

## Final State (as merged)

EventService publishes to the realtime EventEmitter bus only
(`lib/realtime.ts`); the GraphQL pubSub (`lib/pubsub.ts`) subscribes to that
bus via `bridgeRealtimeEvents` so nexus subscriptions in the example games
keep firing. The bridge lives at the pubsub layer instead of inside the
publish functions, keeping tRPC apps free of any graphql-yoga import.

## Handoff Notes

Report:

- Event primitive chosen.
- Subscription cleanup approach.
- Whether tracked event IDs were implemented.
- Any event payload shape differences.

## Agent Prompt

```text
You own WP3 for the tRPC migration. Introduce a GraphQL-independent realtime bus, bridge EventService publishes to both old GraphQL pubSub and the new bus, and expose tRPC event subscriptions. Do not change demo-game client code.
```
