# WP1: Platform tRPC Kernel

Status: serial foundation after `WP0`.

Depends on: `WP0`.

Unblocks: `WP2`, `WP3`.

## Goal

Add the reusable tRPC foundation to `packages/platform`: initialization, typed context, auth middleware, common schemas, error helpers, package exports, and Rollup output. Do not add domain procedures yet.

## Graphify Sanity Check

Graphify shows `GameService.ts`, `PlayService.ts`, and `EventService.ts` as the core service hubs, with `Query.ts` and `Mutation.ts` acting as API facade bridges. This package should create the new facade foundation without touching the service hubs.

## Write Scope

Allowed:

- `packages/platform/src/trpc/init.ts`
- `packages/platform/src/trpc/context.ts`
- `packages/platform/src/trpc/errors.ts`
- `packages/platform/src/trpc/schemas.ts`
- `packages/platform/src/index.ts`
- `packages/platform/rollup.config.js`
- `packages/platform/package.json` only if WP0 did not add required dependencies

Avoid:

- `packages/platform/src/services/**`
- `packages/platform/src/types/Query.ts`
- `packages/platform/src/types/Mutation.ts`
- `packages/platform/src/types/Subscription.ts`
- `apps/demo-game/**`

## Inputs to Inspect

- `packages/platform/src/types.ts`
- `packages/platform/src/index.ts`
- `packages/platform/rollup.config.js`
- `packages/platform/tsconfig.json`
- `packages/platform/package.json`
- Existing GraphQL context usage in `apps/demo-game/src/pages/api/graphql.ts`

## Implementation Plan

1. Create the tRPC directory.

   ```text
   packages/platform/src/trpc/
     init.ts
     context.ts
     errors.ts
     schemas.ts
   ```

2. Define context types in `context.ts`.

   The context should support current platform services:

   - `prisma`
   - `req`
   - `res`
   - `user`
   - optional `services`
   - optional `schemas`

   Normalize the user shape:

   ```ts
   export type PlatformUser = {
     sub: string;
     role: UserRole | string;
     gameId?: number;
   };
   ```

   Add a helper that converts `gameId` from string to number because NextAuth session data currently serializes it as a string.

3. Add `init.ts`.

   Expected exports:

   - `createTRPCRouter`
   - `createCallerFactory`
   - `publicProcedure`
   - `protectedProcedure`
   - `adminProcedure`
   - `playerProcedure`

   Use `superjson` as transformer.

4. Add auth middleware.

   Behavior:

   - `protectedProcedure`: require `ctx.user`.
   - `adminProcedure`: require `ctx.user.role === UserRole.ADMIN` or `'ADMIN'`.
   - `playerProcedure`: require `ctx.user.role === UserRole.PLAYER` or `'PLAYER'`.

   Throw `TRPCError` with:

   - `UNAUTHORIZED` for missing user.
   - `FORBIDDEN` for wrong role.

5. Add common schemas in `schemas.ts`.

   Include:

   - `idSchema`: non-empty string.
   - `gameIdSchema`: integer positive number.
   - `optionalGameIdSchema`: optional integer positive number.
   - `jsonValueSchema`: permissive JSON value schema.
   - `jsonObjectSchema`: record/object JSON schema.
   - `playerResultTypeSchema`: enum from Prisma values if available.

   Keep these small. Game-specific `facts` validation remains Yup in later packages.

6. Add error helpers in `errors.ts`.

   Map known service errors:

   - `INVALID_TOKEN` -> `UNAUTHORIZED`
   - `ACTIONS_NOT_ALLOWED` -> `FORBIDDEN`
   - `INVALID_DECISION` -> `BAD_REQUEST`

   Keep the mapping callable by procedure wrappers. Do not rewrite service errors in this package.

7. Export tRPC helpers.

   Update `packages/platform/src/index.ts` to expose the new tRPC files or a namespace export.

   Prefer explicit export paths:

   ```ts
   export * from "./trpc/init.js";
   export * from "./trpc/context.js";
   export * from "./trpc/schemas.js";
   ```

8. Update Rollup.

   Add tRPC entry points to `input` so consumers can import from `@gbl-uzh/platform/dist/trpc/...`.

   Preserve all existing entries:

   - `src/index.ts`
   - `src/nexus.ts`
   - `src/lib/util.ts`
   - `src/lib/apollo.ts`
   - `src/lib/pubsub.ts`

9. Build platform.

   ```bash
   pnpm --filter @gbl-uzh/platform build
   ```

## Acceptance Criteria

- Platform builds.
- Existing GraphQL exports still build.
- tRPC helpers are emitted under `dist`.
- No domain router or service behavior was added.

## Handoff Notes

Report:

- Export paths added.
- Exact context type shape.
- Any assumptions about role strings/enums.
- Whether Rollup needed explicit per-file inputs or preserved module discovery was enough.

## Agent Prompt

```text
You own WP1 for the tRPC migration. Add only the reusable platform tRPC kernel: init, context, procedures, common schemas, error helpers, exports, and Rollup output. Do not implement domain routers and do not touch demo-game pages.
```
