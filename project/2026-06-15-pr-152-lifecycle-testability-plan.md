# Lifecycle testability — module restructure

Plan identity
- Plan path: `project/2026-06-15-pr-152-lifecycle-testability-plan.md`
- Branch: `claude/jolly-benz-6527e7`  → target `dev`  → PR #152
- History: extends the xstate lifecycle branch (see PR #152). Prior plans:
  `project/2026-06-14-*` (transaction audit/fixes [NOT STARTED], FINISH_GAME, xstate investigation).
- Source: adversarially-verified architecture review (`/improve-codebase-architecture`,
  13 agents). Report archived locally (temp HTML, not committed).

Goal
- Restructure the lifecycle modules so the CRITICAL logic is unit-testable.
- Adapt `GameService` + `PlayService`. No unrelated lifecycle services/machines
  beyond the restored XState machine + service pair.
- Correction 2026-06-17: restore the intended XState architecture. S4 removed
  XState and made `GameTransitions` the authority; user clarified the whole
  purpose of PR #152 was to use XState. Keep S1-S3, supersede S4.

Non-goals
- Prisma transaction hardening (T1-T6) — separate branch.
- Cross-admin ownership scoping — follow-up.
- Behavior change for S1/S2/S3 (pure refactors, identical runtime behavior).

Constraints
- platform package has NO prettier config → match style by hand, do NOT run prettier on it.
- demo-game HAS prettier.
- Tests: `tsx --test 'src/**/*.test.ts'` (node:test).
- Baseline (pre-work): platform tests 11/11 pass, `tsc --noEmit` exit 0.

Vocabulary seeded in `CONTEXT.md`: XState lifecycle authority, result descriptor,
ActionDescriptor, EventDescriptor, visibility filter.

## Research

Original S1-S4: internal refactor backed by the architecture review + direct reads of
`GameService.ts`, `PlayService.ts`, `GameTransitions.ts`, `gameMachine.ts`,
`GameMachineService.ts`, admin `[id].tsx`. Evidence is local code, not external.

Correction research (2026-06-17)
- Local: commit `a9d0955` deleted `gameMachine.ts`, `GameMachineService.ts`,
  XState tests, and the `xstate` dependency. This conflicts with PR #152's core
  purpose.
- Local: pre-collapse commit `a9d0955^` had a valid XState v5 machine, but it
  mirrored `GAME_TRANSITIONS` instead of owning the lifecycle.
- Context7 `/statelyai/xstate`: XState v5 supports typed guards in
  `setup/createMachine`, rebuilding a snapshot with `machine.resolveState`, and
  pure next-state evaluation with `getNextSnapshot`. Use these APIs so service
  code can ask XState for targets without long-lived actors or side effects.

## Slices

S1 — pure result computation (Strong)
- Problem: 4 `compute*` cores take `ctx`, build Prisma promises via `mapAction`
  (+ `receiveEvents` thunks in `computePeriodEndResults`) → uncallable without a DB.
- Decision: cores return plain `{ results, actions: ActionDescriptor[], events?: EventDescriptor[] }`;
  drop `ctx` param; thin call-site mappers (`toPlayerActionCreate`, `toReceiveEventsThunk`)
  build Prisma writes/thunks inside the switch arms. `services` already injected.
- Files: `services/GameService.ts`; new `services/GameService.results.test.ts`.
- Risk: 2 `extras` consumption shapes (array `$transaction([...])` vs `for…await`);
  `computePeriodEndResults` event thunks must carry plain scalars not closures.
  Mitigate: behavior-preserving; cover both shapes; assert via new test + full suite.
- Check: new test green (no Prisma); `tsc` 0; existing 11 still pass.
- Commit: `refactor(platform): make game result computation pure and unit-testable`

S2 — pure visibility filter (Strong)
- Problem: `getPlayerResult` mutates the Prisma object in place (PlayService.ts:370-408)
  + picks result type via `-1` sentinel inline → untested, silent.
- Decision: pure `filterVisiblePeriods(periods, activePeriod, activePeriodIx, activeSegmentIx)
  → { filteredPeriods, filteredActiveSegments, resultType }`; delete the mutation.
- Files: `services/PlayService.ts`; new `services/PlayService.visibility.test.ts`.
- Check: new test green; `tsc` 0; suite green.
- Commit: `refactor(platform): extract pure player-visibility filter`

S3 — injectable notifier (Worth exploring; enabler)
- Problem: post-commit publish does a 2nd Prisma query + reaches the pubsub singleton;
  no seam → side-effects can't be suppressed in a unit test.
- Decision: optional `publish` in the options bag of `activateNextPeriod` /
  `activateNextSegment` / `finishGame`, default closes over `ctx`. Scope to these 3
  only (not `performAction` — different shape).
- Files: `services/GameService.ts` (+ optional test asserting spy is called).
- Check: `tsc` 0; suite green; behavior identical with default.
- Commit: `refactor(platform): make lifecycle realtime publish injectable`

S4 — collapse the xstate machine (SUPERSEDED; do not implement)
- Historical note: commit `a9d0955` implemented this wrong direction. It deleted
  XState, made `GameTransitions` the authority, and conflicts with the user
  clarification that PR #152's purpose is to model lifecycle with XState.
- Corrective work below keeps S1-S3 and replaces S4 with C0-C4.

## Corrective slices (2026-06-17)

C0 — corrected plan + vocabulary (Strong)
- Problem: plan/CONTEXT still encode the bad S4 decision.
- Decision: record user clarification; change vocabulary to XState lifecycle
  authority; keep historical S4 notes but mark superseded.
- Files: `CONTEXT.md`, this plan.
- Check: `git diff --check`; status contains only docs.
- Commit: `docs(project): correct lifecycle xstate plan`

C1 — restore XState package + machine shell (Strong)
- Problem: `xstate` dependency and machine files are gone.
- Decision: restore `xstate@5.20.1` exactly, restore the machine/service file
  paths, and keep DB row as persisted state (`game.status` + derived context).
  No DB snapshot column. No `pnpm install`; restore lockfile blocks by exact
  text from pre-collapse. Tests are C3.
- Files:
  - `packages/platform/package.json`
  - `pnpm-lock.yaml`
  - `packages/platform/src/machines/gameMachine.ts`
  - `packages/platform/src/services/GameMachineService.ts`
- Check: `rg "xstate|gameMachine|GameMachineService"`; `tsc --noEmit`.
- Commit: `refactor(platform): restore xstate lifecycle machine`

C2 — make XState the sole lifecycle authority (Strong)
- Problem: restored machine must not mirror a parallel transition table.
- Decision: move lifecycle decisions into `gameMachine`; make
  `GameMachineService` the adapter:
  - `buildGameMachineContext(game)`
  - `getGameMachineSnapshot(game)`
  - `canTransition(game, event)`
  - `nextStatus(game, event)` using `getNextSnapshot`
  - `availableEvents(game)`
  - `getGameLifecycleState(game)`
- Decision: remove `GameTransitions.ts` or replace it with no-op compatibility
  only if imports require it. Prefer no compatibility export in this branch.
- Decision: update `GameService.resolveTargetStatus` to call
  `GameMachineService.nextStatus`; keep the existing switch arms only for
  transition side effects and DB writes.
- Decision: update `assertMachineTarget` wording to compare committed DB status
  with XState target.
- Files:
  - `packages/platform/src/services/GameService.ts`
  - `packages/platform/src/services/GameMachineService.ts`
  - `packages/platform/src/services/GameTransitions.ts` (delete or empty-shim)
  - `packages/platform/src/index.ts`
- Check: `rg "GameTransitions|transition table|table target"` returns no live
  authority references; `tsc --noEmit`.
- Commit: `refactor(platform): drive lifecycle transitions from xstate`

C3 — restore behavior coverage around XState (Strong)
- Problem: S4 moved machine coverage to table tests; need coverage around the
  actual authority.
- Decision: machine tests cover:
  - state nodes exactly equal `DB.GameStatus`
  - happy-path lifecycle walk
  - guard blocks for missing segments/next segment/active segment
  - segment index 0 consolidation regression
  - `FINISH_GAME` only after final period
  - `COMPLETED` final/terminal
  - persisted row -> XState snapshot rebuild
- Decision: service tests cover:
  - snapshot value equals `game.status`
  - `nextStatus` returns target/null from XState
  - `availableEvents` and admin booleans
- Files:
  - `packages/platform/src/machines/gameMachine.test.ts`
  - `packages/platform/src/services/GameMachineService.test.ts`
  - delete/replace `packages/platform/src/services/GameTransitions.test.ts`
- Check: `node_modules/.bin/tsx --test 'src/**/*.test.ts'`; `tsc --noEmit`.
- Commit: `test(platform): cover xstate lifecycle authority`

C4 — diagram/docs/PR finish (Medium)
- Problem: generated diagram script currently reads `GAME_TRANSITIONS`; comments
  in admin/docs may still reference table authority.
- Decision: either make `lifecycle-diagram.ts` read `gameMachine.config.states`
  or delete the script if the machine itself is enough. If deleted, remove the
  `lifecycle:diagram` package script too. Prefer keeping it only if small and
  clear.
- Decision: update stale admin comments, `CONTEXT.md`, plan Progress, and PR
  body so reviewers see "XState authority" consistently.
- Decision: run final security review again after code changes.
- Files:
  - `packages/platform/scripts/lifecycle-diagram.ts`
  - `packages/platform/package.json` (only if script changes)
  - `apps/demo-game/src/pages/admin/games/[id].tsx`
  - `CONTEXT.md`
  - this plan
- Check: `rg "GameTransitions|transition table|xstate gone|machine deleted"`;
  full platform checks; PR readback.
- Commit: `docs(platform): align lifecycle docs with xstate`

## Finish gate
- Mandatory final security review subagent ($security-review) over the branch scope.
- Update PR #152 body via `$df-mr-description-writer` (whole branch vs dev).
- `Next Steps` section.

## Progress
- [x] Baseline captured: tests 11/11, tsc 0.
- [x] CONTEXT.md + plan written (commit separately: docs first, plan second).
- [x] S1 pure result computation. 4 cores pure (drop ctx, return descriptors);
      call sites build extras via toPlayerActionCreate + promises via
      toReceiveEventsThunk. New GameService.results.test.ts (8 tests, no Prisma).
      Reviewed (behavior-preserving across all 6 arms, no Critical) +
      simplified (dropped unused .map/.reduce params). Verify: tsc 0, tests 19/19.
- [x] S2 pure visibility filter. filterVisiblePeriods extracted (generic over
      row types so rich Prisma rows pass through); getPlayerResult consumes it +
      resultType; in-place filter logic gone. New PlayService.visibility.test.ts
      (6 tests). Reviewed (behavior-preserving, any[]→generics) + simplified.
      Verify: tsc 0, tests 25/25.
- [x] S3 injectable notifier. GamePublisher type + defaultGamePublisher(ctx,
      requireActivePeriod) factory; optional publish in the options bag of all 3
      lifecycle fns (default preserves each block's guard). assertMachineTarget
      now reads the committed tx result (handles array- vs callback-form). New
      GameService.finishGame.test.ts proves the seam (spy + fake prisma, no DB).
      Reviewed (both subagents caught + fixed the array-form actual=undefined
      shadow-check regression) + simplified. Verify: tsc 0, tests 27/27.
- [x] S4 collapse machine. GameTransitions table is sole authority. Deleted
      gameMachine.ts/.test.ts, GameMachineService.ts/.test.ts, machines/README.md.
      Folded getGameLifecycleState (+ GameRowForLifecycle, GameLifecycleState)
      into GameTransitions.ts. Removed GameMachineService re-export from index.ts;
      removed xstate dep from package.json + 3 blocks from pnpm-lock.yaml (surgical,
      8 deletions). Added scripts/lifecycle-diagram.ts (Mermaid from GAME_TRANSITIONS)
      + lifecycle:diagram script. New GameTransitions.test.ts (8 tests). GameService.ts
      doc/log wording only ([xstate]->[lifecycle-shadow]; XSTATE_SHADOW env kept).
      Reviewed + simplified: rejected canFinishGame (no caller, not in old shape),
      the canActivate* removal (preserved contract), and a vacuous property-test port
      (canTransition === nextStatus!==null is its own defn); accepted dedupe of the
      triple ctx-eval in getGameLifecycleState (derive canActivate* from availableEvents)
      + CONTEXT.md path note. Deferred dead jest devDeps (out of scope, chipped).
      Verify: tsc 0, tests 24/24 (count drops from 27: removed machine/service tests,
      added 8 table tests).
- [x] Final security review. Whole-branch pass weighted on the refactor.
      DONE_WITH_CONCERNS, merge-ready for branch scope, no new findings.
      Verified: requireAdmin on all 3 lifecycle mutations; OCC predicate on every
      arm; visibility filter faithful (no over-exposure; player/game from ctx.user);
      playerId from DB rows not caller input; shadow check logging-only; no secrets.
      Deferred (pre-existing, tracked): cross-admin ownership isolation (Important,
      chipped task_35b0eb3d); createGame/addGamePeriod/addPeriodSegment lack
      requireAdmin (Minor); previousResults no type filter (Minor).
- [x] PR #152 body update. $df-mr-description-writer; whole branch vs origin/dev
      (24 files +3358/-355, 26 commits, head a9d0955). Corrected stale phase-1
      claims (no net xstate dep; machine/GameMachineService deleted; single export).
      Read back: base dev, draft, OPEN.
- [x] Takeover check 2026-06-17. Handoff reviewed; correct worktree
      `.claude/worktrees/jolly-benz-6527e7`; branch clean at 10690e4; local
      tsc 0; platform tests 24/24; PR still draft, Vercel failing only.
- [x] C0 corrected plan + glossary. Review subagent found current/target
      contradiction in CONTEXT, stale "no new machines" wording, actionable
      superseded S4 text, C1/C3 test ownership mismatch, C4 package script gap.
      Simplification subagent found same core issues plus persisted snapshot
      wording. Fixed all. Verify: `git diff --check` 0; docs-only diff.
- [x] C1 restored XState dependency + machine/service shell. Added
      `xstate@5.20.1` to package + lockfile by exact blocks; restored
      `machines/gameMachine.ts` and minimal `GameMachineService` snapshot
      bridge. Review: lockfile/package exact, no behavior drift; simplification:
      dropped unused legacy admin adapter, actor helper, exported default
      context, stale C1/C2 comments, and `AnyStateMachine` cast. Verify:
      `node_modules/.bin/tsc --noEmit -p tsconfig.json` 0; `git diff --check` 0.
- [x] C2 made XState the sole lifecycle authority. Moved lifecycle event/context
      types + `GAME_EVENTS` into `gameMachine`; `GameMachineService` now owns
      `buildGameMachineContext`, snapshot rebuild, `canTransition`,
      `nextStatus` via XState `getNextSnapshot`, `availableEvents`, and
      `getGameLifecycleState`. `GameService` now calls `GameMachineService`,
      `GameTransitions.ts` + table tests deleted, index export restored to
      `GameMachineService`, and live refs cleared. Diagram script + admin
      comment were updated in C2 (not C4) because `GameTransitions` deletion
      would otherwise break typecheck / leave live stale refs. Review: no
      critical/important issues; simplification accepted narrower public API
      (no raw `gameMachine` export), clearer input type/comment, no wrapper
      helper, one snapshot for `availableEvents`. Verify:
      `node_modules/.bin/tsc --noEmit -p tsconfig.json` 0;
      `node_modules/.bin/tsx --test 'src/**/*.test.ts'` 16/16;
      `rg "GameTransitions|transition table|table target|GAME_TRANSITIONS|xstate gone|machine deleted"`
      over live app/platform code no matches; `git diff --check` 0.
- [x] C3 restored behavior coverage around XState. Added
      `machines/gameMachine.test.ts` and `services/GameMachineService.test.ts`
      for machine state keys, happy path, guard blocks, active-period-0
      consolidation, intermediate RESULTS -> PREPARATION target,
      final RESULTS -> COMPLETED, COMPLETED terminal state, context derivation
      including `segmentCount` fallback, snapshot rebuild, `nextStatus`,
      `availableEvents`, and admin booleans including segment activation.
      Review/simplification caught missing non-final RESULTS target,
      CONSOLIDATION active-segment guard, inaccurate "first segment" wording,
      missing segmentCount fallback, and missing segment button boolean. Fixed.
      Verify: `node_modules/.bin/tsc --noEmit -p tsconfig.json` 0;
      `node_modules/.bin/tsx --test 'src/**/*.test.ts'` 28/28;
      `git diff --check` 0.
- [x] C4 local docs/security finish. `CONTEXT.md` now states current XState
      authority without corrective-target caveat. Diagram script was already
      moved to `gameMachine.config.states` in C2; verified output includes
      SCHEDULED -> PREPARATION -> RUNNING/PAUSED -> CONSOLIDATION -> RESULTS
      -> PREPARATION/COMPLETED and final COMPLETED. Final security review:
      DONE_WITH_CONCERNS, no new high-confidence exploitable finding introduced;
      residual cross-admin ownership isolation, Prisma tx hardening, and global
      event subscription remain pre-existing/tracked. Verify:
      `node_modules/.bin/tsc --noEmit -p tsconfig.json` 0;
      `node_modules/.bin/tsx --test 'src/**/*.test.ts'` 28/28;
      `node_modules/.bin/tsx scripts/lifecycle-diagram.ts` 0;
      live-code stale-ref grep 0; `git diff --check` 0.

## Next Steps
- Finish corrective slices C0-C4.
- Push local commits when approved. Then update PR #152 body using
  `$df-mr-description-writer` so it reflects whole branch vs `dev`, including the
  C0-C4 correction. Do not mark PR ready until pushed checks pass and PR
  body/title reflect the whole branch.
- Keep deferred follow-ups unchanged: cross-admin ownership scoping
  (`task_35b0eb3d`), requireAdmin on the 3 setup mutations, previousResults type
  filter, remove dead jest devDeps (`task_696c6e51`), Prisma tx hardening
  (T1-T6), optional GAME_COMPLETED event, resolver-level auth regression test.
