<!-- intent-skills:start -->

## Skill Loading

Before substantial work:

- Skill check: run `npx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

<!-- devrouter -->

## devrouter

This repository uses [devrouter](https://github.com/rschlaefli/devrouter) for local dev routing.
All apps and dependencies are declared in `.devrouter.yml`.

Full reference (config schema, docker requirements, env injection, commands):
`.agents/skills/devrouter/SKILL.md`

Quick validation sequence:

- `dev up`
- `dev tls install` (required when repo defines tcp/postgres apps)
- `dev app ls --repo .`
- `dev app run <host-app> --repo . --yes`
- `dev ls`

## GBL Platform Wiki

LLM-facing documentation for building learning games on the GBL platform lives in `docs/` — an Open Knowledge Format bundle, start at `docs/index.md`. Before working on `packages/platform`, `packages/ui`, or a game app, read the relevant wiki page. Game-building skills: `.agents/skills/gbl-game-design`, `gbl-new-game-app`, `gbl-backend-computations`, `gbl-frontend-game-ui`. When a change touches documented behavior, update the wiki in the same PR via `.agents/skills/gbl-wiki-maintenance`. Human-facing onboarding (starter devcontainer, non-technical users, VS Code) is `docs/getting-started.md`; when an external host coding agent drives setup instead (host `git clone` + Docker-only headless bring-up, no VS Code), it is `docs/building-with-an-agent.md`. If the local environment misbehaves (app unreachable, login broken, empty DB), run `.agents/skills/gbl-environment-doctor` before debugging code.
