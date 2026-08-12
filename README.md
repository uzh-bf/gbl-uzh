# Game-Based Learning @ UZH

`gbl-uzh` is the code repository of the Game-Based Learning project (<https://www.gbl.uzh.ch/>) developed at the [Department of Finance](https://www.bf.uzh.ch/en.html) of the [University of Zurich](https://www.uzh.ch/en.html).

## Project Vision

Game-based learning has many benefits for lecturers and students. However, it can be difficult to get started with developing learning games and integrating games with other curricular activities. We want to foster the application of game-based learning in the university context by providing foundational resources for game usage and development based on what we have learned on our own journey.

For more details on our future plans, have a look at our [Roadmap](https://www.gbl.uzh.ch/about/).

## Project Components

The `gbl-uzh` project consists of the following key components:

- The `GBL Website` (located in the `apps/website` directory), a Next.js web application that summarizes all of the outputs of our project on a single site. The `GBL Website` is hosted publicly on <https://www.gbl.uzh.ch>.
- The `GBL Knowledge Base` (located in the `kb` directory as a Git submodule), an [Obsidian](https://obsidian.md/) knowledge graph that contains the knowledge on gamification and game-based learning that we gather and curate throughout this and other projects. The knowledge base also serves as a Content Management System (CMS) for the `GBL Website`. The `GBL Knowledge Base` is publicly accessible on <https://www.gbl.uzh.ch/kb>.
- The `GBL Advisor` (located in the `apps/advisor` directory), an advisory wizard for getting started in the space of Game-Based Learning as a teacher. The advisor is built on the Twinery text-based serious game engine.
- The `GBL Platform` (located in the `packages/platform` directory), a code framework for building round-based simulations with Next.js and React. Documentation for building games on the platform (written for humans and AI coding agents) lives in [`docs/`](docs/index.md), with matching agent skills in `.agents/skills/`.

## Getting Started

Want to build a learning game on the platform? [docs/getting-started.md](docs/getting-started.md) takes you from zero to a running local environment with an AI assistant that does the technical work — no coding experience needed. The same starter devcontainer also gives developers a zero-setup environment; the devrouter-based configuration for running many projects side by side is described in [.devcontainer/README.md](.devcontainer/README.md).

### Three ways to run the platform locally

All three modes share the same OIDC mock config, database image, and schema/seed (one-click admin login, no Auth0 account needed); they differ in where the app process runs, how it is reached, and which script bootstraps it (the devcontainers use `.devcontainer/post-create.sh`, native mode uses `pnpm run setup:host`). Run `bash .devcontainer/smoke.sh` on the native host or inside the selected app container; probe a devrouter HTTPS route separately from the host.

| Mode                                                                    | For                                                                                        | Setup                                                                                                                                   |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Starter devcontainer**                                                | First-time users, game builders — works natively with the VS Code Dev Containers extension | Open in VS Code, pick **GBL Starter**; app on <http://localhost:3000> ([walkthrough](docs/getting-started.md))                          |
| **Devcontainer + [devrouter](https://github.com/rschlaefli/devrouter)** | Maintainers running many projects side by side                                             | `dev up`, then `dev workspace ensure .` for a linked worktree; use `dev ls` for its namespaced URL ([details](.devcontainer/README.md)) |
| **Native `pnpm dev`**                                                   | Developers who prefer the host toolchain (Node 24+, PNPM 11)                               | [Native quickstart](#native-quickstart) below; app on <http://localhost:3000>                                                          |

#### Native quickstart

1. Make sure Docker is running and ports **5432, 8090, 3000** are free.
2. Get the pinned pnpm (`11.6.0`) — an older pnpm exits fine but leaves a stale `node_modules` behind:
   - **Volta** (team default): Volta's pnpm support is behind a feature flag — add `export VOLTA_FEATURE_PNPM=1` to your shell profile, otherwise Volta silently runs its default pnpm and ignores the repo pin.
   - **No Volta:** `corepack enable` honors the `packageManager` field.
   - Either way, verify: `pnpm --version` inside the repo must print `11.6.0`.
3. `docker compose up -d --wait` — starts Postgres and the local login mock (replaces Auth0, no account needed).
4. `pnpm install && pnpm run setup:host` — installs, builds shared packages, prepares and seeds the database.
5. `pnpm -F @gbl-uzh/demo-game dev`
6. Open <http://localhost:3000/admin/login> and click the login button — no password; you are the dev admin `gbl-dev@df.uzh.ch`.
7. If something seems off, `bash .devcontainer/smoke.sh` tells you whether the login mock, the app, or your setup is at fault.

If a default port is taken, every override needs its app-side counterpart (the app reads defaults from `apps/demo-game/.env*`): `GBL_DB_PORT` also needs `DATABASE_URL`/`SHADOW_DATABASE_URL`, `GBL_OIDC_PORT` also needs `GBL_MOCK_OIDC_ISSUER`, and `PORT` also needs `NEXTAUTH_URL`/`NEXT_PUBLIC_APP_URL`/`NEXT_PUBLIC_API_URL` — see the header of [docker-compose.yml](docker-compose.yml). Pass the resulting URLs to the diagnostic, for example `bash .devcontainer/smoke.sh http://localhost:13000 http://localhost:18090/default`. Login against a real Auth0 tenant instead of the mock requires `GBL_AUTH_MODE=auth0` in the game's `.env.local` (see `.env.local.template`).

To run an example game instead, select it with `GBL_GAME_TARGET` — the same steps otherwise, and Prisma creates that game's database on first push:

```bash
GBL_GAME_TARGET=central-bank pnpm run setup:host
pnpm -F @gbl-uzh/central-bank dev
```

Supported targets are `demo`, `central-bank`, and `rate-wars`. All three default to port 3000, so running them at the same time needs the `PORT` override and its counterparts.

## Requirements

- Building a game with the starter devcontainer: only Docker Desktop, VS Code, and the Dev Containers extension — see [Getting Started](docs/getting-started.md).
- Working on the codebase outside a devcontainer: Docker / Podman, Node.js 24+, PNPM 11. The repo pins both (`volta` field and `packageManager`); see step 2 of the [native quickstart](#native-quickstart) for making the pnpm pin actually apply (Volta needs `VOLTA_FEATURE_PNPM=1`).

## Contributing

We welcome any contributions to the project. If you would like to contribute to the code base, please create an [Issue](https://github.com/uzh-bf/gbl-uzh/issues) beforehand to ensure that your goals align with our project vision. If you would like to give us feedback or have any requests regarding content of the website or knowledge base, please add a new entry in [Discussions](https://github.com/uzh-bf/gbl-uzh/discussions).

## License

The GBL Website and Knowledge Base, as well as other published subcomponents, are licensed under the [AGPLv3](https://www.gnu.org/licenses/agpl-3.0.de.html).
