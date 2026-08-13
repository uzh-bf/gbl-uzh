# tRPC example games and documentation reconciliation

Date: 2026-08-10
Status: approved for implementation
Provider: GitHub stacked changes
Base: `trpc-stack/03-ci-devcontainer-docs-collateral` at `2f363c1`
Worktree: `trees/trpc-examples-stack`
Mode: guided, with a review pause after every layer

## Goal

Finish the repository-wide tRPC migration by applying one documented tRPC v11
Pages Router pattern to demo-game, Rate Wars, and Central Bank; migrate both
example games away from GraphQL/Apollo/Nexus; and reconcile every active wiki,
skill, README, workflow, devcontainer, package, and project-plan claim with the
implemented state.

The existing four-PR tRPC stack remains unchanged. This plan creates a second
stack on its top branch. It authorizes implementation, draft branches, draft
pull requests, and pushes for review. It does not authorize merge, publication,
deployment, closing pull requests, deleting branches, or removing worktrees.

## Approved decisions

1. Keep the classic React Query integration and use the official Pages Router
   wrapper: `createTRPCNext<AppRouter>`, `trpc.withTRPC`, and `ssr: false`.
2. Keep subscriptions on SSE with `splitLink`; normal operations use bounded
   `httpBatchLink` requests. Use SuperJSON on the server and every terminating
   client link.
3. Keep type-only `AppRouter` imports in browser code, one platform `initTRPC`
   instance, validator-backed inputs, typed authorization middleware, mapped
   `TRPCError`s, input-specific invalidation, and AbortSignal-aware subscriptions.
4. Do not add `@trpc/tanstack-react-query`, Redis, a new transport, or replay
   IDs. Tracked replay remains out of scope until events have durable IDs and
   retained history.
5. Deprecate public GraphQL compatibility first. Migrate all repository
   consumers and stop documenting GraphQL as the game-building path, but retain
   the published platform GraphQL exports and the UI Apollo hook until external
   consumer confirmation supports a later breaking removal.
6. Preserve historical project records. Add dated outcome or supersession notes
   and a current index instead of rewriting what earlier plans said at the time.

## Official tRPC contract

Implementation is checked against these tRPC v11 sources:

- Pages Router setup: <https://trpc.io/docs/client/nextjs/pages-router/setup>
- HTTP subscriptions and `splitLink`:
  <https://trpc.io/docs/client/links/httpSubscriptionLink>
- HTTP batch bounds: <https://trpc.io/docs/client/links/httpBatchLink>
- Data transformers: <https://trpc.io/docs/server/data-transformers>
- Authorization middleware: <https://trpc.io/docs/server/authorization>
- Subscription cancellation and replay:
  <https://trpc.io/docs/server/subscriptions>
- Targeted cache invalidation: <https://trpc.io/docs/client/react/useUtils>

Package-local tRPC 11.18.0 Intent skills are the API-level reference for exact
installed signatures. Official documentation takes precedence when a local
pattern differs from the supported Pages Router setup.

## Stack topology

| Layer | Branch | Complete outcome | Risk |
| --- | --- | --- | --- |
| 00 | `rs/trpc-examples/00-pages-router-pattern` | Canonical Pages Router client pattern proven in demo-game | Medium, cross-cutting client foundation |
| 01 | `rs/trpc-examples/01-rate-wars-trpc` | Rate Wars runs only on the repository tRPC API path | High, auth/realtime/cache migration |
| 02 | `rs/trpc-examples/02-central-bank-trpc` | Central Bank runs only on the repository tRPC API path | High, auth/realtime/cache migration |
| 03 | `rs/trpc-examples/03-graphql-deprecation-docs` | Internal GraphQL retirement, public compatibility deprecation, and repository-wide documentation reconciliation | High, public-contract and documentation boundary |

Each layer must be independently functional, reviewable, green, and safe to
land on its parent. A partial game migration is not a valid layer because it
would leave two API clients owning one runtime.

## Layer 00: canonical Pages Router pattern

Scope:

- Add the pinned `@trpc/next` package alongside the existing tRPC 11.18.0
  packages.
- Replace demo-game's manual tRPC/QueryClient provider with
  `createTRPCNext<AppRouter>` and `trpc.withTRPC`, retaining `ssr: false`.
- Use a browser-relative `/api/trpc` URL. Preserve same-origin cookie behavior
  without cross-origin credential configuration.
- Preserve the SSE subscription split and SuperJSON transformer on both
  terminating links.
- Set finite client batch limits no higher than the server's accepted batch
  size. Configure an SSE keepalive only if the installed server API supports it
  and the exact setting is verified from package declarations.
- Audit browser imports from `@gbl-uzh/platform`; all server router types must be
  type-only imports.
- Record the canonical pattern in the game-development wiki so later apps copy
  one source of truth.

Verification:

