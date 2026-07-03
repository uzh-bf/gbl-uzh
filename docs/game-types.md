---
type: Design Guide
title: What Kinds of Games Work Here
description: Which game shapes fit the synchronous round-based engine, which do not, and a fit checklist for new ideas.
tags:
  - game-design
  - fit
  - patterns
timestamp: "2026-07-03T00:00:00Z"
---

# What Kinds of Games Work Here

The platform is an engine for **synchronous, round-based, facilitator-led games with computed feedback between rounds**. If a game idea can be expressed as "teams make decisions each round, something is computed, everyone looks at the results together, repeat", it fits. If it needs per-player pacing, real-time interaction, or branching level structure, it does not — see the anti-list below.

## The native game shape

Everything the engine gives you for free assumes this loop:

```text
per period:   [PREPARATION] → ( [RUNNING → segment results] × N segments ) → [CONSOLIDATION → period report]
per game:     period × M, then final report
```

- **Decisions** happen while a segment runs (via player actions) or in explicit preparation/consolidation phases (via player decisions).
- **Computation** happens at boundaries: your `SegmentResult.end` turns decisions + segment facts (e.g. randomness) into outcomes; your `PeriodResult.end` aggregates a period.
- **Reports** are built into the flow: players see segment results while `PAUSED` and period reports in `RESULTS`; admins get a cross-period dashboard. The debrief between rounds is where the learning happens — the platform is designed around that pause.

## Patterns that fit well

**1. Periodic decision / simulation games** (the reference game). Teams allocate resources each round; the environment determines outcomes; results compound. Demo game: split capital across bank/bonds/stocks; dice-driven returns per segment; risk/return/Sharpe analytics per period. The same skeleton covers classics like a beer-distribution game (decision: order quantity; segment facts: demand; result: inventory/backlog cost), a pricing-competition game (decision: price; computation can read _other players' results_ in `PeriodResult.end`), or a budgeting/sustainability game (decision: spend allocation; facts: events like droughts).

**2. Continuation games across sessions.** Because periods are authored while the game runs and all state persists per game, a game can stretch over a semester: one period per seminar session, with the same teams continuing. Between sessions the game simply sits in `RESULTS`.

**3. Role-based variants.** Players can carry a `role` (assigned at game creation via a `roleAssigner` callback). Roles can drive different story content (`StoryElement.contentRole`), different achievement names, and different computation branches (every result hook receives `playerRole`). Suitable for negotiation or stakeholder games where teams see different information. Caveat: engine-supported but no worked example exists (the demo game is role-free).

**4. Narrative/quiz-led progressions with light computation.** Segments can carry story elements (blocking markdown popups, optionally per role) and learning elements (auto-scored MC quizzes with feedback and XP rewards). A game can lean mostly on these — the computation hooks can be near-trivial pass-throughs — turning the engine into a paced, gamified lesson with XP, levels, and achievements.

These patterns compose: the demo game is (1) + (4).

## What does NOT fit (without fighting the engine)

- **Self-paced / asynchronous play.** One `Game.status` for everyone; only the admin advances it. A homework-style game where each student moves at their own speed contradicts the core design.
- **Real-time / twitch interaction.** Realtime here is "refetch when the admin advances", over server-sent events. There is no player-to-player channel, no tick loop, no low-latency path.
- **Branching game structure.** Periods and segments are a linear sequence (linked lists with one active pointer). Content can vary by role, but the structure cannot fork per player or per choice.
- **Individual accounts with cross-game identity.** A `Player` is a per-game team token. There is no profile that persists across games, no matchmaking.
- **Unfacilitated games.** No admin clicking buttons → nothing ever advances. (A cron-driven auto-advance would be new platform work; the countdown timer is advisory only.)

## Fit checklist for a new game idea

Work through these before designing (the `gbl-game-design` skill automates this):

1. Can you phrase one round as _decision → computation → shared result_? What exactly is the decision (fields, constraints)?
2. What is a **period** in your game, and what is a **segment**? What varies per segment (randomness, events) — this becomes segment facts, precomputed at authoring time.
3. What must the period report show for the debrief? (This defines what `PeriodResult.end` must compute and store.)
4. Is a live facilitator running every session? Who clicks "next"?
5. Do teams need different roles/information, or is everyone symmetric?
6. Which parts are narrative/quiz content (seedable, no code) vs. computation (game code)?
7. Does anything require per-player pacing, real-time interaction, or branching? If yes, redesign or pick a different engine.

Then continue with [developing-a-game.md](developing-a-game.md).
