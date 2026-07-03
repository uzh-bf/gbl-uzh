# Game Model (Data Model)

Source of truth: `packages/platform/public/schema.prisma`. Game apps do not write their own copy — a build step (`apps/demo-game/prisma/copy.ts`) copies the published platform schema into the app as `prisma/schema/platform.prisma`, next to a game-specific `specific.prisma` extension file (currently an unused stub in the demo game).

## Structure: Game → Period → Segment

```text
Game (status, facts, activePeriodIx/activePeriodId, version, owner)
 └── Period[] (index, facts, segmentCount, activeSegmentIx/activeSegmentId)
      └── PeriodSegment[] (index, facts, countdown fields, learningElements, storyElements)
```

- **Ordering** is by an `index` int per level (`@@unique([gameId, index])` for periods; unique per game+period+index for segments) plus explicit linked-list pointers (`previousPeriod`/`nextPeriodId`, `previousSegment`/`nextSegmentId`).
- **Progress pointers**: `Game.activePeriodId` + `Game.activePeriodIx` (default `-1` = none yet) and `Period.activeSegmentId` + `Period.activeSegmentIx`. These are advanced only by the state-machine transitions in `GameService` ([03-game-lifecycle.md](03-game-lifecycle.md)), never derived.
- `Period.segmentCount` is the _planned_ number of segments, set when the period is created; the admin UI blocks adding more segments once reached, and "last segment" checks compare `activeSegmentIx` against it.
- `PeriodSegment.countdownExpiresAt` / `countdownDurationMs` back the optional per-segment countdown timer.
- `Game.version` increments on admin-driven game updates (status transitions, countdown, switch toggle) — not on player actions. Do not use it as an optimistic-concurrency token for player input.

## Facts: game-specific state as JSON

Nearly every entity has a `facts Json` column: `Game.facts`, `Period.facts`, `PeriodSegment.facts`, `Player.facts`, `PlayerAction.facts`, `PlayerResult.facts`, `PlayerDecision.facts`.

- The platform treats facts as opaque; **the game defines their shape** in TypeScript + yup (demo game: `apps/demo-game/src/types/`, e.g. `PeriodFacts` = market scenario parameters, `PeriodSegmentFacts` = precomputed dice rolls and returns).
- Validation happens in application code via yup schemas passed into the platform's mutations — there are no DB constraints on facts.
- Rule of thumb for placement: configuration an admin sets per period → `Period.facts`; per-round randomness/environment → `PeriodSegment.facts`; player profile data (name, color, avatar) → `Player.facts`; computed player state (portfolio, score) → `PlayerResult.facts`.

## Players and admins

Two unrelated identity models:

- **`User`** — an admin/facilitator account (standard NextAuth tables: `User`, `Account`, `Session`). `User.role` is `ADMIN` or `MASTER`. Admins own games (`Game.ownerId`).
- **`Player`** — a participant _team_ inside one game. Key fields: uuid `id`, unique `token` (passwordless login: visiting `/join/[token]` signs the team in — `AccountService.ts:loginAsTeam`), `name`, optional `role` (drives role-based content and computations), `isReady` (advisory flag, reset on every transition), `facts`, gamification state (`experience`, `experienceToNext`, `levelIx` → `PlayerLevel`), and progress arrays (`completedLearningElementIds`, `visitedStoryElementIds`, `achievementKeys`).

Players are created up front by `GameService.ts:createGame` (one row per team, default names, fresh tokens, optional `roleAssigner` callback for role-based games).

## The results ledger: PlayerResult

`PlayerResult` rows are the platform's memory of each player's computed state at every boundary:

| `PlayerResult.type` | Written when                                | Computed by (game hook)                      |
| ------------------- | ------------------------------------------- | -------------------------------------------- |
| `PERIOD_START`      | A period is activated                       | `PeriodResult.initialize` (first) / `.start` |
| `SEGMENT_START`     | A segment starts running                    | `SegmentResult.initialize` / `.start`        |
| `SEGMENT_END`       | A segment is closed                         | `SegmentResult.end`                          |
| `PERIOD_END`        | A period is consolidated into final results | `PeriodResult.end`                           |

Unique per `(periodIx, segmentIx, playerId, type)`. The **current** `SEGMENT_END` row doubles as the player's working state during a running segment: player actions mutate its `facts` (see below). Admin report pages and player charts are just queries over this ledger.

## Actions vs. decisions

Two different input channels — do not confuse them:

- **`PlayerAction`** (+ the `Actions` reducer): what players do **while a segment is RUNNING**. Every `performAction` call runs the game's `Actions.apply` reducer inside a serializable transaction, optionally updates the current `SEGMENT_END` result facts, and always appends a `PlayerAction` audit row (`PlayService.ts:performAction`). The demo game uses a single action type whose payload is the bank/bonds/stocks allocation.
- **`PlayerDecision`**: explicit choices captured **outside running segments**, with `type` `PREPARATION` or `CONSOLIDATION` (must match the game's current status; unique per player+period+type; `PlayService.ts:saveDecisions`). They are handed to `PeriodResult.end` as `consolidationDecisions` when a period is finalized. The demo game does not use this channel — it is available for games with explicit planning/closing phases.

## Gamification: XP, levels, achievements

Fully platform-owned (`EventService.ts`); games only provide data and emit events:

- **`PlayerLevel`** — a global level ladder (`index`, `requiredXP`, image), seeded by the game app.
- **`Event`** — a named event type (its `id` is the event key, e.g. `"COMPANY_SETUP_COMPLETED"`).
- **`Achievement`** — attached to an event: `when` (`FIRST`/`EACH`), `scope` (`GAME`/`PERIOD`), `activePeriods`, optional `conditions` (JSON array of `{fact, op, value}` checked against the event's facts; ops `gt|gte|lt|lte|eq|neq`), optional `reward` (e.g. `{ "xp": 100 }`), and role-based names/descriptions.
- **`AchievementInstance`** — an award record per player (+count), unique per achievement+player+period.

Any reducer output can include `events`; the platform matches them to achievements, awards XP, and pushes `ACHIEVEMENT_RECEIVED` notifications; a `LEVEL_UP` notification fires only when the accumulated XP crosses the next `PlayerLevel.requiredXP` threshold. Note: the demo game seeds no `Event`/`Achievement` rows, so this engine is dormant there — working seeds must be written per game.

## Learning content

Attachable to segments at creation time, delivered by the platform without game code:

- **`LearningElement`** — a multiple-choice quiz item (`question`, `options` with `correct` + `feedback`, `motivation`, optional `reward`). Players open them from a sidebar list; `PlayService.ts:attemptLearningElement` scores them and emits solved/incorrect events. Completion tracked on `Player.completedLearningElementIds`.
- **`StoryElement`** — a narrative/markdown popup. `type` `GENERIC` (single `content`) or `ROLE_BASED` (`contentRole` JSON keyed by player role). Unseen story elements attached to the active segment block the player's screen until acknowledged (`markStoryElement`). Tracked on `Player.visitedStoryElementIds`.

Both are M:N with `PeriodSegment` and get selected in the admin's "add segment" dialog. Seed examples: `apps/demo-game/prisma/seed.ts`.
