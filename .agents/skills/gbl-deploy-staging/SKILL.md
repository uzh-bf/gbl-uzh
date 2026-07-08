---
name: gbl-deploy-staging
description: Deploy a GBL game to a shareable staging URL with Vercel + Neon Postgres, driven from the CLI (neonctl + vercel). Use when a game builds and runs locally and needs a public URL for review - the easy alternative to the k8s deploy/ path.
---

# GBL Deploy Staging

App unreachable or environment broken locally? Run the `gbl-environment-doctor` skill first - this skill assumes the game already builds and runs on `http://localhost:3000`.

This is the **easy staging path**: a Vercel deployment of one game app backed by a Neon serverless Postgres, so you can hand a reviewer a URL. It is distinct from the production path (`deploy/`, Kubernetes + kustomize + infisical, `*.env.bf-app.ch`), which needs cluster access and is owned by the platform team.

The conceptual reference is [docs/deploying-a-game.md](../../../docs/deploying-a-game.md) - read it for the "why" behind each step. This skill is the actionable runbook.

## When to use this skill

- A game app under `apps/<game>` builds locally (`pnpm --filter @gbl-uzh/<game> run build` succeeds) and the user wants a public URL.
- You have (or can create) Vercel + Neon accounts. Both have free tiers.
- The user wants the **easy** path. If they mention k8s, `deploy/`, `bf-app.ch`, or infisical, that is the production path - not this skill.

## Prerequisites (check before starting)

```bash
vercel --version    # npm i -g vercel; vercel login
neonctl --version   # npm i -g neonctl; neonctl auth
pnpm --filter @gbl-uzh/<game> run build   # must succeed locally first
```

If the local build fails, fix that first - a Vercel build fails the same way but slower.

## Runbook

Follow [docs/deploying-a-game.md](../../../docs/deploying-a-game.md) steps 1-6 in order. The load-bearing decisions, condensed:

1. **Neon**: `neonctl projects create --name <game>-staging`. Collect **two** connection strings - pooled (`-pooler` host, append `?sslmode=require`) for the app, direct for migrations/seed.
2. **Vercel project**: `vercel link` from the repo root. Root Directory `apps/<game>`. Build command MUST use `pnpm --filter @gbl-uzh/<game>... run build` (the `...` builds workspace deps first - required because `prisma/copy.ts` reads `@gbl-uzh/platform/dist/schema.prisma` at build time).
3. **Env vars in Vercel** (not in committed `.env.production`): `DATABASE_URL` (pooled), `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `AUTH0_*`. See the table in the wiki page.
4. **Schema + seed** against Neon with the **direct** string: `prisma migrate deploy` (or `db push`) then `prisma:seed`. Seeding is mandatory - no `PlayerLevel` ladder means players cannot be created.
5. **Auth**: mock OIDC is local-only. A public deploy needs a real Auth0/OIDC tenant - see [docs/deploying-a-game.md](../../../docs/deploying-a-game.md) Step 5 and the [Auth0 NextAuth docs](https://authjs.dev/getting-started/providers/auth0).
6. **Deploy**: `vercel` (preview URL) then `vercel --prod`.

## Critical guardrails (where agents go wrong)

- **Never point `DATABASE_URL` at the direct (non-pooled) Neon string in Vercel.** Serverless functions open many short-lived connections; without the pooler you hit the connection limit fast. Direct is for migrate/seed only.
- **`NEXT_PUBLIC_*` are build-time baked.** Changing them requires a redeploy, not a restart. Set them to the final Vercel domain before the first prod deploy.
- **`NEXTAUTH_URL` must match the deployed origin exactly** (including `https://`). A mismatch causes `STATE_COOKIE_MISSING` on admin login - the same `localhost` vs `127.0.0.1` class of bug as local Playwright.
- **The committed `apps/<game>/.env.production` is demo-game leftover.** When scaffolding from `apps/demo-game` it still points at `demo-game.stg.env.bf-app.ch`. Vercel env vars override it, but fix or empty the file anyway (see `gbl-new-game-app` decontamination checklist).
- **`SHADOW_DATABASE_URL` is not needed on Vercel.** It is only used by `prisma migrate dev` (local authoring). Leave it unset.

## Verify

After `vercel --prod`:

1. Open `https://<domain>/admin/login` - sign in through your OIDC tenant.
2. Create a game with 2 players, add a period + segment.
3. Open a player join link in a second browser, drive one full loop: Start Period -> Next Segment -> submit decision -> Segment Results -> Consolidate -> Period Results ([docs/game-lifecycle.md](../../../docs/game-lifecycle.md)).
4. If any step fails, check the [Gotchas table](../../../docs/deploying-a-game.md) before debugging code - most staging failures are env-var or connection-string mistakes, not game bugs.
