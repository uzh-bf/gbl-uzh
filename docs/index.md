---
okf_version: "0.1"
---

# GBL Platform Knowledge Bundle

An [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/tree/main/okf) bundle explaining how the GBL (game-based learning) platform in this repository works and how to build a new learning game on it. Written for AI coding agents and humans. Maintained via the `gbl-wiki-maintenance` skill (`.agents/skills/gbl-wiki-maintenance/`); recent changes in [log.md](log.md). When this wiki and the code disagree, the code wins — and the wiki should be updated in the same PR.

## Concepts (reading order)

- [Getting Started (No Coding Experience Needed)](getting-started.md) - How to get the GBL platform running on your own computer and build a learning game together with an AI assistant — without writing code yourself
- [Platform Overview](platform-overview.md) - What the platform is, monorepo layout, what the platform owns vs. what a game owns
- [Game Model](game-model.md) - Data model: games, periods, segments, players, facts, results, decisions, content
- [Game Lifecycle](game-lifecycle.md) - The game state machine, admin controls, and the full end-to-end flow
- [What Kinds of Games Work Here](game-types.md) - Which game shapes fit the platform (and which do not), with a fit checklist
- [Developing a Game](developing-a-game.md) - Backend computations, frontend pages, scaffolding, local dev
- [UI Building Blocks](ui-components.md) - `@gbl-uzh/ui` and `@uzh-bf/design-system` usage, gaps
- [API Layer and Realtime](api-layer.md) - GraphQL today, the tRPC migration, realtime events

## Related resources

- [Agent skills](../.agents/skills/) - `gbl-game-design`, `gbl-new-game-app`, `gbl-backend-computations`, `gbl-frontend-game-ui`, `gbl-wiki-maintenance`
- [Reference game](../apps/demo-game/) - the single worked implementation all pages cite
- [E2E flow spec](../playwright/tests/demo-game-flow.spec.ts) - executable ground truth for the lifecycle

## Caveats (check before trusting details)

- `apps/demo-game` is the only game built on the platform - generic-contract claims are inferred from one worked example plus platform source
- The tRPC migration (branch `codex/trpc-migration-work-packages`) replaces GraphQL entirely; check `src/pages/api/trpc/` vs `src/pages/api/graphql.ts` to see what a checkout runs
- Pages cite `path:Symbol` instead of line numbers; if a symbol moved, search for it
