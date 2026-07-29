# tRPC Migration Finalization Roadmap

Date: 2026-07-29

Branch: `codex/trpc-migration-work-packages` · PR: #144 → `dev` · Head at planning time: `37f4878`

Predecessors (kept for history, superseded by this roadmap for sequencing):

- `project/trpc-migration-plan.md`, `project/trpc-migration-work-packages/*.md` (original WP breakdown)
- `project/2026-06-17-pr-144-trpc-migration-finish-plan.md` (CI/Vercel/Sonar fixes, R1–R6 remediation, Playwright verification)
- `project/2026-07-02-demo-game-type-consolidation-plan.md` (RouterOutputs type consolidation)

Evidence base: three Opus reviews run 2026-07-29 — dependency currency (npm registry live),
dev-restructure impact analysis (`66ed4e0..origin/dev`), production-readiness review of the
branch tree. Findings below are from those reports unless marked otherwise.

## Current state

- PR #144: all 9 checks green on `37f4878` (lint+tsc gate, Docker build, Playwright shards,
  merge-reports, SonarCloud ×2, Vercel ×2). 74 commits ahead of dev; +8.4k/−14.6k over 156 files.
- Mergeability: **CONFLICTING** — dev moved 10 commits ahead (ui-package extraction `6159395`,
  central-bank example `dc29418`, platform stakeholder fixes + rate-wars `e6879fc`, managed
  devrouter workspaces `5cac12c`, docs). 24 conflicted files.
- Migration state on the branch (verified): demo-game + platform are fully GraphQL-free; 9-router
  tRPC surface with consistent procedure tiers, zod inputs, superjson end-to-end, admin
  game-ownership guards (`assertGameOwnership`) on every admin gameId path, player scoping from
  session only, SSE subscriptions via `httpSubscriptionLink`, server `onError` logging, CI type
  gates, frozen-lockfile Docker build, 462-line Playwright lifecycle spec (15/28 procedures).

## The central complication (drives W1)

Dev's restructure and the migration collide in two ways:

1. **Dev rewrote the four major demo-game pages around `packages/ui`** (new shared components,
   new local `GameLayout` that itself fetches data) — but still 100% Apollo. Our branch rewrote
   the same pages' data layer to tRPC on the old component structure. The merge is therefore a
   re-application of the tRPC data layer onto dev's new component structure, not a line-level
   conflict fix.
2. **Dev added two example games (central-bank, rate-wars) that hard-depend on the platform
   GraphQL surface this branch deleted**: `@gbl-uzh/platform/dist/nexus` (schema builders),
   `dist/lib/pubsub`, `dist/lib/apollo`, `dist/ops/*.graphql` (codegen documents). Git merge
   silently drops ~35 of those deleted files (only 2 conflicted because dev also modified them),
   which would break both examples and their new CI jobs
   (`playwright-testing.yml` matrix now runs all three games).

**Decision D1 — platform goes dual-stack (forced):** restore the platform GraphQL surface from
`origin/dev` (which includes dev's admin-role guards in `Query.ts` and the `currentGame.players`
addition in `QResult.graphql`). Demo-game stays tRPC-only; examples stay GraphQL. Migrating the
examples and decoupling `packages/ui`'s `useLearningActivities` from Apollo is explicit
follow-up scope (W7), not part of PR #144.

## Workstreams

### W1 — Merge origin/dev (largest item, do first)

Per-group resolution strategy:

