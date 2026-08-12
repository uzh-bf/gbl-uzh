---
name: gbl-environment-doctor
description: Diagnose and repair the local GBL dev environment - devcontainer, database, seed data, OIDC mock login, dev server, and routing. Use whenever the app is unreachable, login fails, pages 500, the admin UI looks empty, a setup step failed, or any other gbl-* skill hits an environment error - run this BEFORE debugging application code. Also use when a non-technical user says anything like "it doesn't work" or "the page won't load".
---

# GBL Environment Doctor

Most "bugs" a first-time user hits are environment problems, not code problems. Diagnose in the order below; each check names its fix. Re-run the checks top-to-bottom after every fix. Environment healthy -> go back to the skill that sent you.

## Step 0: Which mode is this?

Choose the branch that owns the app process:

- **Native host**: commands run from the repository root on the host. Set `APP_URL="${APP_URL:-http://localhost:${PORT:-3000}}"` and `BROWSER_URL="${BROWSER_URL:-$APP_URL}"`; the mock issuer defaults to `http://localhost:${GBL_OIDC_PORT:-8090}/default`.
- **Starter devcontainer**: `GBL_DEV_MODE=starter` inside `/workspaces/gbl-uzh`. Set `APP_URL=http://localhost:3000` and `BROWSER_URL="$APP_URL"`.
- **Devrouter devcontainer**: inside `/workspaces/gbl-uzh` with no starter flag. Set `APP_URL=http://localhost:3000` for in-container checks. Derive `BROWSER_URL` and `ISSUER` from the human-facing, possibly namespaced HTTPS routes shown by `dev ls` or `dev app ls`; never assume the primary-checkout hostname.

Set `ISSUER` to the configured mock issuer. `APP_URL` is the URL reachable beside the app process; call the human-facing route `BROWSER_URL` when devrouter makes it different.

## Step 1: Health checks, in order

1. **Execution context matches the mode**: native checks stay on the host; starter and devrouter checks run in the app container. Do not use a host-side devrouter URL for the container's app probe.
2. **Dev server process**: `pgrep -f "next dev" || echo DOWN`. In a container, rerun `bash .devcontainer/post-start.sh` when DOWN and inspect `tail -50 /tmp/dev.log`. In native mode, restart the documented `pnpm -F @gbl-uzh/demo-game dev` command and inspect its terminal output.
3. **App responds beside its process**: `curl -s -o /dev/null -w '%{http_code}' "$APP_URL"` -> expect `200`. The first compile can take 30-60s. Devrouter mode additionally requires a host-side probe of `BROWSER_URL`; an in-container 200 plus routed 404 means routes are missing.
4. **OIDC discovery + seed**: run `bash .devcontainer/smoke.sh "$APP_URL" "$ISSUER"`. It verifies the exact issuer using Node's TLS/DNS path (the same path NextAuth uses), checks the app, prints the `PlayerLevel` row count, and fails when the seed is missing.
5. **Install intact**: `pnpm -F @gbl-uzh/demo-game exec prisma -v` works and the repository-root `node_modules` exists. If not, run a full `pnpm install` in the same host/container that owns the app — never a filtered install, which omits a design-system CSS dependency.

## Step 2: Known failure signatures

| Symptom                                                                   | Cause                                                                                              | Fix                                                                                                                                       |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Browser: localhost:3000 refused, but checks 2-3 pass inside the container | ports not published (wrong config chosen) or something else grabbed 3000/8090 before the container | Rebuild with the "GBL Starter" configuration; ask the human to close the other app if `port is already allocated` appeared at startup     |
| Login fails with state/PKCE cookie errors                                 | browser used `127.0.0.1` while the app is configured for `localhost`                               | always use `http://localhost:3000`                                                                                                        |
| Browser redirects to a real Auth0 tenant unexpectedly                     | native host mode loaded `GBL_AUTH_MODE=auth0`, or container process env was overridden             | native: remove `GBL_AUTH_MODE=auth0`; container: restore `GBL_AUTH_MODE=mock`; verify `GBL_MOCK_OIDC_ISSUER`, then restart the dev server |
| Token/issuer (`iss`) mismatch on login                                    | mock issuer host differs from the host the browser hit                                             | use one exact app/issuer host pair; compare check 4 output with `$ISSUER`                                                                 |
| devrouter mode: dev server up but app URL 404s                            | routes never registered (manual host step)                                                         | on the HOST: `for a in app oidc db; do dev app run "$a" --yes; done`; verify with `dev ls`                                                |
| `network devnet ... not found` at container start                         | devrouter not running on host (devrouter mode only)                                                | on the HOST: `dev up && dev tls install`; or switch to the starter config, which needs neither                                            |
| Prisma error `42601` / empty `search_path` right after first start        | fresh Postgres volume warmup race - NOT a config bug                                               | retry `pnpm -F @gbl-uzh/demo-game prisma:push` for up to ~60s                                                                             |
| demo-game `build:nexus` reports a missing `GBL_MOCK_OIDC_*` variable      | its standalone `tsx` process did not load the demo game's Next-style env files                     | verify `apps/demo-game/src/lib/prisma.ts` loads the ordered env files, then rerun `build:nexus`                                           |
| `set: pipefail: invalid option name` during setup                         | CRLF line endings from an old Windows checkout (repo enforces LF since 2026-07)                    | re-clone via "Dev Containers: Clone Repository in Container Volume"                                                                       |
| Env values truncated at first `=` (e.g. `?schema` without `=public`)      | DevPod env_file truncation                                                                         | already worked around: lifecycle scripts re-source `$GBL_ENV_FILE`; keep `=`-bearing values in the env FILE, not compose `environment:`   |
| Playwright: `Executable doesn't exist`                                    | browsers are not baked into the devcontainer image                                                 | `pnpm exec playwright install --with-deps chromium`, or follow `gbl-playwright-e2e`                                                       |
| A checkout contains `apps/demo-game/docker-compose.yml` or `_run.sh`      | stale pre-devcontainer stack, superseded by the devcontainer configs                               | never run them - they collide with devrouter on host ports 80/443/5432; use the devcontainer configs                                      |

## Step 3: Fixes only the human can do

Relay these in plain language (they run OUTSIDE the container):

- **Container runtime is not running** — nothing works without Docker. Ask them to start their runtime (OrbStack, Rancher Desktop, or Docker Desktop), then retry. OrbStack shows a menubar icon; Rancher Desktop shows a tray icon.
- **Windows: "WSL 2 installation is incomplete"** — enable the Windows features "Windows Subsystem for Linux" and "Virtual Machine Platform", reboot, then run `wsl --update` in an admin PowerShell. Reference: <https://learn.microsoft.com/windows/wsl/install>. If it persists, hardware virtualization is likely off in BIOS/UEFI.
- **Container needs a rebuild** (config changed, or the box is wedged): in VS Code press F1 -> "Dev Containers: Rebuild Container".

The human-facing walkthrough (installs, cloning, first login) is [docs/getting-started.md](../../../docs/getting-started.md) - point users there rather than dictating terminal commands to them.

## Step 4: Declare healthy

Environment is healthy when: app returns 200, OIDC discovery issuer matches, `PlayerLevel rows: > 0`, and a browser one-click login at `$BROWSER_URL/admin/login` lands on the admin dashboard. For native and starter modes, `BROWSER_URL` equals `APP_URL`. State what was broken and what you fixed, then continue the original task.
