# PR #185 Native Development Mode Finalization

## Identity

- Plan: `project/2026-08-11-pr-185-native-dev-mode-finalization-plan.md`
- Branch: `enhance/native-dev-mode`
- Worktree: `/Users/rschlae/Git/gbl/gbl-uzh/trees/enhance/native-dev-mode`
- Target: `dev`
- Pull request: [#185](https://github.com/uzh-bf/gbl-uzh/pull/185)
- Ceremony: full path; the branch changes authentication policy and exports a public platform resolver.
- Pre-extension checkpoint: `8f4cbea` passed the original package's local modes, reviews, CI, and Sonar on 2026-08-11. Those final gates are historical after the approved extension below; the global handoff records the current post-plan SHA.

## Goal

- Problem: Central Bank and Rate Wars reach the local OIDC mock through copied fake `AUTH0_*` aliases while demo-game uses `resolveAdminOidcConfig()`. The compatibility bridge leaves in-repository games on different authentication contracts and can drift from the platform's production fail-closed policy.
- Goal: make all three games consume the shared resolver, make `GBL_MOCK_OIDC_*` the only local mock contract, preserve real `AUTH0_*` production behavior, and return PR #185 to an exact-head reviewed and green state.
- Non-goals: add native mock startup or root Compose support for the example games; modify or rebase the open tRPC example stack; add an auth provider or dependency; merge the PR; remove containers, volumes, branches, or worktrees.
- Decision: starter, devrouter, and CI run every game with `GBL_AUTH_MODE=mock` and `GBL_MOCK_OIDC_*`. Native mock startup remains demo-game-only. A manual native example may use a real tenant only with explicit `GBL_AUTH_MODE=auth0` and ignored `AUTH0_*` values. Production defaults to real `AUTH0_*` and rejects mock mode. ADR-0002 supersedes ADR-0001's temporary rollout boundary while retaining its fail-closed policy.

## Evidence and planning review

- Head `8f4cbea` already exports and tests `resolveAdminOidcConfig()`; demo-game is the reference consumer.
- Both examples already depend on `@gbl-uzh/platform`, so adoption needs no dependency or lockfile change.
- Both example `authOptions.ts` files directly read `AUTH0_*`; `.devcontainer/devcontainer.env`, `.devcontainer/starter/starter.env`, and the Playwright workflow duplicate fake aliases only for them.
- The open tRPC example stack does not modify either `authOptions.ts`, but it modifies the workflow and both example READMEs. PR #185 owns the auth semantics; the later stack rebase owns conflict integration.
- Planning-stage reviewer `019ff4c4-bb41-72d2-877a-c74106b9c870` returned `NEEDS_REVISION` on 2026-08-12. All six findings are accepted here: replace the obsolete contract, supersede ADR-0001, keep native mock examples out of scope, add example workflow triggers, run final reviews before push, and name tRPC-stack conflict ownership.

## Owned files

| File | Required change | Completion criterion |
| --- | --- | --- |
| `examples/central-bank/src/lib/authOptions.ts` | Import and use `resolveAdminOidcConfig()` exactly as demo-game does. | No direct `process.env.AUTH0_*` read remains. |
| `examples/rate-wars/src/lib/authOptions.ts` | Same shared resolver adoption. | No direct `process.env.AUTH0_*` read remains. |
| `.devcontainer/devcontainer.env` | Remove fake `AUTH0_*` aliases and legacy comment. | Only `GBL_AUTH_MODE=mock` and `GBL_MOCK_OIDC_*` configure mock auth. |
| `.devcontainer/starter/starter.env` | Remove fake `AUTH0_*` aliases and legacy comment. | Same canonical mock contract as devrouter. |
| `.devcontainer/post-start.sh` | Remove the runtime `AUTH0_ISSUER` rewrite. | The routed issuer is written only to `GBL_MOCK_OIDC_ISSUER`. |
| `.github/workflows/playwright-testing.yml` | Remove fake `AUTH0_*`; add both `examples/**` directories to PR path triggers. | Example-only auth changes trigger all three matrix jobs. |
| Both example `.env.local.template` files | Add explicit `GBL_AUTH_MODE=auth0`; retain real `AUTH0_*` placeholders. | Template does not promise native mock support. |
| Both example `README.md` files | State container mock defaults and explicit manual native Auth0. | README points at the shared resolver contract without duplicating long setup. |
| `.devcontainer/README.md`, `docs/developing-a-game.md`, `docs/deploying-a-game.md`, `docs/log.md` | Remove compatibility-alias claims and state all-game resolver adoption. | Every current auth claim matches code and the mode matrix below. |
| `docs/adr/0001-fail-closed-production-admin-auth.md` | Mark superseded by ADR-0002. | Historical decision remains readable. |
| `docs/adr/0002-standardize-game-admin-auth.md` | Record the all-game contract and native boundary. | Active plan references the accepted ADR. |

Do not edit example `.env.development` files or root Compose to imply native mock support. Do not edit the tRPC stack worktree.

## Mode matrix

| Mode | Supported target and contract | Required proof |
| --- | --- | --- |
| Native mock | Demo-game only, using its committed `GBL_MOCK_OIDC_*` defaults and root Compose. | Existing `8f4cbea` proof remains valid unless native files change. |
| Manual native Auth0 | Any game with its own app/database setup; ignored `.env.local` sets `GBL_AUTH_MODE=auth0` and real `AUTH0_*`. | Static template/doc check; real-tenant proof is outside this PR. |
| Starter container | Selected game at `http://localhost:3000`; mock issuer `http://localhost:8090/default`; `GBL_*` only. | Fresh Central Bank lifecycle, smoke, OAuth callback, authenticated admin page. |
| Devrouter container | Selected game on namespaced HTTPS app/OIDC routes; `GBL_*` only. | Rate Wars route probes, smoke, OAuth callback, authenticated admin page. |
| CI | Every matrix game uses `GBL_AUTH_MODE=mock` and `GBL_MOCK_OIDC_*`; no fake `AUTH0_*`. | All three jobs and merged report pass on exact head. |

## Test portfolio

| Risk | Obligation | Primary seam | Distinct failure |
| --- | --- | --- | --- |
| Production fail-closed policy | Existing | `pnpm -F @gbl-uzh/platform test:auth` | Production accepts mock mode or silently selects stale Auth0 locally. |
| Shared resolver adoption | No new test | source audit, example type checks/builds, three-game browser matrix | An example still reads `AUTH0_*` directly or cannot start from `GBL_*`. |
| Alias removal | No new test | targeted `rg`, starter callback, devrouter callback, CI | A hidden dependency on fake `AUTH0_*` survives. |
| Example workflow triggering | Extend workflow only | pull-request `paths` and exact-head matrix | An example-only auth regression skips Playwright. |
| Local issuer topology | Existing | Central Bank starter and Rate Wars devrouter callbacks | Discovery works but browser/server issuer mismatch breaks OAuth. |
| Native boundary clarity | No runtime test | templates, READMEs, mode matrix | Docs promise unsupported native mock startup for examples. |

## Slices

### S1-S3: Original package through live proof

- Complete at `8f4cbea`. Historical commits and evidence remain in Git history and `project/_local/reviews/`.
- Do not rerun original native demo proof unless a native-owned file changes.

### S4: Revised contract and junior checkpoint

- Do: return PR #185 to draft; replace this plan; supersede ADR-0001 with ADR-0002; write the junior handoff. Leave all implementation files unchanged.
- Check: `git diff --check`; inspect the exact documentation diff; verify PR draft state and clean worktree before the plan edit.
- Planning gate: reviewer `019ff4c4-bb41-72d2-877a-c74106b9c870`; all findings integrated. A main-session correction check is sufficient because the edits implement that review's requested contract.
- Commit: `docs(project): extend PR 185 auth plan`; include both ADR files in the same approved contract checkpoint.

### S5: All games use the shared resolver

- Progress: S5 implementation is committed at `c095ebe`; platform auth tests 7/7, platform build, both example TypeScript checks, both linters, both production builds with safe dummy Auth0/public URLs, shell syntax, Compose rendering, diff check, and alias audits pass. Central Bank initially needed the documented `NEXT_PUBLIC_*` build variables; the rerun passed. The simplifier report is `project/_local/reviews/2026-08-12-pr-185-s5-simplifier.md` with DONE/no reduction; the intermediate auth review is `project/_local/reviews/2026-08-12-pr-185-s5-intermediate.md` with PASS/no findings. No native example mock support or tRPC-stack changes are allowed.
- Do: make only the owned implementation and documentation changes above.
- Check, in order:
  1. `pnpm -F @gbl-uzh/platform test:auth`
  2. `pnpm -F @gbl-uzh/platform build`
  3. `pnpm -F @gbl-uzh/central-bank check:ts && pnpm -F @gbl-uzh/rate-wars check:ts`
  4. `pnpm -F @gbl-uzh/central-bank lint && pnpm -F @gbl-uzh/rate-wars lint`
  5. Build each example with safe dummy production values: `GBL_AUTH_MODE=auth0 AUTH0_ISSUER=https://example.invalid/ AUTH0_CLIENT_ID=dummy AUTH0_CLIENT_SECRET=dummy pnpm -F <package> build`
  6. `bash -n .devcontainer/post-start.sh`; render starter and devrouter Compose; run `git diff --check`.
  7. Audit active code/config: no example `authOptions.ts`, container env, post-start script, or CI env block directly supplies fake `AUTH0_*`.
- Test delta: no new test file; existing platform tests and browser flows are the stable seams.
- Commit: `enhance(auth): standardize example OIDC configuration`.
- Intermediate gates after commit: run one native `simplifier` and one native `intermediate-reviewer` on the same immutable commit. The reviewer focuses on auth boundary, environment precedence, production failure, workflow triggering, docs, and test strategy. Resolve verified findings before S6; one correction rerun is the default limit.

### S6: Local proof, final gates, and exact-head PR

- Starter proof: reuse the preserved `gbl-pr185-starter` stack with `GBL_GAME_TARGET=central-bank`. The approved conflicting `c7004b836d72_gbl-trpc-examples-app-1` may be stopped only for canonical ports and must be restarted on its original ports afterward. Re-run the lifecycle when changing target; smoke the app and issuer; run Playwright auth and confirm an authenticated admin page.
- Devrouter proof: reuse DevPod workspace `enhance-native-dev-mode` and its namespaced routes with `GBL_GAME_TARGET=rate-wars`. Re-run the lifecycle when changing target; probe app/OIDC routes, smoke, run Playwright auth, and confirm an authenticated admin page.
- Run all three local Playwright flows where the existing test command supports the selected app. Record exact commands and results in Progress; preserve environments after proof.
- Commit final docs/progress and compute substantive size.
- Before push, run the applicable bounded security review, strict maintainability review, and integrated final outcome review on the final committed scope. Resolve findings and rerun only affected gates within the correction limit.
- Push the exact reviewed SHA. Require exact-head CI, all three Playwright jobs and merged report, Sonar <=3%, and no unresolved review finding.
- Update the whole-branch PR body with current size and evidence. Mark ready only when the reviewed SHA equals the green CI SHA.
- Stop before merge.

## Coordination with the open tRPC example stack

- PR #185 owns `authOptions.ts`, auth templates and README wording, alias removal, and example-directory Playwright triggers.
- Pull requests [#201](https://github.com/uzh-bf/gbl-uzh/pull/201), [#202](https://github.com/uzh-bf/gbl-uzh/pull/202), [#204](https://github.com/uzh-bf/gbl-uzh/pull/204), and [#205](https://github.com/uzh-bf/gbl-uzh/pull/205) remain unchanged and unmerged. Do not edit, rebase, push, or change their PR state in this package.
- Expected later conflicts: `.github/workflows/playwright-testing.yml`, both example `README.md` files, and `.devcontainer/starter/starter.env`. A later bottom-up stack rebase must preserve PR #185's auth semantics and path triggers together with the stack's tRPC commands and docs.
- After that later rebase, rerun all three Playwright matrices. That reconciliation is outside PR #185.

## Progress

- [x] Original corrective implementation and live native, starter, and devrouter proof complete through `8f4cbea`.
- [x] Pre-extension head `8f4cbea` passed security, maintainability, integrated review, exact-head CI, and Sonar on 2026-08-11.
- [x] User approved all-game resolver adoption on 2026-08-12.
- [x] PR #185 returned to draft; worktree was clean and synchronized with its remote before S4.
- [x] Revised planning review completed; all six findings integrated.
- [x] S4 revised contract and ADR reviewed; PR #185 is draft.
- [x] S5 implementation, focused verification, simplifier, and intermediate review complete at `c095ebe`; no findings require correction.
- [ ] S6 local proof, final reviews, push, exact-head CI/Sonar, PR body, and ready transition complete.
- [x] S6 local proof complete: Central Bank starter smoke and full flow passed; Rate Wars devrouter route, smoke, and full flow passed; all three local Playwright flows passed; preserved environments restored.
- [x] Bounded final security review passed on `8b71911..8614c65`; no high-confidence vulnerabilities or ADR conflicts.
- [x] Strict maintainability review passed on `8b71911..8614c65`; no actionable structural findings.
- [x] Integrated final outcome review passed on `8b71911..0fe92fe`; the retained browser evidence correction closed the only finding. That range was superseded by the Sonar correction below.
- [x] Exact-head CI passed on `231c82f` for typecheck, lint, both image architectures, all three Playwright jobs, and the merged report; Sonar failed only its new-code duplication gate at 4.9% versus the required 3%.
- [x] Sonar correction committed at `2c79c6a`: all three game consumers pass `oidcConfig` directly to `Auth0Provider`, removing the measured five-line duplicate mapping without changing the resolver or provider contract. Platform auth tests, all three game TypeScript checks, platform build, both example production builds, and diff/lockfile hygiene pass.
- [ ] S6 is active: rerun the final security, strict maintainability, and integrated outcome gates on the corrected exact scope, then push and wait for fresh CI/Sonar before updating readiness.

### S6 local proof evidence

- Central Bank starter: `GBL_GAME_TARGET=central-bank docker compose -p gbl-pr185-starter -f .devcontainer/starter/docker-compose.yml up -d --wait`; `docker exec -e GBL_GAME_TARGET=central-bank gbl-pr185-starter-app-1 bash .devcontainer/post-create.sh`; `docker exec -e GBL_GAME_TARGET=central-bank gbl-pr185-starter-app-1 bash .devcontainer/post-start.sh`; `docker exec -e GBL_GAME_TARGET=central-bank -e CI=true -e npm_config_verify_deps_before_run=false gbl-pr185-starter-app-1 bash .devcontainer/smoke.sh http://localhost:3000 http://localhost:8090/default`; all issuer, login, and seed checks passed. `CI=true npm_config_verify_deps_before_run=false PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --filter @gbl-uzh/playwright test:run --project=chromium tests/central-bank-flow.spec.ts` passed 2 tests, including setup and the full authenticated Central Bank flow.
- Rate Wars devrouter: `docker exec -e GBL_GAME_TARGET=rate-wars default-en-d5e78-app-1 bash .devcontainer/post-create.sh`; `docker exec -e GBL_GAME_TARGET=rate-wars default-en-d5e78-app-1 bash .devcontainer/post-start.sh`; `docker exec -e GBL_GAME_TARGET=rate-wars -e CI=true -e npm_config_verify_deps_before_run=false default-en-d5e78-app-1 bash .devcontainer/smoke.sh http://localhost:3000 https://oidc.demo-game.enhance-native-dev-mode.localhost/default`; routed app/OIDC probes and all smoke checks passed. The repository Playwright config's container-specific `devrouter-traefik` resolver did not resolve on the host, so the same existing tests were run with ignored `project/_local/pr185-playwright-host.config.ts`, mapping both namespaced HTTPS hosts to the verified local listener. `CI=true npm_config_verify_deps_before_run=false pnpm --dir playwright exec playwright test --config ../project/_local/pr185-playwright-host.config.ts --project=chromium tests/rate-wars-flow.spec.ts` passed 2 tests, including setup and the full authenticated Rate Wars flow.
- All-game local matrix: with the same ignored host config and the verified DevPod route, `CI=true npm_config_verify_deps_before_run=false pnpm --dir playwright exec playwright test --config ../project/_local/pr185-playwright-host.config.ts --project=chromium tests/demo-game-flow.spec.ts` passed 3 tests. The Central Bank run passed 2 and the Rate Wars run passed 2. The initial host Playwright attempt failed before page navigation because Chromium could not launch under the default sandbox; the permission-approved rerun passed. The first starter smoke seed subcommand hit a pnpm registry timeout; the documented no-implicit-install rerun passed.
- Durable evidence correction: the successful reruns are retained as ignored JUnit reports at `project/_local/playwright-proof/central-bank.junit.xml` (2 tests, 0 failures, 0 errors), `project/_local/playwright-proof/rate-wars.junit.xml` (2 tests, 0 failures, 0 errors), and `project/_local/playwright-proof/demo-game.junit.xml` (3 tests, 0 failures, 0 errors). The exact ignored host mapping is retained at `project/_local/pr185-playwright-host.config.ts`. The preliminary default-config host-browser failure remains separate under ignored `playwright/test-results/` and is not used as successful-flow evidence.
- Final environment state: the `gbl-pr185-starter` containers are stopped with volumes preserved; `c7004b836d72_gbl-trpc-examples-app-1` is running again on `127.0.0.1:3000` and `127.0.0.1:8090`; DevPod `enhance-native-dev-mode` is running with the Rate Wars target and its namespaced app/OIDC routes.

## Stop gates

- Stop if the worktree contains unrelated edits or the tRPC example stack changes.
- Stop before stopping any environment other than the explicitly approved conflicting starter app.
- Stop if Central Bank starter or Rate Wars devrouter lacks a real OAuth callback.
- Stop if a required reviewer is unavailable, or if more than one correction rerun remains unresolved.
- Stop if review range, pushed head, and CI head differ.
- Stop if exact-head CI or Sonar is red.
- Stop before cleanup, deployment, publication outside the existing draft PR, or merge without separate authority.
