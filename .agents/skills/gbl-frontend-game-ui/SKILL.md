---
name: gbl-frontend-game-ui
description: Build the frontend of a GBL platform game - player cockpit with status-switch pattern, admin pages, realtime wiring, and which components to reuse from @gbl-uzh/ui and @uzh-bf/design-system. Use when creating or changing game pages/components in apps/<game>/src.
---

# GBL Frontend Game UI

Each game builds its own Next.js frontend (Pages Router in the reference game); the platform provides no pages. Reference: `apps/demo-game/src/pages/`. Concepts: [docs/developing-a-game.md](../../../docs/developing-a-game.md) (routes + cockpit pattern), [docs/ui-components.md](../../../docs/ui-components.md) (component sources), [docs/game-lifecycle.md](../../../docs/game-lifecycle.md) (which view per status).

## Route checklist

Boilerplate (copy from demo game, adjust branding): `/join/[token]`, `/play/welcome`, `/admin/login`, `/admin/games`, `_app.tsx`, the API route(s). Game-specific (your real work): `/play/cockpit`, `/admin/games/[id]` authoring forms, `/admin/reports/[id]` charts.

## The cockpit pattern (player screen)

One page, four layers — keep this shape:

1. **One aggregate query** for everything the player sees (result + game + active period/segment + content + self).
2. **Realtime = poke, then refetch.** Subscribe to global events; on `PERIOD_ACTIVATED` / `SEGMENT_ACTIVATED` / `COUNTDOWN_UPDATED` (filtered by your game id) refetch/invalidate the aggregate query. Never render data out of the event payload.
3. **Shared chrome** in a `GameLayout` wrapper: nav + player display + Ready toggle + countdown widget + learning-element sidebar + blocking story-element popups.
4. **Body = `switch (game.status)`**: `RUNNING` → decision form; `PAUSED`/`CONSOLIDATION` → read-only segment results; `RESULTS` → period report; other statuses → placeholders. Full per-status expectations: [docs/game-lifecycle.md](../../../docs/game-lifecycle.md).

The decision form validates with a yup schema mirroring the constraints your `Actions.apply` reducer enforces server-side, and submits via the perform-action mutation.

## Admin pages

- `/admin/games/[id]`: the advance button is a `switch (game.status)` producing one label + mutation per state (copy `getButton` from the demo game); add-period and add-segment modals expose **your** period/segment facts fields (Formik + yup); include the player list with join links and the countdown form.
- `/admin/reports/[id]`: query result rows of type `SEGMENT_END` / `PERIOD_END` and chart per-player metrics; aggregation happens client-side.

## Components: where to get what

Priority order:

1. **`@uzh-bf/design-system`** (v4): `Card` family, `Button`, `Modal`, `Switch`, `Progress`, `ShadcnTable*` (alias to `Table`...), `ChartContainer`, and the Formik fields (`FormikTextField`, `FormikNumberField`, `FormikSelectField`). Form pattern is **Formik + yup** — do not introduce react-hook-form.
2. **`@gbl-uzh/ui`**: `Layout`, `NavBar`, `Logo`, `PlayerDisplay`, `XpBar`, `Timeline` — see the [inventory with statuses](../../../docs/ui-components.md) first; its `Button` is a placeholder (use the design system's) and `TimelineAdmin` is a stub.
3. **Copy from `apps/demo-game/src/components/`** when neither has it: `StoryElements`, `LearningElements`, `CycleCountDown`, `MultiSelect` (and `FormikMultiSelectField` in `components/fields/`), local shadcn-style primitives in `components/ui/`.
4. **recharts** directly for game charts.

## Styling setup

Tailwind v4, CSS-only config. Copy `apps/demo-game/src/globals.css` + `postcss.config.js` and keep its gotchas intact (relative `node_modules` import of the design-system CSS, no own preflight, `.aspect-video` patch, `--theme-color-*` custom properties). Details: [docs/ui-components.md](../../../docs/ui-components.md).

## Conventions + verify

- Test selectors: design-system `Button data={{ cy: '...', test: '...' }}` renders `data-cy` and `data-test` attributes (there is no `data-testid`); Playwright is configured with `testIdAttribute: 'data-cy'` (`playwright/playwright.config.ts`), so `getByTestId` matches `data-cy`. The game-detail page exposes `data-game-status` for lifecycle assertions.
- Verify in a real browser through the full lifecycle (admin + one player window): decisions submit, realtime refresh fires on transitions, story popups block, charts render. Automate with an adapted `playwright/tests/demo-game-flow.spec.ts`.
