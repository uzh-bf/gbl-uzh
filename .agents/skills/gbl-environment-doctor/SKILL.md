---
name: gbl-environment-doctor
description: Diagnose and repair the local GBL dev environment - devcontainer, database, seed data, OIDC mock login, dev server, and routing. Use whenever the app is unreachable, login fails, pages 500, the admin UI looks empty, a setup step failed, or any other gbl-* skill hits an environment error - run this BEFORE debugging application code. Also use when a non-technical user says anything like "it doesn't work" or "the page won't load".
---

# GBL Environment Doctor

Most "bugs" a first-time user hits are environment problems, not code problems. Diagnose in the order below; each check names its fix. Re-run the checks top-to-bottom after every fix. Environment healthy -> go back to the skill that sent you.

## Step 0: Which mode is this?

```bash
echo "${GBL_DEV_MODE:-devrouter}"
```

- `starter` (the "GBL Starter" devcontainer): app at `http://localhost:3000`, OIDC mock at `http://localhost:8090/default`. Ports are published on the host's loopback; no extra tooling.
- anything else: the devrouter config. **Never assume `https://demo-game.localhost`** - worktree checkouts register `demo-game.<worktree-slug>.localhost` instead. Derive the real URLs on the HOST with `dev ls` / `dev app ls` (see the `devrouter` skill).

Set `APP_URL` and `ISSUER` accordingly for the checks below.

## Step 1: Health checks, in order

1. **In the container?** `[ -d /workspaces/gbl-uzh ]` - if not, you are on the host; work in the devcontainer terminal instead.
2. **Dev server process**: `pgrep -f "next dev" || echo DOWN`. If DOWN: `bash .devcontainer/post-start.sh` (safe to re-run; skips if already running). Always check the log: `tail -50 /tmp/dev.log`.
3. **App responds**: `curl -s -o /dev/null -w '%{http_code}' "$APP_URL"` -> expect `200`. The first compile after a start takes 30-60s - retry before concluding failure.
4. **OIDC discovery**: `curl -s "$ISSUER/.well-known/openid-configuration"` -> JSON whose `issuer` field matches `$AUTH0_ISSUER` **exactly** (the mock echoes the request Host, so `localhost` vs `127.0.0.1` matters).
5. **Database + seed**:

   ```bash
   cd /workspaces/gbl-uzh/apps/demo-game && pnpm exec tsx --eval \
     'const {PrismaClient}=require("@prisma/client");const p=new PrismaClient();p.playerLevel.count().then(c=>{console.log("PlayerLevel rows:",c);process.exit(c>0?0:1)}).catch(e=>{console.error(e.message);process.exit(2)})'
   ```

   Exit 1 (zero rows) -> seed missing: `pnpm -F @gbl-uzh/demo-game prisma:seed` (idempotent upserts, always safe to re-run). Exit 2 -> DB/connection problem, see signatures below.

6. **Install intact**: `pnpm -F @gbl-uzh/demo-game exec prisma -v` works and `/workspaces/gbl-uzh/node_modules` exists. If not: from the repo root run a FULL `pnpm install` - **never `--filter`** (a filtered install omits `@tailwindcss/aspect-ratio` and `next dev` 500s on the design-system CSS).

## Step 2: Known failure signatures

| Symptom                                                                   | Cause                                                                                              | Fix                                                                                                                                     |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Browser: localhost:3000 refused, but checks 2-3 pass inside the container | ports not published (wrong config chosen) or something else grabbed 3000/8090 before the container | Rebuild with the "GBL Starter" configuration; ask the human to close the other app if `port is already allocated` appeared at startup   |
| Login fails with state/PKCE cookie errors                                 | browser used `127.0.0.1` while the app is configured for `localhost`                               | always use `http://localhost:3000`                                                                                                      |
| Token/issuer (`iss`) mismatch on login                                    | `AUTH0_ISSUER` host differs from the host the browser hit                                          | same fix: `localhost` everywhere; compare check 4 output with `$AUTH0_ISSUER`                                                           |
| devrouter mode: dev server up but app URL 404s                            | routes never registered (manual host step)                                                         | on the HOST: `for a in app oidc db; do dev app run "$a" --yes; done`; verify with `dev ls`                                              |
| `network devnet ... not found` at container start                         | devrouter not running on host (devrouter mode only)                                                | on the HOST: `dev up && dev tls install`; or switch to the starter config, which needs neither                                          |
| Prisma error `42601` / empty `search_path` right after first start        | fresh Postgres volume warmup race - NOT a config bug                                               | retry `pnpm -F @gbl-uzh/demo-game prisma:push` for up to ~60s                                                                           |
| `set: pipefail: invalid option name` during setup                         | CRLF line endings from an old Windows checkout (repo enforces LF since 2026-07)                    | re-clone via "Dev Containers: Clone Repository in Container Volume"                                                                     |
| Env values truncated at first `=` (e.g. `?schema` without `=public`)      | DevPod env_file truncation                                                                         | already worked around: lifecycle scripts re-source `$GBL_ENV_FILE`; keep `=`-bearing values in the env FILE, not compose `environment:` |
| Playwright: `Executable doesn't exist`                                    | browsers are not baked into the devcontainer image                                                 | `pnpm exec playwright install --with-deps chromium`, or follow `gbl-playwright-e2e`                                                     |
| A checkout contains `apps/demo-game/docker-compose.yml` or `_run.sh`      | stale pre-devcontainer stack, superseded by the devcontainer configs                               | never run them - they collide with devrouter on host ports 80/443/5432; use the devcontainer configs                                    |

## Step 3: Fixes only the human can do

Relay these in plain language (they run OUTSIDE the container):

- **Docker Desktop is not running** - nothing works without the whale icon running. Ask them to start it, then retry.
- **Windows: "WSL 2 installation is incomplete"** - enable the Windows features "Windows Subsystem for Linux" and "Virtual Machine Platform", reboot, then run `wsl --update` in an admin PowerShell. Reference: <https://learn.microsoft.com/windows/wsl/install>. If it persists, hardware virtualization is likely off in BIOS/UEFI.
- **Container needs a rebuild** (config changed, or the box is wedged): in VS Code press F1 -> "Dev Containers: Rebuild Container".

The human-facing walkthrough (installs, cloning, first login) is [docs/getting-started.md](../../../docs/getting-started.md) - point users there rather than dictating terminal commands to them.

## Step 4: Declare healthy

Environment is healthy when: app returns 200, OIDC discovery issuer matches, `PlayerLevel rows: > 0`, and a browser one-click login at `$APP_URL/admin/login` lands on the admin dashboard. State what was broken and what you fixed, then continue the original task.
