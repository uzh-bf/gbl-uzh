---
type: Component Inventory
title: UI Building Blocks
description: Reusable UI for game frontends: @gbl-uzh/ui inventory, @uzh-bf/design-system usage, Tailwind v4 wiring, and known gaps.
tags:
  - ui
  - design-system
  - tailwind
  - components
timestamp: '2026-10-02T00:00:00Z'
---

# UI Building Blocks

Two component sources for game frontends: the game-specific library `@gbl-uzh/ui` (`packages/ui`) and the general-purpose UZH design system `@uzh-bf/design-system` (external npm package). Games also use plain [recharts](https://recharts.org) for charts and Formik + yup for forms.

**Maturity warning:** `@gbl-uzh/ui` remains pre-1.0. Its exported package contract is verified and shared by three games, but `TimelineAdmin` is still a stub and `ProbabilityChart` remains demo-game flavored. Treat minor releases as potentially breaking until a stable 1.0 API is declared.

## Distribution and installation

`packages/ui/package.json` defines an ESM-only public package with TypeScript declarations and a stable CSS subpath. `.github/workflows/publish-ui.yml` verifies and publishes the package on repository `v*` tags. The next standard-version release raises the current UI version from `0.4.13` to the root/platform release version.

The package needs one manual public-npm bootstrap before trusted publishing can be configured. Until that happens, `pnpm add @gbl-uzh/ui` returns npm `404`; workspace consumers continue using `workspace:*`.

After the bootstrap publication:

```bash
pnpm add @gbl-uzh/ui
```

Declare compatible application-level peers such as `next`, `react`, `react-dom`, `react-hook-form`, and `@uzh-bf/design-system` directly in the game. Resolve peer warnings against `@gbl-uzh/ui`'s published `peerDependencies` instead of installing arbitrary latest versions.

The package root still exports the deprecated Apollo-backed `useLearningActivities` hook, so an external package-root consumer must also provide a compatible `@apollo/client` peer for now. Repository games do not use that hook; their learning adapters call app-local tRPC hooks. New code must not couple learning UI to GraphQL documents.

Import components from the package root and the utilities-only stylesheet from the stable CSS subpath:

```tsx
import { GameSidebar, Layout, StoryElements } from "@gbl-uzh/ui";
```

```css
@import "@gbl-uzh/ui/style.css";
```

App Router modules importing this hook-based UI bundle must be client components (`'use client'`); the reference games use the Pages Router and need no extra boundary.

## `@gbl-uzh/ui` inventory

Vite-built ESM library; source `packages/ui/src/components/`. Selected exports from `packages/ui/src/index.ts`:

| Area                   | Exports                                                                                              | Status                                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Shell and identity     | `Layout`, `NavBar`, `Logo`, `LogoSelector`, `PlayerDisplay`, `PlayerCompact`, `GameSidebar`, `XpBar` | The package is consumed by all three games; use of individual exports varies                                         |
| Lifecycle display      | `Timeline`, `TimelineEntry`, `CycleCountdown`, status helpers                                        | Player timeline/countdown usable; `TimelineAdmin` remains a hardcoded stub                                           |
| Narrative and learning | `StoryElements`, `LearningActivitiesList`, `LearningActivityModal`, `useLearningActivities`          | Components are current; the exported hook is deprecated GraphQL compatibility, and games use app-local tRPC adapters |
| Forms and controls     | `TradingForm`, `ReusableFormField`, `Form`, `MultiSelect`, `HelpTooltip`                             | React Hook Form for shared reusable fields; app authoring forms may still use Formik                                 |
| Data and game widgets  | `EventLog`, `ProbabilityChart`, `StorageOverview`, `Die`                                             | `ProbabilityChart` and `Die` remain reference-game flavored                                                          |

Other public exports include `cn`, number formatters (including `signedPercent(value, digits = 1)` for signed fixed-precision percentages with rounded-zero normalization), status helpers, and global-event helpers. Internal components include `Achievement`, `SegmentEntry`, `LearningElementDisplay`, and the underlying UI primitives used by exported components. `ListItem` is fully commented out.

CSS: the package ships a Tailwind v4 **utilities-only** stylesheet (no preflight; the consuming app supplies a base). Consumers import `@gbl-uzh/ui/style.css` explicitly; see `apps/demo-game/src/globals.css`.

## `@uzh-bf/design-system` usage

Version 4.1.6 (pinned in the demo game; peer `^4.1.6` in `packages/ui`). It exports ~260 named components; the slice actually exercised by the reference game, by import frequency:

- **Structure**: `Card` family (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) — the workhorse container; `Modal`; `NavigationMenu` family; headings `H3`/`H4`; `Prose`.
- **Forms (Formik-first)**: `FormikTextField`, `FormikNumberField`, `FormikSelectField` inside a `<Formik>` + yup `validationSchema`. This is the sanctioned pattern; the design system's react-hook-form-based `Form*` exports are unused in game code.
- **Controls**: `Button` (with `data={{ cy, test }}` for test selectors), `Select`, `Switch`, `Progress`.
- **Data display**: `ShadcnTable*` family (conventionally import-aliased to `Table`, `TableBody`, ...), `ChartContainer` for recharts wrappers.

### Tailwind v4 integration (CSS-only, no `tailwind.config.js`)

Copy the demo game's setup (`apps/demo-game/src/globals.css`, `postcss.config.js`). Known gotchas encoded there:

1. The design system's compiled CSS must be imported via a **relative `node_modules` path** (`../node_modules/@uzh-bf/design-system/dist/design-system.css`) — the package's exports map does not expose the CSS file as a bare specifier.
2. Skip your own Tailwind preflight — the design-system CSS already ships the base reset (double-applying breaks styles).
3. `@layer utilities { .aspect-video { ... } }` is manually patched in because the design system's `ChartContainer` needs it but the shipped CSS doesn't emit it.
4. Theming = CSS custom properties on `:root` (`--theme-color-primary`, `--theme-color-secondary`, with `-80/-60/-40/-20` shades).

### Market probability charts

`packages/ui/src/components/ProbabilityChart.tsx:ProbabilityChart` keeps its existing admin presentation by default. `variant="market"` adds the compact player presentation with optional `title`, `titleContent`, `monthLabel`, and `month`; `totalEyes` selects an actual revealed total, with no automatic highlight of 7. Expected return, trend gap, and volatility share a compact row with matching text sizes. `monthLabel` places a quarter and calendar abbreviation (for example, Q1 · Jan or Q2 · Apr) for the latest revealed month beneath the Expected value for both Bonds and Stocks; numeric `month` remains supported for other consumers. The label derives from the revealed quarter, not the active quarter; the charts have no highlighted-date footer. The month remains absent until a roll is revealed. The comparison heading is “Monthly returns · Q1 · Jan” (using the revealed calendar month); the latest revealed results continue to persist across quarter and year changes. `titleContent` places the latest revealed dice beneath each asset title; these compact dice use stored outcomes and asset colors. The exported `probabilityDistribution` helper also supplies the Decisions editor’s forecast volatility; `signedPercent` formats its expected values. The shared calculation preserves the reference game's rounded probability weights and volatility convention. All values derive from supplied scenario inputs, not screenshot constants. The Market SVG has an accessible description and per-roll descriptions; all 11 bars scale to the available width without horizontal scrolling, including at a 400px viewport. Narrower bars and compact mobile labels preserve room for the endpoint labels.

### Admin dice workspace

`apps/demo-game/src/components/admin/DiceWorkspace.tsx:DiceWorkspace` presents the admin dice route as three month tabs and one dice/sidebar-and-charts workspace, without a top header. The initial selection is the first unrevealed month (Month 1 when all are revealed); selection persists during refetches and after publication. Calendar names derive from the quarter, and the year uses `FIRST_GAME_YEAR`. Background refresh errors keep the loaded workspace and selected month visible with a retry action.

Both forecasts remain visible before reveal, using the shared `probabilityDistribution` and `signedPercent` helpers in an app-local SVG presentation. Unrevealed dice are blank and neither chart highlights an outcome. After publication, Bonds/Shared/Stocks dice are green/orange/yellow; the charts highlight stored totals and show persisted returns with the shared-plus-asset calculation. The Roll button is replaced by the month's revealed status. Animation and publication temporarily disable month navigation; failed publication offers a retry without rerolling. Existing reveal eligibility, authoritative outcomes, realtime refetches, and backend idempotency are unchanged.

At 1200px the workspace uses three columns; below that the dice section sits above the charts, and below 900px the charts stack. Tabs support arrow keys, Home and End, while labeled dice/charts and live status text expose outcomes to assistive technology. Shared `ProbabilityChart` defaults and player Market presentation remain unchanged.

### Player styling convention

The demo-game cockpit and welcome flow use colocated Tailwind utilities, with shared player colors and font tokens in `apps/demo-game/src/globals.css`. Primary actions use the UZH primary token; Savings, Bonds, and Stocks use named asset tokens shared with the welcome screen. The welcome screen's portaled pickers apply their font, size, line height, and colors directly to dialog content. Welcome-local controls in `apps/demo-game/src/components/welcome/WelcomeControls.tsx` reuse design-system buttons with 44px mobile / 48px desktop minimum heights and forward native props and refs; text inputs and Edit/Cancel buttons share utility classes. `WelcomePickerTrigger` shares the native avatar/canton trigger structure and forwards native props and refs. Welcome and cockpit retain separate action dimensions, while sharing palette tokens, including welcome's primary hover shade.

Reuse structure and styles through app-local components: `PlayerActionButton` provides primary/secondary actions with shared responsive dimensions; `AllocationNotice` provides success/pending/informational notices; `AllocationRow` shares asset identity and amounts between editing and saved summaries. `AllocationBar` owns proportional sections and container-query label visibility; its optional `compact` presentation suppresses labels and internal separators for History table mixes, whose wrappers provide accessible percentages. These components live in `apps/demo-game/src/components/cockpit/`; promote them to the shared UI package only when another game needs them.

`apps/demo-game/src/components/cockpit/AllocationSlider.tsx:AllocationSlider` adds 24px horizontal track margins below 601px using `mobile:mx-app-6`, moving endpoint handles farther from phone navigation gesture areas. The heading retains its form alignment, handles retain 44px touch targets, and dragging uses the actual track width. Desktop sizing and browser navigation remain unchanged.

Demo-game result panels (`apps/demo-game/src/components/cockpit/ResultPanels.tsx`) share total-asset summaries, monthly balance rows, asset breakdowns, and benchmark charts. Compact `AllocationBar` segments encode actual holdings; accessible descriptions expose the mix. Recharts provides monthly cumulative-return bars, stacked year-end assets with an initial-capital reference, and cumulative year-end returns. Shared player colors distinguish Savings/Bonds/Stocks, and gains/losses use success/error tokens. The 784px reference layout scales down to 320px; multi-year charts scroll within their own sections. Benchmark charts show month ticks and compact balance ticks with a visible CHF unit, while tooltips retain exact amounts. Month ticks skip when needed while preserving the endpoints. The benchmark plot is 200px high on mobile and 230px on desktop (260px during consolidation). Screen-reader tables/lists expose monthly chart values.

Below 601px, the quarter-closed “Assets per month” opening and monthly rows use 8px vertical padding and a 40px minimum height, with wrapping amounts. Other balance rows retain their existing spacing. `apps/demo-game/src/components/history/PortfolioHistoryChart.tsx:PortfolioHistoryChart` caps portfolio bars at 28px below 601px and 100px otherwise; resizing updates the cap with fixed quarter slots of 56px on mobile and 120px on desktop. Short histories align left rather than stretching across the card, and longer histories scroll horizontally. Expanded Q1–Q4 rows use Jan–Dec month names derived from the quarter and local month index; the calendar restarts each year.

Preserve the current pixel dimensions and explicit viewport thresholds when adapting these designs: the app root is **14px**, so default rem-based Tailwind spacing is not a pixel-equivalent replacement. Dynamic widths and slider positions remain inline styles. Custom CSS in the converted cockpit is limited to the WebKit number-input stepper reset in the components layer; ordinary layout, responsive rules, and interaction states belong in utilities. Supply control overrides through the design system's class slots rather than CSS Module selectors and blanket `!important` rules.

### Demo-game sizing contract

`apps/demo-game/src/globals.css` centrally defines the demo-game sizing roles. Apply the `mobile:` variant (below **601px**) to opt a component into this scale; existing base and desktop utilities preserve the previous desktop appearance. Keep the **14px document root**, welcome's 359px avatar-grid boundary and 721px shell boundary, and the player shell's existing desktop widths.

| Role                     | Mobile value                     | Usage                                        |
| ------------------------ | -------------------------------- | -------------------------------------------- |
| `app-annotation`         | 12px / 1.25                      | Dense chart and allocation-bar labels        |
| `app-caption`            | 14px / 1.4                       | Metadata, legends, section labels            |
| `app-body`               | 16px / 1.5                       | Body text, fields, buttons, tables           |
| `app-heading`            | 20px / 1.25                      | Page, card and dialog headings               |
| `app-value`              | 24px / 1.2                       | Primary balances and countdown               |
| `app-control`            | Minimum 44px, 8px corners        | Controls that can grow when their text wraps |
| `app-touch`              | Minimum 44 × 44px                | Icon buttons and quarter expansion           |
| `app-panel` / `app-card` | 16px / 12px padding              | Sections and cards; cards use 12px corners   |
| `app-cell`               | 16px text, 10px vertical padding | Dense result tables                          |

The `app-1/2/3/4/6` spacing tokens provide 4/8/12/16/24px for gap, padding and margin utilities. Named dimensions cover phone navigation (40px), header avatars (40px), dice (28px), allocation mixes (88px), and chart heights: monthly 130px, benchmark 200px, accumulated return 160px, History 180px, annual assets 200px, admin reports 240px. Choose by content; do not shrink probability SVG coordinates as though they were screen pixels.

`apps/demo-game/src/components/GameLayout.tsx:GameLayout` uses a separate `phone:` variant for widths below 768px, plus landscape viewports with a coarse pointer up to 1024px wide and 500px tall. On these viewports the shell is fixed to the dynamic viewport, with the header, quarter progress, action footer, and navigation outside the main scroll area. The shell chrome uses compact spacing and typography across this phone range so landscape retains room for content. Vertical overscroll stays within main content rather than chaining to the document. Navigation links are 40px tall, with bottom safe-area padding added separately. This viewport approximation leaves tablet and desktop shell behavior unchanged outside the phone rule and does not change the global below-601px compact-content breakpoint.

Use semantic roles such as `mobile:app-heading`, `mobile:app-control` and `mobile:h-app-chart-history` instead of introducing new mobile pixel literals. Pair them with explicit desktop overrides; omit base size literals when those two rules already cover every viewport. Controls include the body-text and touch-target roles, so do not repeat those classes. The mobile variant repeats only its explicitly opted-in class selector to take precedence over later bundled design-system utilities, without `!important` or global element selectors. Root variables reach portaled dialogs; `RootLayout` supplies the resolved mobile font family, and font/role classes still belong on the portal content itself.

Existing player and welcome controls consume these roles. `apps/demo-game/src/components/admin/AdminControls.tsx` applies them through design-system class slots for admin buttons, cards, headings, tables and dialogs. Components without app sizing changes are imported directly from the design system. Shared `ProbabilityChart`, `MultiSelect`, and `PlayerCompact` consume optional `--market-*` / `--gbl-*` sizing variables with their previous styles as fallbacks; only demo-game defines those overrides on mobile. Other games and desktop retain their existing presentation.

The resize preserves the result-view computations, lifecycle copy and Ready behavior. History uses fully rounded year filters in a keyboard-focusable horizontal scroll region, plus an All filter with year-qualified quarter rows. A fresh page selects the latest started year; the selected filter survives refetches and tab switches. Its 180px chart always shows cumulative data. The player header avatar is a keyboard-accessible “Edit player profile” link on every tab. It opens the welcome form directly in edit mode and returns to the originating tab after Save changes or Cancel; see [the welcome flow](developing-a-game.md#demo-game-welcome-flow).

`GameLayout` shows the team name and HQ location in every tab header, alongside the single shared avatar and countdown. `TeamPanel` keeps its profile text and statistics without repeating the avatar. Stocks retain their blue asset token; completed segments and other completed progress markers use `player-progress-done`, mapped to UZH secondary orange, to distinguish progress from portfolio composition. Annual assets use a compact heading gap and a numeric initial-capital reference label; accumulated-return axis percentages use success/error/neutral colors by sign.

The header and welcome confirmation avatars share `apps/demo-game/src/components/CantonFlagBadge.tsx:CantonFlagBadge`: a circular flag at bottom-right, sized to 45% of the avatar with a white border. The badge sits outside avatar clipping, is decorative alongside the HQ text, and is omitted for unsupported or missing locations. All 26 square flags live in `apps/demo-game/public/locations/flags/`, separate from the shield-shaped coats of arms; `public/locations/README.md` records asset sources and licenses.

### Demo-game content presentation

The demo game keeps Team-specific presentation in `apps/demo-game/src/components/team/`: `TeamPanel`, `ContentSheet`, `StorySheet`, and `LearningSheet`, coordinated by `TeamContent`. These reuse player tokens and action buttons without changing the shared `StoryElements` or learning-modal defaults used by other games. The local story reader adds archive navigation around the existing mark-visited mutation. The `play.result` and `play.self` DTOs carry historical story bodies, lesson rewards, and self read/completion IDs; no database migration is needed.

`packages/ui/src/hooks/useLearningActivities.ts:useLearningActivities` adds optional `preserveDrafts` (default false), optional list-item reward metadata, and query/submission errors plus a query retry function. Query data is exposed only for the selected activity ID; transient submission feedback cannot alter a newer selection. Mutations refresh the submitted activity by ID even after it closes, preserving solved answers and explanations on reopening. Persisted progress is derived directly from the query, while one per-activity draft map stores local selections and attempt feedback, avoiding synchronization effects and duplicate state. Demo-game opts into per-activity answer drafts for the current page visit. Its direct Markdown rendering uses the same React 19 JSX compatibility bridge as the shared UI package.

## Gaps a new game will hit

Known holes, confirmed by how the demo game works around them (candidates for library improvement):

- **No multi-select** in the design system. Use the shared UI package's `MultiSelect`; games can keep a thin Formik adapter when needed.
- **Local shadcn-style fallbacks** coexist with the design system in `apps/demo-game/src/components/ui/` (`select`, `dialog`, `popover`, `command`, `toast`/`toaster`, `button`) — e.g. the cockpit uses the local `Select`, and `_app.tsx` uses the local `Toaster`.
- **No chart components** beyond `ProbabilityChart` — games assemble recharts (`LineChart`, `BarChart`, `AreaChart`, scatter) by hand; only `ChartContainer` is shared.
- **`@gbl-uzh/ui` gaps**: use `Button` from the design system; the package still lacks a usable admin timeline, generic decision-form scaffold, and results-table component. Keep game-specific layouts, decisions, charts, and tRPC adapters in the game.

### Admin report presentation

The demo-game report uses app-local sections under `src/components/admin/report/`: `ReportOverview` supplies summaries, ranking and allocation tables; `ReportCharts` supplies performance, risk/return and Sharpe views. They reuse design-system buttons, tooltips and chart containers, the player font/color tokens, and `AllocationBar`'s opt-in `report` presentation (compact rectangular bars with numeric labels). The default player allocation presentation is unchanged. Allocation wrappers provide accessible percentage labels and keyboard-triggered tooltips. Team colors are stable by player order, independent of scope and ranking. Beyond the first 15 reference colors, deterministic HSL hues extend the palette instead of cycling it. All teams remain available: ranking and Sharpe lists have bounded vertical scrolling, and the decisions table scrolls with a sticky header and team column. Ranking controls announce rank, CHF balance and return through accessible descriptions. Focused endpoint labels use the report’s scalar values in both Assets and Return modes, avoiding the area chart’s internal range representation. Year and whole-game tabs share one renderer. Chart/ranking and lower panels stack below 1024px; summary cells stack below 600px, and tabs/tables scroll within their containers.

### Countdown notices

The demo-game floating countdown messages use the opt-in `countdown` toast variant. `AllocationNotice.tsx:playerNoticeStyles` supplies the same green surface, border, corners, responsive spacing, and title/body hierarchy as the allocation-submitted notice, with a clock icon and an accessible dismiss button. Player typography is applied directly to the floating toast. `GameLayout` uses this variant for countdown updates and threshold reminders across tabs; timing, placement, text, and dismissal behavior remain unchanged. Default and destructive toast variants retain their existing presentation.
