# Demo Game Playwright

Playwright E2E tests for `apps/demo-game`.

## Local App

Run the devcontainer/devrouter stack from the repository root:

```bash
devrouter ensure .
```

Requires devrouter `>=0.0.35`.

The default Playwright base URL is `https://demo-game.localhost`.

## Commands

```bash
pnpm --filter @gbl-uzh/playwright test:run --project=chromium
pnpm --filter @gbl-uzh/playwright test:headed
pnpm --filter @gbl-uzh/playwright test:ui
pnpm --filter @gbl-uzh/playwright show-report
```

Override the app URL when needed:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 \
  pnpm --filter @gbl-uzh/playwright test:run --project=chromium
```
