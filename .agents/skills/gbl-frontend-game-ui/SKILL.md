---
name: gbl-frontend-game-ui
description: Build the frontend of a GBL platform game - player cockpit with status-switch pattern, admin pages, realtime wiring, and which components to reuse from @gbl-uzh/ui and @uzh-bf/design-system. Use when creating or changing game pages/components in apps/<game>/src.
---

# GBL Frontend Game UI

Each game builds its own Next.js frontend (Pages Router in the reference game); the platform provides no pages. Reference: `apps/demo-game/src/pages/`. Concepts: [docs/developing-a-game.md](../../../docs/developing-a-game.md) (routes + cockpit pattern), [docs/ui-components.md](../../../docs/ui-components.md) (component sources), [docs/game-lifecycle.md](../../../docs/game-lifecycle.md) (which view per status).

## Route checklist

Boilerplate (copy from demo game, adjust branding): `/join/[token]`, `/admin/login`, `/admin/games`, `_app.tsx`, the API route(s). Game-specific (your real work): `/play/welcome`, `/play/cockpit`, `/admin/games/[id]` authoring forms, `/admin/reports/[id]` charts.

## The welcome page (`/play/welcome`)

This is the player's **first impression** of the game. When a team clicks the join link, they land here. It must do three things:

1. **Set the scene**: display the game's introductory story text — who is the player, what is the world state, what is at stake. This text should come from the game design's narrative arc.
2. **Let the team customise their identity**: team name (required), and optionally an avatar, a motto, or role-specific details. These write into `Player.facts` and persist across the session.
3. **Transition to the cockpit**: after submitting, redirect to `/play/cockpit`. The welcome page should only show once per team.

Copy the structure from the demo game's `pages/play/welcome.tsx` and customise the form fields and story text for your game.

## The cockpit pattern (player screen)

One page, four layers — keep this shape:

1. **Compose the player contract from `play.result` and `play.self`.** The result
   procedure carries current and past results, game state, active content, and
   safe co-player identities; the self procedure carries session-player state.
2. **Realtime = poke, then refetch.** Subscribe to `events.global`; on
   relevant lifecycle or countdown events use `trpc.useUtils()` to invalidate
   the narrowest affected query. Add `events.user` only when the game handles
   personalized notifications. Never render authoritative state from the event
   payload.
3. **Shared chrome** in a `GameLayout` wrapper: nav + player display + Ready toggle + countdown widget + learning-element sidebar + blocking story-element popups.
4. **Body = `switch (game.status)`**: `RUNNING` → decision form; `PAUSED`/`CONSOLIDATION` → read-only segment results; `RESULTS` → period report; other statuses → placeholders. Full per-status expectations: [docs/game-lifecycle.md](../../../docs/game-lifecycle.md). **Important:** narrative context from the `RUNNING` state (event banners, shock descriptions, scenario headlines) must persist into `PAUSED`/`CONSOLIDATION`/`RESULTS` — players need to see _what happened_ while reviewing _why_ their numbers moved. Extract the event display into a shared component rendered across all post-decision states.

> [!WARNING]
>
> **Do not import `@prisma/client` in frontend code — not even indirectly.** If a shared utility (e.g. from `@gbl-uzh/platform`) uses Prisma enums like `DB.GameStatus`, those will be `undefined` in the browser and crash. Compare game status against string literals (`'RUNNING'`, `'PAUSED'`, `'RESULTS'`, etc.), or define a narrow alias inferred from `RouterOutputs<AppRouter>`. Keep `AppRouter` imports type-only.

The decision form validates with a yup schema mirroring the constraints your `Actions.apply` reducer enforces server-side, and submits via the perform-action mutation. **Ensure the decision screen surfaces enough information** (forecasts, trend indicators, current state, target values) for the player to make a theory-informed decision — not guess randomly.

## The two chart layers (PAUSED vs RESULTS)

The platform's lifecycle creates two distinct review moments. Design each chart set for its purpose:

### PAUSED screen (after each segment, during a period)

Quick tactical feedback while play continues. Show:

- Current-segment outcomes (decision vs result)
- Deviation from targets or benchmarks
- Key metric snapshot (e.g. "your inflation is 4.2%, target is 2%")

Keep it focused — players need to absorb and decide again quickly. Use 1–3 simple charts.

### RESULTS screen (after a full period, facilitator-led debrief)

Deep didactical discussion — this is what the game master projects in class. Show:

- **Full history**: all segments of the period as time series (e.g. line chart of inflation, unemployment, growth across segments)
- **Cross-team comparisons**: how each team's strategy played out relative to others (bar charts, rankings, league tables)
- **Cumulative metrics**: total penalty scores, aggregate performance, trend analysis
- **Reference lines**: targets, benchmarks, theoretical optima — so the facilitator can say "Team A was consistently above the inflation target because…"

Design the RESULTS screen to enable the facilitator to draw **didactical conclusions**. Label axes clearly, add reference lines, and include enough comparative data for a meaningful classroom discussion.

## Content overlays: story and learning elements

The platform supports two types of content overlays that integrate learning into gameplay:

- **Story elements** (blocking narrative popups): shown at segment activation, before the player decides. They contextualise the round ("A supply shock has hit the market…") and build the game's narrative arc. Seeded as `StoryElement` rows per segment. Render with `StoryElements` from `@gbl-uzh/ui`; it blocks interaction until dismissed.
- **Learning elements** (sidebar quizzes): optional MC questions or reflection prompts shown alongside the cockpit. They reinforce the theory behind the game mechanic ("According to the Phillips Curve, what happens to unemployment when inflation rises?"). Seeded as `LearningElement` rows. Compose `LearningActivitiesList` and `LearningActivityModal` from `@gbl-uzh/ui` with an app-local adapter built on the platform `learning` tRPC procedures. Do not use the package's deprecated Apollo-backed `useLearningActivities` compatibility hook in new code.

Both are selected by the admin in the add-segment dialog and attached to specific segments. Plan the content in the game design phase (`gbl-game-design` Step 6) and seed it in `prisma/seed.ts`.

## Admin pages

- `/admin/games/[id]`: the advance button is a `switch (game.status)` producing one label + mutation per state (copy `getButton` from the demo game); add-period and add-segment modals expose **your** period/segment facts fields (Formik + yup); include the player list with join links and the countdown form.
- `/admin/reports/[id]`: query result rows of type `SEGMENT_END` / `PERIOD_END` and chart per-player metrics; aggregation happens client-side.

> [!TIP] > **Always guard `JSON.parse` on facts data.** Facts may be `null`, `undefined`, a plain object, or a double-stringified JSON string depending on the game state. Use a `parseFacts(raw, defaultValue)` wrapper (see `gbl-backend-computations` skill) in every component that reads `team.facts`, `period.facts`, or `segment.facts`. Without this, early game states (before initialisation) will crash the admin reports and player cockpit.

## Formative Feedback & Results Analysis

In `PAUSED`, `CONSOLIDATION`, or `RESULTS` phases, build a structured debriefing view:

- **Map decisions to outcomes:** Use design system cards/tables and Recharts to visualize intermediate calculations (e.g. allocation -> market share).
- **Explain the "why":** Add explanatory messages/warnings based on the result facts.
- **Role-specific views:** Conditionally render content using `playerRole`.

See [docs/game-patterns.md](../../../docs/game-patterns.md) for pattern details.

## Components: where to get what

Priority order:

1. **`@uzh-bf/design-system`** (v4): `Card` family, `Button`, `Modal`, `Switch`, `Progress`, `ShadcnTable*` (alias to `Table`...), `ChartContainer`, and the Formik fields (`FormikTextField`, `FormikNumberField`, `FormikSelectField`). Game-specific and admin authoring forms use **Formik + yup**. Shared UI fields may use the package's exported React Hook Form `Form` and `ReusableFormField` contract.
2. **`@gbl-uzh/ui`**: shared shell, player display, story/learning flow, countdown, reusable fields, `MultiSelect`, and game widgets — see the [inventory with statuses](../../../docs/ui-components.md). Use the design system's `Button`; `TimelineAdmin` remains a stub.
3. **Copy/adapt from `apps/demo-game`** only when neither package provides the behavior: game-specific layouts, decisions, result charts, app-local tRPC adapters, and thin Formik wrappers around shared controls.
4. **recharts** directly for game charts.

## Styling setup

Tailwind v4, CSS-only config. Copy `apps/demo-game/src/globals.css` + `postcss.config.js` and keep its gotchas intact (relative `node_modules` import of the design-system CSS, no own preflight, `.aspect-video` patch, `--theme-color-*` custom properties). Details: [docs/ui-components.md](../../../docs/ui-components.md).

## Leaderboards / cross-team views

The player's `play.result` query exposes a **token-free** co-player list at
`currentGame.players` containing only `id` and `name` — use it to resolve
display names for leaderboards. Result facts from computations carry only
`playerId`s. Keep player pages on this token-free projection: admin-only game
procedures expose the full player shape, including login tokens, and must not
be called from player pages.

## Conventions + verify

- Test selectors: design-system `Button data={{ cy: '...', test: '...' }}` renders `data-cy` and `data-test` attributes (there is no `data-testid`); Playwright is configured with `testIdAttribute: 'data-cy'` (`playwright/playwright.config.ts`), so `getByTestId` matches `data-cy`. The game-detail page exposes `data-game-status` for lifecycle assertions. The design-system `Card` does **not** forward a raw `data-cy` attribute — put test ids on plain wrapper `div`s or anchor tests on visible headline text.
- Verify in a real browser through the full lifecycle (admin + one player window): decisions submit, realtime refresh fires on transitions, story popups block, charts render. Automate with an adapted `playwright/tests/demo-game-flow.spec.ts` (or `rate-wars-flow.spec.ts` for a single-segment-per-period game).
- For a mutation that drives a critical transition, arm a wait for its exact tRPC POST before clicking. Retry the click only until that request is observed, then require the response to succeed before asserting durable UI state.
- One browser profile = one session: player login overwrites the admin's `next-auth.session-token` cookie (`AccountService.ts:loginAsTeam`). Use separate browser contexts/profiles for admin and players when verifying manually.
- Windows + Docker bind mounts do not deliver file-watch events into the container — the dev server does NOT hot-reload on host edits; restart the app's dev server (or set `WATCHPACK_POLLING=true` and `CHOKIDAR_USEPOLLING=true`) after changes.
