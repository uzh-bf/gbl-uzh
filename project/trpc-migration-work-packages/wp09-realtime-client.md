# WP9: Realtime Client

Status: after `WP3` and `WP6`.

Depends on: `WP3`, `WP6`.

Unblocks: `WP10`.

## Goal

Replace cockpit's active GraphQL global subscription with tRPC realtime events and React Query invalidation.

## Graphify Sanity Check

Graphify shows `EventService.ts`, `pubsub.ts`, and `cockpit.tsx` as the relevant realtime chain. This package should touch only the client end of that chain after `WP3` has supplied the tRPC event stream.

## Write Scope

Allowed:

- `apps/demo-game/src/pages/play/cockpit.tsx`
- `apps/demo-game/src/lib/trpc.ts` only if subscription link wiring needs a small adjustment.

Avoid:

- Platform realtime bus changes, unless reporting a blocker to `WP3`.
- Player query/mutation migration owned by `WP6`.
- GraphQL cleanup.

## Inputs to Inspect

- `apps/demo-game/src/pages/play/cockpit.tsx`
- `apps/demo-game/src/lib/trpc.ts`
- `packages/platform/src/trpc/routers/events.ts`
- `packages/platform/src/services/EventService.ts`
- `packages/platform/public/ops/SGlobalEvents.graphql`

## Existing Behavior to Preserve

The cockpit subscribes to global events and refetches the main result when:

- `COUNTDOWN_UPDATED`
- `PERIOD_ACTIVATED`
- `SEGMENT_ACTIVATED`

It filters by:

```ts
event.facts?.gameId === currentGameId;
```

It logs subscription errors and preserves countdown toasts driven by result data changes.

## Implementation Plan

1. Confirm dependencies are complete.

   Ensure:

   - `WP3` exposes `events.global`.
   - `WP6` has migrated cockpit `play.result` to tRPC.

2. Confirm client link supports subscriptions.

   Inspect `apps/demo-game/src/lib/trpc.ts`.

   If missing, add subscription-capable link setup according to the installed tRPC version:

   - split subscription operations from query/mutation operations.
   - use HTTP batching for query/mutation.
   - use HTTP/SSE subscription link for subscriptions.

3. Replace imports in cockpit.

   Remove:

   - `useSubscription` from `@apollo/client`
   - `GlobalEventsDocument`

   Add:

   - tRPC event subscription hook/helper.
   - query client or tRPC utils for invalidation.

4. Implement event subscription.

   Behavior:

   - Skip subscription until `currentGameId` is available.
   - On event, ignore events without matching `facts.gameId`.
   - Invalidate or refetch `play.result`.

   Prefer invalidation through tRPC/React Query utils if available.

5. Preserve event types.

   Use current string values:

   - `COUNTDOWN_UPDATED`
   - `PERIOD_ACTIVATED`
   - `SEGMENT_ACTIVATED`

   If platform exports `BaseGlobalNotificationType`, use that enum if import paths are safe.

6. Handle errors.

   Keep console error behavior equivalent to current subscription error handling. Do not add user-facing errors unless already present.

7. Verify.

   ```bash
   pnpm --filter @gbl-uzh/demo-game check
   ```

## Acceptance Criteria

- `play/cockpit.tsx` no longer imports GraphQL subscription documents.
- Realtime invalidates/refetches `play.result`.
- Event filtering by `gameId` is preserved.
- Apollo can still be mounted temporarily without duplicate cockpit event behavior.

## Manual Smoke

After a dev server is available:

- Open admin game detail and player cockpit in separate browser sessions.
- Set a countdown as admin.
- Confirm player cockpit updates without reload.
- Activate period or segment.
- Confirm player cockpit updates without reload.

## Handoff Notes

Report:

- Subscription link setup used.
- Invalidation/refetch method used.
- Any reconnect or missed-event limitations.
- Any platform `events.global` issues found.

## Agent Prompt

```text
You own WP9 for the tRPC migration. Replace cockpit GraphQL global subscription with tRPC realtime events. WP6 must already have migrated cockpit core queries/mutations.
```