| Group | Files | Resolution |
| --- | --- | --- |
| Rewritten pages | `play/cockpit.tsx`, `play/welcome.tsx`, `admin/games.tsx`, `admin/games/[id].tsx` + new `components/GameLayout.tsx` | Start from dev's version; swap each Apollo hook for the existing tRPC equivalent from our branch (mapping below). Port R5 error-UX (toasts, modal-close-on-success) and ownership-aware flows. `GameLayout` is new scope: migrate its `ResultDocument` query, `UpdateReadyState`/`MarkStoryElement` mutations, `GlobalEvents` subscription, and its `useLearningActivities` usage to tRPC. |
| Components deleted on dev | `LearningElement(s)`, `StoryElements`, `PlayerCompact`, `PlayerData`, `LogoSelector`, `DecisionsDisplay`, etc. | Accept dev's deletion (moved to `packages/ui` as props-only components — they fit RouterOutputs-derived data). Re-home still-needed type aliases from `~/types/api.ts`; drop aliases that die with the old components. |
| Platform GraphQL surface | `src/nexus.ts`, `src/types/*.ts`, `src/lib/{apollo,pubsub,SSELink}.ts`, `public/ops/*` (32 files), rollup entries, graphql peer/devDeps in `package.json` | **Restore wholesale from `origin/dev`** (D1). Audit `git diff --diff-filter=D origin/dev...HEAD -- packages/platform` for the full deletion list; verify platform build compiles both stacks. |
| Platform util | `src/lib/util.ts` | Take dev (STATUS/computePeriodStatus/computeSegmentStatus moved to `@gbl-uzh/ui`); dev's pages already import from ui. |
| demo-game `package.json` | scripts + deps | Keep our codegen-free scripts (`dev`/`build` without `*:nexus`/`*:graphql`); take dev's added deps (`@gbl-uzh/ui`). Was auto-merged by git — verify by hand. |
| Website | `apps/website/{package.json,src/lib/util.ts}` | Take dev (our Lives-in-Transit fix re-landed there with equivalent semantics). |
| Devcontainer | `docker-compose.yml`, `post-start.sh` | Take dev (managed workspaces; OIDC devnet alias fixes the netns issue at the root). Port from ours: `NEXT_PUBLIC_API_URL=/api/trpc`; verify dev handles `AUTH0_ISSUER` per workspace. |
| Playwright | `tests/demo-game-flow.spec.ts` | Reconcile: dev's refined spec + our two robustness fixes (`assertCountdownVisible` reload+auto-wait, `advanceGame` re-click-until-flip). |
| CI workflows | `demo-game.yml` (ours) + `playwright-testing.yml` (dev, 3-game matrix) | Both survive; de-duplicate demo-game e2e if doubled. Set `NEXT_PUBLIC_API_URL` per game (`/api/trpc` for demo-game — harmless today since the client rewrites the path, but fix while touching). |
| Lockfile | `pnpm-lock.yaml`, `pnpm-workspace.yaml` | Take dev's lockfile side, then `pnpm install` to fold our manifests; verify `escapp`/`quartz` exclusions survive in workspace globs. |

Apollo→tRPC hook mapping for W1 (all equivalents already exist on the branch):
`ResultDocument`→`play.result`, `SelfDocument`→`play.self`, `GamesDocument`→`game.list`,
`GameDocument`→`game.byId`, `CreateGame`→`game.create`, `ActivateNextPeriod/Segment`→`game.*`,
`AddGamePeriod`→`period.add`, `AddPeriodSegment`→`segment.add`, `AddCountdown`→`game.addCountdown`,
`UpdatePlayerData`→`play.updatePlayerData`, `UpdateReadyState`→`play.updateReadyState`,
`PerformAction`→`play.performAction`, `MarkStoryElement`→`story.markVisited`,
`LearningElements/StoryElements`→`learning.list`/`story.list`,
`AttemptLearningElement`→`learning.attempt`, `GlobalEventsDocument`→`events.global` (SSE).

Parity checks during W1:

- Dev's `QResult.graphql` added `currentGame { players { id name facts } }` (used by the new
  cockpit). Verify the tRPC `play.result` DTO exposes the same, or add it.
- Dev's cockpit/welcome moved Formik→react-hook-form and constants to `src/lib/constants` —
  keep dev's choices.
- `useLearningActivities` (Apollo, in `packages/ui`) cannot be called from tRPC demo-game:
  implement a local tRPC equivalent in demo-game for now (W7 owns proper decoupling).

Verification gate for W1: platform build (dual-stack) · demo-game `tsc` + `next build` ·
`pnpm -F @gbl-uzh/central-bank build` + rate-wars build (examples must stay green) ·
full Playwright demo-game suite locally (devcontainer, CI-style env) · push → all CI checks
green including the two example-game Playwright jobs.

