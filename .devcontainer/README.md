# Dev container

Self-contained local environment for the **gbl-uzh demo-game** by default. No Infisical, no
external Auth0 — clone, route through devrouter, and run. The devcontainer owns
the whole stack (toolchain, Postgres, the local OIDC mock, install + build +
seed, the dev server); [devrouter](https://github.com/rschlaefli/devrouter)
fronts it on a shared `:443` / `:5432` so many projects coexist with **zero
host-port collisions** (nothing is published on the host).

> [!NOTE]
> This README documents the **devrouter** configuration (multi-project routing,
> host tooling required). First time here, or just building a game? Use the
> **starter** configuration instead (`starter/` in this directory): only Docker +
> VS Code (with the Dev Containers extension) needed, ports published on
> localhost, Claude Code preinstalled.
> Walkthrough: [`docs/getting-started.md`](../docs/getting-started.md).

## Prerequisites

devrouter **≥ 0.0.31** (proxy + TCP routing and managed workspace cleanup).
One-time host setup — must run **before** the container starts, because the
stack joins devrouter's external `devnet` network and that network must already
exist:

```bash
dev up && dev tls install   # Traefik + the shared `devnet` + mkcert CA (needs 80/443/5432 free)
```

The compose file mounts the mkcert root CA from
`${DEVROUTER_MKCERT_CAROOT:-$HOME/Library/Application Support/mkcert}` (the
macOS default). On Linux set `DEVROUTER_MKCERT_CAROOT=~/.local/share/mkcert`,
on Windows `%LOCALAPPDATA%\mkcert`, before starting the container.

## Run with DevPod

```bash
brew install devpod            # or: https://devpod.sh/docs/getting-started/install
devpod provider add docker

devpod up . --ide none         # builds image, starts DB/OIDC, installs, builds deps, seeds, runs dev

# register the routes (one per app; prints the https URLs)
for a in app oidc db; do dev app run "$a" --yes; done
```

Open <https://demo-game.localhost>. The dev server auto-starts in the background
(`tail -f /tmp/dev.log` for output).

## Select a game target

`WORKSPACE` names the routed host and container aliases. `GBL_GAME_TARGET`
separately selects the package used consistently for Prisma copy/generate/push,
seed, and the dev server. It defaults to `demo`; the supported values are:

| Target         | Package                 |
| -------------- | ----------------------- |
| `demo`         | `@gbl-uzh/demo-game`    |
| `central-bank` | `@gbl-uzh/central-bank` |
| `rate-wars`    | `@gbl-uzh/rate-wars`    |

Pass an explicit target when creating the DevPod workspace, for example:

```bash
devpod up . --ide none --workspace-env GBL_GAME_TARGET=central-bank
```

The target does not derive from a branch or workspace name, and it does not
change the routed hostname. Use a distinct `WORKSPACE` when you need an isolated
route and database volume. Unknown targets fail before any Prisma command runs.

## How routing works

The app, OIDC mock, and Postgres join the external `devnet` network with
workspace-aware aliases (`${WORKSPACE:-demo-game}-app`,
`${WORKSPACE:-demo-game}-oidc`, `${WORKSPACE:-demo-game}-db`). devrouter's
Traefik (also on `devnet`) routes to them **by name over the network** — no
published host ports. Linked worktrees namespace both the app and OIDC issuer
hosts automatically.

| What      | Host                                       | Upstream (devnet)        |
| --------- | ------------------------------------------ | ------------------------ |
| App       | `https://demo-game.localhost`              | `${WORKSPACE}-app:3000`  |
| OIDC mock | `https://oidc.demo-game.localhost/default` | `${WORKSPACE}-oidc:8090` |
| Postgres  | `db.demo-game.localhost:5432`              | `${WORKSPACE}-db:5432`   |

Connect to the DB with direct-SSL so the TLS ClientHello carries the SNI:

```bash
psql "host=db.demo-game.localhost port=5432 user=prisma password=prisma \
      dbname=prisma sslmode=require sslnegotiation=direct"
```

## Admin login

Auth0 is replaced by a local OIDC mock (`mock-oauth2-server`), routed through
devrouter at `https://oidc.demo-game.localhost/default`. Login is **one-click** —
no password. You are authenticated as the fixed dev admin `gbl-dev@df.uzh.ch`
(stable `sub` across restarts). The browser (authorize) and the app server
(discovery/token/jwks) use the **same issuer host**, so the token `iss` is
consistent; the app resolves that host to the host gateway (`extra_hosts`) and
trusts the mkcert CA via `NODE_EXTRA_CA_CERTS` (see `docker-compose.yml`).

All local modes default to the mock through `GBL_MOCK_OIDC_*`. A real Auth0
tenant is an explicit opt-in: set `GBL_AUTH_MODE=auth0` in the ignored
`.env.local` and provide `AUTH0_*`; configure the routed callback as
`https://demo-game.localhost/api/auth/callback/auth0` (or the equivalent
workspace hostname). The starter callback remains
`http://localhost:3000/api/auth/callback/auth0`.

## What's inside

| Service    | Image                       | Purpose                                          |
| ---------- | --------------------------- | ------------------------------------------------ |
| `app`      | local `Dockerfile`          | runs the demo-game `next dev`                    |
| `postgres` | `postgres:15`               | DB, fixed creds `prisma/prisma`, seeds shadow DB |
| `oidc`     | `mock-oauth2-server:2.1.11` | local Auth0 replacement (sidecar)                |

Environment lives in `devcontainer.env` (committed, dev-only values). Lifecycle:
`post-create.sh` (install + build platform/ui + prisma generate/push/seed) then
`post-start.sh` (launch dev server). `node_modules` are named volumes (not the
host's), so native binaries match the Linux container.

The OIDC mock's config is shared by all run modes (this one, `starter/`, and
the root `docker-compose.yml` for native `pnpm dev`):
`docker/oidc-config.json`, mounted via `JSON_CONFIG_PATH`. Sanity-check any
running mode from inside the app container with
`bash .devcontainer/smoke.sh http://localhost:3000 <issuer-url>`; probe the
routed app URL separately from the host.
