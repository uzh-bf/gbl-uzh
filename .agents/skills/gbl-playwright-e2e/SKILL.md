---
name: gbl-playwright-e2e
description: Create, run, debug, review, and extend Playwright E2E tests for the GBL demo-game app. Use when working in playwright/tests, Playwright config/CI, local devrouter/devcontainer browser validation, multi-player game flows, OIDC mock auth, report/dice/countdown assertions, flaky Playwright failures, or GBL Cypress-to-Playwright coverage planning.
---

# GBL Playwright E2E

Use this skill for GBL `apps/demo-game` Playwright work. Combine with generic
Playwright docs/skills only for API details; keep repo-specific decisions here.

## Repo Map

- Specs: `playwright/tests/**/*.spec.ts`
- Setup auth: `playwright/tests/setup/admin-auth.setup.ts`
- Support helpers: `playwright/tests/support/*.ts`
- Config: `playwright/playwright.config.ts`
- App under test: `apps/demo-game`
- Local routing: `.devrouter.yml`
- Plan/history: `project/2026-06-28-demo-game-playwright-plan.md`

## Local Stack

Run from repo root:

```bash
dev up
dev tls install
devpod up . --ide none
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
git diff --check -- playwright tests apps/demo-game project
```

`pnpm exec prettier` is not currently available from this workspace. Do not
claim prettier verification unless the binary exists.

## Config Rules

- Keep Chromium as the main CI project until broad flow is stable in CI.
- Keep `workers: 1` and `fullyParallel: false`; tests share local DB/app state.
- Keep setup project + `storageState` for admin auth.
- Keep `testIdAttribute: 'data-cy'`.
- Keep failure artifacts: trace/video/screenshots on failure.
- Use `PLAYWRIGHT_BASE_URL` only to override default
  `https://demo-game.localhost`.
- Set file-local timeout only with measured runtime evidence. Current broad flow
  runs about `1.1m-1.4m`; file-local timeout is `120_000`.

## Auth And Data Rules

- Admin auth uses local OIDC mock via real browser login; storage state lives in
  `playwright/.auth/admin.json` and must not be committed.
- Player auth uses real join links from admin UI. Do not mint player JWTs in
  tests unless OIDC/join flow is unavailable.
- Use one browser context per player. Close all contexts in `finally`.
- If joining players in a helper, close already-created contexts on partial
  failure before rethrowing.
- Use unique game names. Do not reset DB inside Playwright setup.
- Do not make specs depend on prior spec order or prior games.

## GBL Game Flow Rules

Current stable broad flow:

- 4 teams.
- 2 played periods.
- 4 played segments.
- 1 unplayed sentinel period.
- Admin setup guards.
- Dice page smoke.
- Player decision/ready/result states.
- Countdown smoke.
- Final report smoke.

Known platform constraint:

- Final-period `CONSOLIDATION -> RESULTS` still expects a next period record.
  Use an unplayed sentinel period when testing two fully played periods. Do not
  test `COMPLETED` until the platform final-period transition is fixed.

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
