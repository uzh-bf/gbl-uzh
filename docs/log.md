# Log

## 2026-07-05

- **Creation**: `building-with-an-agent.md` - the external-agent onboarding path: point a host coding agent (Claude Desktop / Codex, Windows or macOS) at a normal `git clone`, bring the starter stack up headlessly with Docker only (no VS Code, no volume-clone), and run repo commands via `docker compose exec`. Bring-up commands verified end-to-end (app 200 on host `localhost:3000`, OIDC issuer match).
- **Update**: `getting-started.md` - added a cross-pointer to the external-agent path; `index.md` - added the new page to the reading order and completed the agent-skills list (`gbl-playwright-e2e`, `gbl-environment-doctor`).

## 2026-07-04

- **Creation**: `getting-started.md` - plain-language onboarding for non-technical game builders (Docker Desktop + VS Code + Dev Containers extension, the "GBL Starter" devcontainer configuration with published localhost ports and preinstalled Claude Code, one-click mock login, first prompts, health-check escalation).
- **Update**: `developing-a-game.md` - local-dev step now names both devcontainer configurations (starter and devrouter) and links the getting-started guide.

## 2026-07-03

- **Creation**: Initial knowledge bundle with seven concepts (platform overview, game model, lifecycle, game types, development guide, UI building blocks, API layer), researched from source and fact-checked page-by-page against `packages/platform`, `apps/demo-game`, and the Playwright flow spec.
- **Update**: Adopted Open Knowledge Format v0.1 - frontmatter on every concept, this log, and `index.md` replacing the former `README.md`; concept files renamed from numbered prefixes to stable names.
