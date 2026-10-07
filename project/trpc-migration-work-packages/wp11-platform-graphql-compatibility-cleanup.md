# WP11: Platform GraphQL Compatibility Cleanup

Status: final serial cleanup after `WP10` and explicit confirmation that no external consumer needs platform GraphQL.

Depends on: `WP10`, consumer confirmation.

Unblocks: final merge/release.

## Goal

Remove or formally deprecate the platform GraphQL compatibility surface after demo-game has fully migrated to tRPC.

## Graphify Sanity Check

Graphify shows platform service hubs are separate from GraphQL facade files. This package should remove the old facade (`nexus.ts`, `types/Query.ts`, `types/Mutation.ts`, `types/Subscription.ts`, Apollo/SSE helpers, and operation files) without changing service behavior.

## Write Scope

Allowed:

- `packages/platform/package.json`
- `packages/platform/rollup.config.js`
- `packages/platform/src/nexus.ts`
- `packages/platform/src/types/Query.ts`
- `packages/platform/src/types/Mutation.ts`
- `packages/platform/src/types/Subscription.ts`
- `packages/platform/src/lib/apollo.ts`
- `packages/platform/src/lib/SSELink.ts`
- `packages/platform/src/lib/pubsub.ts`
- `packages/platform/public/ops/**`
- `packages/platform/src/index.ts`
- `pnpm-lock.yaml`
- Platform docs if present.

Avoid:

- Demo-game source behavior changes.
- Platform service refactors.
- Realtime bus removal if tRPC events use it.

## Inputs to Inspect

- `packages/platform/package.json`
- `packages/platform/rollup.config.js`
- `packages/platform/src/index.ts`
- `packages/platform/src/nexus.ts`
- `packages/platform/src/types/Query.ts`
- `packages/platform/src/types/Mutation.ts`
- `packages/platform/src/types/Subscription.ts`
- `packages/platform/src/lib/apollo.ts`
- `packages/platform/src/lib/SSELink.ts`
- `packages/platform/src/lib/pubsub.ts`
- `packages/platform/public/ops/**`

## Required Decision

Before implementation, get explicit confirmation for one of:

1. Remove GraphQL compatibility now.
2. Keep GraphQL compatibility but mark it deprecated.

If external consumers still use `@gbl-uzh/platform/dist/ops` or `@gbl-uzh/platform/dist/nexus`, do not remove those files in this package. Instead, add deprecation docs and leave dependencies intact.

## Preflight Audit

Run:

```bash
rg -n "@apollo/client|graphql-yoga|graphql-sse|graphql-codegen|src/graphql/generated|packages/platform/public/ops|dist/ops|@gbl-uzh/platform/dist/nexus|@gbl-uzh/platform/dist/lib/apollo" apps packages package.json pnpm-lock.yaml
```

Review:

- Internal repo imports.
- `package.json` dependency references.
- Any docs or README examples.

## Implementation Plan for Removal

Only follow this path if removal is confirmed.

1. Remove GraphQL facade source.

   Delete:

   - `packages/platform/src/nexus.ts`
   - `packages/platform/src/types/Query.ts`
   - `packages/platform/src/types/Mutation.ts`
   - `packages/platform/src/types/Subscription.ts`

   Keep model/domain types if they are not GraphQL-specific. Be careful because `packages/platform/src/types/Game.ts`, `Player.ts`, etc. currently contain Nexus object types. If those are still exported only for GraphQL, remove or split them based on current imports.

2. Remove Apollo client helpers.

   Delete if unused:

   - `packages/platform/src/lib/apollo.ts`
   - `packages/platform/src/lib/SSELink.ts`

3. Handle `pubsub.ts`.

   If `WP3` moved tRPC realtime to `realtime.ts`, remove GraphQL Yoga `pubSub` compatibility.

   If tRPC still imports helpers from `pubsub.ts`, keep or rename the GraphQL-independent parts only.

4. Remove operation files.

   Delete:

   - `packages/platform/public/ops/**`

   Keep `packages/platform/public/schema.prisma`.

5. Update Rollup.

   Remove old entries:

   - `src/nexus.ts`
   - `src/lib/apollo.ts`
   - `src/lib/pubsub.ts` only if removed.

   Keep tRPC entries.

   Ensure `copy` still copies `public/schema.prisma` if required by demo-game Prisma copy.

6. Update package exports/index.

   Remove GraphQL exports from `src/index.ts`.

   Keep:

   - services
   - domain types
   - tRPC exports
   - utility exports still used by apps.

7. Remove dependencies/peers.

   Remove if no longer referenced by platform:

   - `@apollo/client`
   - `graphql`
   - `graphql-scalars`
   - `graphql-sse`
   - `graphql-yoga`
   - `nexus`

   Do not remove `next`, `next-auth`, `prisma`, or `@prisma/client` unless separate audit proves they are obsolete.

8. Run install and verify.

   ```bash
   pnpm install
   pnpm --filter @gbl-uzh/platform build
   pnpm --filter @gbl-uzh/demo-game check
   pnpm --filter @gbl-uzh/demo-game build
   ```

## Implementation Plan for Deprecation

If removal is not allowed:

1. Keep GraphQL files.
2. Add deprecation notes in platform docs or README.
3. Keep dependencies.
4. Ensure tRPC and GraphQL exports can coexist.
5. Add a tracking issue reference for later removal.

## Acceptance Criteria

For removal:

- No active repo references old GraphQL platform facade.
- Platform builds.
- Demo-game still checks/builds.
- Prisma schema copy path still works.

For deprecation:

- Deprecated surface is clearly documented.
- tRPC surface is documented as the preferred API.
- No breaking removal happened.

## Handoff Notes

Report:

- Whether removal or deprecation was chosen.
- Consumer confirmation source.
- Deleted files or deprecation docs.
- Dependencies removed or retained.
- Any remaining GraphQL references and why.

## Agent Prompt

```text
You own WP11 for the tRPC migration. Only start after demo-game cleanup and consumer confirmation. Remove or deprecate platform GraphQL compatibility without touching unrelated platform services.
```
