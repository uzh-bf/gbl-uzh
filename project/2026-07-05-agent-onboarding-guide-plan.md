# Agent-Driven Onboarding Guide + First-Game Brief

## Identity

- Plan: `project/2026-07-05-agent-onboarding-guide-plan.md`
- Branch: `claude/agent-onboarding-guide` -> target `dev`
- PR: none yet (rename when known)
- History: builds on PR #157 (`project/2026-07-04-pr-157-starter-onboarding-plan.md` — starter devcontainer + `getting-started.md` + `gbl-environment-doctor`)

## Goal

- Problem: `getting-started.md` assumes Claude Code runs INSIDE the devcontainer (VS Code GUI + "Clone in Container Volume"). The real use case is different: a non-technical person points their own EXTERNAL host coding agent (Claude Desktop / Codex, on Windows) at the repo, and that agent drives setup + building. Two mismatches: (1) "Clone in Container Volume" stores the repo in a Docker volume the host agent cannot read/edit; (2) the gbl-* skills assume the agent runs commands in the container shell.
- Goal: document the external-agent + Docker-only path clearly (host clone -> bind-mount -> headless stack -> localhost:3000; run repo commands via `docker compose exec`), and commit a self-contained first-game brief (Central Bank) to hand to a tester.
- Non-goals: no change to the starter/devrouter configs or lifecycle logic; no change to the VS Code path.

## Decisions

- Setup path (user-chosen): host `git clone` + bring the starter stack up headlessly with **Docker only** — proven below. `devcontainer` CLI one-liner offered as an alternative (needs Node on host).
- Host-agent bridge: edit source in the host clone (bind-mounted into the container); run all repo commands inside the container via `docker compose -p <name> exec app bash -lc '...'` (workdir `/workspaces/gbl-uzh`). node_modules live in container volumes — never `pnpm install` on the host.
- Game (user-approved): Central Bank monetary-policy simulation — a single-lever control loop, deliberately distinct from the demo's asset-allocation mechanic.
- Scope: MR contains BOTH the onboarding doc and the committed brief.

## Verification (done up front — the doc ships proven commands)

Headless bring-up proven on this checkout (the bind-mount `../..` = a host-clone analog), compose project `gbl-agent-check`:

- `docker compose -f .devcontainer/starter/docker-compose.yml -p gbl-agent-check up -d --build` -> 8s (image cached)
- `docker compose -p gbl-agent-check exec app bash /workspaces/gbl-uzh/.devcontainer/post-create.sh` -> 82s, exit 0 (install + build platform/ui + prisma generate/push/seed)
- `docker compose -p gbl-agent-check exec app bash /workspaces/gbl-uzh/.devcontainer/post-start.sh` -> app HTTP 200 on host `localhost:3000` in 19s
- OIDC discovery issuer `http://localhost:8090/default` (matches `starter.env` `AUTH0_ISSUER`)
- Torn down with `down -v`; user's `default-gb-a3e67` devpod stack untouched
- devcontainer CLI present here (0.87.0) but NOT assumed on the target host -> pure-Docker path is primary

## Slices

- S1 plan (this file)
- S2 docs: new `docs/building-with-an-agent.md` (OKF page) + `index.md`/`log.md` reading-order & log entries + `getting-started.md` cross-pointer (timestamp bump) + `AGENTS.md` pointer
- S3 first-game brief: `project/2026-07-05-central-bank-first-game-brief.md` (self-contained hand-off prompt)
- S4 review subagent + draft PR to `dev` via `df-mr-description-writer`

## Progress

- S1 done — plan committed.

## Next Steps

- Fill at end.
