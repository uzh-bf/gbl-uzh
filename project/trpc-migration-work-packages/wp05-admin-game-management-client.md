# WP5: Admin Game Management Client

Status: parallel client package after `WP4`.

Depends on: `WP4`.

Unblocks: `WP10`.

## Goal

Migrate admin game list and game detail pages from Apollo/generated GraphQL operations to tRPC procedures.

## Graphify Sanity Check

Graphify marks `apps/demo-game/src/pages/admin/games/[id].tsx` as the strongest UI bridge across communities. Keep this work isolated from player flow so later agents can work in parallel without conflicting over cockpit files.

## Write Scope

Allowed:

- `apps/demo-game/src/pages/admin/games.tsx`
- `apps/demo-game/src/pages/admin/games/[id].tsx`
- Admin-only helper edits if directly required.

Avoid:

- `apps/demo-game/src/pages/play/**`
- `apps/demo-game/src/components/LearningElement.tsx`
- `apps/demo-game/src/components/StoryElements.tsx`
- GraphQL cleanup or dependency removal.

## Inputs to Inspect

- `apps/demo-game/src/pages/admin/games.tsx`
- `apps/demo-game/src/pages/admin/games/[id].tsx`
- `packages/platform/public/ops/QGames.graphql`
- `packages/platform/public/ops/QGame.graphql`
- `packages/platform/public/ops/MCreateGame.graphql`
- `packages/platform/public/ops/MAddGamePeriod.graphql`
- `packages/platform/public/ops/MAddPeriodSegment.graphql`
- `packages/platform/public/ops/MActivateNextPeriod.graphql`
- `packages/platform/public/ops/MActivateNextSegment.graphql`
- `packages/platform/public/ops/MAddCountdown.graphql`

## Procedure Mapping

- `GamesDocument` -> `trpc.game.list`
- `CreateGameDocument` -> `trpc.game.create`
- `GameDocument` -> `trpc.game.byId`
- `LearningElementsDocument` -> `trpc.learning.list`
- `StoryElementsDocument` -> `trpc.story.list`
- `ActivateNextPeriodDocument` -> `trpc.game.activateNextPeriod`
- `ActivateNextSegmentDocument` -> `trpc.game.activateNextSegment`
- `AddGamePeriodDocument` -> `trpc.period.add`
- `AddPeriodSegmentDocument` -> `trpc.segment.add`
- `AddCountdownDocument` -> `trpc.game.addCountdown`

## Implementation Plan

1. Replace imports.

   Remove from admin pages:

   - `useQuery`/`useMutation` from `@apollo/client`
   - generated GraphQL documents
   - generated GraphQL fragment docs
   - generated `Game`, `Player`, and `GameStatus` types when replaced.

   Add:

   - tRPC client helper.
   - `RouterOutputs` aliases where useful.

2. Migrate `admin/games.tsx`.

   Existing behavior:

   - Load games.
   - Create game.
   - Manually update Apollo cache and refetch.

   New behavior:

   - Use `game.list` query.
   - Use `game.create` mutation.
   - On success, invalidate `game.list`.
   - Keep the same form values and navigation.

3. Migrate `admin/games/[id].tsx`.

   Existing behavior:

   - Polls `GameDocument`.
   - Loads learning/story elements.
   - Runs period/segment/countdown/activation mutations.

   New behavior:

   - Use `game.byId` query with `id: Number(router.query.id)`.
   - Disable query until `router.query.id` exists.
   - Preserve polling with React Query `refetchInterval: 15000` unless realtime invalidation is already available.
   - Use `learning.list` and `story.list`.
   - Use mutations for period/segment/countdown/activation.

4. Replace invalidation.

   Invalidate after mutations:

   - `game.byId({ id })`
   - `game.list` where list data may change.
   - `learning.list`/`story.list` only if those resources mutate, which they do not in this package.

5. Preserve UI behavior.

   Keep:

   - Scroll to active period after activation.
   - Toast on countdown success/failure.
   - Notification sound when all players are ready.
   - Existing loading/null behavior unless a small cleanup is required.

6. Type cleanup.

   Replace generated enum usage with:

   - Prisma/domain enum if safe.
   - `RouterOutputs['game']['byId']` derived types.
   - String enum comparison only if existing UI already uses strings.

7. Verify.

   ```bash
   pnpm --filter @gbl-uzh/demo-game check
   ```

## Acceptance Criteria

- Admin game list page has no Apollo imports.
- Admin game detail page has no Apollo imports.
- Game creation invalidates and refreshes the list.
- Game detail mutations refresh the detail query.
- No GraphQL files are deleted.

## Manual Smoke

After a dev server is available:

- Admin can list games.
- Admin can create a game.
- Admin can open a game detail page.
- Admin can add periods and segments.
- Admin can activate periods and segments.
- Admin can set countdown.

## Handoff Notes

Report:

- Query keys/procedures invalidated.
- Any type aliases created.
- Any missing DTO fields from `WP2`.
- Any behavior that still needs runtime verification.

## Agent Prompt

```text
You own WP5 for the tRPC migration. Migrate only admin game list/detail pages from Apollo to tRPC. Use React Query invalidation instead of Apollo cache writes. Do not edit player flow or cleanup GraphQL files.
```
