# GBL Platform Wiki (for humans and LLM agents)

This wiki explains how the GBL (game-based learning) platform in this repository works and how to build a new learning game on top of it. It is written to be consumed by AI coding agents as well as humans: every page is self-contained, states its sources as `file:symbol` references into this repository, and flags claims that are uncertain or in flux.

## Reading order

| Page                                               | Answers                                                                            |
| -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [01-platform-overview.md](01-platform-overview.md) | What the platform is, monorepo layout, what the platform owns vs. what a game owns |
| [02-game-model.md](02-game-model.md)               | Data model: games, periods, segments, players, facts, results, decisions, content  |
| [03-game-lifecycle.md](03-game-lifecycle.md)       | The game state machine, admin controls, and the full end-to-end flow               |
| [04-game-types.md](04-game-types.md)               | Which kinds of games fit the platform (and which do not), with worked sketches     |
| [05-developing-a-game.md](05-developing-a-game.md) | How to build a game: backend computations, frontend pages, scaffolding, local dev  |
| [06-ui-components.md](06-ui-components.md)         | Reusable UI building blocks: `@gbl-uzh/ui` and `@uzh-bf/design-system`             |
| [07-api-layer.md](07-api-layer.md)                 | The API/transport layer: GraphQL today, the tRPC migration, realtime events        |

Agent skills that operationalize these pages live in [`.agents/skills/`](../.agents/skills/) (see `gbl-game-design`, `gbl-backend-computations`, `gbl-frontend-game-ui`, `gbl-new-game-app`).

## Ground truth and caveats

- **Single reference implementation.** `apps/demo-game` is the only game built on the platform. Statements about the generic contract (`Services`, hooks, role assignment) are inferred from one worked example plus the platform source, not cross-validated against a second game.
- **tRPC migration in progress.** The branch `codex/trpc-migration-work-packages` replaces the entire GraphQL API with tRPC. Until it merges to `dev`, GraphQL is what runs. To check which one is active in a checkout: a `src/pages/api/trpc/` directory means tRPC; `src/pages/api/graphql.ts` means GraphQL. Details in [07-api-layer.md](07-api-layer.md).
- **Line numbers drift.** Pages cite `path:Symbol` (file plus exported function/type) instead of line numbers where possible. If a symbol moved, search for it.

Sources of truth, in order:

1. Platform engine: `packages/platform/src/services/` and `packages/platform/src/types.ts`
2. Data model: `packages/platform/public/schema.prisma`
3. Reference game: `apps/demo-game/`
4. End-to-end behavior: `playwright/tests/demo-game-flow.spec.ts`

When this wiki and the code disagree, the code wins — and the wiki should be updated in the same PR.