- frozen workspace install
- platform TypeScript 6 and TypeScript 7 checks, lint, build, and 45-test suite
- demo-game TypeScript 6 and TypeScript 7 checks, lint, and production build
- focused demo-game Playwright flow covering one mutation and realtime refresh
- static import-boundary and link-configuration audit
- one risk-selected intermediate review before layer 01

## Layer 01: Rate Wars migration

Scope:

- Add the tRPC context, app router, Pages Router handler, and canonical client.
- Migrate admin, player, reports, learning, story, and realtime workflows from
  generated GraphQL hooks to tRPC hooks and targeted cache invalidation.
- Preserve all service and fact-schema injection used by the platform router.
- Replace generated GraphQL-only result types with narrow domain or inferred
  tRPC output types.
- Remove the app's GraphQL endpoint, Apollo provider, Nexus schema, codegen
  configuration, generated documents, GraphQL scripts and dependencies, and
  Apollo-specific Next.js aliases.
- Update Rate Wars README and runtime configuration in the same layer.

Verification:

- frozen workspace install
- TypeScript 6 and TypeScript 7 checks, lint, format, and production build
- complete `rate-wars-flow.spec.ts` lifecycle against the real local app
- focused realtime and post-mutation cache assertions where the lifecycle spec
  does not prove freshness
- residual GraphQL/Apollo/Nexus audit scoped to Rate Wars
- one risk-selected intermediate review before layer 02

## Layer 02: Central Bank migration

Scope and verification mirror layer 01 for Central Bank. The complete
`central-bank-flow.spec.ts` lifecycle remains the primary stable behavior seam;
new tests are added only for a distinct uncovered migration failure.

A risk-selected intermediate review is required before layer 03.

## Layer 03: GraphQL deprecation and document reconciliation

Runtime and package scope:

- Remove platform GraphQL compatibility files that exist only to support the
  two repository examples when that removal does not alter a published import.
- Retain published `@gbl-uzh/platform` GraphQL compatibility exports and the
  `@gbl-uzh/ui` Apollo-backed hook, mark them deprecated in code and package
  documentation, and stop using them anywhere in this repository.
- Add a packed-tarball clean-consumer verifier for the supported platform tRPC
  import path, declarations, runtime imports, and peer dependency closure.
- Keep the existing UI packed-consumer verifier and fixture.
- Remove now-unused repository-level GraphQL watchers, workflow routes,
  devcontainer API paths, aliases, scripts, and dependencies.
- Reconcile the lockfile from manifests; do not hand-edit it.

Documentation scope:

- Wiki: API layer, developing a game, deploying a game, UI components, index,
  log, and any linked page whose current-path facts change.
- Repository skills: new-game, frontend UI, backend computations, Playwright,
  and wiki maintenance instructions.
- App and package READMEs for demo-game, Rate Wars, Central Bank, platform, and
  UI where API or compatibility claims change.
- Active project plans: update current status, PR references, revisions, gates,
  and deferred W7 work. Historical plans and work packages get dated outcome or
  supersession notes and remain factual records.
- Add a short ADR for the deprecation-first public compatibility decision,
  including the removal condition and restoration path.

Verification:

- frozen workspace install
- platform, UI, demo-game, Rate Wars, and Central Bank TypeScript, lint, build,
  and package verification checks
- all three real-app Playwright lifecycle suites
- packed platform and UI clean-consumer checks
- active-code GraphQL/Apollo/Nexus audit with every retained match classified as
  public compatibility, test fixture, historical record, or third-party content
- OKF link validation and fact check for every changed wiki page
- one risk-selected intermediate review of the exact layer
- one separate integrated final review of the complete four-layer stack

## Documentation reconciliation rules

1. Code and manifests are the source of truth for current setup and commands.
2. `docs/` and agent skills describe only the supported current game-building
   path; compatibility notes identify deprecated surfaces explicitly.
3. READMEs link to the wiki rather than duplicating long setup procedures.
4. Project-plan history is append-only in meaning: outcome notes correct current
   status without changing old decisions or evidence.
5. Every removed GraphQL instruction has a concrete tRPC replacement, not only a
   deletion.

## Review response

The independent planning-stage review returned `REVISE` with three findings.
All are part of this approved plan:

| Finding | Resolution |
| --- | --- |
| Public compatibility removal lacked explicit authorization and rollback | User selected deprecation first; public shims remain until external-consumer confirmation, with an ADR and restoration path |
| High-risk layers lacked intermediate reviews | Every layer now pauses for one risk-selected intermediate review |
| Platform package lacked clean-consumer proof | Layer 03 adds a packed-platform verifier for the supported tRPC surface |

## Stop conditions

Pause and return to the user if:

- a migration requires changing game rules or user-facing behavior;
- a public GraphQL export must be removed to make the internal migration work;
- the exact tRPC package API contradicts the official pattern described here;
- an app cannot pass its real lifecycle flow without new infrastructure;
- credentials, production data, deployment, publication, or merge authority are
  required.
