<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `pnpm dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm dlx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
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

- `devrouter ensure .`
- `dev app ls --repo .`
- `dev ls`

## GBL Platform Wiki

LLM-facing documentation for building learning games on the GBL platform lives in `docs/` — an Open Knowledge Format bundle, start at `docs/index.md`. Before working on `packages/platform`, `packages/ui`, or a game app, read the relevant wiki page. Game-building skills: `.agents/skills/gbl-game-design`, `gbl-new-game-app`, `gbl-backend-computations`, `gbl-frontend-game-ui`, `gbl-playwright-e2e`, `gbl-deploy-staging`. When a change touches documented behavior, update the wiki in the same PR via `.agents/skills/gbl-wiki-maintenance`. Human-facing onboarding (starter devcontainer, non-technical users, VS Code) is `docs/getting-started.md`; when an external host coding agent drives setup instead (host `git clone` + Docker-only headless bring-up, no VS Code), it is `docs/building-with-an-agent.md`. To deploy a game to a shareable staging URL (Vercel + Neon, CLI-first), see `docs/deploying-a-game.md` and the `gbl-deploy-staging` skill. If the local environment misbehaves (app unreachable, login broken, empty DB), run `.agents/skills/gbl-environment-doctor` before debugging code.
