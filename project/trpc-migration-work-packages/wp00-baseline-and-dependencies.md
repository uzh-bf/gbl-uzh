# WP0: Baseline and Dependency Pinning

Status: serial foundation.

Depends on: nothing.

Unblocks: `WP1`.

## Goal

Establish a clean baseline and add the dependency surface needed for tRPC without changing runtime behavior. This package should be boring: package manifests and lockfile only.

## Graphify Sanity Check

Graphify identified `PlayService.ts`, `GameService.ts`, and `EventService.ts` as the true platform architecture hubs, while `apollo.ts`, `graphql.ts`, and `pubsub.ts` are facade/integration hubs. This confirms dependencies should be introduced before touching service code, and GraphQL/Apollo must remain installed while parallel facades coexist.

## Write Scope

Allowed:

- `package.json`
- `packages/platform/package.json`
- `apps/demo-game/package.json`
- `pnpm-lock.yaml`

Avoid:

- Any source files.
- Any script rewrites beyond dependency setup.
- Removing GraphQL, Apollo, Yoga, Nexus, or codegen dependencies.

## Inputs to Inspect

- Root `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `packages/platform/package.json`
- `apps/demo-game/package.json`
- `pnpm-lock.yaml`

## Implementation Plan

1. Confirm branch and current local changes.

   ```bash
   git branch --show-current
   git status --short
   ```

2. Run baseline checks before editing.

   Use the full baseline if time allows:

   ```bash
   pnpm install --frozen-lockfile
   pnpm syncpack:lint
   pnpm --filter @gbl-uzh/platform build
   pnpm --filter @gbl-uzh/demo-game check
   pnpm --filter @gbl-uzh/demo-game test
   pnpm --filter @gbl-uzh/demo-game build
   ```

   If one command fails before edits, record the failure exactly and continue only if it is clearly pre-existing.

3. Resolve package versions at implementation time.

   Required packages:

   - `@trpc/server`
   - `@trpc/client`
   - `@trpc/react-query`
   - `@tanstack/react-query`
   - `zod`
   - `superjson`

   Rules:

   - Keep all `@trpc/*` packages on the same exact version.
   - Pin exact versions, not ranges.
   - Do not upgrade unrelated packages.
   - Use current docs/package metadata at implementation time.

4. Decide package placement.

   Recommended placement:

   - `packages/platform`: `@trpc/server`, `zod`, `superjson`
   - `apps/demo-game`: `@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@tanstack/react-query`, `zod`, `superjson`

   Rationale:

   - Platform owns router factories and server-side helpers.
   - Demo-game owns the concrete API handler and React client.

5. Update manifests with `pnpm`.

   Prefer package-manager commands over manual manifest edits when adding dependencies:

   ```bash
   pnpm --filter @gbl-uzh/platform add @trpc/server@<version> zod@<version> superjson@<version>
   pnpm --filter @gbl-uzh/demo-game add @trpc/server@<version> @trpc/client@<version> @trpc/react-query@<version> @tanstack/react-query@<version> zod@<version> superjson@<version>
   ```

6. Run sync and focused verification.

   ```bash
   pnpm install --frozen-lockfile
   pnpm syncpack:lint
   pnpm --filter @gbl-uzh/platform build
   pnpm --filter @gbl-uzh/demo-game check
   ```

7. Leave GraphQL in place.

   Do not remove:

   - `@apollo/client`
   - `graphql`
   - `graphql-yoga`
   - `graphql-sse`
   - `nexus`
   - `@graphql-codegen/*`

## Acceptance Criteria

- Dependencies are pinned.
- `pnpm-lock.yaml` is synchronized.
- No source behavior changes exist.
- Existing GraphQL build/dev scripts still exist.
- Baseline failures, if any, are documented as pre-existing.

## Handoff Notes

Report:

- Exact versions added.
- Commands run.
- Any pre-existing failures.
- Any syncpack version mismatch that should influence later packages.

## Agent Prompt

```text
You own WP0 for the tRPC migration. Work only on dependency manifests and lockfile. Establish baseline checks, add pinned tRPC/React Query/Zod/SuperJSON dependencies, keep GraphQL dependencies for now, and report exact verification results.
```
