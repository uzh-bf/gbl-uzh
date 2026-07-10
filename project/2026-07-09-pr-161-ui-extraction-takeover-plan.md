# PR #161 UI extraction takeover plan

## Identity

- Plan: `project/2026-07-09-pr-161-ui-extraction-takeover-plan.md`
- Branch: `feat/extract-ui-components`
- Target: `dev`
- PR: [#161](https://github.com/uzh-bf/gbl-uzh/pull/161)
- Prepared: 2026-07-09
- Baseline snapshot:
  - Head: `969dcf80c444b47a948945faf7e475a8d8b85dcb`
  - Target: `dc2941822ec813bad2ef41f30d9fbd014020cf3e`
  - Ahead: 13 commits
  - Diff: 96 files, `+5340/-3884`
- Related history:
  - `project/2026-07-06-central-bank-cleanup-plan.md`
  - `project/2026-06-28-demo-game-playwright-plan.md`

## Goal

Make PR #161 merge-ready.

Deliver:

- One intentional `@gbl-uzh/ui` public surface.
- Shared components reused by `demo-game`, `central-bank`, `rate-wars`.
- Shared learning-activity flow. Typed, tested, behavior-preserving.
- Atomic `TradingForm` buy/sell submission.
- Reliable pnpm 9 Vercel install plus pnpm 11 repo install.
- Explicit devcontainer game selection. Parallel devrouter worktrees remain collision-free.
- Green build, lint, Sonar, Vercel, three Playwright game flows.
- Browser evidence plus accurate whole-branch PR body.

## Non-goals

- Merge PR. User approval required.
- Redesign game UX.
- Add shared components without current consumers.
- Upgrade framework or dependency majors unless required by verified blocker and separately approved.
- Rewrite platform lifecycle/domain behavior.
- Change old merged plans.
- Delete unrelated worktrees, branches, containers, routes, or untracked artifacts without explicit approval.
- Fix unrelated repo debt.

## Current state

### Green

- Branch matches remote head.
- GitHub build job passes.
- GitHub lint job passes.
- Central Bank Playwright job passes.
- Rate Wars Playwright job passes.
- Devrouter CLI and repo config both use `0.0.25`.
- Devrouter doctor: 23 checks OK, 0 errors.

### Blocking

1. Demo-game Playwright fails.
   - Failure: `locator.fill: Timeout 15000ms exceeded`.
   - Location: `playwright/tests/demo-game-flow.spec.ts:124`.
   - Cause candidate: test requests second `textbox`; migrated segment-count input exposes `spinbutton`.
   - Retry fails same point.
2. Sonar quality gate fails.
   - New-code duplication: 9.4%; required <= 3%.
   - Main contributors:
     - `packages/ui/src/components/ui/command.tsx`: 158 duplicated lines.
     - `packages/ui/src/components/ui/dialog.tsx`: 122 duplicated lines.
     - `apps/demo-game/src/components/GameLayout.tsx`: 74 duplicated lines.
     - `examples/rate-wars/src/pages/play/cockpit.tsx`: 26 duplicated lines.
     - `examples/central-bank/src/pages/play/cockpit.tsx`: 23 duplicated lines.
     - Three welcome pages repeat logo-color mapping.
3. Vercel fails before build.
   - Vercel selects pnpm `9.15.9`.
   - Error: `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`.
   - Workspace overrides live in `pnpm-workspace.yaml`; pnpm 9 compatibility missing from root package metadata.
4. Local browser path unavailable.
   - `https://demo-game.localhost/admin/login` -> 502.
   - OIDC discovery route -> 502.
   - No GBL app/DB/OIDC containers running.
   - Devrouter reports six orphaned workspace proxy routes.

### Handoff drift

- Handoff says complete. Live PR says unstable.
- PR body says no blockers. Three gates fail.
- PR body says 92 files and seven commits plus merge. Live branch has 96 files and 13 commits.
- PR body lacks screenshots.
- No branch-wide plan existed under `project/`.
- Antigravity task/plan artifacts cover late hook/form work, not whole branch.
- No human review exists.

### Working-tree constraints

- Preserve untracked root artifacts:
  - `playwright-artifacts-1-of-2/`
  - `playwright-artifacts-2-of-2/`
  - `playwright-report/`
  - `run-artifacts*/`
- Do not stage, delete, move, or ignore them without user instruction.
- Other linked worktrees exist outside `trees/`. Treat as user-owned.
- Codex bundled runtime resolves `pnpm` to `11.7.0`; repo pins `11.6.0`.
- Use Volta-pinned Node `24.16.0` plus pnpm `11.6.0` for authoritative repo checks.

## Grill findings

### Resolved

- Product intent: reuse shared UI across three games; support parallel devrouter/DevPod worktrees.
- Merge target: `dev`.
- Existing branch retained. No new worktree needed.
- Hook extraction retained. Removes repeated learning orchestration.
- Atomic TradingForm change retained. Fixes real partial-state race.
- Deployment/check failures included. They gate merge readiness.
- UI behavior must be browser-verified. Build-only proof insufficient.

### Recommended decisions

1. Speculative UI surface: remove.
   - Components with no external consumers:
     - `AssetAllocationMatrix`
     - `FinancialStatements`
     - `GenericDataGrid`
     - `MultiProgress`
     - `OutlookCard`
     - `RelativeMeasure` except internal `OutlookCard` use
     - `RiskScenarioChart`
     - `WaterfallChart`
   - Reason: no current value; ~1,300 lines; extra deps; larger review/security surface.
   - Alternative: retain only with named current consumer and verification.
2. Global supply-chain bypass: remove.
   - Current `.npmrc`: `minimum-release-age=0`.
   - Reason: disables repo-wide release-age policy to work around network timeouts.
   - Preferred fix: deterministic pnpm compatibility plus reliable install path.
   - Exception: keep only after explicit security trade-off approval and durable rationale.
3. Workspace identity vs game target: separate.
   - `WORKSPACE` identifies routing/worktree isolation.
   - Game package selection is different concern.
   - Current substring inference (`central-bank`, `rate-wars`) couples branch naming to runtime.
   - Preferred result: explicit validated game target, default `@gbl-uzh/demo-game`.
4. Sonar duplication: fix code, not gate.
   - Reuse canonical primitives/helpers.
   - Do not suppress or exclude new code only to pass.
5. Test failure: preserve accessible semantics.
   - Prefer label/role selector.
   - Fix app markup if label association missing.
   - Avoid positional selectors after migration.

### Decision gates during execution

- Major dependency upgrade found -> stop; request approval.
- Unused component has confirmed near-term consumer -> keep only component plus consumer in same branch or split explicitly.
- `.npmrc` bypass proves necessary after pnpm compatibility repair -> stop; present narrower options.
- Devcontainer target needs new public config contract -> document before code; update wiki if user-facing.
- Worktree/container cleanup finds uncommitted work -> stop; list exact paths/files; request approval.

## Domain language

- Shared component: component consumed by at least two game apps or intentionally exposed as stable platform UI contract.
- Game adapter: app-owned mapping from game-specific GraphQL/domain data to shared UI props.
- Workspace: devrouter/DevPod isolation identity derived from worktree/branch.
- Game target: package started, migrated, seeded, and verified inside devcontainer.
- Merge-ready: required checks green; review findings handled; browser evidence attached; PR body current.
- No glossary or ADR update needed now. Terms clarify implementation boundaries; no hard-to-reverse domain decision yet.

## Research

### Questions

1. What did user request?
   - Shared reuse across demo plus two example games.
   - Optimal library structure.
   - Latest devrouter support for parallel DevPod worktrees.
2. What did prior agent add?
   - Component extraction/migrations.
   - `useLearningActivities`.
   - TradingForm atomic submit.
   - devrouter `0.0.25`.
   - worktree ignore.
   - repo-wide release-age bypass.
   - implicit game selection from workspace name.
3. What blocks merge now?
   - Demo Playwright.
   - Sonar duplication.
   - Vercel pnpm 9 frozen install.
   - Missing live browser evidence.
4. Which strict-review findings remain?
   - Unused public components.
   - 617-line `FinancialStatements.tsx`.
   - duplicated logo map.
   - duplicated notification enum.
   - `any` types in shared hook and consumers.
   - inconsistent dependency/public-boundary choices.
5. What verification path exists?
   - GitHub Actions for build/lint/three games.
   - Vercel preview for website.
   - SonarCloud PR gate.
   - devrouter/DevPod local stack plus Playwright/browser.

### Evidence

- Local branch/worktree inspection.
- Live GitHub PR metadata, reviews, comments, checks.
- GitHub Actions failed-job logs.
- Vercel deployment logs.
- SonarCloud component measures.
- Antigravity conversation, handoff, walkthrough, plan, strict review.
- Current source/diff and package metadata.
- Devrouter status, doctor, route list, local HTTP probes.

### External research

- None needed for plan shape.
- Primary live systems expose current failures directly.
- During implementation, query current primary docs before changing:
  - pnpm 9/11 override/config compatibility.
  - React Hook Form accessible field wiring.
  - Apollo typed document/query generics.
  - DevPod/devcontainer env forwarding if explicit target config changes.
- Use Context7 where available. Official docs fallback only.

### Limitations

- Local UI unavailable until environment restored.
- No human review feedback yet.
- Sonar duplication shows duplicated lines, not preferred abstraction.
- Vercel may reveal later blockers after first install blocker clears.
- Existing root artifacts may contain older CI evidence; not treated as current.

## Skill routing

- Process: `rs-sliced-development-workflow`.
- Plan/findings: `caveman` basic.
- Clarification: `grill-with-docs`; no domain doc mutation required.
- UI boundaries: `gbl-frontend-game-ui`.
- Local routing: `devrouter`.
- Environment failure: `gbl-environment-doctor`.
- E2E: `gbl-playwright-e2e`.
- Bug loop: `diagnose` before fixes when root cause uncertain.
- Behavior protection: `tdd` for pure/public behavior where practical; no heavy mocks without user approval.
- Wiki: `gbl-wiki-maintenance` when documented setup/runtime behavior changes.
- Per-slice finish: `verification-before-completion`.
- Final maintainability: `thermo-nuclear-code-quality-review`.
- Final security: `security-review` plus `opengrep scan --config auto`.
- PR body: `rs-mr-description-writer`, then `humanizer` for reviewer-facing clarity.

## Execution rules

- Commit plan alone before implementation.
- One branch. One slice at time.
- Each slice:
  1. Mark active in `Progress`.
  2. Implement smallest complete outcome.
  3. Run fast check, then risk-based checks.
  4. Independent correctness review.
  5. Separate simplification review.
  6. Integrate accepted findings.
  7. Re-run checks.
  8. Update `Progress` with evidence.
  9. Commit slice only.
- No broad formatting pass.
- No unrelated cleanup.
- No dependency addition without current consumer.
- Definition and lockfile change stay same commit.
- Repo pnpm check prefix: `volta run --node 24.16.0 --pnpm 11.6.0 pnpm`.
- Do not use ambient Codex pnpm `11.7.0` to regenerate lockfile.
- Push only after local slice checks pass.
- Read CI after each pushed gate-relevant slice.

## Execution order

1. P0 plan commit.
2. F0 feedback-loop preflight. Runtime evidence only; no code commit.
3. S1 demo-game E2E contract.
4. S2 used UI surface.
5. S3 canonical command/dialog primitives.
6. S4 shared logo-color mapping.
7. S5 shared notification/cockpit invariants.
8. S6 typed learning hook contract.
9. S7 TradingForm behavior.
10. S8 reusable-field accessibility.
11. S9 pnpm/Vercel compatibility.
12. S10 explicit devcontainer game target.
13. S11 final verification and PR evidence.

Stop after F0 if app/OIDC/DB health cannot support fast browser feedback. Do not accept build-only proof for UI slices.

## Slices

### P0. Commit takeover plan

Outcome: durable source of truth.

Do:

- Independent plan review.
- Integrate accepted findings.
- User approval.
- Stage this file only.

Check:

- `git diff --check -- project/2026-07-09-pr-161-ui-extraction-takeover-plan.md`
- `git status --short`

Commit:

- `docs(project): add PR 161 takeover plan`

Stop:

- No implementation before plan approval/commit.

### F0. Restore feedback loop

Outcome: healthy demo app, OIDC, DB, browser route before code changes.

Mutation boundary:

- Runtime state only.
- No repo code commit.
- No cleanup without exact user approval.

Do:

- Audit `git worktree list --porcelain`.
- Audit `devrouter workspace ls --json`.
- Audit `devrouter doctor --repo . --json`.
- List orphan workspace IDs, paths, branches, dirty files, route counts.
- Propose exact cleanup commands.
- Obtain explicit approval before any `dev workspace down`, worktree removal, branch deletion, container deletion, or artifact deletion.
- Restore primary devcontainer with repo-native devrouter/DevPod flow.
- Run `gbl-environment-doctor` checks top-to-bottom.

Check:

- App route returns 200 after first compile.
- OIDC discovery returns 200; issuer matches configured value.
- DB responds; seed contains `PlayerLevel` rows.
- `next dev` process runs; `/tmp/dev.log` has no terminal error.
- Browser login reaches admin dashboard.

Stop:

- Any dirty worktree/container ownership ambiguity.
- App/OIDC/DB still unhealthy after one evidence-based repair loop.

### S1. Restore demo-game E2E contract

Outcome: demo broad flow passes with resilient accessible selectors.

Files:

- `playwright/tests/demo-game-flow.spec.ts`
- `apps/demo-game/src/pages/admin/games/[id].tsx`
- shared form field only if markup defect exists
- plan progress

Do:

- Reproduce current failure first.
- Inspect role/name tree and failure trace.
- Prefer `getByRole('spinbutton', { name: 'Number of segments' })` or label-driven helper.
- Fix missing label association in app before test workaround.
- Remove obsolete Formik comment/positional selector.
- Run whole demo flow, not isolated helper only.

Check:

- `CI=true pnpm --filter @gbl-uzh/playwright check:ts`
- Matching demo app running.
- `CI=true pnpm --filter @gbl-uzh/playwright test:run --project=chromium tests/demo-game-flow.spec.ts`
- Do not run all three game specs against one app stack.
- Push focused pass; verify GitHub matrix reruns each spec against matching app.
- Failure artifacts inspected if any retry fails.

Review:

- Correctness: test asserts durable UI outcome.
- Simplification: selector uses semantic contract, not DOM position.

Commit:

- `test(demo-game): use accessible period controls in game flow`

### S2. Reduce UI package to used surface

Outcome: every new public component has current consumer or explicit stable-contract reason.

Files:

- `packages/ui/src/index.ts`
- `packages/ui/src/components/AssetAllocationMatrix.tsx`
- `packages/ui/src/components/FinancialStatements.tsx`
- `packages/ui/src/components/GenericDataGrid.tsx`
- `packages/ui/src/components/MultiProgress.tsx`
- `packages/ui/src/components/OutlookCard.tsx`
- `packages/ui/src/components/RelativeMeasure.tsx`
- `packages/ui/src/components/RiskScenarioChart.tsx`
- `packages/ui/src/components/WaterfallChart.tsx`
- `packages/ui/package.json`
- `pnpm-lock.yaml`

Do:

- Build import/consumer map.
- Remove zero-consumer files/exports.
- Remove dependencies used only by removed components.
- Keep any component only with named consumer plus focused verification.
- Reassess `react-data-grid`, chart, command, tooltip, icon dependencies.

Check:

- `rg` consumer proof for every retained export.
- `pnpm --filter @gbl-uzh/ui build`
- `pnpm --filter @gbl-uzh/demo-game build`
- `pnpm --filter @gbl-uzh/central-bank build`
- `pnpm --filter @gbl-uzh/rate-wars build`
- `git diff --check`

Review:

- Correctness: removed API has no branch consumer.
- Simplification: no replacement abstraction for unused code.

Commit:

- `refactor(ui): remove unused shared component surface`

### S3. Canonicalize command/dialog primitives

Outcome: one command implementation; one dialog implementation; app copies removed.

Files:

- `packages/ui/src/components/ui/command.tsx`
- `packages/ui/src/components/ui/dialog.tsx`
- `apps/demo-game/src/components/ui/{command,dialog}.tsx`
- `examples/central-bank/src/components/ui/{command,dialog}.tsx`
- `examples/rate-wars/src/components/ui/{command,dialog}.tsx`
- affected imports and package metadata

Do:

- Diff all four copies before choosing canonical behavior.
- Keep one implementation in `@gbl-uzh/ui` when consumer dependency direction permits.
- Update consumer imports.
- Delete proven duplicate files.
- Preserve game-specific variants only with behavior evidence.
- Clean formatting only in touched hunks.

Check:

- `pnpm --filter @gbl-uzh/ui lint`
- `pnpm --filter @gbl-uzh/ui build`
- `pnpm --filter @gbl-uzh/demo-game check`
- `pnpm --filter @gbl-uzh/central-bank check`
- `pnpm --filter @gbl-uzh/rate-wars check`
- `git diff --check`
- Push; confirm Sonar duplicated-line reduction.

Review:

- Correctness: focus management, portal behavior, keyboard handling, class contracts.
- Simplification: one source; no wrapper per game without behavior.

Commit:

- `refactor(ui): canonicalize command and dialog primitives`

### S4. Share logo-color mapping

Outcome: three welcome pages use one color-to-selector contract.

Files:

- `packages/ui/src/components/LogoSelector.tsx`
- `apps/demo-game/src/pages/play/welcome.tsx`
- `examples/central-bank/src/pages/play/welcome.tsx`
- `examples/rate-wars/src/pages/play/welcome.tsx`

Do:

- Move repeated `LOGO_SELECTOR_COLORS_MAP` derivation to shared helper or internal component default.
- Preserve per-game color values, avatar options, fallback, form library integration.
- Avoid game-domain constants in UI package.

Check:

- UI lint/build.
- Three game checks.
- Browser proof: welcome selector renders and submits in each game.
- `git diff --check`.
- Push; read Sonar measure movement.

Review:

- Correctness: every supported color keeps background/ring behavior.
- Simplification: one helper/default; no new configuration layer.

Commit:

- `refactor(ui): share logo selector color mapping`

### S5. Reuse notification and cockpit invariants

Outcome: repeated event/cockpit rules share canonical source; game data mapping remains local.

Files:

- `apps/demo-game/src/components/GameLayout.tsx`
- `examples/central-bank/src/pages/play/cockpit.tsx`
- `examples/rate-wars/src/pages/play/cockpit.tsx`
- `packages/platform/src/types.ts`/exports only if dependency direction is valid
- `packages/ui/src/components/GameSidebar.tsx` only for real shared presentation invariant

Do:

- Replace three local `BaseGlobalNotificationType` enums with canonical platform type/value when already public.
- Consolidate identical event predicates or sidebar assembly only where semantics match.
- Keep game-specific subscription effects and GraphQL mapping local.
- Clean formatting only in touched hunks.
- Stop if proposed helper needs platform to depend on UI.

Check:

- UI build if touched.
- Three game checks.
- Matching browser smoke for countdown/period/segment event handling.
- `git diff --check`.
- Push; gate Sonar new-code duplication <= 3%.

Review:

- Correctness: no cross-game event handling loss.
- Simplification: no generic mega-layout or callback matrix.

Commit:

- `refactor(games): reuse cockpit notification invariants`

### S6. Type learning-activity hook contract

Outcome: shared hook owns learning orchestration without avoidable `any` boundaries.

Files:

- `packages/ui/src/hooks/useLearningActivities.ts`
- `apps/demo-game/src/components/GameLayout.tsx`
- `examples/central-bank/src/pages/play/cockpit.tsx`
- `examples/rate-wars/src/pages/play/cockpit.tsx`
- focused pure tests only when useful without heavy Apollo mocks

Do:

- Query current Apollo typed-document guidance.
- Replace `TypedDocumentNode<any, any>` and transform `any` with minimal explicit generics/types.
- Define input/output contract from data actually used.
- Preserve loading, malformed solution fallback, wrong-answer toast, solved/attempted state, completed dedupe, open ordering.
- Keep Apollo peer/runtime dependency choice explicit.

Check:

- UI lint/build/type declarations.
- Three game checks.
- Browser proof: select; wrong answer; correct answer; completed/open lists.
- `git diff --check`.

Review:

- Correctness: stale query state, malformed JSON, duplicate IDs, empty periods, zero reward.
- Simplification: no second state model beside Apollo unless required.

Commit:

- `refactor(ui): type learning activity orchestration`

### S7. Verify atomic TradingForm behavior

Outcome: buy/sell submit validated volume plus correct modifier exactly once.

Files:

- `packages/ui/src/components/TradingForm.tsx`
- `apps/demo-game/src/pages/index.tsx`
- `examples/rate-wars/src/pages/index.tsx`
- focused test only if behavior can be covered without heavy mocks

Do:

- Query current React Hook Form submission guidance.
- Keep modifier outside form state.
- Remove duplicate implicit/default submit path if it can submit wrong modifier.
- Preserve disabled/loading/validation behavior.
- Confirm zero-volume rule matches intended behavior; do not silently change validation.

Check:

- UI lint/build.
- Demo and Rate Wars checks.
- Browser proof: buy -> `1`; sell -> `-1`; invalid volume rejected; single callback per click.
- `git diff --check`.

Review:

- Correctness: rapid clicks, async rejection, Enter key, disabled side.
- Simplification: one submit helper, no mutable modifier field.

Commit:

- `fix(ui): submit trades atomically`

### S8. Verify reusable-field accessibility

Outcome: labels, numeric roles, descriptions, errors, values form stable accessible contract.

Files:

- `packages/ui/src/components/ReusableFormField.tsx`
- `packages/ui/src/components/ui/form.tsx`
- direct consumers affected by markup changes

Do:

- Verify `htmlFor`, input `id`, description IDs, error IDs, `aria-invalid`.
- Preserve empty numeric input while converting valid integer/float values.
- Remove explanatory comments that restate code.
- Do not broaden component API without current consumer.

Check:

- UI lint/build.
- Affected game checks.
- Browser role/name inspection.
- Focused Playwright assertion for labeled text and number inputs.
- `git diff --check`.

Review:

- Correctness: SSR IDs, error state, empty/zero/decimal handling.
- Simplification: standard input props; no bespoke accessibility layer.

Commit:

- `fix(ui): expose accessible reusable form fields`

### S9. Restore pnpm 9/11 and Vercel compatibility

Outcome: frozen install succeeds in repo toolchain and Vercel toolchain; no global security bypass.

Files:

- `package.json`
- `pnpm-workspace.yaml`
- `.npmrc`
- `pnpm-lock.yaml`
- `apps/website/vercel.json` only when current checkout evidence needs submodule initialization

Do:

- Query current pnpm docs for override/config placement.
- Reproduce pnpm `9.15.9` frozen install.
- Add pnpm 9-compatible root override metadata while retaining pnpm 11 source of truth as needed.
- Exclude submodule/non-workspace apps only when Vercel checkout evidence requires it.
- Remove `minimum-release-age=0`.
- Regenerate lockfile with pinned repo pnpm `11.6.0`.
- Do not upgrade major packages.
- Expect chained Vercel blockers; rerun until deployment reaches build/result.
- If the checkout omits the tracked website-content submodule, initialize it in the project build command before Turbo runs.

Check:

- `CI=true npx pnpm@9.15.9 install --frozen-lockfile --ignore-scripts`
- `CI=true volta run --node 24.16.0 --pnpm 11.6.0 pnpm install --frozen-lockfile --ignore-scripts`
- Three game builds plus website build if install reaches it.
- Push; Vercel status green.
- Confirm no secret values in logs/diff.

Review:

- Correctness: pnpm 9 and 11 interpret equivalent overrides/workspaces.
- Simplification: minimum compatibility metadata; no duplicated config beyond required version bridge.

Commit:

- `build(workspace): restore pnpm 9 and 11 compatibility`

### S10. Make devcontainer game targeting explicit

Outcome: workspace token controls isolation; explicit game target controls package/schema/server.

Files:

- `.devrouter.yml`
- `.devcontainer/post-create.sh`
- `.devcontainer/post-start.sh`
- `.devcontainer/docker-compose.yml` or env templates only if needed
- `docs/` plus devrouter skill if user-facing behavior changes

Precondition:

- Audit existing worktrees/routes/containers.
- Before cleanup: list exact workspace, path, branch, dirty state, command.
- Obtain explicit approval for any `dev workspace down`, worktree removal, branch deletion, or artifact deletion.

Do:

- Keep devrouter `0.0.25` unless current official release differs and user approves upgrade.
- Define explicit allowed target mapping:
  - demo -> `@gbl-uzh/demo-game`
  - central bank -> `@gbl-uzh/central-bank`
  - rate wars -> `@gbl-uzh/rate-wars`
- Default demo game.
- Reject unknown target early.
- Use same target for Prisma copy/generate/push/seed and dev server.
- Keep `WORKSPACE` for route/container alias only.
- Ensure post-start process detection cannot mistake another Next process.
- Refresh devrouter agent artifacts only when generated content genuinely changes.

Check:

- `devrouter -V --repo .`
- `devrouter doctor --repo .`
- `devrouter app ls --repo .`
- Start representative workspaces with repo-local `trees/` paths.
- Verify at least two workspaces concurrently:
  - distinct HTTPS hosts;
  - distinct DB routes/volumes;
  - correct target app;
  - OIDC discovery healthy;
  - app 200 after first compile.
- Run matching focused Playwright spec against each target.
- Tear down only created test workspaces after dirty-state audit and approval already covers command.

Review:

- Correctness: routing identity, game target, DB schema cannot cross.
- Simplification: one target resolver shared by lifecycle scripts or one tiny shell function; no branch-name heuristics.

Commit:

- `fix(devcontainer): select game package explicitly`

### S11. Final branch verification and PR evidence

Outcome: current head demonstrably merge-ready.

Do:

- Sync target before final reviews only if needed; preserve branch history intentionally.
- Run full fresh verification.
- Run mandatory security review.
- Run Opengrep.
- Run thermo-nuclear maintainability review.
- Run independent final branch review.
- Integrate or explicitly defer each valid finding.
- Any target-sync conflict resolution or accepted code finding becomes focused fix slice:
  - named outcome;
  - relevant check;
  - correctness review;
  - simplification review;
  - conventional commit.
- Restart S11 verification after final code SHA changes.
- Capture browser screenshots from real local environments.
- Update plan progress.
- Rewrite PR body with full branch diff/history, checks, screenshots, manual gates.
- Keep PR draft until all gates green and user approves ready state.

Check:

- `git diff --check origin/dev...HEAD`
- `pnpm --filter @gbl-uzh/ui lint`
- `pnpm --filter @gbl-uzh/ui build`
- `pnpm --filter @gbl-uzh/demo-game exec prettier --check "../../packages/ui/src/**/*.{ts,tsx}"`
- `pnpm --filter @gbl-uzh/demo-game build`
- `pnpm --filter @gbl-uzh/central-bank build`
- `pnpm --filter @gbl-uzh/rate-wars build`
- `pnpm --filter @gbl-uzh/demo-game check`
- `pnpm --filter @gbl-uzh/central-bank check`
- `pnpm --filter @gbl-uzh/rate-wars check`
- `CI=true pnpm --filter @gbl-uzh/playwright check:ts`
- Demo-game full flow.
- Central Bank full flow.
- Rate Wars full flow.
- `opengrep scan --config auto`
- GitHub build/lint green.
- Three Playwright jobs green.
- Sonar quality gate green.
- Vercel green.
- No unresolved human review comments.
- `git status --short` contains only known user-owned artifacts, if still present.

Browser evidence:

- Demo Game:
  - welcome desktop/mobile;
  - admin add-period dialog with labeled numeric control;
  - player cockpit learning-activity modal;
  - TradingForm buy/sell state if rendered in demo flow.
- Central Bank:
  - welcome selector;
  - player cockpit shared sidebar/learning/story state.
- Rate Wars:
  - welcome selector;
  - player cockpit shared sidebar/learning/story state.
- Include URLs, viewport sizes, commit SHA, scenario labels in PR.

Commit:

- `docs(project): record PR 161 verification`
- Plan/evidence only. No code fixes folded into this commit.

PR update:

- Use `rs-mr-description-writer`.
- Use `humanizer` after factual body complete.
- Title stays conventional and whole-branch accurate.
- Do not mark ready or merge without user approval.

## Acceptance criteria

- [ ] Plan reviewed, approved, committed alone.
- [ ] Every new `@gbl-uzh/ui` export has current consumer or explicit stable-contract rationale.
- [ ] Zero-consumer speculative components/deps removed or explicitly approved.
- [ ] Shared hook contains no avoidable `any` boundary.
- [ ] TradingForm buy/sell modifiers submitted atomically.
- [ ] Numeric fields expose correct accessible role/name.
- [ ] Demo, Central Bank, Rate Wars builds pass.
- [ ] Demo, Central Bank, Rate Wars Playwright flows pass.
- [ ] New-code duplication <= 3%.
- [ ] pnpm 9.15.9 frozen install passes.
- [ ] pnpm 11.6.0 frozen install passes.
- [ ] `.npmrc` does not globally disable release-age policy unless explicitly approved.
- [ ] Vercel preview passes.
- [ ] Parallel devrouter workspaces verified with distinct routes and correct game targets.
- [ ] Local app/OIDC/DB health verified.
- [ ] `git diff --check` clean.
- [ ] Opengrep reviewed.
- [ ] Security review handled/deferred explicitly.
- [ ] Thermo-nuclear review handled/deferred explicitly.
- [ ] Independent final branch review handled/deferred explicitly.
- [ ] Screenshots attached to PR.
- [ ] PR body matches current commits/diff/checks.
- [ ] No unresolved review comments.
- [ ] User approves ready-for-review transition.

## Risks

- Wide branch hides behavior regressions. Control: slice, build, browser flow each boundary.
- Shared abstraction may erase game differences. Control: shared UI contracts; game adapters retain domain mapping.
- Package peer/runtime deps may duplicate React/Apollo. Control: inspect bundle/externalization and consumer installs.
- pnpm 9 bridge may drift from pnpm 11 lockfile. Control: run both frozen installs on every metadata change.
- First Vercel blocker may hide later blockers. Control: rerun until terminal green state.
- Sonar fix may tempt exclusions. Control: code reuse first; no gate suppression without approval.
- Devcontainer cleanup may destroy user work. Control: dirty audit plus exact-command approval.
- Workspace substring targeting may start wrong app/schema. Control: explicit validated target.
- Browser first compile may exceed proxy timeout. Control: wait for compile; verify second request; do not mask persistent 502.
- Global release-age bypass increases supply-chain exposure. Control: remove by default.

## Progress

### Status

- Current: S11 active. GitHub Actions green; focused Sonar duplication and Vercel content-checkout fixes in progress.
- Implementation: P0, F0, S1-S10 complete and pushed through `5620460`; S11 verification/fixes active.
- Branch mutations this takeover: P0-S10 commits through `5620460`; no user-owned artifacts changed.
- User-owned untracked artifacts: preserved.

### Evidence collected

- [x] Handoff reviewed.
- [x] Antigravity conversation/artifacts reviewed.
- [x] Branch/worktree/commit state verified after fetch.
- [x] Live PR metadata/checks/comments/reviews verified.
- [x] Demo Playwright failure identified.
- [x] Sonar duplication files measured.
- [x] Vercel install failure identified.
- [x] Devrouter config/version/doctor/routes checked.
- [x] Local app/OIDC probes attempted; both 502.
- [x] Unused public UI exports verified.
- [x] Ambient vs pinned pnpm versions verified; Volta command selected.
- [x] Independent plan review complete.
- [x] Accepted plan findings integrated.
- [x] User approves final plan.
- [x] Plan committed alone as `f730ca8`.
- [x] Existing primary DevPod workspace restarted without cleanup.
- [x] Host app and OIDC routes return 200; issuer is `https://oidc.demo-game.localhost/default`.
- [x] In-container app returns 200; demo DB contains four `PlayerLevel` rows.
- [x] Real admin OIDC Playwright setup passes.
- [x] Period and countdown labels now expose matching accessible numeric controls.
- [x] Demo Playwright selectors use stable role/name contracts, not DOM positions.
- [x] `react-dice-complete` UMD double-default interop normalized at the shared `Die` boundary.
- [x] `@gbl-uzh/ui` build passes.
- [x] Playwright TypeScript check passes.
- [x] Full demo flow passes: 2/2 in 43.9 seconds.
- [x] S1 correctness review found no defects; React 19 peer mismatch recorded as pre-existing limitation.
- [x] S1 simplification review complete; unsafe `any`, non-semantic selector, and speculative ID-prefix suggestions deferred.
- [x] S1 CI: lint and all three matching Playwright jobs pass.
- [ ] S1 CI: build still pending at readback; Sonar duplication and Vercel remain red for S3-S5 and S9.
- [x] S2 consumer map proves eight new public components have no tracked consumer.
- [x] Eight zero-use files and exports removed without replacement abstraction.
- [x] Unused UI `formik` peer and all four `react-data-grid` declarations removed.
- [x] pnpm 11.6.0 frozen install passes; lockfile loses the package entirely.
- [x] UI bundle shrank from 288.58 kB to 254.24 kB; UI build passes.
- [x] Demo Game, Central Bank, and Rate Wars production builds pass.
- [x] S2 correctness review found no defects or dangling tracked consumers.
- [x] S2 simplification review finding integrated; all three game-level grid dependencies removed.
- [x] S2 CI lint passes; Central Bank Playwright passes at readback.
- [ ] S2 Sonar remains red at 13.2% new-code duplication; S3 removes the six largest identical primitive copies.
- [x] S3 comparison proves six app-local command/dialog files are behavior-identical and unused.
- [x] Canonical Radix dialog focus, Escape, portal, and focus-return behavior preserved.
- [x] Canonical cmdk combobox, arrow-key, and selection behavior preserved.
- [x] Shared runtime peers for Radix Dialog, cmdk, and Lucide declared explicitly.
- [x] pnpm 11.6.0 frozen install passes after peer declarations; lockfile correctly has no peer-only delta.
- [x] UI bundle shrank from 254.24 kB to 182.77 kB; UI build passes.
- [x] Demo Game, Central Bank, and Rate Wars production builds pass with peer externalization.
- [x] S3 correctness review found no defects or dangling imports.
- [x] S3 simplification review otherwise clean; stale-lock finding rejected by authoritative frozen install.
- [x] S3 CI: lint and all three Playwright jobs pass; Sonar duplication falls from 13.2% to 4.3%.
- [ ] S3 build remains pending at readback; Vercel remains red for S9.
- [x] S4 `LogoSelector` accepts each game's raw `COLORS` map and derives the selected ring/background internally.
- [x] Three duplicate eager reducers removed; per-game colors, avatars, fallbacks, forms, and submits preserved.
- [x] Image fallback now uses typed `currentTarget`; prior `no-extra-semi` lint defect removed.
- [x] UI build passes; all required ring/background utilities appear in generated CSS.
- [x] Demo Game, Central Bank, and Rate Wars fresh production Next builds pass after final simplification.
- [x] Full demo browser flow passed 2/2 immediately before the final API simplification.
- [ ] Post-simplification local browser rerun blocked by desktop approval quota; require three green GitHub Playwright jobs after push.
- [x] S4 correctness review found no defects; tracked consumers complete.
- [x] S4 simplification finding integrated; public helper/type/barrel export removed.
- [x] S4 CI: lint, Central Bank Playwright, and Rate Wars Playwright pass at readback.
- [ ] S4 demo Playwright/build pending at readback; local full demo flow passes.
- [ ] S4 Sonar remains red at 4.4% new-code duplication; S5 removes the remaining repeated event predicates.
- [x] S5 browser-safe `shouldRefetchGameResult` owns the three shared refresh event strings and strict game-ID match.
- [x] Direct platform enum import rejected because frontend platform imports can pull Prisma runtime code into the browser.
- [x] Countdown toasts and sidebar assembly remain local because behavior differs across games.
- [x] Predicate truth table covers all three accepted types plus null, unknown, and wrong-game cases.
- [x] UI build and all three fresh production Next builds pass.
- [x] Full demo lifecycle passes 2/2, exercising period/segment/countdown subscription refreshes.
- [x] S5 correctness review found no functional defects.
- [x] S5 simplification review found no abstraction issue; Rate Wars CRLF finding integrated.
- [x] UI lint passes after removal of the S6 explicit-`any` debt.
- [ ] Full game `check` scripts retain pre-existing formatter incompatibility and planned S7/report type debt; production builds pass.
- [ ] Demo app full TypeScript check remains red on the branch's known S5-S7 migration debt.
- [x] Current Apollo typed-document guidance confirmed that generated `TypedDocumentNode` results and variables should drive hook inference.
- [x] The learning hook now constrains only the query and mutation fields it reads while preserving each generated query's complete result type for consumers.
- [x] Explicit `any` transforms are removed; malformed/non-integer solution JSON falls back to no selected answers.
- [x] Query results are matched to the active learning ID, unknown server states map to `UNATTEMPTED`, and nullable activity content no longer crashes consumers.
- [x] Missing attempt scores cannot compare equal and falsely solve an activity; numeric `0 === 0` remains valid.
- [x] Completed-item dedupe and ordering, open-item ordering, empty periods, wrong-answer toast, and solved/attempted transitions are preserved.
- [x] UI lint and UI build/type declarations pass; Central Bank `check:ts` passes.
- [x] Demo and Rate Wars `check:ts` contain no S6 errors; remaining failures belong to existing report debt and S7 TradingForm/form-state debt.
- [x] Demo Game and Rate Wars production builds pass; Central Bank passes with a non-secret local `NEXT_PUBLIC_API_URL` after its Google Font fetch was allowed.
- [x] Full demo flow passed cleanly before review fixes; after fixes it passed on retry with one unrelated dice-popup timeout recorded as an existing flake.
- [x] S6 correctness review findings integrated: missing-score equality, nullable nested element, and stale response matching.
- [x] S6 simplification findings integrated: mutation-result generic removed and active-ID dependency made purposeful.
- [x] Current React Hook Form guidance confirms `handleSubmit` should own validated values while the selected trade action stays in an external closure.
- [x] Buy and Sell now invoke one shared typed submission factory with modifiers `1` and `-1`; the form has no implicit default trade.
- [x] Successful callbacks reset the shared form; rejected callbacks retain the entered volume and React Hook Form owns `isSubmitting` for the awaited call.
- [x] Stale Formik helper arguments and consumer-owned reset calls are removed from Demo Game and Rate Wars.
- [x] Focused browser coverage proves invalid volume disables both actions, Enter submits nothing, each action emits exactly once with the correct modifier, and success resets to zero.
- [x] The focused regression was moved into the exact `demo-game-flow.spec.ts` path selected by CI after independent review caught an unselected standalone spec.
- [x] UI lint/build and Playwright TypeScript pass; Demo Game and Rate Wars production builds pass.
- [x] Demo and Rate Wars `check:ts` no longer report TradingForm callback errors; remaining failures are planned S8/report/domain typing debt.
- [x] Exact CI-selected demo Playwright file passes 3/3, including the full lifecycle and TradingForm regression.
- [x] S7 correctness review has no remaining findings after the CI-selection fix.
- [x] S7 simplification review accepts the handler structure; console interception remains an explicit E2E seam because the demo callback has no durable external effect and no component-test harness exists.
- [x] Accessibility-compliance guidance applied to reusable label, invalid-state, error-reference, and live-error semantics.
- [x] Reusable field props now exclude controlled/ID attributes, thread React Hook Form context/transformed-value generics, and preserve empty numeric input plus integer/float conversion.
- [x] Form contexts now fail clearly outside their providers; `aria-invalid`, `aria-errormessage`, described-by error IDs, and alert roles form one stable error contract.
- [x] The UI package declares its React Hook Form runtime imports as peers and pins React 19 only for local development while retaining the published React 18-or-19 peer range.
- [x] Aligning the UI development peer set removes the duplicate React 18 React Hook Form type instance and its lockfile snapshots; the Demo reusable-field/Form type errors are gone.
- [x] Demo portfolio form values are explicit at `useForm` and `Form` boundaries.
- [x] Frozen pnpm 11.6.0 install, UI lint/build/declarations, Playwright TypeScript, and all three production app builds pass.
- [x] Focused browser proof covers label-to-input ID, numeric role/name, invalid/error references, error alert, valid cleanup, empty clearing, and integer submission.
- [x] Exact CI-selected demo Playwright file passes 3/3 after S8.
- [x] S8 correctness and simplification reviews found no defects; residual limits are no dedicated SSR hydration or React 18 consumer test and no current float consumer.
- [x] Current pnpm guidance confirms workspace overrides are the pnpm 11 source of truth; pnpm 11 no longer reads `package.json#pnpm` settings.
- [x] Local pnpm 9.15.9 reproduced Vercel's frozen lockfile configuration mismatch before the S9 change.
- [x] Root package overrides now mirror the three workspace overrides exactly as the pnpm 9 compatibility bridge; pnpm 11 continues to ignore that block and use the workspace file.
- [x] Frozen installs pass with pnpm 9.15.9 and pinned pnpm 11.6.0; no effective override changed, so the lockfile remains untouched.
- [x] Deleted the `.npmrc` `minimum-release-age=0` supply-chain bypass; npm no longer reports an unknown configuration key.
- [x] S9 correctness and simplification reviews found no defects; duplicated overrides must remain synchronized, and no deliberate non-zero release-age policy is configured yet.
- [x] The next Vercel deployment passes pnpm 9 frozen install and reaches the website prerender.
- [x] Vercel then fails because its checkout omits tracked `apps/quartz` content (`Lives In Transit.md`); local website build succeeds with the initialized submodule.
- [x] Independent review corrected the Vercel config scope: the project root is `apps/website`, so `apps/website/vercel.json` initializes only `apps/quartz` and runs only the website build.
- [x] The exact website-scoped submodule command and production website build pass locally; Vercel Git access to `uzh-bf/gbl-knowledge` remains to be verified on the preview.
- [x] Focused S9 Vercel configuration committed and pushed as `0a8c0dd`; Vercel deployment readback pending.
- [x] S10 maps `demo`, `central-bank`, and `rate-wars` explicitly to one package resolver shared by post-create and post-start.
- [x] S10 keeps `WORKSPACE` only for routing/container identity and preserves an explicit runtime target across env-file loading.
- [x] The same resolved package drives Prisma copy/generate/push/seed and the dev server; unknown targets fail before lifecycle work.
- [x] Both devcontainer configurations now shadow every selectable game's `node_modules`, including the review-found Central Bank starter mount.
- [x] Correct-server detection accepts Volta/Corepack `pnpm` command paths; a foreign `next dev` is rejected rather than mistaken for the selected target.
- [x] S10 correctness and simplification reviews completed; the two accepted P1 findings and the unrelated Markdown-callout regression were fixed and rechecked.
- [x] S10 shell syntax, resolver allowed/rejection matrix, both Compose configurations, devrouter configuration, and OKF documentation validation pass locally.
- [ ] S10 concurrent full workspace proof is a manual gate: six pre-existing orphaned routes are user-owned and lifecycle teardown needs explicit approval.
- [x] S10 committed and pushed as `5620460`; GitHub build, lint, and all three Playwright jobs pass.
- [x] S11 Sonar readback: sole failing gate is new-code duplication at 4.2% (`138/3303` lines); at least 39 duplicated lines must be removed.
- [x] S11 Vercel readback: pnpm 9 install passes and the public Quartz submodule exists; Linux prerender exposes Title Case reconstruction (`Lives In Transit.md`) mismatching the tracked `Lives in Transit.md` filename.
- [x] S11 shared `LearningActivityModal` replaces the repeated modal/display/selection block in all three games without leaking generated GraphQL types into the UI package.
- [x] S11 Sonar-fix verification: UI lint/build and all three production game builds pass; Central Bank uses a non-secret local `NEXT_PUBLIC_API_URL` for prerender.
- [x] S11 Sonar-fix correctness review found no defects; simplification review findings were integrated by preserving functional selection updates and each example's prior loading behavior.

### Next action

Commit and push the reviewed shared-modal fix, confirm Sonar <= 3%, then resolve Vercel slugs against exact tracked filenames.

## Independent plan review

- Reviewer: Codex review subagent `/root/review_pr161_plan`.
- Preferred `droid`/GLM review attempt: unavailable after MCP startup failure; Codex fallback used.
- Status: `DONE_WITH_CONCERNS`; no critical findings.
- Important findings:
  - Browser feedback loop appeared after UI slices.
  - UI/logic slices bundled unrelated horizontal work.
  - UI/example lint and formatting gates incomplete.
  - Final review fixes lacked code commit boundaries.
- Accepted changes:
  - Added F0 environment/browser preflight.
  - Moved demo E2E fix to first code slice.
  - Split primitives, logo mapping, notification rules, hook, TradingForm, accessibility into separate commits.
  - Added explicit UI lint, game checks, UI Prettier check.
  - Limited formatting cleanup to touched hunks.
  - Added focused fix-slice rule for sync/review code changes.
  - Corrected Playwright guidance: one matching app/spec per local stack.
- Deferred changes: none.
- Reviewer limitation: local repo/diff checked; live GitHub/Sonar/Vercel claims not re-queried by reviewer.

## Next Steps

1. Execute S6 typed learning-hook contract.
2. Push S6 and read lint/type/Playwright movement.
3. Continue one reviewed, verified commit per slice through S10.
4. Restart S11 verification after the final code SHA changes.
