---
type: Deployment Guide
title: Deploying a Game to Staging (Vercel + Neon)
description: The easy path to a shareable staging URL for a GBL game - a Vercel deployment backed by a Neon Postgres database, driven from the CLI.
tags:
  - deployment
  - staging
  - vercel
  - neon
  - prisma
timestamp: "2026-09-07T00:00:00Z"
---

# Deploying a Game to Staging (Vercel + Neon)

There are two ways to get a GBL game off your machine:

- **The production path** (`deploy/`) - Kubernetes + kustomize + infisical, targeting `*.env.bf-app.ch`. Maintained by the platform team; needs cluster access. Not covered here.
- **This page - the easy staging path** - a [Vercel](https://vercel.com) deployment of one game app backed by a [Neon](https://neon.tech) serverless Postgres, so you can hand a reviewer a URL. CLI-first, so a coding agent can drive it end to end.

Driven by the `gbl-deploy-staging` skill (`.agents/skills/gbl-deploy-staging/`). Read [developing-a-game.md](developing-a-game.md) first - this assumes you already have a game app that builds and runs locally.

## What makes this a monorepo deploy (read this first)

The game is one app inside a pnpm + turbo monorepo, and that shapes every setting below:

- The app depends on `@gbl-uzh/platform` and `@gbl-uzh/ui` (`workspace:*`). They must be **built before** the game, because `prisma/copy.ts` copies the platform's `schema.prisma` out of `node_modules/@gbl-uzh/platform/dist/` at build time (`apps/<game>/prisma/copy.ts`). A build that skips the workspace packages fails at `prisma:copy`.
- The Prisma client is generated for a Linux runtime. The datasource + generator live in the platform schema; this branch already pins `binaryTargets = ["native", "linux-musl"]` in the generator block so the client works both locally and on Vercel's build image. Keep it.
- Install happens at the **repo root** (workspace resolution); build targets the **one app**.

## Prerequisites

- `vercel` CLI (`npm i -g vercel`) and a Vercel account, logged in (`vercel login`).
- `neonctl` CLI (`npm i -g neonctl`) and a Neon account, logged in (`neonctl auth`).
- The game builds locally: `pnpm --filter @gbl-uzh/<game> run build` succeeds.

## Step 1 - Provision the database (Neon)

```bash
# Create a project (one per game is cleanest) and read back the connection string
neonctl projects create --name <game>-staging
neonctl connection-string --project-id <id> --pooled   # -> DATABASE_URL (app runtime)
neonctl connection-string --project-id <id>             # -> direct (migrations + seed)
```

Neon gives you two forms of the same database:

- **Pooled** (host contains `-pooler`): use for the app's `DATABASE_URL`. Vercel functions are serverless and open many short-lived connections; the pooler is what keeps you under the connection limit. Append `?sslmode=require`.
- **Direct** (no `-pooler`): use only for schema migration and seeding. Prisma migrations do not run through the PgBouncer pooler.

> **NOTE:** `SHADOW_DATABASE_URL` is not needed for a staging deploy. The platform schema declares `shadowDatabaseUrl = env("SHADOW_DATABASE_URL")`, but a shadow database is only used by `prisma migrate dev` (local authoring). Staging uses `migrate deploy` / `db push`, which do not touch it. Leave it unset in Vercel.

## Step 2 - Create + link the Vercel project

Run from the repo root:

```bash
vercel link            # create/link a project; when asked, this is a monorepo
vercel project ls
```

Then set the project so Vercel builds only your app out of the workspace. In the Vercel project settings (or `vercel.json` at the repo root), the load-bearing values are:

- **Root Directory**: `apps/<game>`
- **Install Command**: `pnpm install --no-frozen-lockfile` (run at repo root; the lockfile HACK mirrors `apps/<game>/Dockerfile`)
- **Build Command**: `cd ../.. && pnpm --filter @gbl-uzh/<game>... run build` - the `...` selector builds the app **and its workspace dependencies** first, satisfying the `prisma:copy` requirement above.
- **Output**: Next.js is auto-detected; the app already sets `output: "standalone"` in `next.config.ts`, which Vercel handles.

## Step 3 - Set environment variables

### Isolated Startinvest ARM staging image

The additional `build_startinvest_arm64` workflow job selects
`apps/demo-game/.env.staging-arm64` with Docker build argument
`APP_ENV=staging-arm64`. It sets `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to
`https://startinvest.stg.df-app.ch`, and `NEXT_PUBLIC_API_URL` to that origin
plus `/api/graphql`. The job validates dev pull requests without publishing;
pushes to dev publish only `ghcr.io/uzh-bf/gbl-uzh/demo-game:dev-startinvest-arm64`.
It runs on `ubuntu-24.04-arm` and does not contribute to the existing
multi-architecture manifest. Existing builds retain `APP_ENV=production`,
the original `.env.production`, and their current tags and deployment URLs.
The new helm-charts staging deployment should pin a verified digest from the
Startinvest variant after merge; no existing deployment is switched here.

### Vercel configuration

Set these in Vercel (Production or Preview scope), **not** in the committed `.env.production` files:

| Variable                                                   | Value                                      | Notes                                  |
| ---------------------------------------------------------- | ------------------------------------------ | -------------------------------------- |
| `DATABASE_URL`                                             | Neon **pooled** string                     | app runtime                            |
| `NEXTAUTH_URL`                                             | `https://<your-vercel-domain>`             | must match the deployed origin exactly |
| `NEXTAUTH_SECRET`                                          | `openssl rand -base64 32`                  | required in production                 |
| `NEXT_PUBLIC_API_URL`                                      | `https://<your-vercel-domain>/api/graphql` | **build-time baked** (see warning)     |
| `NEXT_PUBLIC_APP_URL`                                      | `https://<your-vercel-domain>`             | **build-time baked**                   |
| `AUTH0_CLIENT_ID` / `AUTH0_CLIENT_SECRET` / `AUTH0_ISSUER` | from your OIDC tenant                      | see Step 5                             |

```bash
printf 'https://<your-vercel-domain>' | vercel env add NEXT_PUBLIC_APP_URL production
# ...repeat per variable, or use `vercel env pull` to sync a local file
```

> **WARNING:** The committed `apps/<game>/.env.production` is demo-game leftover. When a game is scaffolded by copying `apps/demo-game`, these files still point `NEXT_PUBLIC_*` and `NEXTAUTH_URL` at `demo-game.stg.env.bf-app.ch`. Vercel dashboard env vars override them at build time, but fix or empty the committed files anyway so nobody deploys the wrong origin from the k8s path. `NEXT_PUBLIC_*` values are **inlined into the client bundle at build time** - changing them requires a redeploy, not just a restart.

## Step 4 - Initialise the schema + seed (against Neon)

Run once from the app directory, using the **direct** (non-pooled) connection string:

```bash
cd apps/<game>
DATABASE_URL="<neon-direct-string>" pnpm prisma migrate deploy --schema=prisma/schema
DATABASE_URL="<neon-direct-string>" pnpm prisma:seed
```

`prisma migrate deploy` applies the committed migrations under `prisma/schema/migrations/`. If your game has no migration history yet, `pnpm prisma db push --schema=prisma/schema` is the pragmatic staging alternative. Seeding is mandatory - without the `PlayerLevel` ladder from `prisma/seed.ts`, players cannot be created.

## Step 5 - Auth for a real deployment

The one-click mock OIDC login is **local-only** (the devcontainer's `mock-oauth2-server` sidecar). All in-repo games use the shared `resolveAdminOidcConfig()` resolver (`packages/platform/src/lib/auth.ts:resolveAdminOidcConfig`). Starter, devrouter, and CI use mock OIDC through `GBL_AUTH_MODE=mock` and `GBL_MOCK_OIDC_*`. Native host real-tenant opt-in requires explicit `GBL_AUTH_MODE=auth0` with ignored `AUTH0_*` values; production defaults to real `AUTH0_*` and forbids mock mode.

Minimum setup in your provider, then set the three `AUTH0_*` vars in Vercel:

- Allowed callback URL: `https://<your-vercel-domain>/api/auth/callback/auth0`
- Allowed logout URL: `https://<your-vercel-domain>/`
- Application login URL: `https://<your-vercel-domain>/admin/login`

For provider-side details (creating the application, issuer URL format), follow the [Auth0 Next.js / NextAuth docs](https://authjs.dev/getting-started/providers/auth0). Players never authenticate here - they join via per-game links - so this only gates admin login.

## Step 6 - Deploy

```bash
vercel           # preview deployment (shareable URL)
vercel --prod    # promote to the project's production domain
```

Open `https://<your-vercel-domain>/admin/login`, sign in through your OIDC tenant, create a game, and drive one full lifecycle to confirm the deploy is wired end to end.

## Gotchas

| Symptom                                                       | Cause                                                                  | Fix                                                                                      |
| ------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Build fails at `prisma:copy` (`schema.prisma` not found)      | Workspace packages not built before the app                            | Use the `--filter @gbl-uzh/<game>...` selector so `@gbl-uzh/platform` builds first       |
| App loads but every query hangs on `loading`                  | `NEXT_PUBLIC_API_URL` points at the wrong origin (stale demo-game URL) | Set it to `https://<your-vercel-domain>/api/graphql` and **redeploy** (build-time baked) |
| Admin login redirects then errors with a state/cookie failure | `NEXTAUTH_URL` does not match the deployed origin                      | Set `NEXTAUTH_URL` to the exact `https://` domain, redeploy                              |
| Too many database connections under light load                | App using the direct (non-pooled) Neon string                          | Point `DATABASE_URL` at the **pooled** string; keep direct only for migrate/seed         |
| `prisma migrate deploy` hangs or errors on Neon               | Running migrations through the pooler                                  | Run migrations with the **direct** connection string                                     |
