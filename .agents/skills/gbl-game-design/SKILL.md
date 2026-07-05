---
name: gbl-game-design
description: Design a learning game for the GBL platform - check platform fit, map a game idea onto periods/segments/decisions/facts, and produce a build-ready game design. Use BEFORE writing any code for a new game.
---

# GBL Game Design

If the local environment is broken or the app is unreachable, fix it first with the `gbl-environment-doctor` skill — design work is fine, but building/verifying is not.

Turn a game idea into a design that maps cleanly onto the platform's engine. Ground truth: [docs/game-types.md](../../../docs/game-types.md) (what fits) and [docs/game-model.md](../../../docs/game-model.md) (vocabulary). Do not skip the fit check — ideas that need per-player pacing, real-time interaction, or branching structure cannot be built on this engine.

## Step 1: Fit check

The engine supports exactly one shape: **synchronous, facilitator-led, round-based play with computed results between rounds**. Reject or reshape the idea if any of these fail:

- [ ] One round can be phrased as _decision → computation → shared result_.
- [ ] A live facilitator advances the game (admin clicks every transition; nothing auto-advances).
- [ ] All teams move together (one shared game status; no self-paced or branching play).
- [ ] Interaction is team↔platform, not team↔team in real time (players affect each other only through computed results).
- [ ] Participants play as teams with a shared login link (no individual accounts or cross-game identity).

## Step 2: Map the idea onto the structure

Fill this table — it is the core design artifact:

| Concept                  | Your game                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| Period =                 | e.g. one business year / one seminar session                                                 |
| Segment =                | e.g. one quarter / one decision round                                                        |
| Decision per segment     | exact fields + constraints (e.g. allocation percentages summing to 100)                      |
| Environment per segment  | what varies (randomness, events) — precomputed at segment creation from a seed               |
| Period facts (admin-set) | scenario parameters the facilitator configures when adding a period                          |
| Player state             | what carries across segments/periods (e.g. capital, inventory) — lives in result facts       |
| Segment outcome          | formula: decisions + environment → new player state                                          |
| Period report            | what the debrief needs: metrics, comparisons, charts. Design for **formative feedback** (map decisions to outcome, e.g. financial statements). See [docs/game-patterns.md](../../../docs/game-patterns.md). |
| Roles (optional)         | asymmetric roles (e.g. Buyer vs Seller in derivatives-game) or specialized team roles to create positive interdependence. |
| Content overlays         | story elements (narrative popups, per segment) and learning elements (MC quizzes) with texts |
| Gamification             | XP/levels ladder; achievements as event + condition + reward triples                         |

## Step 3: Sanity-check the computation & didactical patterns

For the segment outcome and period report, write the math/logic in prose first and check:

- **Asymmetric Roles:** Interdependent outcomes combining decisions from multiple roles (e.g., Buyer/Seller).
- **Formative Feedback:** Store detailed intermediate metrics (revenue breakdown, errors) in results for debrief dashboards.
- **Seeded Randomness:** Use `PeriodFacts` seeds for deterministic environment generation (no `Math.random()`).
- **Inputs available at `SegmentResult.end`:** player decisions (from Action reducer), segment facts, period facts, game facts, player role.
- **Inputs available at `PeriodResult.end`:** the player's final segment results, **other players' segment-end results** (enables competitive/market computations), consolidation decisions, XP/level.

## Step 4: Output

Produce a short design doc with: the fit-check verdict, the mapping table, computation prose (including didactical patterns and roles), the list of periods/segments for a first session, and seed content (level ladder, story/learning element texts, achievements). Hand off to `gbl-new-game-app` (scaffold), then `gbl-backend-computations` and `gbl-frontend-game-ui`.
