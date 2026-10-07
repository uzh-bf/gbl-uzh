# WP10: Demo-Game GraphQL Cleanup

Status: serial cleanup after `WP5`, `WP6`, `WP7`, `WP8`, and `WP9`.

Outcome (2026-08-10): complete. Demo-game has no active Apollo provider,
GraphQL endpoint, Nexus schema, generated GraphQL client, or codegen command;
its supported API is tRPC v11. This file remains the historical execution
contract.

Depends on: `WP5`, `WP6`, `WP7`, `WP8`, `WP9`.

Unblocks: `WP11`.

## Goal

Remove the demo-game GraphQL/Apollo/codegen surface after all demo-game API call sites have migrated to tRPC.

## Graphify Sanity Check

Graphify marks `graphql.ts`, `_app.tsx`, `apollo.ts`, and generated/type usage as integration artifacts. Cleanup should happen only after true hubs (`admin/[id].tsx`, `cockpit.tsx`, `analysis.ts`) no longer depend on those artifacts.

## Write Scope

Allowed:

- `apps/demo-game/package.json`
- `apps/demo-game/codegen.ts`
- `apps/demo-game/src/graphql/**`
- `apps/demo-game/src/pages/api/graphql.ts`
- `apps/demo-game/src/pages/_app.tsx`
- `apps/demo-game/next.config.ts` only if GraphQL-specific fallback is obsolete.
- `pnpm-lock.yaml`

Avoid:

- Platform GraphQL cleanup. `WP11` owns it.
- Feature changes to migrated tRPC pages.
- Reworking tRPC procedure names.

## Inputs to Inspect

- `apps/demo-game/package.json`
- `apps/demo-game/codegen.ts`
- `apps/demo-game/src/pages/_app.tsx`
- `apps/demo-game/src/pages/api/graphql.ts`
- `apps/demo-game/src/graphql/**`
- `pnpm-lock.yaml`

## Preflight Audit

Run:

```bash
rg -n "@apollo/client|src/graphql/generated|graphql-yoga|graphql-sse|nexus|graphql-codegen|/api/graphql" apps/demo-game
```

Do not continue if active imports remain outside files this package is about to delete. Hand the remaining references back to the owning work package.

## Implementation Plan

1. Remove Apollo provider.

   In `_app.tsx`, remove:

   - `ApolloProvider`
   - platform `useApollo`
   - `initialApolloState` usage if now unused.

   Keep:

   - `SessionProvider`
   - tRPC provider
   - QueryClient provider
   - `RootLayout`
   - `Toaster`

2. Delete GraphQL endpoint.

   Remove:

   - `apps/demo-game/src/pages/api/graphql.ts`

3. Delete GraphQL schema/generated files.

   Remove:

   - `apps/demo-game/src/graphql/index.ts`
   - `apps/demo-game/src/graphql/nexus.ts`
   - `apps/demo-game/src/graphql/generated/**`
   - any now-empty `src/graphql` directories.

4. Delete codegen config.

   Remove:

   - `apps/demo-game/codegen.ts`

5. Update scripts.

   In `apps/demo-game/package.json`, remove:

   - `build:graphql`
   - `build:nexus`
   - `dev:graphql`
   - `dev:nexus`

   Update:

   - `build`
   - `dev`
   - `dev:exec`

   Keep Prisma generation/copy steps.

6. Remove demo-game dependencies.

   Remove if no longer referenced in demo-game:

   - `@apollo/client`
   - `graphql`
   - `graphql-scalars`
   - `graphql-sse`
   - `graphql-yoga`
   - `nexus`
   - `@graphql-codegen/*`

   Do not remove platform peer dependencies in this package.

7. Run install.

   ```bash
   pnpm install
   ```

8. Verify.

   ```bash
   rg -n "@apollo/client|graphql-yoga|graphql-sse|graphql-codegen|src/graphql/generated|/api/graphql" apps/demo-game
   pnpm --filter @gbl-uzh/demo-game check
   pnpm --filter @gbl-uzh/demo-game test
   pnpm --filter @gbl-uzh/demo-game build
   ```

## Acceptance Criteria

- Demo-game no longer imports Apollo or GraphQL generated ops.
- Demo-game no longer hosts `/api/graphql`.
- Demo-game build/dev scripts no longer run GraphQL codegen or Nexus generation.
- Demo-game still builds through tRPC.
- Lockfile is synchronized.

## Handoff Notes

Report:

- Deleted files/directories.
- Removed dependencies.
- Final audit output.
- Any platform GraphQL leftovers for `WP11`.

## Agent Prompt

```text
You own WP10 for the tRPC migration. Only start after all demo-game call sites are migrated. Remove demo-game GraphQL/Apollo/codegen surface and verify no active references remain.
```
