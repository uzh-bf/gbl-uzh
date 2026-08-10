---
name: gbl-playwright-e2e
description: Create, run, debug, review, and extend Playwright E2E tests for GBL games (the demo-game suite and specs adapted for new game apps). Use when working in playwright/tests, Playwright config/CI, local devrouter/devcontainer browser validation, multi-player game flows, OIDC mock auth, report/dice/countdown assertions, flaky Playwright failures, or GBL Cypress-to-Playwright coverage planning.
---

# GBL Playwright E2E

Local stack unhealthy (app 404/refused, login broken, empty DB)? Run the `gbl-environment-doctor` skill first.

Use this skill for GBL Playwright work, whether you are extending the demo-game
suite or adapting it for a new game (`apps/<game>`). Combine with generic
Playwright docs/skills only for API details; keep repo-specific decisions here.

## Repo Map

- Specs: `playwright/tests/**/*.spec.ts`
- Setup auth: `playwright/tests/setup/admin-auth.setup.ts`
- Support helpers: `playwright/tests/support/*.ts`
- Config: `playwright/playwright.config.ts`
- CI workflow: `.github/workflows/playwright-testing.yml`
- Apps under test: `apps/demo-game`, `examples/rate-wars`, and
  `examples/central-bank`; each has a matching lifecycle spec and only one app
  serves the shared base URL at a time.
- Local routing: `.devrouter.yml`
- Plan/history: `project/2026-06-28-demo-game-playwright-plan.md`

## Local Stack

There are two local stacks. Use the one that matches how the app is running. **The game-building skills (`gbl-new-game-app`, etc.) assume the starter path.**

### Starter / Docker-only (default for game-building agents)

The getting-started / building-with-an-agent path: the app is published on `http://localhost:3000`, there is no devrouter, DevPod, or `<game>.localhost`. Run Playwright **inside the container**, prefixing every command with the exec container:

```bash
# Install browsers once per container (the binary persists in the container volume)
docker compose -p <name> exec app bash -lc 'cd /workspaces/gbl-uzh && pnpm --filter @gbl-uzh/playwright exec playwright install --with-deps chromium'

# Run the suite
docker compose -p <name> exec app bash -lc 'cd /workspaces/gbl-uzh && CI=true pnpm --filter @gbl-uzh/playwright test:run --project=chromium'
```

Point tests at `http://localhost:3000` - set `PLAYWRIGHT_BASE_URL=http://localhost:3000` if the config defaults elsewhere. Everything below is the devrouter/DevPod maintainer stack only.

### devrouter / DevPod (maintainer stack)

Run from repo root:

```bash
dev up
dev tls install
devrouter ensure .
for a in app oidc db; do dev app run "$a" --yes; done
```

Expected routes:

- app: `https://demo-game.localhost`
- OIDC mock: `https://oidc.demo-game.localhost/default`
- Postgres SNI route: `db.demo-game.localhost:5432`

Probe before blaming tests:

```bash
dev app ls
curl -k -I https://demo-game.localhost/admin/login
curl -k -sS https://oidc.demo-game.localhost/default/.well-known/openid-configuration
```

If sandboxed local network probes fail but routes look registered, rerun probes
outside sandbox before debugging selectors. Devrouter route access can be a
sandbox artifact.

## Commands

Use `CI=true` for pnpm commands when non-interactive module cleanup can trigger.

```bash
CI=true pnpm --filter @gbl-uzh/playwright check:ts
CI=true pnpm --filter @gbl-uzh/playwright test:run --project=chromium
CI=true pnpm --filter @gbl-uzh/playwright test:run --project=chromium tests/demo-game-flow.spec.ts
CI=true npm_config_verify_deps_before_run=false pnpm --dir playwright exec playwright test --list --project=chromium --shard=1/2
git diff --check -- .github .agents playwright apps/demo-game project
```

`pnpm exec prettier` is not currently available from this workspace. Do not
claim prettier verification unless the binary exists.

## Config Rules

- Keep Chromium as the main CI project until broad flow is stable in CI.
- Keep `workers: 1` and `fullyParallel: false`; tests share local DB/app state.
- Keep setup project + `storageState` for admin auth.
- Keep `testIdAttribute: 'data-cy'`.
- Keep failure artifacts: trace/video/screenshots on failure.
- Keep CI reporter output mergeable: include the `blob` reporter when
  `process.env.CI` is set. The GitHub Actions merge job turns blob reports into
  the uploaded HTML report.
- Use `PLAYWRIGHT_BASE_URL` only to override default
  `https://demo-game.localhost`.
- Set file-local timeout only with measured runtime evidence. Local broad flow
  runs about `1.1m-1.6m`, but the GitHub-hosted shard has reached the old
  `120_000` timeout after CI setup and slower player actions; current file-local
  timeout is `300_000`.

