# WP4: Demo-Game tRPC Endpoint and Provider

Status: serial bridge after `WP2`.

Depends on: `WP2`.

Unblocks: `WP5`, `WP6`, `WP7`, `WP8`.

## Goal

Make demo-game host the concrete tRPC API and provide a tRPC/React Query client to React while Apollo remains mounted for unmigrated screens.

## Graphify Sanity Check

Graphify identifies `graphql.ts` and `_app.tsx` as integration bridges, not business hubs. That confirms this package should mirror the existing Yoga/NextAuth wiring in a new tRPC endpoint and provider without touching page-level API calls yet.

## Write Scope

Allowed:

- `apps/demo-game/src/server/trpc/context.ts`
- `apps/demo-game/src/server/trpc/router.ts`
- `apps/demo-game/src/pages/api/trpc/[trpc].ts`
- `apps/demo-game/src/lib/trpc.ts`
- `apps/demo-game/src/lib/queryClient.ts`
- `apps/demo-game/src/pages/_app.tsx`
- `apps/demo-game/package.json` only if WP0 missed dependencies

Avoid:

- Admin/play/report page conversions.
- Deleting GraphQL endpoint or codegen.
- Removing `ApolloProvider`.

## Inputs to Inspect

- `apps/demo-game/src/pages/api/graphql.ts`
- `apps/demo-game/src/graphql/index.ts`
- `apps/demo-game/src/pages/_app.tsx`
- `apps/demo-game/src/lib/authOptions.ts`
- `apps/demo-game/src/lib/prisma.ts`
- `apps/demo-game/src/services/index.ts`
- `apps/demo-game/src/types/index.ts`

## Implementation Plan

1. Add server context.

   Create:

   ```text
   apps/demo-game/src/server/trpc/context.ts
   ```

   Reuse behavior from `src/pages/api/graphql.ts`:

   - `getServerSession(req, res, authOptions)`
   - `prisma`
   - `req`
   - `res`
   - `user: session?.user`

   Normalize:

   - `user.sub`
   - `user.role`
   - `user.gameId` as number if present.

2. Add app router composition.

   Create:

   ```text
   apps/demo-game/src/server/trpc/router.ts
   ```

   Compose platform router factory with:

   - `src/services`
   - `GameFactsSchema`
   - `PeriodFactsSchema`
   - `PeriodSegmentFactsSchema`
   - `PlayerFactsSchema`

   Export:

   - `appRouter`
   - `type AppRouter`
   - `type RouterInputs`
   - `type RouterOutputs`

3. Add API handler.

   Create:

   ```text
   apps/demo-game/src/pages/api/trpc/[trpc].ts
   ```

   Use the tRPC Next.js Pages Router adapter. Keep path `/api/trpc`.

4. Add client helper.

   Create:

   ```text
   apps/demo-game/src/lib/trpc.ts
   ```

   Use the React Query integration matching the installed tRPC version.

   URL behavior:

   - Browser: same-origin `/api/trpc`.
   - Server-side fallback: use app URL only if necessary.
   - Include credentials for cookie auth.

5. Add query client helper.

   Create:

   ```text
   apps/demo-game/src/lib/queryClient.ts
   ```

   Conservative defaults:

   - Low or zero stale time for game state.
   - Avoid aggressive mutation retries.
   - Leave refetch behavior explicit in migrated pages.

6. Update `_app.tsx`.

   Add:

   - `QueryClientProvider`
   - tRPC provider

   Keep:

   - `SessionProvider`
   - `ApolloProvider`
   - `RootLayout`
   - `Toaster`

7. Confirm endpoint compiles.

   ```bash
   pnpm --filter @gbl-uzh/platform build
   pnpm --filter @gbl-uzh/demo-game check
   ```

## Acceptance Criteria

- `/api/trpc` route exists.
- Demo-game composes the platform router with game-specific services/schemas.
- `_app.tsx` hosts both Apollo and tRPC providers.
- No existing Apollo call sites are migrated in this package.
- Type checking reaches the new files.

## Handoff Notes

Report:

- Provider style used.
- Client URL logic.
- Context normalization details.
- Any router factory mismatch that `WP2` must fix.

## Agent Prompt

```text
You own WP4 for the tRPC migration. Add the demo-game tRPC endpoint, server router composition, client helpers, and providers. Keep Apollo mounted because client pages are not migrated yet.
```
