# UI Building Blocks

Two component sources for game frontends: the game-specific library `@gbl-uzh/ui` (`packages/ui`) and the general-purpose UZH design system `@uzh-bf/design-system` (external npm package). Games also use plain [recharts](https://recharts.org) for charts and Formik + yup for forms.

**Maturity warning:** `@gbl-uzh/ui` is early-stage and unstable (many `TODO(JJ)` markers, unused peer deps, one placeholder component). Expect to copy/adapt as much as you import. Improving this library is an explicit project goal.

## `@gbl-uzh/ui` inventory

Vite-built ESM library; source `packages/ui/src/components/`. All named exports via `packages/ui/src/index.ts`:

| Component                    | Purpose                                                                           | Key props                                                                                                                  | Status                                           |
| ---------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `Layout`                     | Page shell: `NavBar` + content + optional sidebar                                 | `tabs: {name, href}[]`, `playerInfo`, `sidebar`, `children`                                                                | —                                                |
| `NavBar`                     | Top navigation with player badge (name, level, avatar)                            | `tabs`, `playerName`, `playerLevel`, `playerColor?`, `playerHref?`                                                         | —                                                |
| `Logo`                       | Player avatar/identity block (color, location, level)                             | `color?`, `name?`, `imgPathAvatar?`, `location?`, `level?`                                                                 | —                                                |
| `PlayerDisplay`              | Sidebar player card: identity + achievements list                                 | flat: `name?`, `color?`, `level`, `location?`, `achievements?`, `onClick?` (xp props are commented out)                    | Renders internal `Achievement` items             |
| `XpBar`                      | XP progress bar (wraps design-system `Progress`)                                  | `value`, `max`                                                                                                             | —                                                |
| `Timeline` / `TimelineEntry` | Period/segment progress visualization for players                                 | `Timeline`: `periods`, `activePeriodIx`, `activeSegmentIx`; `TimelineEntry`: `entryStatus: PAST\|CURRENT\|FUTURE`, indices | —                                                |
| `TimelineAdmin`              | Admin-side timeline                                                               | none — **hardcoded demo data inside**                                                                                      | Stub (renders internal `SegmentEntry`)           |
| `ProbabilityChart`           | Recharts-based probability/outcome distribution chart (demo game's dice forecast) | data series props                                                                                                          | Demo-game flavored                               |
| `TradingForm`                | Formik buy/sell form with amount + price                                          | `price`, `max`, `onSubmit`, `nameButtonBuy/Sell`, `unitName?`                                                              | Usable for trading-style games                   |
| `StorageOverview`            | Simple used/total capacity display                                                | `storageUsed`, `storageTotal`, `icon`                                                                                      | Generic                                          |
| `Button`                     | **Placeholder** — renders a hardcoded "hello world" button                        | `className?`                                                                                                               | Do not use; take `Button` from the design system |

Internal only (not exported): `Achievement`, `SegmentEntry`. Dead: `ListItem` (fully commented out).

CSS: the package ships a Tailwind v4 **utilities-only** stylesheet (no preflight — it assumes the consuming app already loads a base). Consumers must import it explicitly by deep path: `@import '@gbl-uzh/ui/dist/style.css'` (see `apps/demo-game/src/globals.css`).

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

- **No multi-select** in the design system — the demo game builds `MultiSelect` + a `FormikMultiSelectField` wrapper on radix `Command` (`apps/demo-game/src/components/`).
- **Local shadcn-style fallbacks** coexist with the design system in `apps/demo-game/src/components/ui/` (`select`, `dialog`, `popover`, `command`, `toast`/`toaster`, `button`) — e.g. the cockpit uses the local `Select`, and `_app.tsx` uses the local `Toaster`.
- **No chart components** beyond `ProbabilityChart` — games assemble recharts (`LineChart`, `BarChart`, `AreaChart`, scatter) by hand; only `ChartContainer` is shared.
- **`@gbl-uzh/ui` gaps**: no usable `Button`, no admin timeline, no decision-form scaffold, no results-table component — the demo game implements these inline (`DecisionsDisplay`, `PlayerCompact`, `CycleCountDown`, `LogoSelector`, `StoryElements`, `LearningElements` in `apps/demo-game/src/components/` are all app-local and reasonable copy sources for a new game).