## GitHub Actions Rules

Keep `.github/workflows/playwright-testing.yml` close to the Klicker pattern, but
adapt it to GBL's smaller stack:

- Use the Playwright Docker image matching `playwright/package.json`
  (`mcr.microsoft.com/playwright:v1.61.1-noble` for Playwright `1.61.1`).
- Use Node `24` and pnpm `11.6.0`, matching the root package manager metadata.
- Pin third-party GitHub Actions to a full commit SHA. SonarCloud flags
  floating third-party action tags such as `pnpm/action-setup@v4`.
- Run Postgres and `ghcr.io/navikt/mock-oauth2-server:2.1.11` as job services.
- In CI, do not use devrouter/TLS. Use:
  - `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000`
  - `NEXTAUTH_URL=http://127.0.0.1:3000`
  - `AUTH0_ISSUER=http://oidc:8090/default`
- Build `@gbl-uzh/platform` and `@gbl-uzh/ui` before starting `demo-game`.
- Prepare Prisma with `prisma:copy`, `prisma:generate`, `prisma:push`, and
  `prisma:seed`.
- Start `pnpm --filter @gbl-uzh/demo-game dev` in the background, wait for both
  OIDC discovery and `/admin/login`, then run the shard.
- Use matrix shards with `fail-fast: false`, upload one blob report per shard,
  and merge them in a separate job.
- Current suite has one real spec file, so two shards means one shard can be
  empty. Use `--pass-with-no-tests` only for sharded CI; split future breadth
  coverage into separate spec files before increasing shard count.

## Auth And Data Rules

- Admin auth uses local OIDC mock via real browser login; storage state lives in
  `playwright/.auth/admin.json` and must not be committed.
- Player auth uses real join links from admin UI. Do not make player JWTs in
  tests unless OIDC/join flow is unavailable.
- Use one browser context per player. Close all contexts in `finally`.
- If joining players in a helper, close already-created contexts on partial
  failure before rethrowing.
- Submit player decisions sequentially. Concurrent player writes can create
  Postgres serializable transaction conflicts in CI without increasing coverage.
- Use unique game names. Do not reset DB inside Playwright setup.
- Do not make specs depend on prior spec order or prior games.

> [!IMPORTANT]
> **`localhost` vs `127.0.0.1` matters.** NextAuth state cookies are scoped to the exact hostname. If `NEXTAUTH_URL` is `http://localhost:3000` but Playwright navigates to `http://127.0.0.1:3000`, the OAuth callback will fail with `STATE_COOKIE_MISSING`. Always set `PLAYWRIGHT_BASE_URL=http://localhost:3000` — matching `NEXTAUTH_URL` exactly.

> [!TIP]
> **Segment facts validation schemas must allow empty/partial input.** When the admin clicks "Add Segment", the platform submits `{}` as the initial facts before calling `SegmentService.initialize`. If your yup schema marks fields as `.required()`, the mutation silently fails. Make segment-facts schema fields `.optional()` (or `.nullable()`) and let `SegmentService.initialize` fill them.

> [!TIP]
> **Wait for the exact tRPC mutation response.** Start `page.waitForResponse`
> with a predicate for the intended procedure path and POST method before the
> click, then require `response.ok()`. Follow that transport assertion with the
> next durable UI state. Button enabled/disabled timing alone is not proof that
> the intended mutation succeeded.

## GBL Game Flow Rules

Current stable lifecycle matrix:

- Demo-game: four teams, two periods, four segments, dice, countdown, player
  decisions/results, and final report.
- Rate Wars: its complete multi-bank, multi-period lifecycle.
- Central Bank: its complete monetary-policy lifecycle, including decision and
  admin mutation response checks, no-reload SSE countdown, period results, and
  leaderboard.

Platform notes:

- Final-period `CONSOLIDATION -> RESULTS` works without a next period since
  the `GameService` consolidation fix (the pointer is disconnected instead of
  connecting a missing record) — the old "unplayed sentinel period" workaround
  is obsolete; `playwright/tests/rate-wars-flow.spec.ts` asserts the fixed
  behavior. `COMPLETED` is still never set — do not test it.
- One app per stack: specs assume THEIR app is the one serving
  `PLAYWRIGHT_BASE_URL`. The demo spec needs `apps/demo-game` on :3000, the
  rate-wars spec needs `examples/rate-wars`. Run the matching spec file, not the
  whole suite, when a different game app is up.
- Reload-polling: give each reload time to hydrate before deciding the
  predicate failed (dev-server first paint can take several seconds — use
  `locator.waitFor({ timeout: 10_000 }).then(() => true).catch(() => false)`
  inside the poll instead of a bare `isVisible()`).
