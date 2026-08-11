# PR #185 Native Development Mode Finalization

## Identity

- Plan: `project/2026-08-11-pr-185-native-dev-mode-finalization-plan.md`
- Branch: `enhance/native-dev-mode`
- Worktree: `trees/enhance/native-dev-mode`
- Target: `dev`
- Pull request: [#185](https://github.com/uzh-bf/gbl-uzh/pull/185)
- Ceremony: full path; the branch changes authentication policy and a public platform export.
- History: commits `7e5c27f..7b05db3` predate this retrospective contract. The 2026-08-05 review covered only `254606c..ff31321`; it is historical evidence, not a current-head gate.

## Goal

- Problem: the draft adds native demo-game development and shared mock OIDC configuration, but head `7b05db3` breaks the CI auth topology, leaves example games on inconsistent auth contracts, permits a smoke false positive, adds unexplained generated GraphQL output, and fails Sonar's new-code duplication gate.
- Goal: make native host, starter-devcontainer, devrouter-devcontainer, and three-game CI paths coherent and proven, then make PR #185 review-ready.
- Non-goals: migrate example games to the new auth resolver; add native host mode for example games; upgrade devrouter; merge the PR; remove verification containers or worktrees.
- Decision: keep the new fail-closed resolver for demo-game, restore central-bank's legacy auth contract, and provide fake local `AUTH0_*` aliases so central-bank and rate-wars remain supported in devcontainers and CI. See ADR-0001.
- Base evidence: `dev` is eight commits ahead only through a merge-and-revert sequence; `git diff 254606c..origin/dev` is empty, so no base update changes the tree.

## Research and Reviews

- Live PR evidence: head `7b05db3` is draft and mergeable; demo-game and central-bank Playwright jobs fail; Sonar reports 10.4% duplication on new code.
- CI evidence: demo-game reaches `OAuthSignin`; central-bank exits because `GBL_MOCK_OIDC_ISSUER` is absent.
- Sonar evidence: duplicated new lines are the matching demo/central-bank Prisma and auth adapter changes.
- External review evidence: `.devcontainer/smoke.sh` accepts any successful `/admin/login` response without checking the expected sign-in UI.
- Standards review: full-path plan and final gates were missing.
- Spec review: central-bank migration and generated `GameWithoutFacts` output exceed the demo-only host package; devrouter was not re-proven.
- Planning-stage reviewers: Codex planner passes on 2026-08-11. Accepted findings: preserve both auth namespaces for supported targets; use one exact CI app hostname and the `oidc` service alias; add ADR-0001; audit all 31 files; require live proof in all three local modes.
- Limitation: static configuration and rendered Compose are not runtime proof. Each mode records static, local process, live browser, and CI evidence separately.

## Commit `7b05db3` Acceptance Ledger

| File | Decision | Required evidence or correction |
| --- | --- | --- |
| `.agents/skills/gbl-environment-doctor/SKILL.md` | Rework | Add native-host routing and mode-specific smoke guidance. |
| `.agents/skills/gbl-playwright-e2e/SKILL.md` | Rework | Match job-service CI and namespaced devrouter proof. |
| `.devcontainer/README.md` | Rework if needed | State demo resolver versus legacy example aliases accurately. |
| `.devcontainer/devcontainer.env` | Rework | Add fake legacy `AUTH0_*` aliases for example targets. |
| `.devcontainer/docker-compose.yml` | Keep | Prove routed issuer DNS, TLS, and CA path live. |
| `.devcontainer/post-create.sh` | Verify or reduce | Retain heap/pnpm changes only when fresh lifecycle evidence requires them. |
| `.devcontainer/post-start.sh` | Verify or reduce | Keep workspace URL rewrite; justify unrelated pnpm setting. |
| `.devcontainer/smoke.sh` | Rework | Assert sign-in content, add bounded discovery, and resolve selected game package. |
| `.devcontainer/starter/starter.env` | Rework | Add fake legacy `AUTH0_*` aliases for example targets. |
| `README.md` | Rework | Separate host, starter, and container-side devrouter commands. |
| `apps/demo-game/.env.development` | Keep | Prove native mock defaults and process-env precedence. |
| `apps/demo-game/.env.local.template` | Keep | Preserve explicit real-Auth0 opt-in. |
| `apps/demo-game/README.md` | Rework if needed | Match the proven mode matrix. |
| `apps/demo-game/src/graphql/generated/ops.ts` | Regenerate and bound | Remove `GameWithoutFacts` if no source operation reproduces it; exclude unrelated historical generator drift. |
| `apps/demo-game/src/lib/authOptions.ts` | Keep | Shared resolver consumer. |
| `apps/demo-game/src/lib/prisma.ts` | Keep | Standalone Next-style environment bootstrap. |
| `docker-compose.yml` | Keep | Prove conflict-safe native overrides. |
| `docs/building-with-an-agent.md` | Rework if needed | Match starter proof and auth split. |
| `docs/deploying-a-game.md` | Keep | Production Auth0 contract. |
| `docs/developing-a-game.md` | Rework | Scope standalone bootstrap to demo-game. |
| `docs/log.md` | Rework | Record the final verified scope, not intended standardization. |
| `examples/central-bank/README.md` | Revert | Example migration is out of scope. |
| `examples/central-bank/src/lib/authOptions.ts` | Revert | Preserve legacy contract. |
| `examples/central-bank/src/lib/prisma.ts` | Revert | Native bootstrap is not needed for this example. |
| `packages/platform/package.json` | Keep | Focused auth test command. |
| `packages/platform/src/index.ts` | Keep | ADR-governed public resolver export. |
| `packages/platform/src/lib/auth.test.ts` | Keep and extend only if needed | Protect mode selection and production fail-closed behavior. |
| `packages/platform/src/lib/auth.ts` | Keep | ADR-governed policy. |
| `playwright/README.md` | Keep | Focused auth command and exact hostname guidance. |
| `playwright/package.json` | Keep | Focused auth setup command. |
| `playwright/playwright.config.ts` | Keep pending live proof | Scoped HTTPS `.localhost` resolver. |

## Mode Matrix

| Mode | App and issuer | Environment path | Required proof |
| --- | --- | --- | --- |
| Native host | `http://localhost:<app-port>` and `http://localhost:<oidc-port>/default` | demo `.env.development`; explicit process overrides for conflict-safe ports | root Compose, `setup:host`, smoke, Playwright auth, browser callback |
| Starter devcontainer | `http://localhost:3000` and `http://localhost:8090/default` | `starter.env`, re-sourced by lifecycle scripts | fresh lifecycle logs, in-container smoke, host Playwright callback and authenticated screenshot |
| Devrouter devcontainer | namespaced HTTPS app/OIDC routes; app remains `http://localhost:3000` in-container | `devcontainer.env`, workspace rewrite in `post-start.sh`, mounted CA | `workspace ensure`, route probes, container smoke, host Playwright and browser callback |
| CI | `http://localhost:3000` app and `http://oidc:8090/default` issuer | workflow provides demo `GBL_*` and legacy example `AUTH0_*` variables | all three matrix jobs and Sonar green on exact head |

## Test Portfolio

| Risk | Obligation | Stable seam | Distinct failure | Slice |
| --- | --- | --- | --- | --- |
| Mock/Auth0 selection and production fail-closed | Extend existing only if uncovered | platform `test:auth` | mock accepted in production or stale Auth0 silently selected | S2 |
| CI app/issuer coherence | No new test | existing browser callback in game matrix | `OAuthSignin` or missing variable | S2/S3 |
| Smoke false positive | No test file | positive UI-body probe plus negative wrong-body probe | unrelated 200 response passes | S2 |
| Standalone environment loading | No unit test | demo `build:nexus` | resolver runs before env files load | S2 |
| Compose validity | Existing checks | all three rendered Compose combinations | invalid mounts, env, or networking | S2 |
| Authenticated callback in each local mode | Existing Playwright setup | `test:auth` plus browser session | discovery works but OAuth callback fails | S3 |
| Example-game compatibility | Existing CI and source comparison | central-bank/rate-wars flows | mixed namespace breaks supported target | S2/S4 |
| Generated output integrity | Regenerate against the current sources | Exact pre-Jakob baseline plus absence of `GameWithoutFacts` | generated API with no source operation | S2 |

## Slices

### S1: Retrospective contract and auth-policy ADR

- Do: commit this plan, then ADR-0001 separately.
- Check: plan names PR, branch, target, worktree, ledger, matrix, portfolio, and stop gates; ADR passes the three-part decision gate.
- Commit: `docs(project): add PR 185 finalization plan`; `docs(adr): record production admin auth policy`.

### S2: Corrective tracer bullet

- Do: correct CI variables and app hostname; add local legacy aliases; harden smoke; restore central-bank; regenerate GraphQL output; keep or remove lifecycle edits by evidence; align directly affected docs and skills.
- Check: platform auth tests; app/platform type, lint, and build checks; `bash -n`; all Compose renderings; codegen cleanliness; Playwright list; `git diff --check`; data hygiene.
- Review: immutable corrective commit gets the dedicated simplifier and one auth/CI intermediate reviewer. Resolve verified findings before S3.
- Commit: `fix(devcontainer): restore auth compatibility across development modes`.

### S3: Live mode proof

- Do: verify native host, canonical starter, and namespaced devrouter serially. Temporarily stop and restart the approved `gbl-trpc-examples` app container only for canonical starter ports. Preserve every environment after proof unless cleanup is separately approved.
- Check: each mode records lifecycle output, smoke, Playwright auth, and browser callback. Static rendering cannot substitute for runtime proof.
- Commit: plan progress and evidence only after runtime behavior is confirmed.

### S4: Exact-head PR and final gates

- Do: push the existing draft, wait for exact-head CI and Sonar, finish evidence-backed docs/skills, compute substantive size, and update plan progress.
- Check: bounded code-level security review, strict maintainability review, and integrated final outcome review on the exact final range; repeat applicable gates after behavioral changes.
- Publish: update the existing PR body and mark ready only when all checks, Sonar <=3%, three local modes, and review findings are closed.
- Stop: never merge.

## Progress

- [x] Live PR, branch, base, CI, Sonar, comments, and historical review reconciled.
- [x] Standards/spec reviews and exhaustive 31-file audit complete.
- [x] User approved preserving legacy example-game auth and temporarily stopping/restarting the conflicting starter app container.
- [x] Planning-stage reviews complete; accepted findings are integrated above.
- [x] S1 plan and ADR committed (`27547ca`, `6ccc5c9`).
- [x] S2 corrective tracer bullet committed (`703694f`) and locally verified. The intermediate reviewer requested restoration of the configurable fresh-install heap guard; that adjustment and its shell and Compose checks are included in the follow-up commit. The configured native simplifier role is unavailable in this client, so its result is recorded as `BLOCKED` without substitution. Fresh evidence: auth tests 7/7; platform/demo/central-bank/rate-wars/Playwright type checks; platform/UI/demo production builds; all three app linters with pre-existing warnings only; all Nexus builds; shell syntax; three Compose renderings; Playwright lists all five tests; Prettier and OKF checks. `actionlint` is not installed; exact-head GitHub Actions remains the workflow parser gate.
- [x] S3 native, starter, and devrouter live proof complete. Native used isolated ports `13000`/`18090`/`55433` and passed `setup:host`, smoke, Playwright auth, and an independent browser callback. Devrouter completed a fresh empty-store lifecycle, namespaced host and container route probes, smoke, warmed Playwright auth, and an independent HTTPS browser callback. Starter completed an independent fresh lifecycle, smoke, Playwright auth, and an authenticated Playwright screenshot on the canonical localhost ports. The initial mode switch exposed a shared `.next` cache stall; per-project container cache volumes now isolate Linux artifacts from the host, and both container modes passed smoke and Playwright auth again from empty cache volumes. Agent-browser 0.32.2 with Chrome 149 could render starter HTML but its Next 16 HMR client did not activate the sign-in control; Playwright 1.61.1 completed the same live callback and authenticated page. The approved `gbl-trpc-examples` app container was stopped for starter proof and restarted on its original ports afterward.
- [x] The first integrated final review on `029dd88` found two documentation-contract regressions: starter commands selected the new native Compose file, and container Auth0 opt-in was claimed through an overridden `.env.local`. All current starter instructions now select `.devcontainer/starter/docker-compose.yml` explicitly, including the first-game brief, and real Auth0 opt-in is scoped to native host mode. The corrected range requires a fresh final review before publication.
- [ ] S4 exact-head CI/Sonar and final gates complete; PR body current and ready.

## Stop Gates

- Stop before publication if any local mode lacks live callback proof.
- Stop if exact-head CI or Sonar is red.
- Stop if a required reviewer is unavailable.
- Stop before stopping another environment unless its exact stop/restart was approved.
- Stop before cleanup, deployment, publication outside the existing draft PR, or merge without separate authority.
