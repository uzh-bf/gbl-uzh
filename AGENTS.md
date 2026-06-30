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