- The design-system `Card` does not forward a raw `data-cy` attribute — anchor
  results/leaderboard assertions on visible headline text, or add the test id
  to a plain wrapper `div`.

State transitions worth asserting:

```text
SCHEDULED -> PREPARATION -> RUNNING -> PAUSED -> RUNNING -> CONSOLIDATION -> RESULTS -> PREPARATION
```

Use reload-aware polling for admin status because UI data can lag mutations.
Return the post-reload status in the same poll cycle.

## Selector Rules

- Prefer role/name for accessible controls.
- Use `data-cy` for dynamic/repeated areas and component-library controls with
  weak accessible labels.
- Avoid CSS class locators and structural selectors such as `svg text`.
- Avoid toast assertions as primary outcomes; assert durable UI state instead.
- `FormikNumberField` often renders visible labels without usable accessible
  names. If positional textbox locators become necessary, scope them tightly and
  leave a short comment.
- For countdown:
  - admin field wrapper: `countdown-seconds`
  - player widget: `countdown`
- For segments, placeholder cards render before segment data exists. Count real
  segments by stable child content such as dice links, not by segment card count.

## Assertion Scope

- Report: assert `report-loaded`, team names, `Player Decisions`, period/segment
  row labels, and stable section titles (`Risk-Return`, `Sharpe Ratio`). Do not
  overfit chart internals or transient exact numeric rendering.
- Dice: one configured segment dice page smoke is enough unless user asks for
  dice animation coverage.
- Countdown: set countdown, assert player widget appears, never wait for expiry
  in CI.
- Player cockpit: assert form/result states (`Submit`, `Assets Overview`,
  `Savings`, `Bonds`, `Stocks`, `Total`) rather than chart pixels.

## Adapting the demo-game spec to your game

The demo-game spec (`playwright/tests/demo-game-flow.spec.ts`) is the template for any GBL game's lifecycle test. Copy it to `playwright/tests/<game>-flow.spec.ts` and adapt with this checklist - it is intentionally small so a full multi-player lifecycle run stays achievable:

- **Decision form**: swap the demo's allocation inputs (`bank` / `bonds` / `stocks` summing to 100) for your game's single decision. Update the input locator (e.g. `getByPlaceholder`, `input[name=...]`), the yup validation values, and the submit button name. Mirror the constraints your `Actions.apply` reducer enforces.
- **Player plan**: replace the `decisions` array with your game's per-segment decision values (e.g. `[{ rate: '6.0' }, { rate: '5.5' }]`).
- **Dashboard assertions**: replace demo-game metric labels (`Assets Overview`, `Savings`, `Bonds`, `Stocks`, `Total`) with your game's (`Current Inflation`, `Unemployment`, `GDP Growth`, `Cumulative Loss`). Assert durable headings, not chart pixels or transient numbers.
- **Do not add a sentinel period.** Final-period consolidation disconnects the
  next-period pointer safely; the lifecycle spec should prove that the real last
  period reaches `RESULTS` without a fabricated extra period.
- **Keep the admin flow**: `createGame` -> `addPeriod` -> `addSegment` (per period) -> join players -> advance transitions. The state-transition sequence is game-agnostic.
- **Keep `expectGameStatusEventually`** (or equivalent reload-aware polling) for admin status assertions - UI data lags mutations.
- **Segment count via stable child content**: count real segments by a child that only exists after `SegmentService.initialize` (e.g. `text=Roll:`), not by placeholder card count.
- **One browser context per player**, close in `finally`, submit decisions sequentially.

## Debug Loop

1. Confirm routes and OIDC before selector debugging.
2. Run `check:ts`.
3. Run focused Chromium spec.
4. On failure, read first error, `error-context.md`, screenshots, trace hint,
   and app route health.
5. Fix smallest root cause.
6. Rerun focused spec, then full Chromium suite.
7. Review and simplify after each slice before committing.

Common failures:

- Welcome submit never reaches `/play/cockpit`: bank name likely exceeds
  welcome validation max length (`20` chars) or join token/session failed.
- `input[name=...]` not found for design-system number field: component did not
  forward stable name; add a small `data-cy` wrapper instead of broad CSS.
- Report strict-mode text failure: use exact text or scope/first deliberately.
- Local `curl` refused inside sandbox while Docker route exists: rerun probe
  outside sandbox before changing app/test code.

## Commit Discipline

- Keep unrelated dirty files unstaged.
- Commit per slice:
  - implementation.
  - verification evidence in plan.
  - review/simplification notes in plan when workflow requires them.
- Use conventional messages, for example:
  - `test(demo-game): cover multi-team multi-period flow`
  - `test(playwright): add breadth flow timeout headroom`
  - `test(demo-game): add countdown e2e smoke`
