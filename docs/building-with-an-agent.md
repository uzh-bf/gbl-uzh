---
type: Getting Started Guide
title: Building a Game with Your Own Coding Agent
description: Point an external coding agent (Claude Desktop, Codex, Claude Code on your host) at this repo on Windows or macOS, bring the platform up with Docker only, and build a game — no VS Code required.
tags:
  - onboarding
  - agent
  - devcontainer
  - docker
timestamp: "2026-08-11T00:00:00Z"
---

# Building a Game with Your Own Coding Agent

There are two ways to get from nothing to a running game:

- **[getting-started.md](getting-started.md)** — you drive VS Code yourself, and Claude Code runs _inside_ the devcontainer. Best for a guided, click-through setup.
- **This page** — you point your _own_ coding agent (Claude Desktop, the Codex app, Claude Code in a host terminal, …) at the repo, and it drives setup and building for you. Best if you already have an agent and want it to do the work.

This page is written so you can hand it — or the first-game brief that links here — straight to that agent.

## The one thing that's different: a host clone, not a volume clone

Your agent runs on your computer (the "host"), so it can only see and edit files that live on your computer's disk. That rules out VS Code's "Clone Repository in **Container Volume**" — that hides the code inside Docker, where a host agent can't reach it.

Instead:

1. **Clone the repo normally, onto your disk** (`git clone`).
2. Bring up the **starter devcontainer**, which **bind-mounts your host clone** into the container.
3. Your agent **edits the source files in your host clone**; the container runs them and serves the app on **http://localhost:3000**.
4. Your agent **runs repo commands inside the container** (the toolchain and `node_modules` live there, not on your host).

## What you install

Just a **Docker-compatible container runtime** (plus `git` to clone). You do **not** need VS Code, Node, pnpm, or the platform toolchain on your host.

