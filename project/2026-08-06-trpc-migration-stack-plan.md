# tRPC Migration — Stack Plan (historical predecessor)

Date: 2026-08-06
Source branch: `codex/trpc-migration-work-packages` @ `c25e0a7f`
Source PR: [#144 feat(trpc): migrate platform and demo-game from GraphQL to tRPC v11](https://github.com/uzh-bf/gbl-uzh/pull/144) — OPEN, non-draft, CONFLICTING, 93 commits, 134 files, +11033/−17270, 30 comments (14 human threads by jajakob, 16 automated).
Base: `dev` @ `254606c` (6 commits ahead of the branch merge-base `5cac12c`; all merged Aug 1, all toolchain).
Provider: GitHub (stacks preview enabled — repo stack #179 exists).
Worktree: new `trees/trpc-migration-stack` (one stack, one worktree). Source worktree `.claude/worktrees/modest-rosalind-8e36bd` stays untouched.

> **Current-state pointer (2026-08-13):** This document is the first-slice
> execution plan committed in PR #197; it is now a historical predecessor and
> is not the active execution contract. The active plan is
> [`project/2026-08-10-pr-205-trpc-examples-stack-plan.md`](2026-08-10-pr-205-trpc-examples-stack-plan.md).
> Plan provenance: PR #197 first added this file in commit `7cfd562`; its
> current head is `321a958`. The later continuation ledger is absent from #197
> and lives in the upper #205 layer.
> The live chain is `dev 6bab3ed` → `#197 321a958` → `#196 8140600` →
> `#195 dd26b0f` → `#194 2e36f98` → `#201 d392283` → `#202 e2738dd` →
> `#204 786ed47` → `#205 2957beb`. Git ancestry and live PR base/head
> metadata agree; all eight PRs are open, draft, mergeable, and unmerged.
> Current #205 CI passed TypeScript run `31651590153`, Docker run
> `31651590156`, and Playwright run `31651590169`, including merged reports
> in job `94298057262`. PRs #202 and #204 remain `UNSTABLE` because
> `SonarCloud Code Analysis` fails only on new-code duplication: 48.4% and
> 38.0%, respectively, against the 3% threshold. The accepted exception is a
> non-blocking process waiver; it does not skip or turn either check green.
> The #195 dependency-install failure and #205 blob-report aggregation failure
> are closed by fresh reruns. No PR is ready-marked or merged.

## 2026-08-13 current-state addendum

The first-slice plan remains the authoritative plan for PR #197's responsibility
and provenance, but its original Gate 1 design sections below are historical.
The implemented stack expanded into the eight-layer chain recorded in the active
continuation plan. The shared CI install is owned by #197; platform privacy and
compatibility corrections are in #196; demo-game lifecycle proof is in #195;
#194 owns its independent CI, devcontainer, and auth-origin corrections; #201
owns the canonical Pages Router pattern; #202 and #204 own their game-specific
transition fixes; and #205 owns the compatibility boundary, verification
fixtures, and reconciliation ledger.

The game-runtime migration tip is #204 (`786ed47`), but #205 is code-bearing
through `a0f6d52`, including workflow, package-verification, configuration, and
compatibility-source changes. Only commits from `cf67aa4` through current head
`2957beb` are documentation, agent-instruction, or plan-only. The integrated
final initial and correction reviews both returned `DONE_WITH_CONCERNS` on
earlier ranges; the allowed two-review budget is exhausted. Their findings are
recorded as closed through owning-layer corrections plus focused verification,
but no exact-current-head integrated-final verdict exists. Gate 3 evidence is
complete; the stack remains draft and reviewable, not merge-authorized.

## 2026-08-10 continuation note

This plan's extraction was replaced by the still-open draft PR stack #194-#197
at commits `1e19f05`, `d704da8`, `c2d972d`, and `2f363c1`. A second draft
stack builds on #194 to apply the official Pages Router client pattern and
migrate Rate Wars and Central Bank. See
`project/2026-08-10-pr-205-trpc-examples-stack-plan.md` for current execution state.
No layer from either stack has been merged.

## 2026-08-12 base-refresh note (superseded by the active plan)

The earlier refresh snapshot was rooted at `dev` commit `5852341` and said the
rewritten branches were not yet pushed. That snapshot was superseded by the
latest-`dev` refresh and ownership correction documented in the active plan.
The current stack has been pushed and read back with `needsRebase: false`; the
integrated final and correction reviews are closed under the two-review budget.
The current Gate 3 evidence is the fresh CI readback in the active plan, not
the historical status sections below. No merge, publication, deployment,
branch deletion, or worktree cleanup is authorized.

## 1. Reconcile live state (verified 2026-08-06)

| Item | State |
| --- | --- |
| Source branch HEAD | `c25e0a7f`, clean, pushed, equals origin |
| PR #144 | OPEN, targets `dev`, CONFLICTING, 14 unresolved human threads (jajakob), 16 automated comments |
| `dev` HEAD | `254606c` — 6 commits: #183 native ARM CI, #177 Prettier 3.9.6, #178 TS 6.0.2 bridge, #180 website React 19/Next 16, #181 Prisma 7.9.1, #182 TS 7 native checks |
| Branch already merged dev | Yes, at `08c19d4` (incl. ui extraction `6159395`, central-bank, stakeholder fixes, managed devrouter `5cac12c`). Remaining 6 dev commits are toolchain/CI only → merge is mechanical |
| Branch still on | Prisma 6.14.0, TS ~5.9.3, Prettier ~3.3.2 + own newer bumps (next 16.2.12, react 19.2.8, pnpm 11.18.0, playwright 1.62.0) |
| Prior gates | Roadmap `project/2026-07-29-trpc-migration-finalization-roadmap.md` records W1–W7 complete, security + maintainability gates run, 45-test platform baseline |
| No-merge boundary | No merge without explicit user authority (memory + handoffs) |

## 2. Approach — extraction, not re-implementation

The branch's **final tree** is re-staged deliberately onto `origin/dev`, layer by layer, with `git add <paths>` and focused commits. PR #144 and its branch are frozen as a safety reference until the stack validates (migration contract: freeze, extract, prove, audit).

### Step 0 — absorb `dev` (L0)
Create `trees/trpc-migration-stack` from `origin/dev`, merge the source branch's final tree, then take **dev's versions** of the 6 toolchain commits: Prisma 7.9.1 (`prisma.config.ts`, adapter-pg, generated client), TS 6 canonical + `typescript-native@7` alias with dual `check:ts` / `check:ts:typescript6` in every package, Prettier 3.9.6, native ARM Docker matrix, website React 19/Next 16. Reconcile `pnpm-lock.yaml`, manifests, `pnpm-workspace.yaml`. Result is behavior-identical to `dev` with every check green.

> **L0 definition (verified 2026-08-06):** L0 is the execution-contract commit — the plan file plus this coverage ledger. Its tree equals `origin/dev` exactly (zero code diff by construction; `git diff origin/dev <L0 tip>` shows only the added plan file). The reconciled `pnpm-workspace.yaml` and `pnpm-lock.yaml` are **not** dev-identical (branch-authored exclusions, React/FontAwesome overrides, and a lockfile regenerated for the full merged tree), so they cannot ride in L0 without breaking L0's dev-parity and `--frozen-lockfile` check. They travel with the layer whose manifests change them: `pnpm-workspace.yaml` + regenerated lockfile in L1, lockfile regenerated again at the L2 and L3 tips. L3's regenerated lockfile must equal merge-ref `92fd710:pnpm-lock.yaml` (same manifests) — that equality is the convergence check.

### Step 1 — re-stage layers bottom-up
Each layer is a work package with its own branch in the stack, its own commits, and per-layer CI.

```yaml
feature: trpc-migration
provider: github
base: dev
mode: guided            # Gate 2 pause after L0 (toolchain foundation)

layers:
  - id: 00
    name: absorb-dev-toolchain
    work_package: dev parity — Prisma 7, TS 6/7 dual checks, Prettier 3, native ARM CI, lockfile reconciliation
    responsibility: churn isolation; every layer above carries only human-authored change
    depends_on: base
    reviewer: devops / CI audience
    attention: mechanical
    reviewer_focus:
      - Is the merged tree exactly dev-identical in behavior (no stray branch deltas)?
      - Do both TS check scripts run in every package?
    validation:
      - pnpm install --frozen-lockfile
      - check:ts (TS 6) and check:ts:typescript6 (TS 7 alias) per package
      - lint, build, platform jest baseline (45 tests)
    activation: complete
    risk: medium

  - id: 01
    name: platform-trpc-kernel
    work_package: tRPC server kernel in packages/platform — procedures, DTOs, auth tiers, error mapping, realtime bus, tests
    responsibility: all of packages/platform/src/trpc/* (additions, ~+2897 lines), platform tests, jest config, platform manifest deps, rollup/index exports, pubsub→realtime bridge, EventService/GameService collateral
    depends_on: 00
    reviewer: platform backend audience
    attention: judgment-heavy
    reviewer_focus:
      - Auth tier boundaries (public/player/admin) and ownership assertions
      - DTO shapes vs GraphQL parity; D3 fact-withholding on results DTOs (incl. residual in toPastResultDto)
      - Error mapping contract (yup ValidationError → BAD_REQUEST)
      - API surface is inert: no consumers until L2
    validation:
      - platform jest (45 tests), check:ts, lint, build
    activation: inert
    risk: low-medium

  - id: 02
    name: demo-game-trpc-migration
    work_package: demo-game runtime migration — remove GraphQL/nexus, add tRPC client + hooks, rewire pages/components, Dockerfile/next.config
    responsibility: apps/demo-game/* (additions + rewiring + graphql deletions), consumed packages/ui component fixes (command/dialog/Timeline), rate-wars index.tsx typing collateral
    depends_on: 01
    reviewer: demo-game frontend audience
    attention: judgment-heavy
    reviewer_focus:
      - Runtime behavior parity (cockpit, admin, reports, learning elements, realtime bus)
      - Error/loading state handling (verified current bugs: games.tsx error-after-loading, multi-select toggle in LearningActivityModal)
      - Realtime event flow via trpc subscription vs old pubsub
    validation:
      - demo-game build, check:ts, lint, unit tests
      - playwright demo-game-flow smoke
      - docker build demo-game
    activation: complete
    risk: high

  - id: 03
    name: ci-devcontainer-docs-collateral
    work_package: CI workflows, devcontainer/devrouter, vercel.json, playwright config, example-game manifests, project docs, AGENTS.md
    responsibility: residual branch-authored deltas after L0 absorption; answer-only review threads; no behavior change
    depends_on: 02
    reviewer: devops / maintainer audience
    attention: mechanical
    reviewer_focus:
      - Answers to jajakob's config/devops questions (vercel.json, cypress, nodemon, yup/zod, graphql-in-platform, Dockerfile explanations, devrouter commands, post-start env, playwright workflow, webpack, globals.css comment)
    validation:
      - workflow lint, docker builds (demo-game, rate-wars), devcontainer config validation
    activation: complete
    risk: low

follow_up_stacks:
  - W7 follow-ups: migrate example games to tRPC, decouple ui useLearningActivities from Apollo, optional @trpc/tanstack-react-query
```

## 3. Coverage ledger (source branch → layer)

Every diff file of the source branch maps to exactly one layer; cross-cutting files (manifests, lockfile) are split by hunk with L0 taking dev-alignment and L2/L3 taking branch-authored hunks.

| Layer | Files |
| --- | --- |
| 00 | This plan + coverage ledger only. Tree == `origin/dev` (`254606c`) with zero code diff; verified via `git diff origin/dev <L0 tip>` (plan file is the sole addition). |
| 01 | `packages/platform/src/trpc/**` (22 files), `packages/platform/test/**` (6), `packages/platform/jest.config.cjs`, `packages/platform/package.json` (trpc deps + mirrored devDeps), `packages/platform/rollup.config.js`, `packages/platform/src/index.ts`, `src/lib/pubsub.ts`, `src/lib/realtime.ts` (addition), `src/services/EventService.ts`, `src/services/GameService.ts` — plus `pnpm-workspace.yaml` (branch toolchain reconciliation: escapp/quartz excludes, React/FontAwesome overrides, packageExtensions) and `pnpm-lock.yaml` regenerated at the L1 tip. |
| 02 | `apps/demo-game/**` (54 files incl. `src/graphql/**` deletions, `codegen.ts`, `api/graphql.ts`), `packages/ui/src/components/{Timeline,ui/command,ui/dialog,LearningActivityModal}.tsx` (incl. multi-select fix), `examples/rate-wars/src/pages/index.tsx`, `pnpm-lock.yaml` regenerated at the L2 tip. |
| 03 | `.github/workflows/*` (branch type-gate + ARM matrix), `.devcontainer/**`, `.devrouter.yml`, `.dockerignore`, `vercel.json`, `playwright/**`, `.agents/skills/{devrouter,gbl-playwright-e2e}/SKILL.md`, `docs/solutions/integration/devpod-oidc-network-namespace-recreate.md`, `examples/rate-wars/Dockerfile`, `packages/ui/package.json` (next devDep closure), `AGENTS.md`, `project/**` (14 migration docs; the plan file itself lives in L0), `pnpm-lock.yaml` regenerated at the L3 tip (must equal `92fd710:pnpm-lock.yaml`). |

After L0, any file whose branch version equals dev's drops out of the diff automatically; L3 content is the computed residual.

> **L3 convergence-check deviation (verified 2026-08-06):** the literal check "L3 lockfile equals `92fd710:pnpm-lock.yaml`" cannot hold — the merge-ref was never CI-green. Its platform setup (`ts-jest ~29.2.6`, no direct `@jest/globals`) fails under TS 6.0.2 (ts-jest 29.2.6 peer is `typescript <6` → TS5107) and `@jest/globals` is not hoisted under pnpm 11. L1 carries the verified fixes: `ts-jest ~29.4.12` (peer `typescript >=4.3 <7`) and a direct `@jest/globals ~29.7.0` devDep. The L3 lockfile is frozen-consistent (`CI=true pnpm install --frozen-lockfile --ignore-scripts` passes) and differs from `92fd710:pnpm-lock.yaml` only in those two platform importer entries plus version-string drift (@babel/core 7.29.7, @types/react 19.2.18, next-auth resolution shape) — no manifest-level dependency additions.

## 4. Review-thread triage (PR #144, jajakob)

14 human threads — 12 answer-with-explanation, 2 may warrant small fixes (Timeline rename; "examples should also use trpc" → answer: deliberate W7 deferral). All answered in L3 (or their owning layer where code changes). Automated comments (Sonar, bots): 3 verified already-fixed (missing awaits, services injection, toDate epoch-0), 2 verified still-valid (games.tsx error order, multi-select toggle) → fixed in L2, rest are config/explanation.

Verified current-code findings (bot comments that survive):

| Finding | Status | Layer |
| --- | --- | --- |
| Multi-select learning elements unsolvable (`LearningActivityModal.tsx` replaces selection with `[index]`) | Still valid | 02 |
| `games.tsx` loading-before-error guard | Still valid | 02 |
| Missing awaits (logoutAsTeam, addCountdown, toggleSwitch) | Already fixed (returned promises) | — |
| services injection crash (play router) | Already fixed (demo-game passes services) | — |
| toDate epoch-0 | Already fixed | — |

## 5. Deliberate exclusions (unchanged from prior decisions)

- D2: stay classic `createTRPCReact` (no tanstack adapter)
- D3 residual: `toPastResultDto` still copies `period.facts` / `segment.facts` / `player.facts` into the player-facing `pastForPlayer`. No consumer reads them (verified: zero call sites in demo-game) and GraphQL parity is not required → **proposed small fix in L1**: withhold these facts, matching `SpecificResultDto`.
- D4: 6 no-UI procedures kept
- W7 follow-ups: examples stay on GraphQL (Apollo stays in example manifests), ui `useLearningActivities` stays Apollo-backed — deferred stack

## 6. Open PRs on dev (overlap check, verified 2026-08-06)

| PR | Scope | Overlap | Handling |
| --- | --- | --- | --- |
| #168 `claude/pr161-review-followups` (ui dep externalization, OPEN/CONFLICTING) | packages/ui + demo-game components | L2 ui components, L3 ui manifest | Leave independent; conflicts resolved at merge time if it lands first |
| #184 dependabot postcss bump (OPEN) | manifests + lockfile | L0 lockfile | Leave independent |
| #185 `enhance/native-dev-mode` devcontainer (OPEN/MERGEABLE) | .devcontainer | L3 devcontainer | Leave independent; re-check before Gate 3 |

## 7. Validation & gates

- Per-layer CI at each layer's tip (GitHub: each layer PR evaluated against `dev` rules) — never rely on the top layer being green
- Gate 2 (after L0): foundation is toolchain churn, not auth/API — present L0 result, continue per guided mode
- Gate 3: review package with per-layer human-authored vs generated delta, review focus, risk; one decision: open for review / revise / keep drafts
- Final-outcome review (repo Mandatory Review Gates): configured reviewer over the integrated stack before opening for review; security + maintainability gates were run on the source branch and are re-validated at Gate 3 on the exact re-staged content
- Landing (Gate 4): explicit user authorization; user lands via GitHub UI; stack lands atomically bottom-up

## 8. Open decisions (recommendations)

1. **Topology: 4 layers (recommended) vs 3** (fold L0 into L1). 4 isolates toolchain churn; 3 saves one review context-switch.
2. **PR #144: freeze now (recommended)** — keep as safety reference until stack validates; close after stack lands. Alternative: close immediately.
3. **D3 residual: fix in L1 (recommended)** — strip period/segment/player facts from `pastForPlayer`; no consumers, matches D3. Alternative: defer.
4. **Thread triage: answer 14 + fix the 2 verified bugs (recommended)** in their owning layers. Alternative: answers only, bugs as follow-ups.
5. **Open PRs #168/#184/#185: leave independent on dev (recommended)**.

## 9. Agy discussion (planning-stage challenge pass)

### Outcome: agy unavailable in this environment (verified 2026-08-06, agy 1.1.10)

Every invocation shape was attempted and verified against agy's own conversation transcripts (the CLI records what it actually received):

| Attempt | Result |
| --- | --- |
| `agy --print "<prompt>"` | Prompt dropped — model received only the `--model` flag token |
| `agy --print --prompt "<prompt>"` | Same: model received only `--prompt` |
| `--prompt=`, `--print=`, positional-after-`--`, stdin pipe | Prompt dropped or empty reply |
| `agy -i` (interactive PTY) | CLI not signed in (Antigravity auth) + invalid `settings.json` (`artifactReviewPolicy: "request-review"`) — exits before any prompt |

The model calls do fire (stream ResponseIDs appear in agy's logs), but print mode never emits the reply in this setup, so the planning-stage challenge pass could not be obtained. No agent/client configuration was modified (per repo rules).

**Fallback for the planning-stage pass:** the plan in this file is the Gate 1 draft; the repo's Mandatory Review Gates require one separate read-only planning-stage pass before the plan is presented as the execution contract. Options (user ruling):
1. Run the configured reviewer (`reviewer` route per `$rs-model-routing`) on this plan now — recommended; satisfies the gate and the "discuss with agy" intent is recorded as attempted-but-blocked.
2. Retry agy later (sign in / fix `settings.json` outside this session), then re-run the critique before Gate 3.
3. Proceed to Gate 1 with in-session review only and accept the gate as waived for this plan — not recommended; the final outcome review would still run before any merge.

### Droid (gpt-5.6-luna) review status (re-checked 2026-08-06)
Per user ruling, droid replaces agy as the review provider for this plan. Still blocked: `droid exec -m gpt-5.6-luna -r high "<prompt>"` exits 1 silently and `~/.factory/auth.v2.file` is stale (Aug 4); `droid exec -m gpt-5.6-luna --list-tools` works, so the model and read-only tools are valid. The user must sign in at https://auth.factory.ai/device before per-layer and Gate-3 reviews can run. All stack execution proceeds without it.

## 10. Full verification and equivalence audit (executed 2026-08-06)

### Stack state
All four layers committed in `trees/trpc-migration-stack`: 00 `d556d0b`, 01 `24d3271`, 02 `821b341`, 03 `6e6ccc6`. `origin/dev` re-fetched and unchanged at `254606c` — base did not advance, no rebase needed. PR #144 and its branch remain frozen and untouched (`codex/trpc-migration-work-packages` @ `c25e0a7f`, OPEN/CONFLICTING).

### File-set equivalence (stack tip vs merge-ref `92fd710`)
`comm` over the three `git diff --name-only` lists:

| Set | Files | vs stack |
| --- | --- | --- |
| PR #144 (`origin/dev..c25e0a7f`) | 315 | 193 equal dev (drop out in merged tree); 1 carried fix not in PR set (see below) |
| merge-ref (`origin/dev..92fd710`) | 122 | **identical set**: 122/122 common, 0 missing, 0 unexplained extra |
| stack (`origin/dev..6e6ccc6`) | 124 | = merge-ref set + 2 intentional additions |

The 2 intentional additions:
- `project/2026-08-06-trpc-migration-stack-plan.md` — the L0 plan/ledger itself (by design).
- `packages/platform/tsconfig.build.json` (+ `build:dts` script in `package.json`) — L1 addition, absent from branch, merge-ref, and dev. Rationale (recorded in commit `24d3271`): rollup-plugin-typescript with TS 6.0.2 drops `.d.ts` for files whose inferred types hit TS2883 (all router factories); standalone `tsc --project tsconfig.build.json` emits portable declarations into the rollup dist layout. demo-game consumes `@gbl-uzh/platform` (`workspace:*`), so the declarations are load-bearing.

Of the 122 shared files, 18 carry content deltas vs the merge-ref, all attributable:
- **L1 (13):** platform `package.json` (ts-jest ~29.4.12, @jest/globals, restored `test` script), `src/services/EventService.ts`, `src/trpc/context.ts`, DTOs `game/player/results`, `routers/play.ts`, `schemas.ts`, and 5 test files (explicit `@jest/globals` imports).
- **L2 (4):** demo-game `admin/games/[id].tsx`, `admin/reports/[id].tsx`, `server/trpc/context.ts`, `services/ActionsReducer.ts` — Prisma 7 fixes (enums from generated client, type-only `PrismaClient`, generated-client cast in context).
- **L3 (1):** `pnpm-lock.yaml` (documented ts-jest/@jest/globals delta, see §3 deviation note).

The remaining 104 shared files are byte-identical to the merge-ref.

### LearningActivityModal fix attribution
`packages/ui/src/components/LearningActivityModal.tsx` is the one file in the merge-ref/stack set that is **not** in PR #144's diff: dev and the frozen branch both carry the buggy `[index]` toggle (verified byte-level at `c25e0a7f` and `origin/dev`), while the merge-ref and stack carry the review-thread fix `[...previous, index]`. This matches §4 triage ("multi-select toggle — still valid → fixed in L2") and rides in L2 commit `821b341`. It is a planned repair carried via the merge-ref, not an unexplained extra.

### Verification status per layer
- L1: TS7 + TS6 `check:ts`, lint (0 errors / 5 pre-existing warnings), 45/45 jest, clean rollup build emitting all 66 declarations.
- L2: Prisma 7 breaks from the mechanical merge fixed and verified; TS7 + TS6 checks, lint, jest passWithNoTests, full `pnpm run build` green.
- L3: configs validated; lockfile frozen-consistent per §3 deviation note.
- Per-layer CI on GitHub and the droid (gpt-5.6-luna) review pass remain pending: CI starts with `gh stack submit`, droid waits on user sign-in at https://auth.factory.ai/device.

### Registration
Stack initialized with `gh stack init --base dev` (adopting 00/01). 02/03 were re-staged and committed after the init, and are registered in the follow-up step; stack metadata lives in `.git/gh-stack` and is shared across worktrees.

## 11. Execution addendum (verified 2026-08-06/07)

Executed the approved plan end-to-end. PRs #186–#189 (L0–L3) are open, draft, chained (`base` = previous layer), MERGEABLE. PR #144 and `codex/trpc-migration-work-packages` @ `c25e0a7f` remain frozen and untouched (verified: local ref == origin ref, worktree clean). No merges performed without explicit user authorization.

### Final commit map (replaces §10's earlier SHAs)

| Layer | Branch | Final HEAD | Vercel |
| --- | --- | --- | --- |
| L0 | `trpc-stack/00-absorb-dev-toolchain` | `878bc4f` | ✅ (no vercel.json, dev-era lockfile) |
| L1 | `trpc-stack/01-platform-trpc-kernel` | `38adf73` | ✅ success |
| L2 | `trpc-stack/02-demo-game-trpc-migration` | `1f58abb` | ✅ success |
| L3 | `trpc-stack/03-ci-devcontainer-docs-collateral` | `8a8c07d` | ✅ success |

Deploy proof: `gh api repos/uzh-bf/gbl-uzh/deployments?per_page=20` + statuses — L1 `38adf73` (deployment 5785881340), L2 `1f58abb` (5785899024), L3 `8a8c07d` (5785907467) all `success` ("Deployment has completed"). Preview URLs live (HTTP 200): L1 https://gbl-7yi7wx13k-roland-schlflis-projects.vercel.app, L2 https://gbl-pb0dg87s6-roland-schlflis-projects.vercel.app, L3 https://gbl-fubtby2su-roland-schlflis-projects.vercel.app. Old preview URLs (gbl-5qypgj5iq…, gbl-f2p4qippe…) serve Vercel's "Deployment has failed" page — those are the pre-fix deployments, not the stack's.

### Vercel root cause (L1/L2/L3 failed deploys, now fixed)

Deploy-status evidence (via deployments API, authoritative): L0 `878bc4f` (no vercel.json, dev-era 11.6.0 lockfile) ✅; L1 `92d462a` (no vercel.json, lockfile regenerated during re-staging) ❌; L2 `8fec541` (same) ❌; L3 `5b46539` (vercel.json `pnpm@11.18.0 --trust-lockfile`) ❌; L3 `84012d3` (vercel.json `corepack pnpm@11.6.0 install --frozen-lockfile --trust-lockfile` + 11.6.0-regen lockfile) ✅.

Fix: added the proven-green `vercel.json` recipe to L1 (`38adf73`) and L2 (`14a9e63`), merged up the stack. Vercel logs not obtainable (`vercel inspect <dpl> --logs` → invalid token; user sign-in needed).

### Playwright image fix (L3)

`.github/workflows/playwright-testing.yml` docker image `v1.62.0-noble` → `v1.61.1-noble` (lines 51 + 224) matching repo pin `@playwright/test@1.61.1` — commit `81bb286`. L3 Playwright run 31129852746 fully green.

### CI-gap method (documented deviation)

Workflows (`typescript-checks.yml`, `demo-game.yml`, `playwright-testing.yml`) trigger on `main`/`dev` branches and PRs only — stack branches do not match, so per-layer CI was run via manual `workflow_dispatch` on each layer's tip. Verified green per layer (typecheck/lint/build/Playwright matrix below). Open question to user: add `trpc-stack/**` to workflow `push.branches` filters in L3 so future stack branches self-trigger, or keep manual dispatch (documented deviation).

### CI proof per layer (final heads)

| Check | L1 `38adf73` | L2 `1f58abb` | L3 `8a8c07d` |
| --- | --- | --- | --- |
| TypeScript checks | ✅ 31128997405 | ✅ 31128997741 | ✅ 31131362581 |
| Lint + build (demo-game.yml) | ✅ | ✅ | ✅ |
| Playwright matrix | ✅ 31129138781* | ✅ 31129138781* | ⚠ 31131364271** (re-run 31132051193 pending) |
| Vercel preview | ✅ | ✅ | ✅ |

\* L2 demo-game had 2 passed + 1 flaky retry (`demo-game-flow.spec.ts:361` CONSOLIDATION timeout passed on retry) — timing flake, not regression; earlier failure 31128998181 = same flake.
** Final-head run 31131364271: central-bank/rate-wars/merge-reports green; demo-game `demo-game-flow.spec.ts:361` multi-period flow failed twice — first attempt timed out on Savings spinbutton fill (15s), retry failed on consolidation `report-loaded` (30s). Same spec/region as the documented flake; app code between L2 head and final L3 is unchanged (L3 = CI/devcontainer/docs only). Re-run 31132051193 dispatched on final head.

### Workspace-exclusion defect (92d462a, L1)

Frozen branch excluded `apps/escapp` + `apps/quartz` from the pnpm workspace (ci(vercel) commit), dropping both importers from the lockfile and breaking `check:ts:quartz` module resolution in CI. Fixed in `92d462a` (restore dev workspace shape, regen lockfile). L1/L2/L3 lockfiles all include both importers; L3's lockfile is frozen-consistent.

### Lockfile convergence (updated)

§3's literal check ("L3 lockfile == `92fd710:pnpm-lock.yaml`") holds only for the importer/manifest level. Verified: all manifests byte-identical between stack tip and merge-ref **except** the two documented L1 platform deltas (`ts-jest ~29.4.12` + direct `@jest/globals` — required for TS 6.0.2, see §3 deviation) and the added `build:dts` script/tsconfig. Resolution-level drift exists (~1,138 hunks of the 17,383-line diff): L3 regenerated from a different registry snapshot than the merge-ref (e.g. `@babel/core 7.28.5` vs `7.29.7`, `@types/react 19.2.17` vs `19.2.18`, `tailwindcss-radix 3.0.5` vs `4.0.2` — design-system's declared peer is `^4.0.2`, and 3.0.5 declares tailwindcss `^3.4.1` peer; dev's lockfile also carries 3.0.5, so this is pre-existing dev-era resolution behavior, not a stack regression). Both lockfiles pass `--frozen-lockfile` installs locally; L3's is CI-verified (typescript-checks run 31131362581 ran `pnpm install --frozen-lockfile`). No action unless the user wants byte-exact lockfile convergence (regen from the merge-ref snapshot — costly, no functional delta observed).

### Substantive diff size per layer (vs base, excluding lockfile/workspace/docs/generated)

| Layer | Substantive | Note |
| --- | --- | --- |
| L0 | +0/-0 | plan file only (project/ excluded from substantive) |
| L1 | +3,146/-27 | tRPC kernel: procedures, DTOs, auth tiers, error mapping, realtime bus, 45 tests |
| L2 | +2,613/-8,899 | demo-game GraphQL → tRPC: 54 files, GraphQL deletions dominate |
| L3 | +174/-98 | CI workflows, devcontainer, devrouter, docs, spec hardening |

### Demo-game flake (documented, not a regression)

`demo-game-flow.spec.ts:361` multi-team multi-period flow has a known timing flake at CONSOLIDATION: run history — 31128998181 ❌ (flake), 31129138781 ✅ (2 passed + 1 flaky retry), 31131364271 ❌ (twice, final head). Spec hardening (retry-on-rerender helpers) shipped in L3 `5b46539` (already included in green run 31129852746). Not a regression: app code unchanged between the L2 head and final L3 head.

### droid (gpt-5.6-luna) review status (re-checked 2026-08-07)

Still blocked: `droid exec -m gpt-5.6-luna -r high "<prompt>"` exits 0 silently (no output), `~/.factory/auth.v2.file` last modified Aug 4 10:20. User must sign in at https://auth.factory.ai/device before per-layer + Gate-3 droid reviews can run. All stack execution proceeds without it.

### agy review status (re-checked 2026-08-07, per user ruling: agy replaces droid)

The earlier "agy unavailable" verdict (section 9) was a sandbox artifact, not a real blocker. Outside the sandbox, agy 1.1.10 is signed in and the working invocation shape is bare `agy --print "<prompt>"` run from a trusted workspace (`trees/major-dependency-upgrades`), which delivers the prompt to the default model Gemini 3.6 Flash (High) and can read stack files via absolute paths. Any flag that enables permissions (`--model`, `--effort`, `--mode plan`, `--sandbox`, `--dangerously-skip-permissions`, `--print-timeout`, `--add-dir`) drops the prompt in this setup, so reviews run with default permissions and file reads only.

All five review passes completed 2026-08-07, persisted under `project/_local/reviews/`:

| Review | Scope | Verdict |
| --- | --- | --- |
| Planning-stage challenge | plan + Gate 3 package | APPROVE-WITH-FINDINGS (3 findings, all already recorded; map to open decisions a/b) |
| L1 platform kernel | `52c2134..7b226b5` | APPROVE (no findings >= 75) |
| L2 demo-game migration | `7b226b5..f8de28c` | APPROVE (no findings >= 75) |
| L3 CI/devcontainer/docs | `f8de28c..1d6925c` | APPROVE (no findings >= 75) |
| Final-outcome (integrated) | `254606c..1d6925c` | APPROVE (no findings >= 75) |

Review reports: `2026-08-07-trpc-stack-{planning-stage,l1,l2,l3,final-outcome}-agy.md`. The planning-stage findings (L0 isolation, CI trigger gap, lockfile convergence drift) are the same three items already surfaced as open decisions; no new actionable items. The final-outcome review satisfies the repo Mandatory Review Gate for the integrated stack before opening for review.
