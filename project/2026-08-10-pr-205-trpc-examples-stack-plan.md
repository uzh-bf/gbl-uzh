# tRPC example games and documentation reconciliation

Date: 2026-08-10
Plan: `project/2026-08-10-pr-205-trpc-examples-stack-plan.md`
Status: shared CI install ownership was moved into the bottom layer and
propagated through the draft stack on 2026-08-12; both integrated final passes
are closed and their findings are corrected in the owning platform layer; the
corrected eight-branch stack was atomically pushed and read back; fresh CI is
terminal and green for every layer, including a fresh top-tip artifact
generation; Gate 3 evidence is complete with the accepted SonarCloud
duplication exceptions explicitly skipped; all pull
requests remain draft, open, and unmerged
Provider: GitHub stacked changes
Base: `dev` at `6bab3ed`
Worktree: `trees/trpc-examples-stack`
Mode: guided, with a review pause after every layer

## 2026-08-12 refresh status

The examples stack is now layered directly on the refreshed original tRPC
stack rooted at `dev` commit `6bab3ed`. The refresh includes PR #185's native
mock-auth contract and PR #206's `pnpm dev [game]` native-development path.
Late corrections were folded into the earliest owning layers instead of
remaining as repairs in this final layer: the shared CI install in #197,
canonical guidance in #201, Rate Wars corrections in #202, Central Bank
corrections in #204, and the shared platform result contract in #196.

