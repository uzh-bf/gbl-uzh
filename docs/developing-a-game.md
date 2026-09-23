---
type: Development Guide
title: Developing a Game
description: How to build a game: scaffolding by copying the demo game, the six-module Services contract, frontend routes, and verification.
tags:
  - services
  - backend
  - frontend
  - scaffolding
timestamp: "2026-09-23T14:38:48Z"
---

# Developing a Game

How to build a new game on the platform. Read [game-model.md](game-model.md) and [game-lifecycle.md](game-lifecycle.md) first — this page assumes their vocabulary. For mechanical and didactical patterns (e.g. formative feedback, roles, seeded randomness), see [game-patterns.md](game-patterns.md). Related skills: `gbl-game-design` (design), `gbl-new-game-app` (scaffolding), `gbl-backend-computations` (backend), `gbl-frontend-game-ui` (frontend).

## 1. Game Design (before you code)

Before writing any code or scaffolding an app, use the `gbl-game-design` skill to map out the game. The game development process must explicitly include:

- **Overall narrative and storyline**: establishing the premise and the narrative arc across periods (e.g. baseline, crisis, recovery).
- **Welcome page customization**: designing the `/play/welcome` page where the player first lands to read the introductory story and customize their identity (team name, avatar).
- **Decision and mechanics design**: grounding the gameplay in theory. Ensure the information needed to deduce a sound decision (forecasts, predictions, probabilities) is surfaced to the player, so success is based on applying theory, not just luck.
- **Content overlays**: creating learning elements (quizzes/reflections) and story elements (narrative popups) that support the game's mechanics and story.
- **Two chart layers**: planning tactical charts for the `PAUSED` screen (relevant for immediate feedback during play) and historical/comparative charts for the `RESULTS` screen (between periods) to allow the game master to draw didactical conclusions in class.

## Authentication and local development

All in-repo games use the shared `resolveAdminOidcConfig()` resolver
(`packages/platform/src/lib/auth.ts:resolveAdminOidcConfig`). The starter and
devrouter containers, plus CI, use mock OIDC through `GBL_AUTH_MODE=mock` and
`GBL_MOCK_OIDC_*`. Native host mock startup is unsupported for example packages.

Native host real-tenant opt-in requires explicit `GBL_AUTH_MODE=auth0` with real
`AUTH0_*` values in an ignored `.env.local`. Production defaults to real
`AUTH0_*` and forbids mock mode. If the environment misbehaves, use the
`gbl-environment-doctor` skill.

## 2. Scaffolding a new game app

There is no generator. The supported path is copying the reference game inside a monorepo clone/fork:

