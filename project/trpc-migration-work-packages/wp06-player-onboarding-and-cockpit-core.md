# WP6: Player Onboarding and Cockpit Core

Status: parallel client package after `WP4`.

Depends on: `WP4`.

Unblocks: `WP9`, `WP10`.

## Goal

Migrate player join, welcome, and cockpit core query/mutation calls from Apollo to tRPC. Leave realtime subscription replacement to `WP9`.

## Graphify Sanity Check

Graphify identifies `cockpit.tsx` and `PlayService.ts` as major hubs. This package owns the cockpit's query/mutation surface but deliberately excludes the realtime subscription to avoid conflicting with `WP3`/`WP9`.

## Write Scope

Allowed:

- `apps/demo-game/src/pages/join/[token].tsx`
- `apps/demo-game/src/pages/play/welcome.tsx`
- `apps/demo-game/src/pages/play/cockpit.tsx`

Avoid:

- `apps/demo-game/src/components/LearningElement.tsx`
- `apps/demo-game/src/components/StoryElements.tsx`
- Admin pages.
- Realtime link setup unless a tiny compatibility edit is unavoidable.

## Inputs to Inspect

- `apps/demo-game/src/pages/join/[token].tsx`
- `apps/demo-game/src/pages/play/welcome.tsx`
- `apps/demo-game/src/pages/play/cockpit.tsx`
- `packages/platform/public/ops/MLoginAsTeam.graphql`
- `packages/platform/public/ops/QSelf.graphql`
- `packages/platform/public/ops/MUpdatePlayerData.graphql`
- `packages/platform/public/ops/QResult.graphql`
- `packages/platform/public/ops/MUpdateReadyState.graphql`
- `packages/platform/public/ops/MPerformAction.graphql`
- `packages/platform/public/ops/MSaveConsolidationDecision.graphql`

## Procedure Mapping

- `LoginAsTeamDocument` -> `trpc.auth.loginAsTeam`
- `SelfDocument` -> `trpc.play.self`
- `UpdatePlayerDataDocument` -> `trpc.play.updatePlayerData`
- `ResultDocument` -> `trpc.play.result`
- `UpdateReadyStateDocument` -> `trpc.play.updateReadyState`
- `PerformActionDocument` -> `trpc.play.performAction`
- `SaveConsolidationDecisionDocument` -> `trpc.play.saveConsolidationDecision`

## Implementation Plan

1. Migrate join page.

   Existing behavior:

   - Read `router.query.token`.
   - Run `loginAsTeam`.
   - Redirect to `/play/welcome`.

   New behavior:

   - Use `auth.loginAsTeam` mutation.
   - Keep redirect after successful mutation.
   - Avoid repeated mutation calls when router query changes by checking mutation state or using a guarded effect.

2. Migrate welcome page.

   Existing behavior:

   - Query `Self`.
   - Submit player name/facts.
   - Navigate to cockpit.
   - Has an optimistic response but visible optimistic value is not essential because navigation follows submit.

   New behavior:

   - Use `play.self`.
   - Use `play.updatePlayerData`.
   - Prefer simple submit, invalidate `play.self`, then navigate.
   - Only implement optimistic update if UI visibly regresses.

3. Migrate cockpit `GameLayout` data.

   Existing behavior:

   - `ResultDocument` with `cache-and-network`.
   - `updateReadyState`.
   - GraphQL subscription refetches result.

   New behavior:

   - Use `play.result`.
   - Use `play.updateReadyState`.
   - Invalidate or refetch `play.result` after ready-state mutation if needed.
   - Keep old GraphQL subscription block temporarily if Apollo still exists. Add a comment that `WP9` owns it.

4. Migrate cockpit action submission.

   Existing behavior:

   - `performAction` mutation.
   - `refetchQueries: [ResultDocument]`.

   New behavior:

   - Use `play.performAction`.
   - On success, invalidate `play.result`.
   - Preserve payload shape expected by the service. If `WP2` still expects a string payload, stringify in the client. If `WP2` accepts unknown/object, pass the object.

5. Migrate consolidation decision if active.

   Search cockpit for `SaveConsolidationDecisionDocument`, `saveConsolidationDecision`, or similar. If active, migrate to `play.saveConsolidationDecision` and invalidate `play.result`.

6. Replace generated types.

   Use:

   - `RouterOutputs['play']['result']`
   - `RouterOutputs['play']['self']`
   - local inferred types from result properties.

7. Preserve loading/error behavior.

   Map:

   - Apollo `loading` -> React Query `isLoading` or `isPending`.
   - Apollo `error` -> React Query `error`.
   - Apollo `data` -> React Query `data`.

8. Verify.

   ```bash
   pnpm --filter @gbl-uzh/demo-game check
   ```

## Acceptance Criteria

- Join, welcome, and cockpit core files no longer use Apollo queries/mutations for their core calls.
- Realtime subscription is either still present for `WP9` or clearly isolated.
- Player action and ready-state mutations invalidate cockpit data.
- No learning/story component migration is included here.

## Manual Smoke

After a dev server is available:

- Player can join by token.
- Player can complete welcome setup.
- Player can load cockpit.
- Player can toggle ready state.
- Player can submit the main action form.

## Handoff Notes

Report:

- Whether `play.performAction` uses object or string payload.
- Whether GraphQL subscription remains for `WP9`.
- Any missing fields in `play.result` DTO.
- Any cockpit type aliases created.

## Agent Prompt

```text
You own WP6 for the tRPC migration. Migrate join, welcome, and cockpit core query/mutation calls from Apollo to tRPC. Do not implement realtime subscriptions; WP9 owns that after this lands.
```
