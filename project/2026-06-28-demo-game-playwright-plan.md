# Demo Game Playwright Plan

## Goal

- Add Playwright E2E suite for GBL `apps/demo-game`.
- Cover first valuable full flow:
  - admin creates game.
  - admin configures period and segment.
  - two players join with real join links.
  - players complete welcome.
  - admin starts game.
  - players submit decisions and mark ready.
  - admin advances to results.
  - report shows outcome.
- Keep first branch small and green. Extend later.

## Non-Goals

- No external Auth0 UI automation in core CI.
- No Cypress deletion.
- No multi-browser full-flow matrix.
- No broad UI refactor.
- No hidden destructive DB reset inside Playwright tests.

## Plan Identity

- Plan path: `project/2026-06-28-demo-game-playwright-plan.md`
- Current branch when planned: `dev`
- Target branch: `dev`
- Intended branch: `codex/demo-game-playwright`
- Current repo state:
  - local `dev` behind `origin/dev` by 3 commits.
  - `apps/quartz` dirty before plan work. Do not touch.
  - `origin/dev` contains the local devcontainer/devrouter/OIDC mock setup.
- PR ID: none.

## Evidence

- Current Cypress smoke: `cypress/e2e/game-management.cy.ts`
  - creates game, periods, segments.
  - joins two players.
  - does not run playable game flow.
- Demo app:
  - implementation base must be latest `origin/dev`.
  - Next.js `16.2.9` on `origin/dev`.
  - React `19.2.7` on `origin/dev`.
  - Prisma `6.14.0`
  - NextAuth `4.24.14` on `origin/dev`.
  - pnpm `11.6.0` on `origin/dev`.
  - Node `24.16.0` on `origin/dev`.
  - `next.config.ts` has `output: 'standalone'`.
- Local auth facts already verified:
  - `apps/demo-game/src/lib/authOptions.ts` uses `session.strategy = 'jwt'`.
  - `apps/demo-game/src/pages/api/graphql.ts` uses `getServerSession(..., authOptions)`.
  - `origin/dev` adds a devcontainer with `mock-oauth2-server:2.1.11`.
  - local OIDC issuer: `https://oidc.demo-game.localhost/default`.
  - app URL: `https://demo-game.localhost`.
  - OIDC login is one-click and fixed to `gbl-dev@df.uzh.ch`.
  - `apps/demo-game/src/pages/admin/login.tsx` still calls `signIn('github')`.
    This is stale with the Auth0 provider and must be changed to `signIn('auth0')`.
- Seed facts:
  - `apps/demo-game/prisma/seed.ts` is executable script, not reusable module export.
  - Use app commands for schema/seed, not import internals.
- Existing useful selectors:
  - `game-name`, `game-player-count`, `create-game`
  - `add-period`, `period-name`, `segment-count`
  - `add-segment`
  - `player-0`, `player-1`
  - player decision inputs: `Savings-cy`, `Bonds-cy`, `Stocks-cy`

## External Research

- Playwright docs:
  - Use `defineConfig`.
  - Use `webServer`.
  - Use `storageState`.
  - Use setup project dependencies.
  - Use locators and web-first assertions.
  - Use traces/screenshots/videos on failure.
  - Use CI reporters/retries.
- Next.js docs:
  - E2E with Playwright.
  - Prefer production build for realistic behavior.
- Latest checked package:
  - `@playwright/test@1.61.1`
- Sources:
  - `https://playwright.dev/docs/test-configuration`
  - `https://playwright.dev/docs/test-webserver`
  - `https://playwright.dev/docs/auth`
  - `https://playwright.dev/docs/best-practices`
  - `https://playwright.dev/docs/ci`
  - `https://nextjs.org/docs/app/guides/testing/playwright`

## KlickerUZH Lessons

- Keep separate `playwright/` workspace package.
- Set `testIdAttribute: 'data-cy'`.
- Keep base URL env-driven.
- Capture failure artifacts.
- Start with Chromium flow, not full browser matrix.
- Borrow DB/auth setup ideas from Cypress, not its large helper surface.

## Accepted Review Findings

Reviewer: opencode, `opencode-go/glm-5.2`, `--variant max`.

- Accepted:
  - Make auth strategy explicit.
  - Do not assume `seed.ts` is importable.
  - Add real-time wait/reload mitigation.
  - Add CI Postgres healthcheck.
  - Add explicit CI env for reset/setup.
  - Add retries/timeout budget.
  - Drop premature `graphql.ts` helper.
  - Add player join-link selector coverage.
  - Shrink first flow to 1 period x 1 segment.
