# WP8: Reports and Generated Type Cleanup

Status: parallel client package after `WP4`.

Depends on: `WP4`.

Unblocks: `WP10`.

## Goal

Migrate admin reports and non-React generated GraphQL type imports to tRPC output aliases, DTO types, or domain types.

## Graphify Sanity Check

Graphify identifies `analysis.ts` and `PeriodResultService.ts` as non-React nodes connected to generated result types. This package owns that cleanup so UI migration agents do not leave generated GraphQL types hidden in service/helper code.

## Write Scope

Allowed:

- `apps/demo-game/src/pages/admin/reports/[id].tsx`
- `apps/demo-game/src/lib/analysis.ts`
- `apps/demo-game/src/services/PeriodResultService.ts`
- Other files found by `rg -n "src/graphql/generated" apps/demo-game/src`

Avoid:

- Admin game management pages.
- Player cockpit query/mutation migration.
- GraphQL endpoint/codegen deletion.

## Inputs to Inspect

- `apps/demo-game/src/pages/admin/reports/[id].tsx`
- `apps/demo-game/src/lib/analysis.ts`
- `apps/demo-game/src/services/PeriodResultService.ts`
- `apps/demo-game/src/graphql/generated/ops.ts`
- `packages/platform/public/ops/QGame.graphql`
- `packages/platform/public/ops/QSpecificResults.graphql`

## Procedure Mapping

- `GameDocument` -> `trpc.game.byId` or a dedicated report DTO procedure if `game.byId` is too broad/narrow.
- `SpecificResultsDocument` -> `trpc.results.specific`

## Implementation Plan

1. Audit generated imports.

   ```bash
   rg -n "src/graphql/generated|from 'src/graphql/generated/ops'|from \"src/graphql/generated/ops\"" apps/demo-game/src
   ```

   Separate findings into:

   - Active React query/mutation use.
   - Type-only imports in helpers/services.
   - Stale/commented imports.

2. Migrate report page.

   Existing behavior:

   - Query game by router ID.
   - Query segment-end specific results.
   - Query period-end specific results.
   - Compose chart data.

   New behavior:

   - Use `game.byId({ id })`.
   - Use `results.specific({ gameId, type: 'SEGMENT_END' })`.
   - Use `results.specific({ gameId, type: 'PERIOD_END' })`.
   - Keep query disabled until `router.query.id` exists.
   - Preserve current `cache-first` equivalent with a reasonable React Query stale time only if it helps; otherwise use defaults.

3. Replace generated report types.

   Candidate aliases:

   ```ts
   type ReportGame = NonNullable<RouterOutputs["game"]["byId"]>;
   type SpecificResult = RouterOutputs["results"]["specific"][number];
   ```

   Keep aliases local if only used once. Move to a shared `src/server/trpc/router.ts` export only if multiple files need them.

4. Update `analysis.ts`.

   Replace generated `PlayerResult` type with a structural DTO type that includes only what `composeChartData` reads.

   Prefer a narrow type:

   ```ts
   type AnalysisPlayerResult = {
     facts: any;
     period?: { index: number };
     segment?: { index: number } | null;
     player?: { id: string; name: string };
   };
   ```

   Adjust exact fields after inspection.

5. Update `PeriodResultService.ts`.

   If it imports generated `PlayerResult` only as a type, replace it with:

   - a platform/domain type if available, or
   - a local structural type matching used fields.

   Do not alter business calculations.

6. Remove stale generated imports.

   If files contain commented imports from generated ops, remove them if safe.

7. Verify.

   ```bash
   pnpm --filter @gbl-uzh/demo-game check
   rg -n "src/graphql/generated" apps/demo-game/src
   ```

   The `rg` command may still show files owned by other active work packages. Report them rather than editing outside scope.

## Acceptance Criteria

- Report page uses tRPC.
- `analysis.ts` no longer imports generated GraphQL types.
- `PeriodResultService.ts` no longer imports generated GraphQL types.
- Remaining generated imports are only in other not-yet-migrated work scopes or generated files.

## Manual Smoke

After a dev server is available:

- Admin report page loads.
- Segment and period charts render.
- No runtime crash from changed result DTO shape.

## Handoff Notes

Report:

- Any generated imports still present and who owns them.
- Type aliases introduced.
- Any DTO fields missing from `game.byId` or `results.specific`.
- Whether chart data output changed.

## Agent Prompt

```text
You own WP8 for the tRPC migration. Migrate reports and non-React generated GraphQL type imports to tRPC output aliases or DTO/domain types. Do not edit admin game management or player cockpit calls.
```
