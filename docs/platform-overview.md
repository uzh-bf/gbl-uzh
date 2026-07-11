---
type: Architecture Overview
title: Platform Overview
description: What the GBL platform is, the monorepo layout, and what the platform owns vs. what a game owns.
tags:
  - architecture
  - monorepo
  - packages
timestamp: "2026-07-11T00:00:00Z"
---

# Platform Overview

The GBL platform is a framework for browser-based, **facilitator-led, synchronous** learning games, built at the University of Zurich. A teacher (admin) runs a game session live; student teams (players) log in via link, make decisions in timed rounds, and the platform computes and visualizes results between rounds. The reference game is a portfolio-investment simulation in `apps/demo-game`.

## Monorepo layout

pnpm workspace + turborepo (`pnpm-workspace.yaml`, `turbo.json`):

| Path                                          | Package              | Role                                                                                                                         |
| --------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `packages/platform`                           | `@gbl-uzh/platform`  | The game engine: Prisma schema, game/play/account/event services, API wiring, realtime pub/sub                               |
| `packages/ui`                                 | `@gbl-uzh/ui`        | Shared game UI components and orchestration hooks; pre-1.0 public package contract, see [ui-components.md](ui-components.md) |
| `apps/demo-game`                              | `@gbl-uzh/demo-game` | Reference investment-simulation game and primary implementation example                                                      |
| `examples/central-bank`, `examples/rate-wars` | game apps            | Additional games consuming the shared platform and UI packages                                                               |
| `apps/website`                                | `@gbl-uzh/website`   | Marketing/knowledge site for gbl.uzh.ch; not built on the platform                                                           |
| `apps/escapp`, `apps/quartz`, `apps/advisor`  | other                | Unrelated tools and submodules; not built on the platform                                                                    |

Distribution status: `@gbl-uzh/platform` is published to public npm on `v*` tags. `@gbl-uzh/ui` is publication-ready but awaits its one-time public npm bootstrap; workspace games consume both through `workspace:*`. See [UI Building Blocks](ui-components.md#distribution-and-installation) for the canonical UI package status and release flow.

**Practical consequence:** copying `apps/demo-game` inside this monorepo remains the complete scaffolding path. After the first UI package publication, an external Next.js game can install both public packages; see [developing-a-game.md](developing-a-game.md). There is no scaffolding CLI.

## Division of responsibility

The core design: **the platform owns state and orchestration; a game owns computations and UI.**

The platform (`packages/platform`) provides generically, with no game code required:

- The relational data model and all DB writes/transactions (`public/schema.prisma`, services)
- The game state machine and its transitions (`src/services/GameService.ts:activateNextPeriod` / `activateNextSegment`)
- Player action processing with serializable transactions and retries (`src/services/PlayService.ts:performAction`)
- XP, levels, achievements: a generic event-driven engine (`src/services/EventService.ts`) — games only seed `Event`/`Achievement` rows and emit events
- Learning elements (auto-scored multiple-choice quizzes) and story elements (markdown narrative popups), attachable per segment
- Player readiness flags, countdown timers, a global on/off switch on game facts
- Auth plumbing: admin accounts (NextAuth/OIDC) and passwordless player login via per-team token links (`src/services/AccountService.ts:loginAsTeam`)
- Realtime pub/sub so clients refresh when the admin advances the game ([api-layer.md](api-layer.md))

A concrete game implements:

1. **Backend computations** — a `Services` object with six modules (`GameFacts`, `Actions`, `Period`, `PeriodResult`, `Segment`, `SegmentResult`) of mostly-pure functions that transform "facts" (JSON state blobs). Contract: `packages/platform/src/types.ts:Services`. This is computation-first, not computation-only: each module may also declare optional `updateDB*` hooks that run inside the platform's transactions for game-specific persistence.
2. **Facts shapes + validation** — TypeScript types and yup schemas for its game/period/segment/player facts (the DB stores them as untyped JSON).
3. **Frontend** — all pages: player cockpit, admin cockpit, reports. Reusable pieces come from `@gbl-uzh/ui` and `@uzh-bf/design-system`, but page composition is per game.
4. **Seed data** — player levels, story elements, learning elements, optionally achievements/events (`apps/demo-game/prisma/seed.ts`).

## Key vocabulary

| Term     | Meaning                                                                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Game     | One session/course run, owned by an admin. Carries global status and facts.                                                  |
| Period   | A major phase of the game (e.g. "Year 1"). Ordered within a game. Reports appear at period boundaries.                       |
| Segment  | The smallest time unit inside a period (e.g. "Q1"). Players act while a segment is running.                                  |
| Player   | A participant _team_ (one login token per team, no individual accounts). Not the same as an admin `User`.                    |
| Facts    | Game-specific JSON state attached to nearly every entity. The platform stores it; the game interprets it.                    |
| Decision | Player input — two distinct channels (in-segment actions vs. explicit period decisions), see [game-model.md](game-model.md). |
| Result   | A computed per-player snapshot at each boundary (period/segment start/end) — the input for charts & reports.                 |

Deeper definitions and the full entity list: [game-model.md](game-model.md).
