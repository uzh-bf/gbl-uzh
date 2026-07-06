# Log

## 2026-07-06

- **Creation**: `deploying-a-game.md` - the easy staging deploy path: a Vercel deployment of one game app backed by a Neon serverless Postgres, CLI-first (`neonctl` + `vercel`), distinct from the k8s production path (`deploy/`). Covers the monorepo build-order gotcha (`prisma/copy.ts` needs `@gbl-uzh/platform` built first), pooled vs direct Neon connection strings, the env-var matrix, and the Auth0/OIDC reality (mock OIDC is local-only).
- **Update**: `developing-a-game.md` - added a "Decontaminate the copy" warning to the scaffolding section (demo-game residue hit-list) and a deploy pointer in the verification loop; `index.md` - added the new page to the reading order and `gbl-deploy-staging` to the skills list.
- **Companion skill updates** (not part of the docs bundle, done in the same pass): new `gbl-deploy-staging` skill; `gbl-new-game-app` gained a decontamination checklist + definition of done; `gbl-playwright-e2e` promoted the starter/Docker path to default, added a spec-adaptation checklist, the fast-submit `toBeEnabled()` idiom, and a prominent sentinel-period callout; `gbl-wiki-maintenance` gained a deployment trigger.

## 2026-07-05

- **Creation**: `building-with-an-agent.md` - the external-agent onboarding path: point a host coding agent (Claude Desktop / Codex, Windows or macOS) at a normal `git clone`, bring the starter stack up headlessly with Docker only (no VS Code, no volume-clone), and run repo commands via `docker compose exec`. Bring-up commands verified end-to-end (app 200 on host `localhost:3000`, OIDC issuer match).
- **Update**: `getting-started.md` - added a cross-pointer to the external-agent path; `index.md` - added the new page to the reading order and completed the agent-skills list (`gbl-playwright-e2e`, `gbl-environment-doctor`).

## 2026-07-04

- **Creation**: `getting-started.md` - plain-language onboarding for non-technical game builders (Docker Desktop + VS Code + Dev Containers extension, the "GBL Starter" devcontainer configuration with published localhost ports and preinstalled Claude Code, one-click mock login, first prompts, health-check escalation).
- **Update**: `developing-a-game.md` - local-dev step now names both devcontainer configurations (starter and devrouter) and links the getting-started guide.

## 2026-07-03

- **Creation**: Initial knowledge bundle with seven concepts (platform overview, game model, lifecycle, game types, development guide, UI building blocks, API layer), researched from source and fact-checked page-by-page against `packages/platform`, `apps/demo-game`, and the Playwright flow spec.
- **Update**: Adopted Open Knowledge Format v0.1 - frontmatter on every concept, this log, and `index.md` replacing the former `README.md`; concept files renamed from numbered prefixes to stable names.
