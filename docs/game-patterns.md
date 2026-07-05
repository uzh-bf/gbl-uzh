---
type: Development Guide
title: Game Patterns
description: Reusable didactical and mechanical patterns extracted from existing games on the platform.
tags:
  - design
  - patterns
  - mechanics
  - feedback
timestamp: '2026-07-05T00:00:00Z'
---

# Game Patterns

This document outlines successful didactical and mechanical patterns from existing games on the GBL platform (like `business-game`, `derivatives-game`, and `pfm-game`). Use these patterns as inspiration and blueprints when designing and building new games.

## Formative Feedback & Results Analysis

**The Problem:** Simply showing players a "score" at the end of a round does not support learning. It increases cognitive load as players try to guess what they did wrong.

**The Pattern:** Tie player actions directly to explanatory frameworks (like financial statements) using the `PeriodResult` or `SegmentResult` hooks, and display these explicitly in the UI during `PAUSED`, `CONSOLIDATION`, or `RESULTS` phases.

**How to Implement:**
1. **Backend (`SegmentResultService` / `PeriodResultService`):**
   Instead of just computing a final score, break the calculation down into intermediate steps (e.g., revenue, COGS, gross margin, net income) and save these in the `SegmentResult` facts.
2. **Frontend (`/play/cockpit`):**
   When `game.status` is `PAUSED` or `RESULTS`, display a structured dashboard (using the design system's `Card` and `ShadcnTable`) that visually maps the player's initial decisions to the final outcome. Use tooltips or explanatory text to clarify the "why" behind the numbers.

*Reference:* The financial dashboards in `business-game` and the end-of-period consolidation views in `derivatives-game`.

## Asymmetric & Team Roles

**The Problem:** Having all players do exactly the same thing can limit engagement and miss opportunities for collaborative learning and positive interdependence.

**The Pattern:** Assign different responsibilities, information, or actions to different players or teams.

**How to Implement:**
1. **Backend (`PeriodService` / `SegmentService`):**
   Use period or segment facts to define the roles in the simulation.
2. **Backend (`ActionsReducer` & `SegmentResultService`):**
   The outcome of a segment is computed by combining the independent decisions of different roles. For example, a `Buyer` role sets a demand quantity, while a `Seller` role sets a supply quantity. The `SegmentResultService.end` hook takes both into account to calculate a market clearing price or transaction success.
3. **Frontend (`/play/cockpit`):**
   Read the player's role from their facts and conditionally render different forms or different information panels based on their role.

*Reference:* The Buyer vs. Seller dynamic in `derivatives-game` and the specialized team roles in `pfm-game`.

## Probabilistic State Generation

**The Problem:** Games that are completely deterministic can become solved or predictable, while games that are purely random are frustrating and impossible to learn from. Furthermore, randomness needs to be reproducible if a segment is reset or re-run.

**The Pattern:** Use seeded randomness to generate the environment for a segment.

**How to Implement:**
1. **Backend (`PeriodService`):**
   Generate a base random seed when the period is initialized (often configured by the facilitator). Save this `seed` in the `PeriodFacts`.
2. **Backend (`SegmentService.initialize`):**
   Use the period's base seed combined with the segment index (e.g., `seed + segmentIndex`) to pre-compute the environment variables for that segment (e.g., market volatility, random events).
3. **Utilities (`@gbl-uzh/platform/dist/lib/util`):**
   Always use the platform's seeded randomness helpers (`diceRoll`, `computeScenarioOutcome`) which are based on Mersenne-Twister. Never use `Math.random()`. This ensures that if the server crashes or the segment is re-evaluated, the exact same random environment is generated.

*Reference:* The scenario outcome generation across our simulation portfolio.

## Consolidation-Phase Decisions (Period-End Planning)

**The Problem:** Some decisions do not fit within the high-frequency rhythm of segment actions. Instead, they require a macro, period-level view (e.g. strategic investments, profit distribution, or structural planning) after segment outcomes are known.

**The Pattern:** Utilize the `CONSOLIDATION` phase to capture long-term strategic decisions using the platform's `PlayerDecision` entity. 

**How to Implement:**
1. **Frontend (`/play/cockpit`):**
   When `game.status` is `CONSOLIDATION`, render a dedicated decision form (e.g., investment choices, factory expansion) that saves decisions via the `saveDecisions` mutation (using `PlayerDecision` with type `CONSOLIDATION`).
2. **Backend (`PeriodResultService.end`):**
   The platform passes these inputs as `consolidationDecisions` (along with all `segmentEndResults` and `otherPlayersSegmentEndResults`) to the `PeriodResult.end` hook. Use this hook to resolve the macro consequences (e.g., applying factory purchases to the player's capital facts for the next period).

*Reference:* End-of-year capital investments (e.g., investing into factories) in `business-game`.
