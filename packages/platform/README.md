# @gbl-uzh/platform

Shared server-side game lifecycle, persistence, authorization, and tRPC v11
router composition for GBL learning games.

The package is ESM-only and pre-1.0. Pin a tested version and review release
notes before upgrading.

## Supported API

New games call `createPlatformRouter({ services, schemas })`, export
`AppRouter = typeof appRouter`, and host the router at `/api/trpc` in a Next.js
Pages Router app. The maintained setup, authorization, transport, and realtime
patterns are documented in the
[GBL platform wiki](../../docs/api-layer.md).

```ts
import { createPlatformRouter } from "@gbl-uzh/platform";

export const appRouter = createPlatformRouter({ services, schemas });
export type AppRouter = typeof appRouter;
```

Applications must declare the compatible runtime peers listed in
`peerDependencies`. GraphQL peers are optional for tRPC-only consumers.

## Deprecated GraphQL compatibility

The packed package temporarily retains its existing Nexus schema exports,
GraphQL operation files, Apollo client/SSE link, and GraphQL pubsub subpaths for
unknown external consumers. These surfaces are deprecated and are not used by
any game in this repository. Do not use them for new work.

They may be removed only after external-consumer usage is confirmed. The
decision, removal condition, and restoration path are recorded in
[ADR 0001](../../docs/adr/0001-deprecate-graphql-compatibility.md).

## Verification

`pnpm run verify:package` checks the packed artifact, declarations, runtime
imports, and dependency closure. `pnpm run verify:consumer -- --package <tgz>`
installs that exact tarball in a clean strict-peer fixture and verifies the
supported tRPC import under TypeScript and Node.

## License

LGPL-3.0