### W2 — Dependency currency (after W1, before further fixes)

Same-major set (registry-verified 2026-07-29; no breaking changes 11.17→11.18):

| Package | From → To |
| --- | --- |
| `@trpc/server`,`@trpc/client`,`@trpc/react-query` | 11.17.0 → **11.18.0** (latest 11.x; no v12 exists) |
| `@tanstack/react-query` | 5.100.9 → 5.101.4 |
| `next` (demo-game) | 16.2.9 → 16.2.12 |
| `react`/`react-dom` | 19.2.7 → 19.2.8 |
| `next-auth` | 4.24.14 → 4.24.15 (v5 still beta) |
| `yup` | 1.6.1 → 1.7.1 |
| `typescript` | ~5.6.3 → ~5.9.3 (stay in 5.x) |

Platform `@trpc/server` peerDep is exact-pinned — bump by hand to 11.18.0. Excluded
(cross-major, own initiative if ever): prisma 6→7, zod 3→4, TS 6/7, @apollo/client 3→4.

**Decision D2 — client integration pattern:** repo uses classic `createTRPCReact`; tRPC now
recommends `@trpc/tanstack-react-query` for new projects. Classic is fully supported and not
deprecated. Recommendation: **stay classic in PR #144**; record the newer integration as an
optional follow-up so we don't rewrite the client layer mid-merge.

### W3 — Production-readiness fixes (from the 2026-07-29 review)

Fix in this PR (all on the migrated surface):

1. Error-code mapping: `asTRPCCodeFromServiceError` maps only 3 literal messages; yup
   `ValidationError` and reducer range errors surface as genericized 500s. Map validation
   failures to `BAD_REQUEST` (keep internals genericized) — `packages/platform/src/trpc/errors.ts`.
2. Missing `onError` (R5 gaps): `play.updateReadyState` (cockpit) and `story.markVisited`
   (StoryElements — lands in the new structure post-W1). Add toasts consistent with R5.
3. `play.performAction` payload is `z.string()` + `JSON.parse` with no shape schema; non-numeric
   fields pass the reducer's range checks silently. Add a zod schema for the decisions payload.
4. `results.specific`/`play.result` return full period/segment `facts` to players including
   operator-only simulation params (`trendStocks/trendBonds/gapStocks/gapBonds/interestBank`) —
   contradicts the DTO's own comment; players can read market bias from network traffic.
   **Decision D3:** withhold operator-only keys in the player-facing DTO (recommended; matches
   documented intent) — needs a domain sanity-check that no legitimate player UI reads them
   (cockpit reads only `returns`-type data; verify during implementation).

Documented, not in this PR (unchanged from dev or needs product decision):

- Single-replica in-memory event bus (fine at `replicas: 1`; Redis-backed bus is scale-out work).
- `events.user` subscription published server-side but no client consumer (half-wired path).
- Procedures with no demo-game caller (`game.toggleSwitch`, `play.saveConsolidationDecision`,
  `results.listForCurrentGame`, `results.pastForPlayer`, `learning.questAchievements`,
  `auth.logoutAsTeam`): these mirror the platform's GraphQL base surface, so **keep** as platform
  API (D4 recommendation) and cover via W5 unit tests instead of deleting.
- Admin polls (`refetchInterval: 15000`) vs player SSE — acceptable inconsistency, note only.
- Unbounded `game.list` (pre-existing), `loginAsTeam` rate limiting (infra), platform `exports`
  map split, `ctx as any` casts — carried over from the 2026-06-17 plan's deferred list.

### W4 — PR review-thread triage (19 unresolved)

After W1, most component-level threads are mooted (files deleted/moved by dev). Triage then:

