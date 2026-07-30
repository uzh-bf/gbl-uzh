# Demo-Game Type Consolidation Plan (2026-07-02)

Goal: kill scattered inline `type`/`interface` in demo-game components/pages. One source per domain type. No runtime change — type-only refactor. No new workspace package (central module `~/types` already exists with yup schemas; platform stays generic over facts).

## Inventory (current state)

41 declarations outside `src/types/`. Four problem classes + one healthy class.

### Class 1 — duplicates of existing `~/types` exports (drift bugs waiting)

| File | Inline type | Central type it shadows |
| --- | --- | --- |
| `pages/admin/games/[id].tsx:58` | `PeriodFacts` (all-optional copy) | `~/types/Period.ts` `PeriodFacts` (yup-inferred) |
| `pages/admin/games/[id].tsx:72` | `SegmentFacts` | `~/types/Period.ts` `PeriodSegmentFacts` |
| `components/DecisionsDisplay.tsx:26` | inline `{bank,bonds,stocks}` | `~/types/facts.ts` `Decisions` |
| `pages/admin/reports/[id].tsx:70` | `DecisionFacts` | `~/types/facts.ts` `Decisions` |
| `lib/analysis.ts:9` | `ReportPlayerResult.facts` hand-mirror | `~/types/facts.ts` `ResultFacts` (+`AssetsWithReturns`) |

### Class 2 — hand-mirrors of tRPC DTO shapes (should be derived, not declared)

| File | Inline type | Replace with |
| --- | --- | --- |
| `components/StoryElements.tsx:20` | `StoryElement` | indexed access on `RouterOutputs['play']['result']` segment story elements |
| `components/PlayerData.tsx:3` | `PlayerAchievement` | indexed access on `play.self` output achievements |
| `components/PlayerCompact.tsx:6` | `CompactPlayer` | indexed access on `game.byId` players element (facts via `PlayerFacts`) |
| `components/LearningElements.tsx:15,20` | `LearningElementSummary`, `PeriodWithLearningElements` | indexed access on `PlayerResult` |

### Class 3 — same derived helper re-declared per file

- `type PlayerResult = NonNullable<RouterOutputs['play']['result']>` appears in `LearningElements.tsx`, `StoryElements.tsx`, cockpit (`CockpitResult`), reports (`ReportGame` for `game.byId`).
- Progress-augmentation types duplicated: `PlayerResultWithLearningProgress` (LearningElements) vs `PlayerResultWithStoryProgress` (StoryElements) vs ad-hoc object construction in cockpit — one concept, three definitions.

### Class 4 — untyped escape hatch

- `pages/play/cockpit.tsx:67` `FactMap = Record<string, unknown>` + `getFacts()`/`getNumber()` — facts access fully untyped despite schemas existing in `~/types`.

### Healthy — keep as-is

- Component props (`DieProps`, `CycleCountdownProps`, `MultiSelectProps`, `PlayerDataProps`, `LogoSelector Props`, Formik field props) — local by design.
- `server/trpc/router.ts` `AppRouter`/`RouterInputs`/`RouterOutputs` — canonical.
- `server/trpc/context.ts` `SessionUser`/`Context` — server boundary.
- Services' `Input*/Output*Facts` wrappers — compose central types with platform generics, fine.
- `components/ui/*` (vendored shadcn) — do not touch.
- Chart-shaping types in reports (`PlayerPeriodData`, `RiskReturnPlayerData`, `ChartPlayerData`) — page-local presentation types, keep local, but type their facts inputs via Class-1 fixes.

## Target structure

- `~/types/*` stays THE domain module (yup schema + inferred type per facts kind). No new package: only cross-app types are platform's, already exported; demo-game facts are game-specific by design (platform generic via `OutputFacts<T>`).
- NEW `~/types/api.ts`: central `RouterOutputs`-derived aliases — `PlayerResult`, `GameDetail`, `SelfPlayer`, `PlayerResultWithProgress` (single progress-augmentation type replacing the three copies). Types only, `import type` everywhere — erased at build.
- Components/pages: import from `~/types` + `~/types/api`; local types limited to props + presentation shaping.
- Rule going forward (add to AGENTS.md): no hand-declared mirror of a server response — derive via `RouterOutputs`; no facts shape outside `~/types`.

## Slices

- S1: add `~/types/api.ts`; migrate LearningElements, StoryElements, cockpit progress types to shared `PlayerResultWithProgress`. Verify: tsc, lint, playwright suite.
- S2: Class-1 kills — `[id].tsx`, DecisionsDisplay, reports `DecisionFacts`, `analysis.ts` derive from `ResultFacts`. Caution: yup-inferred types stricter than the all-optional copies; DTO `facts` arrive as `unknown` → cast to `Partial<...>` at the boundary or `schema.validateSync` where cheap. Verify same.
- S3: Class-2 kills — PlayerCompact, PlayerData, StoryElements, LearningElements indexed-access derivations. Verify same.
- S4 (optional): type cockpit `getFacts` against schemas; move `ExtendedSession` to next-auth module augmentation (`types/next-auth.d.ts`).
- Final: independent review pass + simplification; security review n/a (type-only, no runtime diff — confirm via `git diff` yields no `.js` behavior change and playwright suite green).

## Verification loop

Per slice: `pnpm -F @gbl-uzh/demo-game exec tsc --noEmit`, lint, playwright game-flow suite in devcontainer (CI-style localhost env, ~16s — see memory `gbl-playwright-in-devcontainer`).

## Where it lands

Follow-up branch/PR after #144 merges (PR #144 already 150+ files; type refactor on top inflates review). Plan committed with the follow-up branch.

## Progress

- 2026-07-02: Inventory done (this file). Not started.

## Progress (execution, folded into PR #144)

- 2026-07-02: Executed S1-S3 on this branch (no new package):
  - S1: added `~/types/api.ts` (`PlayerResult`, `SelfPlayer`, `GameDetail`,
    `LearningElementRef`, `StoryElementRef`, `PlayerResultWithProgress` — all
    `RouterOutputs`-derived, `import type`, kept OUT of the `~/types` barrel to
    avoid pulling the router graph into service-side type imports). LearningElements
    + StoryElements now import the shared progress type + element refs; dropped the
    `as unknown as PeriodWithLearningElements[]` and `as StoryElement[]` casts;
    `contentRole` narrowed at its single read site.
  - S2: `[id].tsx` inline `PeriodFacts`/`SegmentFacts` removed — now import canonical
    `PeriodFacts`/`PeriodSegmentFacts` from `~/types/Period` (enriched with the
    real-but-untyped fields: optional `spotTradingEnabled/futures/options` on
    PeriodFacts, optional `shared` on `diceRolls[]` — optional-only, so existing
    service consumers unaffected). DecisionsDisplay + reports `DecisionFacts` →
    central `Decisions`; reports `ReportGame` derivation → `GameDetail`.
  - S3: PlayerCompact prop type → `GameDetail['players'][number]`, dropped the
    `as any` at the `[id].tsx` call site (real safety gain); facts narrowed inside.
  - Deferred: cockpit `getFacts`/`FactMap` deep typing (S4, high effort/low certainty);
    `authOptions` `ExtendedSession` module augmentation (low value); `lib/analysis.ts`
    `ReportPlayerResult` left as-is (lib-level defensive narrowing boundary over
    `unknown` facts, not a component inline type). `components/PlayerData.tsx` is
    DEAD (no importer) — flagged for separate removal, type left untouched.
  - Net: -58 lines. Verify: tsc exit 0, lint 0 errors (14 pre-existing warnings),
    Playwright game-flow suite green (behavior-preserving confirmed end-to-end).