- Deferred:
  - Playwright browser cache. Start with pnpm cache and browser install; add browser cache only if CI runtime hurts.

## Decisions

- Implementation starts from latest `origin/dev`.
- Local browser path uses devcontainer + devrouter:
  - `dev up && dev tls install`
  - `devpod up . --ide none`
  - `for a in app oidc db; do dev app run "$a"; done`
  - app at `https://demo-game.localhost`
  - OIDC at `https://oidc.demo-game.localhost/default`
- New package: `playwright/`.
- Dependency: pinned `@playwright/test@1.61.1`.
- Main browser: Chromium.
- Full flow size: 2 players, 1 period, 2 segments.
  - Reason: current `activateNextPeriod` has a falsy `activeSegmentIx = 0`
    guard in RUNNING -> CONSOLIDATION, so a one-segment flow would not exercise
    the existing UI path reliably without a platform bug fix.
- Later expansion: 2 periods x 2 segments, then Firefox/WebKit smoke.
- DB reset/seed outside Playwright:
  - local and CI run app DB setup command before tests.
  - Playwright setup creates only admin storage state and verifies seed presence.
- Admin auth:
  - use local OIDC mock as primary auth.
  - Playwright setup clicks the admin login once and saves storage state.
  - save storage state to ignored `.auth/admin.json`.
  - keep direct signed JWT only as a fallback if OIDC setup becomes unavailable.
- Player auth:
  - use real join link from admin UI.
  - app creates player JWT through `loginAsTeam`.
- State waits:
  - prefer visible UI assertions.
  - use helper with `expect.poll` and optional `page.reload()` for app polling/subscription delays.

## Files

- Add:
  - `playwright/package.json`
  - `playwright/playwright.config.ts`
  - `playwright/tsconfig.json`
  - `playwright/README.md`
  - `playwright/.gitignore`
  - `playwright/tests/setup/admin-auth.setup.ts`
  - `playwright/tests/demo-game-flow.spec.ts`
  - `playwright/tests/support/auth.ts`
  - `playwright/tests/support/db.ts`
  - `playwright/tests/support/waits.ts`
- Update:
  - `pnpm-workspace.yaml`
  - `pnpm-lock.yaml`
  - `.gitignore`
  - `apps/demo-game/src/pages/admin/login.tsx`
  - `apps/demo-game/src/pages/admin/games/[id].tsx`
  - `apps/demo-game/src/pages/play/welcome.tsx`
  - `apps/demo-game/src/pages/play/cockpit.tsx`
  - `apps/demo-game/src/pages/admin/reports/[id].tsx`
  - `.github/workflows/demo-game-playwright.yml`

## Slice 1: Plan Commit

- Do:
  - Start from latest `origin/dev` before implementation.
  - Commit this reviewed plan only.
- Check:
  - `git diff --check -- project/2026-06-28-demo-game-playwright-plan.md`
- Commit:
  - `docs(project): add demo-game playwright plan`

## Slice 2: Playwright Package

- Do:
  - Add `playwright` workspace.
  - Add pinned Playwright dependency.
  - Add config:
    - `testDir: './tests'`
    - `testIdAttribute: 'data-cy'`
    - `baseURL = PLAYWRIGHT_BASE_URL ?? https://demo-game.localhost`
    - `retries: CI ? 1 : 0`
    - `workers: 1`
    - timeout `90_000`
    - expect timeout `10_000`
    - trace `retain-on-failure`
    - screenshot `only-on-failure`
    - video `retain-on-failure`
    - reporters: list/html locally, list/html/junit/github in CI.
  - Make the first executable browser check the authenticated full-flow spec.
  - Document commands.
- Check:
  - `pnpm install`
  - `pnpm --filter @gbl-uzh/playwright test:run --project=chromium`
- Review:
  - package shape, lockfile, config minimality.
- Commit:
  - `test(playwright): add demo-game playwright package`

## Slice 3: Auth And Setup

- Do:
  - Fix admin login provider:
    - change `signIn('github')` to `signIn('auth0')`.
    - keep existing callback to `/admin/games`.
  - Add `auth.ts`:
    - open `/admin/login`.
    - click sign-in.
    - rely on mock OIDC one-click login.
    - assert `/admin/games` is visible.
    - save storage state to `.auth/admin.json`.
  - Add `db.ts`:
    - Prisma client using demo-game generated client.
    - verify app seed exists: player levels and learning/story elements.
  - Add setup project:
    - writes `.auth/admin.json`.
    - opens `/admin/games`.
    - asserts admin page visible with saved state.
  - Do not reset DB here.