The prior execution and Gate 3 record below remains historical evidence for the
pre-refresh commit identities. It is not current readiness evidence. The
rewritten branches were pushed and read back once before PR #206 landed, and
the latest-`dev` rebase plus the ownership correction were then pushed and read
back atomically. Every PR remains draft. The shared demo-game workflow's
deterministic install now belongs to the bottom toolchain layer (#197), so
lower platform and example layers inherit the same `--ignore-scripts` install;
#194 retains its independent same-origin and workflow-path corrections. No
merge, publication, deployment, branch deletion, or worktree cleanup is
authorized.

### Fresh CI readback (2026-08-12)

The corrected push started a new CI generation for every layer. PR #197's
workflow run `31638659737` is fully green: arm64 and amd64 image builds, lint,
and manifest merge all passed. PR #196 is fully green on fresh TypeScript,
Docker, and browser runs `31638659837`, `31638659924`, and `31638659935`.
PR #194 is fully green on fresh runs `31638660683`, `31638660696`, and
`31638660726`; the latter passed all three game shards and merged reports. PR
#201 is fully green on fresh runs `31638663513`, `31638663549`, and
`31638663819`. PR #202 is fully green on fresh runs `31638661148`,
`31638661160`, and `31638661283`. PR #204 is fully green on fresh runs
`31638662318`, `31638662375`, and `31638662408`.

PR #195's fresh Docker and TypeScript runs `31638659669`, `31638660445`, and
`31638660256` passed. Its failed browser run `31638660452` was rerun: Central
Bank passed in job `94275688457`, demo-game and Rate Wars passed, and merged
reports passed in job `94278825058`. The earlier dependency-install failure is
closed as transient infrastructure.

PR #205's initial fresh Docker and TypeScript runs `31638660728` and
`31638660872` passed, and its first browser generation `31638660796` plus the
failed-job rerun exposed a transient artifact-service download failure. The
final documentation-only top-layer generation on commit `c254d20f` passed Docker run
`31648405382`, TypeScript run `31648405370`, all three browser jobs in run
`31648405436`, and merged reports in job `94288353440`. Gate 3 CI evidence is
complete. No PR was marked ready or merged.

The last exact-tip CI generation on documentation-only commit `e7c0ba08`
passed Docker run `31649892531`, TypeScript run `31649892556`, and Playwright
run `31649892585`, including merged reports in job `94292831912`. The current
#205 tip is documentation-only after that green generation and has no
executable changes.

The earlier #205 failed run and failed-job rerun remain recorded as historical
infrastructure evidence: they did not fail a game assertion, and the fresh
generation independently uploaded and merged a new artifact set.

The official tRPC v11 documentation was re-read against the checked-in
clients after this refresh. The three apps use the documented Pages Router
`createTRPCNext<AppRouter>` and `withTRPC` wrapper with `ssr: false`; browser
requests use same-origin `/api/trpc`; `splitLink` routes subscriptions to
`httpSubscriptionLink`; and finite operations use `httpBatchLink` with
`maxItems: 10` and `maxURLLength: 2083`. Each server adapter sets the matching
`maxBatchSize: 10`, and SuperJSON is configured in the platform router and on
both terminating client links. This matches the official [Pages Router setup](https://trpc.io/docs/client/nextjs/pages-router/setup),
[HTTP subscription](https://trpc.io/docs/client/links/httpSubscriptionLink),
[HTTP batch](https://trpc.io/docs/client/links/httpBatchLink), and
[data transformer](https://trpc.io/docs/server/data-transformers) guidance.

### Refreshed exact-tip verification (2026-08-12)

- The eight-layer local and remote stack is clean and contiguous from `dev`
  commit `6bab3ed` through executable code head `786ed47`; the lower-layer
  remote heads are `321a958` (#197), `8140600` (#196), `dd26b0f` (#195),
  `2e36f98` (#194), `d392283` (#201), `e2738dd` (#202), and `786ed47` (#204).
  The top branch carries the current reconciled ledger. The code-bearing stack
  ends at #204 (`786ed47`); every #205 commit is documentation-only. The last
  exact-tip CI is green on `e7c0ba08`; the current #205 tip only changes
  ledger wording. Every local and remote layer reports `needsRebase: false`.
- PR #206 landed while the first refreshed CI cycle was running. Its native
  development changes were incorporated at the trunk boundary, not patched at
  the top of the stack. The only semantic conflicts preserved PR #206's
  `pnpm dev [game]` launcher and workspace exclusions while retaining the
  platform layer's React package extensions. A range-diff shows the remaining
  stack commits replayed unchanged.
- The common demo-game workflow initially failed in bottom layers before
  reaching lint or Playwright because `pnpm/action-setup` inherited
  `run_install: true` and `sharp@0.32.6` hit a `socket hang up` downloading its
  native binary. That fix now lives in #197 as `run_install: false` plus an
  explicit frozen `--ignore-scripts` install. The later #194 layer keeps only
  its already-owned checkout, type-gate, and app-origin corrections.
- Frozen install and supply-chain checks pass. Platform tests pass 53/53;
  TypeScript 7 and 6, production build, auth tests 8/8, packed-package
  verification, and the clean tRPC-only consumer pass. The build retains its
  existing non-fatal declaration-portability and circular-dependency warnings.
- UI TypeScript 7 and 6, lint, production build, packed-package verification,
  and the clean Next.js consumer pass. Demo-game, Rate Wars, and Central Bank
  TypeScript 7 and 6, lint, and production builds pass with existing lint
  warnings only.
- A namespaced devrouter/DevPod runtime on Node 24 used the repository mock OIDC
  provider and isolated PostgreSQL database. With Playwright retries disabled,
  demo-game passed 3/3 in 1.5 minutes, Rate Wars passed 2/2 in 31.8 seconds, and
  Central Bank passed 2/2 in 38.3 seconds.
- Before PR #206 landed, the corrected #194 workflow completed green on GitHub:
  TypeScript, deterministic install/lint, amd64 and arm64 Docker builds, all
  three Playwright jobs, and merged reports passed. Central Bank passed after
  one automatic retry, which remains recorded as flakiness. After rebasing onto
  PR #206, frozen install, host-script syntax and target selection, platform
  TypeScript 7 and 6, 53/53 tests, platform build, and both TypeScript compilers
  for all three games pass at the new final tip. The full no-retry browser
  evidence remains reusable because PR #206 does not change game runtime code,
  tRPC wiring, browser tests, or the CI game servers. The fresh corrected-stack
  generation is green for #197, #196, #195, #194, #201, #202, #204, and #205.
  The #195 rerun closes its transient Central Bank dependency-install failure;
  the fresh #205 generation closes the artifact-download failure. Gate 3 CI
  evidence is complete. PRs #202 and #204 remain `UNSTABLE` only because of
  the accepted duplication-only SonarCloud exception, which is intentionally
  skipped; all PRs remain draft and no merge or ready-state transition was
  performed.
- Browser proof found two synchronization defects in the example specs. Rate
  Wars still reloaded all player pages concurrently before its live form
  assertion; commit `f9b55a1` removes those reloads. Central Bank both waited
  for a missed `domcontentloaded` event after successful client navigation and
  retained the same concurrent reload pattern; commit `e28d99d` asserts the
  final URL and removes those reloads. Both fixes live in their owning game
  layers, pass TypeScript 7 and 6, pass their no-retry lifecycles, and have
  completed simplification and intermediate review with no findings.
- Changed documentation passes Prettier and OKF link/frontmatter validation.
  The active runtime audit has no repository game consumer of Apollo, GraphQL
  code generation, Nexus build wiring, or `/api/graphql`; retained matches are
  deprecated public compatibility or historical/test material classified in
  `project/2026-08-10-trpc-graphql-reference-audit.md`.
- The canonical Pages Router pattern was checked against the official tRPC v11
  setup, batching, subscription, and transformer documentation: it uses
  `createTRPCNext<AppRouter>`, `withTRPC`, `ssr: false`, `httpBatchLink` for
  finite operations, `httpSubscriptionLink` behind `splitLink` for SSE, and
  SuperJSON on both terminating links and the server.
- The initial integrated final review found two cross-player privacy gaps in
  the platform layer: historical results included private progression fields,
  and the tRPC SSE subscription consumed one repository-wide event channel.
  Both corrections now live in PR #196 at `8140600`: historical result DTOs
  expose only player id and name, and tRPC subscriptions derive the game scope
  from the authenticated context while the deprecated GraphQL bridge retains
  its aggregate compatibility stream. The platform passes both TypeScript
  compilers, 53/53 tests, package build, and 8/8 auth
  tests. The simplifier's redundant-assertion reduction was applied, and the
  risk-selected correction review returned `DONE` with no findings.
- The integrated correction review confirmed both privacy findings were
  closed, then found that the game-scoping change had replaced the published
  one-argument `EventService.publishGlobalNotification(event)` contract. PR
  #196 now keeps that overload, always preserves aggregate GraphQL delivery,
  and additionally scopes legacy events when their facts contain a validated
  game id. Two focused compatibility tests pass. The same review also found a
  stale code-head SHA in this ledger; the reproducible executable and final
  documentation tips above replace it. These are reviewer-requested closure
  changes with no new behavior beyond restoring the published compatibility
  contract, so the two-review budget closes with focused verification.

## Historical execution status (2026-08-11, pre-refresh)

| Layer                               | Branch / pull request                                                                               | Verified state                                                                                           |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 00 canonical Pages Router pattern   | `rs/trpc-examples/00-pages-router-pattern` / [#201](https://github.com/uzh-bf/gbl-uzh/pull/201)     | Commit `a7ac89a`; checks, lifecycle proof, and intermediate review passed                                |
| 01 Rate Wars                        | `rs/trpc-examples/01-rate-wars-trpc` / [#202](https://github.com/uzh-bf/gbl-uzh/pull/202)           | Commit `10fcc62`; lifecycle and review passed; the 46.4% duplication-only SonarCloud failure is accepted |
| 02 Central Bank                     | `rs/trpc-examples/02-central-bank-trpc` / [#204](https://github.com/uzh-bf/gbl-uzh/pull/204)        | Commit `4a1271d`; lifecycle and review passed; the 38.1% duplication-only SonarCloud failure is accepted |
| 03 compatibility and reconciliation | `rs/trpc-examples/03-graphql-deprecation-docs` / [#205](https://github.com/uzh-bf/gbl-uzh/pull/205) | Implementation and final-review closure through `79c7042`; all local gates complete                      |

The user approved opening pull requests #201, #202, #204, and #205 for review
on 2026-08-11. All listed pull requests remain unmerged. The earlier replacement
stack [#194-#197](https://github.com/uzh-bf/gbl-uzh/pulls?q=is%3Apr+197+196+195+194)
remains unchanged and unmerged.

### Accepted SonarCloud exception (2026-08-11)

- [Rate Wars PR #202](https://github.com/uzh-bf/gbl-uzh/pull/202) passes
  Greptile, Vercel, and the Sonar GitHub check, but SonarCloud's code-analysis
  quality gate rejects 46.4% new-code duplication against a 3% limit. The main
  contributors are the intentionally template-aligned `GameLayout`, learning
  hook, tRPC client, and administrator detail page.
- [Central Bank PR #204](https://github.com/uzh-bf/gbl-uzh/pull/204) has the
  same check profile, with 38.1% new-code duplication. Its largest contributors
  are `GameLayout`, join/welcome pages, the facts helper, game list, learning
  hook, and administrator detail page.
- Reliability, security, maintainability, and reviewed-hotspot conditions pass
  on both pull requests. The failing measure is duplication only.
- The repeated code is largely deliberate example-game scaffolding tied to each
  app's distinct `AppRouter`. The user accepted both duplication-only failures
  as non-blocking process exceptions and approved opening all four example-stack
  pull requests for review. No SonarCloud setting, copy-paste-detection
  exclusion, or code refactor was applied.
- GitHub continues to report PRs #202 and #204 as `UNSTABLE` because their
  SonarCloud quality gates remain red. This accepted exception does not turn
  those checks green and does not authorize merging any layer.

### Layer 03 verification record

- Frozen lockfile and supply-chain-policy verification passed with pnpm 11.6.0.
- Platform TypeScript 7 and 6 checks, production build, 48 tests, packed-artifact
  verifier, and clean tRPC-only consumer passed.
- UI TypeScript 7 and 6 checks, lint, production build, packed-artifact
  verifier, and clean Next.js consumer passed. Its verifier now resolves npm
  and tar from `PATH` instead of assuming host-specific absolute locations.
- Demo-game, Rate Wars, and Central Bank passed TypeScript 7 and 6, formatting,
  lint, and production builds. Existing lint warnings remain unchanged.
- Real Node 24 browser lifecycles passed: Central Bank 2/2, Rate Wars 2/2 on
  two consecutive runs, and demo-game 3/3. Player contexts now explicitly start
  with empty storage instead of inheriting the administrator project's saved
  authentication state. Game-status assertions observe the tRPC-driven DOM
  update directly, without a reload fallback, so the tests prove targeted cache
  invalidation. A local Docker OIDC crash and disk-pressure interruption were
  recovered without changing application behavior; the final suites ran
  against the recovered local app and OIDC sidecar.
- OKF/frontmatter/link validation passed. Active game-code and runtime-config
  audits have no Apollo, GraphQL endpoint/codegen, Nexus build, or
  `/api/graphql` matches. Retained repository matches are classified in
  `project/2026-08-10-trpc-graphql-reference-audit.md`.
- Terra first reviewed `4a1271d..b08f89e` with no findings. After the initial
  Sonar run found three missing `--ignore-scripts` flags and 123 duplicated
  verifier lines, `7fd6b32` added the flags and one shared verifier helper.
- The review rerun on `4a1271d..7fd6b32` returned
  `APPROVE-WITH-FINDINGS`: two non-blocking P3 cleanup/status issues. `f6447f2`
  closes the cleanup issue, and this ledger update closes the stale-status
  issue. The reports are stored under `project/_local/reviews/`.
- The bounded security review of `2f363c1..9e42693` passed with no findings.
- The maintainability review of `2f363c1..9e42693` found one P2 DTO contract
  weakness and one P3 Rate Wars type erasure. Commit `a9e535e` maps current-game
  results through the required-player DTO, preserves inferred result types in
  Central Bank and Rate Wars, and adds the browser-session proof described
  above. TypeScript 7 and 6, all 48 platform tests, all app checks, both
  Playwright type checks, package verification, production builds, and all
  three browser lifecycles pass after remediation.
- The dedicated simplifier reviewed the substantive remediation range
  `9e42693..a9e535e` and returned `DONE`: no behavior-preserving net
  reduction is justified, and no additional verification is needed.
- The integrated final reviewer inspected `2f363c1..9f570bd` and returned
  `APPROVE-WITH-FINDINGS`: no blocking correctness, security, maintainability,
  package, test-strategy, or landing-safety issue. Its one low-severity finding
  identified guidance that treated the optional `events.user` subscription as
  canonical. Commit `79c7042` corrects both documentation locations. Prettier,
  OKF/link validation, and direct comparison with all three `GameLayout`
  implementations close this reviewer-requested documentation-only change; it
  introduces no behavior and does not re-arm the final review gate.
- No merge, publication, deployment, branch deletion, or worktree cleanup is
  authorized by this plan.

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

| Layer | Branch                                         | Complete outcome                                                                                                | Risk                                             |
| ----- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 00    | `rs/trpc-examples/00-pages-router-pattern`     | Canonical Pages Router client pattern proven in demo-game                                                       | Medium, cross-cutting client foundation          |
| 01    | `rs/trpc-examples/01-rate-wars-trpc`           | Rate Wars runs only on the repository tRPC API path                                                             | High, auth/realtime/cache migration              |
| 02    | `rs/trpc-examples/02-central-bank-trpc`        | Central Bank runs only on the repository tRPC API path                                                          | High, auth/realtime/cache migration              |
| 03    | `rs/trpc-examples/03-graphql-deprecation-docs` | Internal GraphQL retirement, public compatibility deprecation, and repository-wide documentation reconciliation | High, public-contract and documentation boundary |

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

| Finding                                                                 | Resolution                                                                                                                  |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Public compatibility removal lacked explicit authorization and rollback | User selected deprecation first; public shims remain until external-consumer confirmation, with an ADR and restoration path |
| High-risk layers lacked intermediate reviews                            | Every layer now pauses for one risk-selected intermediate review                                                            |
| Platform package lacked clean-consumer proof                            | Layer 03 adds a packed-platform verifier for the supported tRPC surface                                                     |

## Stop conditions

Pause and return to the user if:

- a migration requires changing game rules or user-facing behavior;
- a public GraphQL export must be removed to make the internal migration work;
- the exact tRPC package API contradicts the official pattern described here;
- an app cannot pass its real lifecycle flow without new infrastructure;
- credentials, production data, deployment, publication, or merge authority are
  required.
