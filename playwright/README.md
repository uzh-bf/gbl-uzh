# Demo Game Playwright

Playwright E2E tests for `apps/demo-game`.

## Local App

Run the devcontainer/devrouter stack from the repository root:

```bash
dev up
dev tls install
devpod up . --ide none
for a in app oidc db; do dev app run "$a" --yes; done
```

Requires devrouter `>=0.0.23`.

The default Playwright base URL is `https://demo-game.localhost`.

## Commands

```bash
pnpm --filter @gbl-uzh/playwright test:run --project=chromium
pnpm --filter @gbl-uzh/playwright test:auth
pnpm --filter @gbl-uzh/playwright test:headed
pnpm --filter @gbl-uzh/playwright test:ui
pnpm --filter @gbl-uzh/playwright show-report
```

Override the app URL when needed:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 \
  pnpm --filter @gbl-uzh/playwright test:run --project=chromium
```
