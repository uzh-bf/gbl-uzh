# WP2: Platform Procedures and DTOs

Status: foundation, parallelizable with `WP3` after `WP1`.

Depends on: `WP1`.

Unblocks: `WP4`.

## Goal

Create platform tRPC router factories that cover the current GraphQL operation surface and return intentional DTOs. The existing services remain the behavior source.

## Graphify Sanity Check

Graphify ranks `GameService.ts` and `PlayService.ts` as the largest architecture hubs, and `Mutation.ts`/`Query.ts` as bridge files. That confirms this package should wrap `GameService`, `PlayService`, `AccountService`, and read-only Prisma access in routers rather than reimplementing business logic.

## Write Scope

Allowed:

- `packages/platform/src/trpc/createPlatformRouter.ts`
- `packages/platform/src/trpc/routers/**`
- `packages/platform/src/trpc/dto/**`
- `packages/platform/src/trpc/schemas.ts`
- Small additions to `packages/platform/src/services/**` only if a DTO cannot be built safely otherwise.

Avoid:

- Demo-game client files.
- GraphQL resolver files.
- Realtime event bus work owned by `WP3`, except importing `eventsRouter` if it already exists.

## Inputs to Inspect

- `packages/platform/src/types/Query.ts`
- `packages/platform/src/types/Mutation.ts`
- `packages/platform/src/services/GameService.ts`
- `packages/platform/src/services/PlayService.ts`
- `packages/platform/src/services/AccountService.ts`
- `packages/platform/src/services/EventService.ts`
- `packages/platform/public/ops/*.graphql`
- `apps/demo-game/src/graphql/generated/ops.ts` for current output shapes.

## Router Structure

Create:

```text
packages/platform/src/trpc/
  createPlatformRouter.ts
  dto/
    game.ts
    learning.ts
    player.ts
    results.ts
  routers/
    auth.ts
    game.ts
    period.ts
    segment.ts
    play.ts
    learning.ts
    story.ts
    results.ts
```

If `WP3` has already created `events.ts`, compose it in `createPlatformRouter.ts`. If not, leave a clear integration point.

## Procedure Checklist

Auth:

- [ ] `auth.loginAsTeam`
- [ ] `auth.logoutAsTeam`

Game:

- [ ] `game.list`
- [ ] `game.byId`
- [ ] `game.create`
- [ ] `game.activateNextPeriod`
- [ ] `game.activateNextSegment`
- [ ] `game.addCountdown`
- [ ] `game.toggleSwitch`

Period and segment:

- [ ] `period.add`
- [ ] `segment.add`

Play:

- [ ] `play.self`
- [ ] `play.result`
- [ ] `play.updateReadyState`
- [ ] `play.performAction`
- [ ] `play.saveConsolidationDecision`

Learning and story:

- [ ] `learning.list`
- [ ] `learning.byId`
- [ ] `learning.attempt`
- [ ] `learning.questAchievements`
- [ ] `story.list`
- [ ] `story.markVisited`

Results:

- [ ] `results.listForCurrentGame`
- [ ] `results.specific`
- [ ] `results.pastForPlayer`

## DTO Plan

Add DTO helpers before wiring clients.

Required DTOs:

- `GameListItemDto`
- `AdminGameDto`
- `PlayerSelfDto`
- `PlayerResultDto`
- `LearningElementStateDto`
- `SpecificResultDto`

Rules:

- Do not return player tokens except from admin-only game detail DTOs.
- Preserve fields currently read by demo-game pages.
- Preserve enum string values.
- Keep `Date` values as `Date` and let `superjson` transport them.
- Avoid broad Prisma includes if a screen needs only a few nested fields.

## Implementation Plan

1. Translate GraphQL operations into service calls.

   Use the operation map in `project/trpc-migration-plan.md` as the source of truth.

2. Define input schemas.

   Examples:

   - `game.byId`: `{ id: number }`
   - `game.create`: `{ name: string; playerCount: number; facts: unknown }`
   - `period.add`: `{ gameId: number; facts: unknown; segmentCount: number }`
   - `segment.add`: `{ gameId; periodIx; facts; storyElements?; learningElements? }`
   - `play.performAction`: `{ type: string; payload: unknown }`
   - `learning.attempt`: `{ elementId: string; selection: number[] | string }`
   - `results.specific`: `{ gameId: number; type: PlayerResultType }`

3. Preserve Yup validation where services already expect it.

   The router factory should accept game-specific schemas:

   - `GameFactsSchema`
   - `PeriodFactsSchema`
   - `PeriodSegmentFactsSchema`
   - `PlayerFactsSchema`

4. Handle JSON string compatibility pragmatically.

   Existing GraphQL mutations pass some payloads as JSON strings. For tRPC, prefer object/array inputs only when the matching client package can migrate at the same time. Otherwise stringify inside the procedure before calling the existing service.

5. Add role protection.

   Suggested:

   - Admin: game creation, game activation, period/segment setup, countdown, reports.
   - Player: self, result, update player data, ready state, perform action, learning attempt, story mark.
   - Protected but role-flexible only where current behavior truly allows both.

6. Use service wrappers.

   Examples:

   - `game.list` -> `GameService.getGames`.
   - `game.byId` -> `GameService.getGame`.
   - `play.result` -> combine `PlayService.getPlayerResult`, `PlayService.getPlayerData`, and `PlayService.getPlayerDecision` to match `ResultDocument`.
   - `auth.loginAsTeam` -> `AccountService.loginAsTeam`.

7. Add `createPlatformRouter`.

   Factory input should include:

   - `services`
   - `schemas`
   - optional `roleAssigner`
   - optional router extensions if needed later.

8. Build.

   ```bash
   pnpm --filter @gbl-uzh/platform build
   ```

## Acceptance Criteria

- Every active GraphQL operation used by demo-game has a tRPC equivalent.
- Procedure inputs are validated.
- DTOs avoid accidental token exposure.
- Platform builds.
- No demo-game page has been migrated in this package.

## Handoff Notes

Report:

- Procedure names implemented.
- DTO fields intentionally included/excluded.
- Any operation that was not mapped and why.
- Any client migration implications, especially changed input shapes.

## Agent Prompt

```text
You own WP2 for the tRPC migration. Build platform tRPC router factories and DTO helpers over the existing services. Preserve existing GraphQL files and service behavior. Cover the operation map in project/trpc-migration-plan.md and report any operation you cannot map cleanly.
```