- Check:
  - Local app prepared by devcontainer `post-create.sh`.
  - Setup project logs into `/admin/games` through local OIDC.
- Review:
  - provider id, OIDC env, seed assumptions.
- Commit:
  - `test(playwright): add oidc admin auth setup`

## Slice 4: Minimal Stable Selectors

- Do:
  - Add only missing `data-cy` hooks:
    - admin state action button.
    - game status.
    - period card.
    - segment card.
    - player join link inside player card.
    - welcome start button.
    - decision submit button.
    - ready switch wrapper/control.
    - report loaded container.
  - No visible UI changes.
- Check:
  - `pnpm --filter @gbl-uzh/demo-game check:ts`
  - `pnpm --filter @gbl-uzh/demo-game lint`
  - selector smoke.
- Review:
  - no behavior changes, no redundant hooks.
- Commit:
  - `test(demo-game): add e2e selectors`

## Slice 5: First Full Flow

- Do:
  - Add `demo-game-flow.spec.ts`.
  - Use admin storage state.
  - Create unique 2-player game.
  - Add 1 period with 2 segments.
  - Capture player join links from UI.
  - Open two isolated player contexts.
  - Players join and complete welcome form.
  - Admin starts period.
  - Players submit decisions:
    - Player 1: savings 40, bonds 30, stocks 30.
    - Player 2: savings 20, bonds 40, stocks 40.
  - Players mark ready.
  - Admin waits for ready state with reload-capable helper.
  - Admin advances through first segment results, second segment, consolidation,
    and period results.
  - Open report.
  - Assert report loaded and both players visible.
  - Add DB assertions:
    - one game by unique name.
    - two players.
    - player actions/results created.
- Check:
  - `pnpm --filter @gbl-uzh/playwright test:run --project=chromium`
- Review:
  - flake risks, helper size, user-flow coverage.
- Commit:
  - `test(demo-game): cover admin player game flow`

## Slice 6: CI

- Do:
  - Add `.github/workflows/demo-game-playwright.yml`.
  - Trigger on PR/push to `dev`.
  - Use Postgres service with healthcheck.
  - Use Node `24.16.0`, pnpm `11.6.0`.
  - Cache pnpm store.
  - Install with lockfile.
  - Install Chromium browser.
  - Start local OIDC mock with `mock-oauth2-server:2.1.11` on port `8090`.
    - use the same fixed dev-admin `JSON_CONFIG` as `.devcontainer/docker-compose.yml`.
  - Set explicit CI env:
    - `DATABASE_URL`
    - `SHADOW_DATABASE_URL`
    - `NEXTAUTH_SECRET`
    - `NEXTAUTH_URL=http://127.0.0.1:3000`
    - `NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000`
    - `AUTH0_ISSUER=http://127.0.0.1:8090/default`
    - `AUTH0_CLIENT_ID=demo-game-ci`
    - `AUTH0_CLIENT_SECRET=demo-game-ci-secret`
    - `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000`
  - Run:
    - `pnpm --filter @gbl-uzh/demo-game prisma:setup`
    - `pnpm --filter @gbl-uzh/demo-game build`
    - start app.
    - Playwright Chromium.
  - Upload:
    - `playwright/playwright-report`
    - `playwright/test-results`
- Check:
  - Local command mirrors CI.
  - Workflow syntax sanity.
- Review:
  - env safety, healthcheck, artifacts, runtime.
- Commit:
  - `ci(demo-game): run playwright e2e`

## Slice 7: Final Gate

- Do:
  - Update plan progress.
  - Run final security review.
  - Run final branch review.
  - Create draft PR with `$df-mr-description-writer`.
  - Include screenshots/report evidence if UI hooks visible.
- Check:
  - `git diff --check`
  - `pnpm --filter @gbl-uzh/demo-game check:ts`
  - `pnpm --filter @gbl-uzh/demo-game lint`
  - `pnpm --filter @gbl-uzh/playwright test:run --project=chromium`
- Commit:
  - only final fixes if needed.

## Local Runbook

```bash
dev up
dev tls install
devpod up . --ide none
for a in app oidc db; do dev app run "$a"; done

PLAYWRIGHT_BASE_URL=https://demo-game.localhost \
  pnpm --filter @gbl-uzh/playwright test:run --project=chromium
```

