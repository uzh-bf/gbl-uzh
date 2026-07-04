# Dev container

Self-contained local environment for the **gbl-uzh demo-game**. No Infisical, no
external Auth0 — clone, route through devrouter, and run. The devcontainer owns
the whole stack (toolchain, Postgres, the local OIDC mock, install + build +
seed, the dev server); [devrouter](https://github.com/rschlaefli/devrouter)
fronts it on a shared `:443` / `:5432` so many projects coexist with **zero
host-port collisions** (nothing is published on the host).

> [!NOTE]
> This README documents the **devrouter** configuration (multi-project routing,
> host tooling required). First time here, or just building a game? Use the
> **starter** configuration instead (`starter/` in this directory): only Docker +
> VS Code needed, ports published on localhost, Claude Code preinstalled.
> Walkthrough: [`docs/getting-started.md`](../docs/getting-started.md).

## Prerequisites

devrouter **≥ 0.0.23** (proxy + TCP routing). One-time host setup — must run
**before** the container starts, because the stack joins devrouter's external
`devnet` network and that network must already exist:

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

## How routing works

The app and Postgres join the external `devnet` network with workspace-aware
aliases (`${WORKSPACE:-demo-game}-app`, `${WORKSPACE:-demo-game}-db`).
devrouter's Traefik (also on `devnet`) routes to them **by name over the
network** — no published host ports. The OIDC mock shares the app container's
netns, so it is reached on `devnet` as `${WORKSPACE:-demo-game}-app:8090`.

| What      | Host                                       | Upstream (devnet)       |
| --------- | ------------------------------------------ | ----------------------- |
| App       | `https://demo-game.localhost`              | `${WORKSPACE}-app:3000` |
| OIDC mock | `https://oidc.demo-game.localhost/default` | `${WORKSPACE}-app:8090` |
| Postgres  | `db.demo-game.localhost:5432`              | `${WORKSPACE}-db:5432`  |

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
