---
okf_version: "0.1"
---

# GBL Platform Knowledge Bundle

An [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) bundle explaining how the GBL (game-based learning) platform in this repository works and how to build a new learning game on it. Written for AI coding agents and humans. Maintained via the `gbl-wiki-maintenance` skill (`.agents/skills/gbl-wiki-maintenance/`); recent changes in [log.md](log.md). When this wiki and the code disagree, the code wins — and the wiki should be updated in the same PR.

## Concepts (reading order)

- [Getting Started (No Coding Experience Needed)](getting-started.md) - How to get the GBL platform running on your own computer and build a learning game together with an AI assistant — without writing code yourself
- [Building a Game with Your Own Coding Agent](building-with-an-agent.md) - The alternative onboarding: point an external host coding agent (Claude Desktop, Codex, …) at the repo, bring it up with Docker only, no VS Code
- [Platform Overview](platform-overview.md) - What the platform is, monorepo layout, what the platform owns vs. what a game owns
- [Game Model](game-model.md) - Data model: games, periods, segments, players, facts, results, decisions, content
- [Game Lifecycle](game-lifecycle.md) - The game state machine, admin controls, and the full end-to-end flow
- [What Kinds of Games Work Here](game-types.md) - Which game shapes fit the platform (and which do not), with a fit checklist
- [Developing a Game](developing-a-game.md) - Backend computations, frontend pages, scaffolding, local dev
- [UI Building Blocks](ui-components.md) - `@gbl-uzh/ui` and `@uzh-bf/design-system` usage, gaps
- [API Layer and Realtime](api-layer.md) - The supported tRPC Pages Router pattern, authorization, caching, and realtime events
- [Deploying a Game to Staging](deploying-a-game.md) - The easy Vercel + Neon path to a shareable staging URL (CLI-first), distinct from the k8s production path

## Related resources

- [Agent skills](../.agents/skills/) - `gbl-game-design`, `gbl-new-game-app`, `gbl-backend-computations`, `gbl-frontend-game-ui`, `gbl-playwright-e2e`, `gbl-deploy-staging`, `gbl-environment-doctor`, `gbl-wiki-maintenance`
- [Reference games](../apps/demo-game/) - demo-game is the canonical scaffold; Rate Wars and Central Bank under `examples/` show complete game-specific tRPC integrations
- [GraphQL compatibility decision](adr/0001-deprecate-graphql-compatibility.md) - why published GraphQL exports remain deprecated while all repository games use tRPC
- [E2E flow spec](../playwright/tests/demo-game-flow.spec.ts) - executable ground truth for the lifecycle

## Caveats (check before trusting details)

- Demo-game is the canonical scaffold. Rate Wars and Central Bank are complete examples, but their game-specific facts, services, and UI are not generic platform contracts.
- All three games use the same tRPC Pages Router pattern. Published GraphQL exports remain deprecated compatibility only; do not use them in new repository or external game code.
- Pages cite `path:Symbol` instead of line numbers; if a symbol moved, search for it