Debug:

```bash
pnpm --filter @gbl-uzh/playwright test:headed
pnpm --filter @gbl-uzh/playwright test:ui
pnpm --filter @gbl-uzh/playwright show-report
```

## Selector Rules

- Prefer `getByTestId` for `data-cy`.
- Prefer role/name when accessible and stable.
- No CSS class locators.
- No fixed waits.
- Add selectors only for duplicated/dynamic/component-library controls.

## DB Rules

- DB reset happens only in documented setup command or CI job.
- Never reset arbitrary DB from Playwright setup.
- E2E DB must be disposable.
- Keep DB helpers small:
  - seed verification.
  - final assertions.

## Progress

- 2026-06-28:
  - Repo inspected.
  - KlickerUZH Playwright inspected.
  - Playwright/Next docs checked.
  - `@playwright/test` latest checked: `1.61.1`.
  - Draft plan written.
  - opencode GLM 5.2 max review run.
  - Review findings integrated.
  - Plan simplified.
  - Auth strategy updated after verifying `origin/dev` has local OIDC mock.
  - Plan now uses devcontainer/devrouter/OIDC as primary admin login path.
  - Slice 1 plan commit created on `codex/demo-game-playwright`.
  - Slice 2 Playwright package skeleton added.
  - Slice 2 checks:
    - `pnpm --filter @gbl-uzh/playwright check:ts` passed.
    - `playwright --version` reports `1.61.1`.
    - initial unauthenticated smoke reached devrouter, but local CLI is
      `0.0.19` and rejects `.devrouter.yml` `upstream`; local browser runs
      need devrouter `>=0.0.21`.
  - Slice 3 auth setup started:
    - admin login provider fixed from stale `github` to `auth0`.
    - Playwright setup project added for local OIDC login and storage state.
    - DB seed helper deferred to first full-flow slice to avoid adding Prisma
      as a Playwright package dependency before it is needed.
  - Slice 4 selector hooks added for game detail status, period/segment cards,
    player login links, ready switch, report loaded, and accessible labels on
    icon-only period/segment add buttons. The test uses roles and form controls
    for design-system fields/buttons instead of relying on inert `data` props.
  - Slice 5 first full-flow spec drafted against 2 players, 2 periods, and 2
    played segments. The second period is present so the current platform can
    transition `CONSOLIDATION -> RESULTS`.
  - Simplification review removed the auth-conflicting standalone smoke test,
    redundant root ignore rules, and non-assertive admin ready-state selector.
  - 2026-06-30 validation:
    - Upgraded devrouter validated with CLI `0.0.22` against repo requirement
      `0.0.21`.
    - Stopped conflicting local containers for the validation run:
      `klicker-uzh-reverse_proxy_macos-1`, `klicker-uzh-postgres-1`, and
      `docker-nginx-1`.
    - `dev up`, `dev tls install`, and `dev app run app|oidc|db --yes` passed.
    - `devpod up . --ide none` passed, including install, platform/ui build,
      Prisma push/seed, and background `next dev`.
    - `curl -k -I https://demo-game.localhost/admin/login` returned `200`.
    - OIDC discovery at
      `https://oidc.demo-game.localhost/default/.well-known/openid-configuration`
      returned issuer `https://oidc.demo-game.localhost/default`.
    - `pnpm --filter @gbl-uzh/playwright check:ts` passed.
    - `pnpm --filter @gbl-uzh/playwright test:run --project=chromium` passed:
      setup auth plus full demo-game flow, `2 passed`.
    - `git diff --check` passed.
  - Remaining non-Playwright blocker:
    - `docker exec default-gb-68b8e-app-1 ... pnpm -F @gbl-uzh/demo-game
      check:ts` runs now, but fails on existing app type debt in
      `PlayerData`, `StoryElements`, generated ops dependency resolution,
      report numeric types, cockpit Formik errors, and React Markdown JSX types.

## Handoff Prompt

Use `project/2026-06-28-demo-game-playwright-plan.md`.

- Verify branch and dirty state first.
- Do not touch pre-existing `apps/quartz` change.
- Create/switch to implementation branch.
- Keep this plan updated.
- Work one slice at a time.
- Verify each slice.
- Run review and simplification subagents per slice.
- Commit each slice separately.
- Run final security review and final branch review.
- Use `$df-mr-description-writer` for draft PR.
