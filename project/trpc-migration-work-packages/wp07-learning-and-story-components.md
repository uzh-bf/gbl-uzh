# WP7: Learning and Story Components

Status: parallel client package after `WP4`.

Depends on: `WP4`.

Unblocks: `WP10`.

## Goal

Migrate nested learning and story components from Apollo to tRPC, including the old Apollo `cache-only` dependency in `LearningElements.tsx`.

## Graphify Sanity Check

Graphify places `cockpit.tsx` high in the architecture hubs and shows learning/story UI as downstream of cockpit state. This package should coordinate lightly with `WP6` but keep its direct write scope focused on the nested components.

## Write Scope

Allowed:

- `apps/demo-game/src/components/LearningElement.tsx`
- `apps/demo-game/src/components/LearningElements.tsx`
- `apps/demo-game/src/components/StoryElements.tsx`
- Small prop-threading edits in `apps/demo-game/src/pages/play/cockpit.tsx` only if required.

Avoid:

- Admin pages.
- Join/welcome player pages.
- tRPC server procedure changes unless reporting a missing procedure.
- GraphQL cleanup.

## Inputs to Inspect

- `apps/demo-game/src/components/LearningElement.tsx`
- `apps/demo-game/src/components/LearningElements.tsx`
- `apps/demo-game/src/components/StoryElements.tsx`
- `apps/demo-game/src/pages/play/cockpit.tsx`
- `packages/platform/public/ops/QLearningElement.graphql`
- `packages/platform/public/ops/MAttemptLearningElement.graphql`
- `packages/platform/public/ops/MMarkStoryElement.graphql`
- `packages/platform/public/ops/QResult.graphql`

## Procedure Mapping

- `LearningElementDocument` -> `trpc.learning.byId`
- `AttemptLearningElementDocument` -> `trpc.learning.attempt`
- `MarkStoryElementDocument` -> `trpc.story.markVisited`
- `ResultDocument` cache-only read -> either a prop from cockpit or React Query cache lookup for `play.result`

## Implementation Plan

1. Migrate `LearningElement.tsx`.

   Existing behavior:

   - Query learning element state by ID.
   - Keep local `elementState`.
   - Parse `solution` if solved.
   - Attempt mutation with selected option indexes encoded as JSON.
   - Refetch all Apollo queries.

   New behavior:

   - Use `learning.byId`.
   - Use `learning.attempt`.
   - Keep local state behavior unless it can be simplified safely.
   - On success, invalidate:
     - `learning.byId({ id: elementId })`
     - `play.result`
     - `play.self` if XP/achievements may change.
   - Preserve wrong-answer toast.

2. Decide selection input shape.

   If `WP2` accepts `selection: number[]`, send the array.

   If `WP2` preserves string compatibility, send `JSON.stringify(activeElements)`.

   Do not change both server and client shape in this package unless the router already supports it.

3. Migrate `StoryElements.tsx`.

   Existing behavior:

   - Runs `MarkStoryElementDocument`.
   - Tracks loading.

   New behavior:

   - Use `story.markVisited`.
   - On success, invalidate `play.result`.
   - Preserve loading/disabled behavior.

4. Resolve `LearningElements.tsx` cache-only read.

   Current behavior:

   - Reads `ResultDocument` from Apollo cache with `fetchPolicy: 'cache-only'`.

   Preferred new behavior:

   - Accept required result data as props from cockpit if the component is only rendered there.

   Alternative:

   - Read React Query cache with the exact `play.result` query key.

   Choose the simpler option after inspecting call sites. Prop threading is usually easier to reason about.

5. Replace generated imports.

   Remove imports from:

   - `@apollo/client`
   - `src/graphql/generated/ops`

   Add:

   - tRPC helper imports.
   - Router output aliases only where useful.

6. Verify.

   ```bash
   pnpm --filter @gbl-uzh/demo-game check
   ```

## Acceptance Criteria

- Learning/story components no longer import Apollo.
- `LearningElements.tsx` no longer depends on Apollo cache-only behavior.
- Learning attempts still update solved/attempted local UI.
- Story visits still update player result state after invalidation.
- No GraphQL files are deleted.

## Manual Smoke

After a dev server is available:

- Learning elements open.
- Attempts update local state.
- Solved elements reveal feedback.
- Wrong attempts show the existing toast.
- Story elements can be marked visited.

## Handoff Notes

Report:

- How the old cache-only dependency was replaced.
- Selection payload shape used for `learning.attempt`.
- Query invalidations used after attempts and story visits.
- Any missing DTO fields in `learning.byId` or `play.result`.

## Agent Prompt

```text
You own WP7 for the tRPC migration. Migrate only learning/story components from Apollo to tRPC and resolve the old cache-only dependency cleanly. Coordinate with WP6 if a cockpit prop is needed.
```