- **Windows:** install **[Rancher Desktop](https://rancherdesktop.io/)** and select the **dockerd (moby)** engine during setup. Accept **WSL 2** when the installer offers it (restart if asked). Run the agent's shell commands from **PowerShell** or a **WSL** terminal — either can reach Docker.
- **macOS:** install **[OrbStack](https://orbstack.dev/)** or **[Rancher Desktop](https://rancherdesktop.io/)** (with the **dockerd (moby)** engine).
- _Already have Docker Desktop?_ That works too — any runtime providing `docker` and `docker compose` is fine.

## Bring the platform up (headless, Docker only)

Clone and start the stack. Replace `gbl` with any project name you like, but keep it the same across all commands.

```bash
git clone https://github.com/uzh-bf/gbl-uzh
cd gbl-uzh

# 1. Build + start Postgres, the app container, and the OIDC mock login
docker compose -f .devcontainer/starter/docker-compose.yml -p gbl up -d --build

# 2. Install deps, build shared packages, create + seed the database (~1-2 min)
docker compose -f .devcontainer/starter/docker-compose.yml -p gbl exec app bash /workspaces/gbl-uzh/.devcontainer/post-create.sh

# 3. Start the dev server (the first page compiles in ~30-60s)
docker compose -f .devcontainer/starter/docker-compose.yml -p gbl exec app bash /workspaces/gbl-uzh/.devcontainer/post-start.sh
```

> **Shortcut if you have Node on your host:** `npx -y @devcontainers/cli up --workspace-folder . --config .devcontainer/starter/devcontainer.json` does steps 1–3 in one command (it runs the same setup hooks). The three Docker commands above need only Docker.

## Check it works

Open **http://localhost:3000** in your browser — you should see the demo game. Then open **http://localhost:3000/admin/login** and click the login button — no password; you're the demo admin `gbl-dev@df.uzh.ch`. (Players join a game through a per-game link and never need accounts.)

For a scripted check, curl _inside the container_ (works from PowerShell, WSL, or macOS — unlike a host `curl`, which PowerShell rewrites):

```bash
docker compose -f .devcontainer/starter/docker-compose.yml -p gbl exec app curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000   # -> 200
```

## How your agent works from here

- **Edit code** in your host clone. Changes are live in the container immediately (bind mount) and the dev server hot-reloads.
- **Run repo commands inside the container.** Whenever a skill or the docs tell you to run something (`pnpm …`, `prisma …`, a health check), run it in the container:

  ```bash
  docker compose -f .devcontainer/starter/docker-compose.yml -p gbl exec app bash -lc 'cd /workspaces/gbl-uzh && <the command>'
  ```

  Do **not** run `pnpm install` on your host — `node_modules` live in the container's volumes so the Linux-native binaries stay correct.

- **Follow the game-building skills** (they assume this platform and read the wiki themselves): `gbl-game-design` (first, before any code) → `gbl-new-game-app` (scaffold) → `gbl-backend-computations` → `gbl-frontend-game-ui`, with `gbl-playwright-e2e` for tests. See [developing-a-game.md](developing-a-game.md) and the [agent skills](../.agents/skills/). One caveat: `gbl-playwright-e2e`'s "Local Stack" section is for the devrouter/DevPod setup — in this Docker-only mode the app is already at `http://localhost:3000`, so skip that section and run Playwright inside the container (the skill now says as much).
- **If anything breaks** (app won't load, login fails, empty admin UI): run the `gbl-environment-doctor` skill first, before debugging code. Its checks are meant to run inside the container, so prefix them with `docker compose -f .devcontainer/starter/docker-compose.yml -p gbl exec app …` as above. The mode is `starter`; the app is always `http://localhost:3000`.

## Troubleshooting

| Symptom                                                                                              | Cause                                                                                                                                        | Fix                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EACCES` error mentioning `pnpm.cjs` under `.volta/` when running `pnpm run dev` or `pnpm run build` | `npm-run-all` (`run-s`) cannot spawn the Volta-shimmed pnpm on the host                                                                      | Run commands **inside the container** via the explicit starter `docker compose -f .devcontainer/starter/docker-compose.yml -p gbl exec app` prefix (the container has a normal pnpm). If you must run on the host, execute the current subcommands directly (for the platform: `pnpm run generate && pnpm run build:ts && pnpm run build:dts`). |
| `127.0.0.1` vs `localhost` cookie / OIDC errors                                                      | NextAuth state cookies are domain-scoped; `127.0.0.1` ≠ `localhost`                                                                          | Always use `http://localhost:3000` in the browser and in `PLAYWRIGHT_BASE_URL`.                                                                                                                                                                                                                                                                 |
| You need to test demo-game against a real Auth0 tenant                                               | Starter process variables intentionally pin the local mock and override `.env.local`                                                         | Use native host mode with `GBL_AUTH_MODE=auth0` in `apps/demo-game/.env.local`; the starter path supports mock login only.                                                                                                                                                                                                                      |
| App silently reads/writes the wrong database (e.g. writes land in `prisma`, not your game's DB)      | A `DATABASE_URL` set in the container's shell environment overrides the app's `.env` — Node gives `process.env` precedence over `.env` files | Pass `DATABASE_URL` explicitly on the command (e.g. `DATABASE_URL="postgres://prisma:prisma@postgres:5432/<game>?schema=public" pnpm prisma db push --schema=prisma/schema`), or unset the shell var so the app's `.env` wins.                                                                                                                  |

## Stop, restart, reset

```bash
docker compose -f .devcontainer/starter/docker-compose.yml -p gbl stop        # pause (keeps data)
docker compose -f .devcontainer/starter/docker-compose.yml -p gbl up -d       # resume, then re-run post-start.sh for the dev server
docker compose -f .devcontainer/starter/docker-compose.yml -p gbl down        # remove containers (keeps the database volume)
docker compose -f .devcontainer/starter/docker-compose.yml -p gbl down -v     # full reset (also wipes the database)
```

## A first game to build

For a concrete, self-contained brief you can hand to your agent — set up the platform, build a "Central Bank" monetary-policy game with the skills, and report back on how well they guided it — see [`project/2026-07-05-central-bank-first-game-brief.md`](../project/2026-07-05-central-bank-first-game-brief.md).
