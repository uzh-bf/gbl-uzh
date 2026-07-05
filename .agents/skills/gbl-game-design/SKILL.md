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
| Period report            | what the debrief needs: metrics, comparisons, charts                                         |
| Roles (optional)         | symmetric teams, or per-role info/computations (note: engine-supported, no worked example)   |
| Content overlays         | story elements (narrative popups, per segment) and learning elements (MC quizzes) with texts |
| Gamification             | XP/levels ladder; achievements as event + condition + reward triples                         |

> [!TIP]
> **Narrative context must persist across review states.** When designing the cockpit, identify which information players need to see during `PAUSED`, `CONSOLIDATION`, and `RESULTS` — not just during `RUNNING`. For example, if random events (shocks, news) drive the round, the player must still see *which* event occurred while reviewing their results. Plan for this in the mapping table under "Environment per segment" — the cockpit `switch` should render event context in every post-decision state, not just the active decision state.

## Step 3: Design the narrative and storyline

A learning game is not a spreadsheet exercise — it needs a **narrative wrapper** that motivates decisions and makes the scenario memorable. Design these layers:

1. **Overall premise**: a one-paragraph framing ("You are the governor of a central bank…", "Your team runs a supply chain under disruption…"). This sets the welcome page text and the game's tone.
2. **Welcome page / first login**: when a player joins via the join link, they land on `/play/welcome`. This page sets the scene and lets the team customise their identity (team name, optional avatar/details). Write the introductory story text that orients the player: what is their role, what is the world state, what is at stake?
3. **Per-segment story elements**: short narrative popups ("Breaking news: a drought has hit the region…") shown at the start of each segment. These contextualise the environment/shocks the computation will apply. Seed them as `StoryElement` rows tied to specific segments.
4. **Per-segment learning elements**: optional MC quizzes or reflection prompts ("Which macroeconomic theory predicts this relationship?") shown alongside or after the story. Seed as `LearningElement` rows. Use these to reinforce the theory behind the game mechanics.
5. **Arc across periods**: the narrative should develop — e.g. period 1 is a calm baseline, period 2 introduces a crisis, period 3 is recovery. Plan the arc when planning the period/segment list.

## Step 4: Ground the decision in theory

The game should teach, not just entertain. For each decision the player makes:

1. **Name the theory or model** the decision is meant to exercise (e.g. Taylor rule, IS-LM, supply/demand elasticity, portfolio theory).
2. **Surface actionable information** in the cockpit so the decision is informed, not random luck. Players need forecasts, probabilities, trend indicators, or outlook data — enough to apply the theory and reason about the tradeoffs. If a player cannot deduce a reasonable decision from what they see, the game is testing luck, not understanding.
3. **Constrain the decision space** so the tradeoff is clear. A single lever with visible consequences teaches more than five sliders with opaque interactions.
4. **Show consequences legibly**: after each segment, the PAUSED screen should make the link between decision → outcome obvious ("You raised rates → inflation fell but unemployment rose").

## Step 5: Plan the two chart layers

The platform has two distinct review moments with different purposes:

| State | When | Purpose | Chart content |
|-------|------|---------|---------------|
| **PAUSED** (after each segment) | During a period, between segments | Quick tactical feedback while play continues | Current-segment outcomes, decision vs result, deviation from targets. Keep it focused — players need to absorb and decide again quickly. |
| **RESULTS** (after a full period) | Between periods, facilitator-led debrief | Deep didactical discussion | Full period history, cross-team comparisons, cumulative metrics, trend lines, rankings. This is what the game master projects and discusses — design it for classroom insight, not just player vanity. |

Design both chart sets explicitly in the mapping table. The RESULTS screen should enable the facilitator to draw **didactical conclusions**: "Team A's aggressive strategy led to short-term gains but long-term instability" — label axes, add reference lines (targets, benchmarks), and include comparative views.

## Step 6: Plan content overlays

Content overlays are the learning-integration layer. Plan them alongside the narrative:

- **Story elements** (blocking popups): one per segment, shown on segment activation. Write the text now — it grounds the decision in the narrative ("A trade war has broken out…"). Seed as `StoryElement` rows in `prisma/seed.ts`.
- **Learning elements** (sidebar quizzes): optional, one per segment. Write MC questions that test understanding of the theory behind the mechanic. Seed as `LearningElement` rows with question text, options, and correct answer index.
- **Welcome page text**: the introductory story shown on `/play/welcome` when the team first joins. This is the first impression — make it set the stage clearly.

## Step 7: Sanity-check the computation

For the segment outcome and period report, write the math/logic in prose first and check:

- Inputs available at `SegmentResult.end`: the player's decisions (stored by the action reducer), segment facts, period facts, game facts, player role.
- Inputs available at `PeriodResult.end`: the player's final segment results, **other players' segment-end results** (enables competitive/market computations), consolidation decisions, XP/level.
- Randomness must be seedable (same seed → same environment) — plan a seed parameter in period facts.
- The computation should expose enough intermediate values (forecasts, indicators, trends) for the cockpit to surface actionable information (Step 4).

## Step 8: Output

Produce a short design doc with: the fit-check verdict, the mapping table, the narrative arc (premise + welcome text + per-segment story beats), the theory grounding per decision, computation prose, the two chart-layer designs (PAUSED vs RESULTS), the list of periods/segments for a first session, and seed content (level ladder, story/learning element texts, achievements). Hand off to `gbl-new-game-app` (scaffold), then `gbl-backend-computations` and `gbl-frontend-game-ui`.