1. Copy `apps/demo-game` to `apps/<your-game>`; set `name` in its `package.json` (keep `@gbl-uzh/platform` and `@gbl-uzh/ui` as `workspace:*`).
2. Keep the Prisma setup as-is: `prisma/copy.ts` copies the platform schema to `prisma/schema/platform.prisma` on every build/dev run (never edit that file); `prisma/schema/specific.prisma` is yours for game-specific tables (the demo game's is an unused stub).
3. Replace the game logic: `src/services/` (computations, below), `src/types/` (facts shapes + yup schemas), `prisma/seed.ts` (levels/content), and the pages under `src/pages/`.
4. The workspace glob `apps/*` picks the package up automatically; run from the repo root with turbo or from the app directory.
5. Local dev environment: the **starter** config (`.devcontainer/starter/`, published localhost ports) and the **devrouter** config (`.devcontainer/README.md`, namespaced maintainer routing) select `demo`, `central-bank`, or `rate-wars` through `GBL_GAME_TARGET`. Both use the shared mock OIDC contract described above, and so does native host mode — it selects the same games with an argument to `pnpm bootstrap` / `pnpm dev`, or with `GBL_GAME_TARGET`.

Demo-game's standalone Nexus and GraphQL scripts run before Next.js can load environment files. Its Prisma bootstrap loads `.env.<mode>.local`, `.env.local`, `.env.<mode>`, and `.env` in Next's precedence order before authentication is resolved (`apps/demo-game/src/lib/prisma.ts:default`). Existing process or container variables still take priority.

> **WARNING:** Decontaminate the copy. `cp -R apps/demo-game apps/<your-game>` also copies the demo game's domain logic, and the build will not fail on residue you leave behind. After step 3, hunt down demo-game leftovers: `.env.production` URLs still pointing at `demo-game.stg.env.bf-app.ch`, the `src/pages/index.tsx` trading showcase, portfolio helpers in `src/lib/results.ts` and `src/services/PeriodResultService.ts`, demo time constants (`MONTHS`/`NUM_MONTHS`), and the `GameFacts.myInt` stub. The full hit-list and a "definition of done" are in the `gbl-new-game-app` skill. Grep your `src/` for `assetsWithReturns`, `spotPrice`, `bank`/`bonds`/`stocks` — any hit is residue.

### Using the UI package outside this monorepo

Inside this repository, keep `@gbl-uzh/ui` as `workspace:*`. External games can install it after the one-time npm bootstrap, must provide its application-level peers, and need a `'use client'` boundary when App Router modules import the hook-based bundle. The canonical install, CSS, compatibility, maturity, and release guidance is in [UI Building Blocks](ui-components.md#distribution-and-installation).

## Backend: the `Services` contract

A game's entire backend is one object with six modules, passed into the platform's API wiring. Contract: `packages/platform/src/types.ts:Services`. Reference implementation: `apps/demo-game/src/services/` (a barrel re-exporting six files).

```ts
// apps/<game>/src/services/index.ts
export * as Actions from "./ActionsReducer";
export * as GameFacts from "./GameFactsService";
export * as Period from "./PeriodService";
export * as PeriodResult from "./PeriodResultService";
export * as Segment from "./SegmentService";
export * as SegmentResult from "./SegmentResultService";
```

Each hook is a mostly-pure function `(facts, payload) => OutputFacts` — it receives the current facts plus a payload the platform assembled from the DB, and returns new facts (plus optional side-channel outputs). The platform owns all persistence and transactions around it.

| Module          | Hooks                        | Called when ([lifecycle](game-lifecycle.md))                 | Typical job                                                                                        |
| --------------- | ---------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `Period`        | `initialize`, `consolidate`  | Admin adds a period; period is consolidated                  | Derive period facts from admin input; roll up period facts at the end                              |
| `Segment`       | `initialize`                 | Admin adds a segment                                         | Precompute the segment's environment (randomness, events) — at authoring time, not activation      |
| `PeriodResult`  | `initialize`, `start`, `end` | First period start; each period start; period → RESULTS      | Seed a new player's state; carry state across periods; compute the period outcome per player       |
| `SegmentResult` | `initialize`, `start`, `end` | First segment of a period; each segment start; segment close | Carry player state into a segment; **apply decisions + segment facts to produce outcomes** (`end`) |
| `Actions`       | `apply` + `ActionTypes`      | Every `performAction` while RUNNING                          | Validate and store player input into the working `SEGMENT_END` result facts                        |
| `GameFacts`     | `update`                     | **Currently never** — defined in the contract but unwired    | Reserved for global game-facts updates; implement as a stub                                        |

Conventions from the reference implementation:

- **Immer** for fact transforms: wrap the output in `produce(basefacts, draft => { ... })`; never mutate inputs.
- **`Actions.apply`** returns `{ result, isDirty }`; the platform persists `result` only when `isDirty` is true. Throw a plain `Error` for invalid input (e.g. allocation not summing to 100) — the platform surfaces it.
- **Deterministic randomness**: `@gbl-uzh/platform/dist/lib/util` exports seeded helpers (`diceRoll`, `computeScenarioOutcome`, Mersenne-Twister based). Seed from period facts (e.g. `scenario.seed` + segment index) so re-created segments reproduce identically.
- **Side channels** in any hook's return: `actions` (extra audit-log rows), `events` (feed the achievement engine), `notifications`/`globalNotification` (push to clients), `updatedPeriodFacts`/`updatedSegmentFacts` (patch parent facts from an action).
- **Escape hatches**: optional `updateDBAfterInitialize` / `updateDBBeforeActivation` / `updateDBAfterEnd` / `updateDBAfterApply` hooks receive the open Prisma transaction for game-specific writes (e.g. into your `specific.prisma` tables). Prefer pure facts transforms; use hooks only when you must persist outside the facts blobs.

### Facts types and validation

Define TypeScript types + yup schemas for `GameFacts`, `PeriodFacts`, `PeriodSegmentFacts`, `PlayerFacts` (demo game: `apps/demo-game/src/types/`). The yup schemas are handed to the platform's API wiring so admin inputs (e.g. "add period" parameters) are validated before your hooks run. The DB does not validate facts — your schemas are the only gate.

### Seed data

`prisma/seed.ts` must provide at minimum the `PlayerLevel` ladder (players are created at level index 0). Optionally: `StoryElement` and `LearningElement` rows (selectable in the admin's add-segment dialog) and `Event` + `Achievement` rows if you want the XP/achievement engine to award XP (the demo game seeds none, so the engine is dormant with fresh demo seed data).

### Wiring it together

The `services` object, yup schemas, and facts input types are passed into the platform's API builder, which exposes all queries/mutations/subscriptions. What that builder looks like depends on the transport — GraphQL today, tRPC after the migration. See [api-layer.md](api-layer.md); reference: `apps/demo-game/src/graphql/index.ts` (`generateBaseMutations({ services, schemas, inputTypes })`).

## Frontend: built per game

There is no generic frontend — each game builds its own Next.js pages (Pages Router in the reference game), reusing components from [`@gbl-uzh/ui and the design system`](ui-components.md). The demo game's route set is the template:

| Route                 | Purpose                                                                                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/join/[token]`       | Player entry: calls the team-login mutation, redirects to the welcome page. Pure boilerplate — copy as-is.                                          |
| `/play/welcome`       | One-time team setup (name, avatar); writes `Player.facts`.                                                                                          |
| `/play/cockpit`       | **The** player screen: one layout + a body that switches on `game.status`. Game-specific.                                                           |
| `/admin/login`        | Admin OIDC sign-in. Boilerplate.                                                                                                                    |
| `/admin/games`        | Game list + create form. Near-boilerplate.                                                                                                          |
| `/admin/games/[id]`   | Facilitator control panel: period/segment authoring forms (game-specific fields!), the advance button, player list with join links, countdown form. |
| `/admin/reports/[id]` | Cross-period analytics dashboard. Game-specific charts.                                                                                             |

### Demo-game welcome flow

`apps/demo-game/src/components/welcome/WelcomeSetup.tsx:WelcomeSetup` implements a responsive welcome flow: lottery introduction → bank setup → review. The mobile layout follows the references in `apps/demo-game/design/`, with bottom-sheet avatar and searchable canton pickers and a footer that stays below the scrolling content without covering it. Options use the existing supported assets from `src/lib/constants.ts`. The complete welcome flow uses colocated Tailwind utilities and shared player color/font tokens from `src/globals.css`, including its portaled dialogs and loading/error views. App-local controls in `src/components/welcome/WelcomeControls.tsx` preserve native props and refs, reuse design-system buttons, and keep welcome actions at least 44px high on mobile and 48px above 600px. The 720px shell, 359px avatar-grid boundary, 721px desktop boundary, and safe-area footer/sheet padding use explicit pixel utilities. `playwright/tests/demo-game-welcome.spec.ts` covers these layouts, picker drafts and dismissal, validation, save failure/retry, and loading/query-error/missing-player states.

Setup uses Formik + yup and requires a trimmed bank name of 2–20 characters, an avatar, and a canton. Picker changes remain drafts until confirmed; Cancel or Escape discards them. Players can edit all three choices from the review. The final **Start the game** action persists the name and facts through the existing mutation, preserves the saved color (defaults to Blue when absent or invalid), and navigates to `/play/cockpit`. Review controls are disabled while saving. Failed saves retain the choices and show a retry message. The route handles loading, query failures, and missing player sessions (`apps/demo-game/src/pages/play/welcome.tsx:Welcome`).

The cockpit pattern (from `apps/demo-game/src/pages/play/cockpit.tsx`):

1. The cockpit page fetches **one aggregate query** and passes its data/refetch function to the `GameLayout` wrapper (player result + previous results + current game with active period/segment + attached content + self).
2. `GameLayout` subscribes to global events and, on `PERIOD_ACTIVATED` / `SEGMENT_ACTIVATED` / `COUNTDOWN_UPDATED`, **refetches that query** — events are a poke, never a data source.
3. The demo-game layout renders a compact team header, live countdown, active-period/segment progress, and bottom navigation. `/play/cockpit?tab=cockpit|market|history|team` selects the tab without discarding the allocation draft. The Decisions tab retains the `cockpit` URL key; Ready appears there only during RUNNING. Team shows the profile, level/XP, settled portfolio statistics, learning activities, and a library of released stories. Market shows the active scenario’s outlook and the latest admin-revealed monthly result; History shows cumulative portfolio values and expandable quarterly results, with a year selector that filters only the breakdown table. Blocking story popups remain global.
4. The page body is a `switch (game.status)`: decision form under `RUNNING`, read-only results under `PAUSED`/`CONSOLIDATION`, period report under `RESULTS`, placeholders otherwise ([game-lifecycle.md](game-lifecycle.md) lists the expected view per status).

The RUNNING allocation flow follows `apps/demo-game/design/cockpit.png`, `cockpit_after_submission.png`, and `cockpit_ready.png`:

- **Responsive sizing** (`apps/demo-game/src/components/GameLayout.tsx:GameLayout`, `apps/demo-game/src/components/cockpit/PlayerActionButton.tsx:PlayerActionButton`): the single-column shell stays centered and capped at 784px. Editing, submitted, and Ready share header, progress, footer, navigation, and action-button dimensions at each viewport. Tailwind utilities retain explicit pixel dimensions with the 14px app root. Above 600px, spacing and headings increase modestly; Submit and Change allocation share one size rule in enabled and disabled states.
- **Allocation bar** (`apps/demo-game/src/components/cockpit/AllocationBar.tsx:AllocationBar`): the editor and summary share colors, centered labels, and narrow-section handling. Labels that cannot fit are hidden; asset rows always retain complete values.
- **Slider** (`apps/demo-game/src/components/cockpit/AllocationSlider.tsx:AllocationSlider`): two boundaries in integer tenths define Savings, Bonds (the gap), and Stocks (the remainder). Handles stay vertically centered and push each other on contact. Starting a new drag from coincident handles selects the left handle for leftward movement or the right handle for rightward movement, keeping that selection until release. At rest, the left handle covers the right at 100%, and the right covers the left at 0%. Both are keyboard-focusable: arrows move 0.1%, Shift+Arrow moves 1%. Labels are centered within each colored section.
- **Validation** (`apps/demo-game/src/lib/allocation.ts:allocationSchema`): the client and server share finite, 0–100% validation in 0.1% steps, totaling 1000 integer tenths. Server validation is strict; the mutation remains `{ bank, bonds, stocks }` with numeric percentages.
- **Drafts** (`apps/demo-game/src/components/cockpit/useAllocationForm.ts:useAllocationForm`): fields edit independently. Invalid inputs freeze the last valid slider preview and disable dragging/submission, with a live total and difference. Drafts survive tab switches, unrelated refetches, and failed saves; changing rounds resets them. Late submission callbacks cannot clear a newer round’s saving state or errors. Submission does not set Ready.
- **Calendar and progress** (`apps/demo-game/src/components/GameLayout.tsx:GameLayout`): player-facing periods map to years starting in the current calendar year (`FIRST_GAME_YEAR`, evaluated at runtime on a fresh page load), and segments are labeled quarters. During RUNNING, the progress strip shows only the year/quarter heading and bars; submission and readiness are communicated by the summary and footer.
- **Summary styling** (`apps/demo-game/src/components/cockpit/AllocationBar.tsx:AllocationBar`, `apps/demo-game/src/globals.css` player tokens): allocation labels are centered within each colored section, Bonds uses the same navy in editing and saved summaries, the active progress segment has no outer halo, and the checked Ready switch uses the green readiness color.
- **Submitted and Ready** (`apps/demo-game/src/components/cockpit/AllocationSummary.tsx:AllocationSummary`): submission replaces the form with a persisted, read-only mix and CHF breakdown. Change allocation reopens saved percentages; Ready is disabled in the editor until resubmission. Ready locks the cockpit controls, keeps the countdown visible, and can be switched off to return to the summary. The disabled Change allocation button retains its normal width. Market and History remain accessible while Ready. The lock is UI-only; the shared API remains advisory and the instructor still closes each segment.
- **Submission marker** (`apps/demo-game/src/services/ActionsReducer.ts:apply`, `apps/demo-game/src/services/SegmentResultService.ts:initialize`/`start`): optional `allocationSubmitted` in result facts records an explicit submission, even for the unchanged/default mix. Both segment entry hooks reset it while carrying forward percentages. Missing markers mean unsubmitted; existing Ready players still see the locked mix. No schema migration is needed.
- **Context** (`apps/demo-game/src/components/cockpit/AllocationForm.tsx:AllocationForm`): CHF previews follow draft percentages and available assets; Market outlook appears only while editing and shows Bonds/Stocks expected value, gap, and volatility from the validated active scenario and shared probability calculation. Expected values use the Market tab’s colors: red for negative values and green otherwise. Compact Bonds and Stocks columns sit beneath the Market outlook title; navigation uses the Market tab. Missing or invalid scenarios show an unavailable message. Closed-round segment results and period reports remain in Decisions.
- **Market** (`apps/demo-game/src/components/market/MarketPanel.tsx:MarketPanel`): active-period Bonds/Stocks probabilities show expected return, gap, calculated volatility, and every possible return. Heights encode probability; the latest revealed totals are highlighted independently. The revealed month appears beneath Expected for both assets; the comparison heading is “Monthly returns · Month N”. In the player view, the shared die is orange, Bonds is yellow, and Stocks is green. Revealed dice appear beneath each asset title; the comparison uses recorded segment returns. Both persist across quarter/year changes and stay hidden before the first reveal.
- **Admin reveals** (`apps/demo-game/src/services/MarketRevealService.ts:revealMarketRoll`): dice and returns are generated when a segment is created. The admin animation publishes an existing monthly outcome through the app-local ADMIN/MASTER-only mutation, including while allocations are open. Optional `revealedRollIndices` in segment facts persist visibility; serializable transactions with conflict retries merge concurrent reveals. Replaying a month cannot reroll outcomes or replace a later result. Future segments cannot be revealed; closing a quarter does not reveal it automatically. `MARKET_ROLL_REVEALED` tells players to refetch the aggregate query. `apps/demo-game/src/lib/gameEvents.ts:shouldRefetchDemoGame` combines the platform lifecycle events with the app-specific reveal event for both player and admin dice views. `apps/demo-game/src/lib/queuedRefetch.ts:queueRefetch` schedules another read when a notification arrives during an in-flight refresh, so Apollo deduplication cannot drop the newer reveal. Market also refreshes on focus/reconnect and every 30 seconds while visible. These markers control the Market UI, not access to raw facts or existing cockpit result timing.

### Decisions result screens

The three review states follow `segment_end.png`, `consolidation.png`, and `period_end.png` in the demo game's design folder. `apps/demo-game/src/components/cockpit/ResultPanels.tsx` provides distinct quarter, consolidation, and year panels in the shared player shell:

- **PAUSED:** closing assets and quarter gain, opening/monthly balances with holdings mixes, current-year portfolio/benchmark balances, and accumulated return by month since initial capital. The allocation legend shows the submitted percentages; monthly mixes reflect actual holdings after returns.
- **CONSOLIDATION:** quarter-close versus current holdings, their CHF difference, current asset shares/amounts, and the completed quarter's benchmark history. The current consolidation hook carries balances unchanged.
- **RESULTS:** stacked assets and CHF gains for completed years, cumulative portfolio return from game start, and closing asset amounts alongside each asset's compounded market return for the completed year. Reallocation-dependent result-facts returns do not supply these rates.

`apps/demo-game/src/lib/results.ts:buildResultView` uses the existing aggregate query, sharing settled-row selection (`readResultHistory`) and sample validation (`readBalanceSamples`) with `buildHistory` in the same module. `PERIOD_END` identifies the displayed completed year, even when the active period points ahead or disconnects. Persisted monthly samples supply balances and benchmarks; repeated opening samples are excluded from the year timeline. Missing/malformed values remain unavailable, and negative returns remain visible. A missing final-quarter result does not move year-end progress backward; annual gains require the period opening record or quarter 1’s opening balance. Dice reveal markers do not gate these settled result screens.

`apps/demo-game/src/components/GameLayout.tsx:GameLayout` renders state-specific progress and “Waiting for the instructor to continue.” during PAUSED, CONSOLIDATION, and RESULTS. Ready appears only during RUNNING; scheduled, preparation, and completed states have no action footer. Advancement remains instructor-controlled. Result screens hide the empty countdown placeholder, retain a configured timer, and keep the footer/navigation accessible while their body scrolls. The RUNNING editor, submitted summary, and Ready lock retain their existing layout.

> [!WARNING]
>
> **Prisma enum trap:** `@prisma/client` exports runtime enum objects (`GameStatus`, etc.) that Next.js strips from client bundles. Code like `DB.GameStatus.RESULTS` will be `undefined` in the browser. In the cockpit `switch` and any shared utility reachable from the frontend, compare against string literals (`'RUNNING'`, `'PAUSED'`, etc.) or the GraphQL-generated enum from `src/graphql/generated/ops.ts`. Use `import type` for Prisma imports in shared files.

Your game-specific work is almost entirely: the decision form (validate with yup: same constraints as your `Actions.apply`), the results/report visualizations (the demo game uses recharts), and the admin authoring forms for your period/segment facts.

The adapters share settlement selection, contiguous balance-sample parsing, initial-capital lookup, saved allocations, and numeric calculations through `apps/demo-game/src/lib/results.ts`. `src/lib/facts.ts:parseFacts` handles persisted objects and legacy single/double-encoded JSON for welcome, player chrome, market data, and results. `src/lib/results.ts` also owns player amount/percentage formatting; `src/lib/constants.ts` holds asset display metadata, canton names, the starting year, and month names. Avatar names stay local to the welcome flow. Market presentation reuses the shared UI's `signedPercent` formatter. These helpers retain each view's existing rounding, missing-value, and reveal rules.

### Demo-game History tab

`apps/demo-game/src/components/history/HistoryPanel.tsx:HistoryPanel` follows the player History reference: shared header/countdown, year pills, cumulative CHF value and gain, quarterly portfolio bars, and a year-filtered breakdown. The latest started year is selected on first load; selection persists across tabs and refetches. Future years stay hidden. Each quarter expands into monthly asset returns, portfolio CHF changes, and dice totals. Dice remain “Not revealed” until the instructor publishes that month, even when the quarter has closed; settled financial results remain visible.

`apps/demo-game/src/lib/results.ts:buildHistory` adapts the existing aggregate result query without another API. Shared `src/lib/results.ts:readResultHistory` uses `PERIOD_END` records and active-quarter lifecycle state to identify completed `SEGMENT_END` records: the latter also exist during allocation with carried-forward facts. It handles an upcoming active period during between-year `RESULTS` and a disconnected final-period pointer. Portfolio amounts and monthly changes come from persisted `assetsWithReturns`; quarterly bond/stock rates compound the monthly market rates, not allocation-dependent asset changes. Missing values render as dashes; before the first completed quarter, known initial capital appears with an empty state. Chart and table scroll independently on narrow screens.

The History lifecycle browser test covers two years, quarter completion, delayed dice reveals, year filtering, selection and allocation-draft retention, final results, keyboard expansion, and screenshots at 784px, 390px, and 320px.

### Demo-game Team and content sheets

`apps/demo-game/src/components/team/TeamContent.tsx:TeamContent` coordinates the Team panel and one active content sheet. Team uses the same expanded header as Market/History and hides cockpit progress. It preserves the mounted allocation editor while tabs and overlays change. `src/lib/team.ts:teamStatistics` reuses settled History balances; Last quarter is that quarter’s gain divided by its starting balance, with a dash before settlement or when unavailable. Level and cumulative XP use the stored player fields; lesson badges display only finite, nonnegative `reward.xp` values. The demo seed configures no lesson rewards, so these badges are absent in fresh databases. Existing databases can still display previously stored rewards, although lesson completion does not apply them directly.

`src/lib/team.ts:storyLibrary` lists released stories, deduplicated by ID with first-release quarter metadata, newest release first and title order within each quarter. Future segments stay hidden, and finished-year stories remain available in final results. `StorySheet` renders the existing generic or role-specific Markdown and images. Unread active-quarter cards open automatically in title order. Continue persists Read status and advances; Close, Escape, and Skip stories dismiss the sequence for this page visit without marking skipped cards Read. Clicking outside does not dismiss. Library entries can reopen any card in its original sequence, including Read cards. Failed progress writes keep the card open for retry. A newly activated unread story preempts a learning sheet.

`LearningSheet` retains the existing single-answer quiz and server scoring rules. Incorrect answers can be retried; solved answers are read-only with feedback and motivation. The shared `useLearningActivities` hook uses `preserveDrafts` for page-visit answer retention and guards against stale query/submission responses. New becomes Open when first opened; viewed IDs are remembered in browser storage per game/team, with an in-memory fallback. Solved is server-backed. Active-quarter unsolved and previously solved lessons retain their existing eligibility. The sheet shows advisory quarter time remaining, never a timer-based submission cutoff. Loading, unavailable content, query retry, and failed submissions have explicit states.

The sheets share an app-local, accessible dialog shell with a 784px width cap, a 90dvh height cap, scrollable content, visible footer actions, safe-area padding, focus trapping and restoration. The Team lifecycle browser test covers story skip/read/reopen, query and mutation failures, quiz states and drafts, a new quarter preempting an activity, final-result archives, and screenshots at 784px, 390px, and 320px.

## Verification loop

Demo-game, platform, and UI use Vitest 5 with separate package-local configurations. Run `pnpm --filter @gbl-uzh/demo-game test`, `pnpm --filter @gbl-uzh/platform test`, or `pnpm --filter @gbl-uzh/ui test` for a single run; each package also provides `test:watch`. Demo-game provides `test:debug` for an inspector-enabled watch session, and platform retains `test:auth` for its authentication suite. Tests import Vitest explicitly and run in Node. UI test types are checked with `pnpm --filter @gbl-uzh/ui check:ts:test`.

Demo-game service tests use the generated Prisma clients and platform distribution from the normal local setup; rebuild platform after changing its implementation. Default test runs skip database integration cases and do not initialize the demo-game Prisma connection. Browser tests remain in the separate Playwright package.

- Run the app locally (devcontainer flow above) and click through the full lifecycle as admin + one player — the fastest end-to-end check.
- `playwright/tests/demo-game-flow.spec.ts` shows how to automate exactly that loop (admin auth setup, multi-player contexts, status assertions via `data-game-status`); adapt it for your game.
- Keep the copied package's `check` script green (`pnpm run check` = lint + `check:ts`; there is no `typecheck` script); the facts types are your main defense against silent data corruption.
- Ready to share a URL? See [deploying-a-game.md](deploying-a-game.md) for the easy Vercel + Neon staging path (the `gbl-deploy-staging` skill drives it from the CLI).

### Demo-game calendar and learning reward maintenance

`src/lib/constants.ts` owns `NUM_MONTHS_PER_SEGMENT = 3` and the runtime `FIRST_GAME_YEAR`. Every period advances the displayed year by its index; each segment contains three months. The admin still chooses the segment count and scenario, but cannot set a monthly roll count. `src/types/Period.ts:PeriodFactsSchema` strips legacy `rollsPerSegment` JSON, and the GraphQL input no longer exposes it. `SegmentService.initialize` uses the constant; `SegmentResultService.end` rejects stored segments whose dice/return arrays do not each contain three months. Existing outcomes are never regenerated by this change.

The XP changes from commit `a11456d6` were reverted: the demo seed no longer assigns lesson rewards, and the platform awards XP only through configured achievements. This is a code-only revert; existing player XP and persisted lesson rewards remain unchanged. Re-running the seed does not clear old reward values because the reverted seed omits the reward field from its updates.

An earlier one-time local correction credited 1,160 XP across 51 players, as previously documented. Those credits are preserved. Do not infer from completion records alone that XP should be added or removed.

From `apps/demo-game`, `pnpm test src/services/calendar.test.ts` verifies the fixed month count and current-year behavior, including an isolated Node subprocess for fresh runtime imports.
