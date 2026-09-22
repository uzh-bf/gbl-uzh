---
type: Component Inventory
title: UI Building Blocks
description: Reusable UI for game frontends: @gbl-uzh/ui inventory, @uzh-bf/design-system usage, Tailwind v4 wiring, and known gaps.
tags:
  - ui
  - design-system
  - tailwind
  - components
timestamp: "2026-09-22T00:00:00Z"
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

Declare compatible application-level peers such as `next`, `react`, `react-dom`, `@apollo/client`, `react-hook-form`, and `@uzh-bf/design-system` directly in the game. Resolve any remaining peer warnings against `@gbl-uzh/ui`'s published `peerDependencies` instead of installing arbitrary latest versions.

The React 18 reference games use Apollo Client 3.11. The strict external React 19 fixture uses Apollo Client 3.14.1; use 3.14.1 or newer when pairing this package with React 19.

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

| Area                   | Exports                                                                                              | Status                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Shell and identity     | `Layout`, `NavBar`, `Logo`, `LogoSelector`, `PlayerDisplay`, `PlayerCompact`, `GameSidebar`, `XpBar` | The package is consumed by all three games; use of individual exports varies          |
| Lifecycle display      | `Timeline`, `TimelineEntry`, `CycleCountdown`, status helpers                                        | Player timeline/countdown usable; `TimelineAdmin` remains a hardcoded stub            |
| Narrative and learning | `StoryElements`, `LearningActivitiesList`, `LearningActivityModal`, `useLearningActivities`          | Shared typed flow; games supply generated GraphQL documents and app-specific adapters |
| Forms and controls     | `TradingForm`, `ReusableFormField`, `Form`, `MultiSelect`, `HelpTooltip`                             | React Hook Form for shared reusable fields; app authoring forms may still use Formik  |
| Data and game widgets  | `EventLog`, `ProbabilityChart`, `StorageOverview`, `Die`                                             | `ProbabilityChart` and `Die` remain reference-game flavored                           |

Other public exports include `cn`, number formatters, status helpers, and global-event helpers. Internal components include `Achievement`, `SegmentEntry`, `LearningElementDisplay`, and the underlying UI primitives used by exported components. `ListItem` is fully commented out.

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

`packages/ui/src/components/ProbabilityChart.tsx:ProbabilityChart` keeps its existing admin presentation by default. `variant="market"` adds the compact player presentation with optional `title`, `titleContent`, and `month`; `totalEyes` selects an actual revealed total, with no automatic highlight of 7. Expected return, trend gap, and volatility share a compact row with matching text sizes. `month` places the latest revealed month beneath the Expected value for both Bonds and Stocks; the charts have no highlighted-date footer. The month remains absent until a roll is revealed. The comparison heading is “Monthly returns · Month N”; the latest revealed results continue to persist across quarter and year changes. `titleContent` places the latest revealed dice beneath each asset title; these compact dice use stored outcomes and asset colors. The shared `probabilityDistribution` calculation preserves the reference game's rounded probability weights and volatility convention. All values derive from supplied scenario inputs, not screenshot constants. The Market SVG has an accessible description and per-roll descriptions; all 11 bars scale to the available width without horizontal scrolling, including at a 400px viewport. Narrower bars and compact mobile labels preserve room for the endpoint labels.

### Player styling convention

The demo-game cockpit and welcome flow use colocated Tailwind utilities, with shared player colors and font tokens in `apps/demo-game/src/globals.css`. Primary actions use the UZH primary token; Savings, Bonds, and Stocks use named asset tokens shared with the welcome screen. The welcome screen's portaled pickers apply their font, size, line height, and colors directly to dialog content. Welcome-local controls in `apps/demo-game/src/components/welcome/WelcomeControls.tsx` reuse design-system buttons with 48px minimum heights and forward native props and refs; text inputs and Edit/Cancel buttons share utility classes. Welcome and cockpit retain separate action dimensions, while sharing palette tokens, including welcome's primary hover shade.

Reuse structure and styles through app-local components: `PlayerActionButton` provides primary/secondary actions with shared responsive dimensions; `AllocationNotice` provides success/pending/informational notices; `AllocationRow` shares asset identity and amounts between editing and saved summaries. `AllocationBar` owns proportional sections and container-query label visibility; its optional `compact` presentation suppresses labels and internal separators for History table mixes, whose wrappers provide accessible percentages. These components live in `apps/demo-game/src/components/cockpit/`; promote them to the shared UI package only when another game needs them.

Demo-game result panels (`apps/demo-game/src/components/cockpit/ResultPanels.tsx`) share total-asset summaries, monthly balance rows, asset breakdowns, and benchmark charts. Compact `AllocationBar` segments encode actual holdings; accessible descriptions expose the mix. Recharts provides monthly cumulative-return bars, stacked year-end assets with an initial-capital reference, and cumulative year-end returns. Shared player colors distinguish Savings/Bonds/Stocks, and gains/losses use success/error tokens. The 784px reference layout scales down to 320px; multi-year charts scroll within their own sections. Screen-reader tables/lists expose monthly chart values.

Preserve the current pixel dimensions and explicit viewport thresholds when adapting these designs: the app root is **14px**, so default rem-based Tailwind spacing is not a pixel-equivalent replacement. Dynamic widths and slider positions remain inline styles. Custom CSS in the converted cockpit is limited to the WebKit number-input stepper reset in the components layer; ordinary layout, responsive rules, and interaction states belong in utilities. Supply control overrides through the design system's class slots rather than CSS Module selectors and blanket `!important` rules.

### Demo-game content presentation

The demo game keeps Team-specific presentation in `apps/demo-game/src/components/team/`: `TeamPanel`, `ContentSheet`, `StorySheet`, and `LearningSheet`, coordinated by `TeamContent`. These reuse player tokens and action buttons without changing the shared `StoryElements` or learning-modal defaults used by other games. The local story reader adds archive navigation around the existing mark-visited mutation. GraphQL aggregate fragments select historical story bodies, lesson rewards, and self read/completion IDs; this requires operation regeneration but no database migration.

`packages/ui/src/hooks/useLearningActivities.ts:useLearningActivities` adds optional `preserveDrafts` (default false), optional list-item reward metadata, and query/submission errors plus a query retry function. Query data is exposed only for the selected activity ID; transient submission feedback cannot alter a newer selection. Mutations refresh the submitted activity by ID even after it closes, preserving solved answers and explanations on reopening. Persisted progress is derived directly from the query, while one per-activity draft map stores local selections and attempt feedback, avoiding synchronization effects and duplicate state. Demo-game opts into per-activity answer drafts for the current page visit. Its direct Markdown rendering uses the same React 19 JSX compatibility bridge as the shared UI package.

## Gaps a new game will hit

Known holes, confirmed by how the demo game works around them (candidates for library improvement):

- **No multi-select** in the design system. Use the shared UI package's `MultiSelect`; games can keep a thin Formik adapter when needed.
- **Local shadcn-style fallbacks** coexist with the design system in `apps/demo-game/src/components/ui/` (`select`, `dialog`, `popover`, `command`, `toast`/`toaster`, `button`) — e.g. the cockpit uses the local `Select`, and `_app.tsx` uses the local `Toaster`.
- **No chart components** beyond `ProbabilityChart` — games assemble recharts (`LineChart`, `BarChart`, `AreaChart`, scatter) by hand; only `ChartContainer` is shared.
- **`@gbl-uzh/ui` gaps**: use `Button` from the design system; the package still lacks a usable admin timeline, generic decision-form scaffold, and results-table component. Keep game-specific layouts, decisions, charts, and GraphQL adapters in the game.
