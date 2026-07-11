---
type: Component Inventory
title: UI Building Blocks
description: Reusable UI for game frontends: @gbl-uzh/ui inventory, @uzh-bf/design-system usage, Tailwind v4 wiring, and known gaps.
tags:
  - ui
  - design-system
  - tailwind
  - components
timestamp: '2026-07-11T00:00:00Z'
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

## Gaps a new game will hit

Known holes, confirmed by how the demo game works around them (candidates for library improvement):

- **No multi-select** in the design system. Use the shared UI package's `MultiSelect`; games can keep a thin Formik adapter when needed.
- **Local shadcn-style fallbacks** coexist with the design system in `apps/demo-game/src/components/ui/` (`select`, `dialog`, `popover`, `command`, `toast`/`toaster`, `button`) — e.g. the cockpit uses the local `Select`, and `_app.tsx` uses the local `Toaster`.
- **No chart components** beyond `ProbabilityChart` — games assemble recharts (`LineChart`, `BarChart`, `AreaChart`, scatter) by hand; only `ChartContainer` is shared.
- **`@gbl-uzh/ui` gaps**: use `Button` from the design system; the package still lacks a usable admin timeline, generic decision-form scaffold, and results-table component. Keep game-specific layouts, decisions, charts, and GraphQL adapters in the game.