| Thread (source) | Status after W1 | Action |
| --- | --- | --- |
| `ctx.services ?? {}` never populated in `performActionWithRetry` (copilot) | Still live | Verify and fix wiring or drop the dead param |
| reports/[id] `initialCapital` read before empty-check (copilot) | Still live | Guard |
| welcome `playerError` interpolated as object (copilot) | Re-check in dev's rewritten page | Fix if still present |
| Unused `UserRole` import in platform trpc context (copilot) | Still live | Remove |
| LearningElement multi-select replaces selection (coderabbit, major) | Component moved to ui pkg | Re-verify in `LearningElementDisplay` + tRPC attempt path |
| games.tsx / [id].tsx loading-state-before-error (coderabbit, major ×2) | Pages rewritten | Apply to merged pages |
| dto/game.ts epoch-0 timestamp dropped (coderabbit) | Still live | Explicit null check |
| dto/learning enum + dto/results (coderabbit) | Still live | Verify each |
| PlayerData empty-div nav, PlayerCompact alt, LearningElements Readonly (3 threads) | Mooted (files deleted on dev) | Resolve with explanation |
| wp03 plan doc drift, workflow checkout persist-credentials (outdated), post-start.sh root check | Docs/CI | Fix or resolve with rationale |

Resolve every thread on GitHub with a fix reference or a reasoned dismissal before the finish gate.

### W5 — Behavioral test baseline for the platform tRPC surface

Currently zero unit/integration tests (jest is an unused devDep; platform has no test script).
Minimum bar for merge: router-level integration tests via `createCaller` against a test Prisma DB
(or mocked services where DB-free) covering: auth tier enforcement (public/protected/admin/player),
`assertGameOwnership` denial, error-code mapping (W3.1), facts withholding (W3.4), and the six
no-UI procedures (D4). Wire into CI (`demo-game.yml` or a new `platform.yml` job). Keep scope
tight — this is a safety net, not full coverage.

### W6 — Finish gates (in order)

1. Re-run repo-native checks: prettier (project config), lint, `check:ts`, builds (all three apps
   + platform + ui), full local Playwright run.
2. Final security review (`$security-review` scope: merged tRPC surface + restored GraphQL
   surface + auth) and maintainability gate per Review Routing.
3. Update PR #144 body with `$rs-mr-description-writer` (whole-branch coverage incl. merge,
   dual-stack decision, dep bumps, W3 fixes, evidence per gate).
4. All CI checks green on final head; PR stays ready-for-review. **Merge only on explicit user
   authority.**

### W7 — Follow-up scope (post-PR #144, separate work)

- Migrate `examples/central-bank` + `examples/rate-wars` to tRPC (each is a clone; migrating one
  produces a template for the other). Then remove the platform GraphQL surface for real
  (reinstating wp11) and drop graphql peerDeps.
- Decouple `packages/ui/src/hooks/useLearningActivities.ts` from Apollo (caller-supplied fetch
  functions) — unblocks removing `@apollo/client` from the published ui package's peer contract.
- Optional: adopt `@trpc/tanstack-react-query` (D2), Redis-backed event bus for scale-out,
  SSE missed-event replay, `decision` query product decision, cypress workspace removal.

## Decisions

| ID | Decision | Recommendation | Status |
| --- | --- | --- | --- |
| D1 | Platform dual-stack (restore GraphQL surface for examples) | Forced — only alternative breaks examples/CI or balloons scope | Proceeding; user veto possible |
| D2 | Classic `createTRPCReact` vs `@trpc/tanstack-react-query` | Stay classic in this PR; follow-up item | Proceeding classic |
| D3 | Withhold operator-only facts from player results | Implement withhold (matches documented intent) | Needs user/domain confirmation before behavior change |
| D4 | Six tRPC procedures without demo-game UI callers | Keep as platform base surface; unit-test in W5 | Proceeding keep |

## Sequencing

W1 (merge) → W2 (deps) → W3 (fixes) + W4 (triage, parallel) → W5 (tests) → W6 (gates).
W7 after PR #144 merges. Estimated heavy lifting is W1; everything after is bounded.

## Progress

- 2026-07-29: Roadmap created from three Opus review reports. PR green on `37f4878` but
  CONFLICTING vs dev. Starting W1.
