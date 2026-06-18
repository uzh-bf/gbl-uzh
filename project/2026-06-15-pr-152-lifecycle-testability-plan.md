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
  pure next-state evaluation. Use these APIs so service code can ask XState for
  targets without long-lived actors or side effects. Later C5 cleanup uses
  installed `xstate@5.20.1`'s non-deprecated `transition(...)` helper.

Side-effect research addendum (2026-06-17)
- Context7 re-check attempted for XState; quota exceeded. Fallback: official
  Stately docs.
- Evidence: Stately pure transition docs say `transition(machine, state, event)`
  returns `[nextState, actions]` without creating a live actor or executing side
  effects. Good fit for backend request handlers.
  Source: https://stately.ai/docs/pure-transitions
- Evidence: Stately action docs recommend named action objects with `type` and
  `params`; inline actions are mainly for prototypes/simple cases. In this PR,
  action objects should be plain "work orders", not implementations.
  Source: https://stately.ai/docs/actions
- Evidence: Stately invoke docs position invoked actors for async work managed
  by a live actor. That is useful for long-running actor workflows, but not the
  best fit for Prisma request transactions where DB write order, rollback
  behavior, and post-commit effects must stay explicit in `GameService`.
  Source: https://stately.ai/docs/invoke
- Decision: use XState as a pure rule checker + work-order emitter. Do not put
  Prisma, EventService, pubsub, async actors, or reducer/service calls inside
  the machine.

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
  - `nextStatus(game, event)` using XState pure transition evaluation
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

C5 — XState insights + simplification (Medium)
- Problem: XState now enforces transition validity, but insight APIs are still
  limited to available events and admin booleans. `getGameLifecycleState`
  duplicates part of the snapshot/event derivation.
- Decision: use typed XState tags + state metadata for durable insights:
  phase labels, player-facing tags, terminal tag, and next-status map for each
  currently valid event. Keep Prisma writes/side-effects outside XState actions.
- Files:
  - `packages/platform/src/machines/gameMachine.ts`
  - `packages/platform/src/services/GameMachineService.ts`
  - `packages/platform/src/machines/gameMachine.test.ts`
  - `packages/platform/src/services/GameMachineService.test.ts`
  - `CONTEXT.md`
- Check: platform `tsc`, full `tsx --test`, stale-ref grep.
- Commit: `refactor(platform): expose xstate lifecycle insights`

C6 — pure lifecycle work orders (Planned; Strong)

Plain-language target
- Machine = permission checker. It answers: "Can this admin action happen from
  this game row?" and "what status comes next?"
- Work order = plain object. It says "create segment-start results" or
  "publish period activated". It does not do the work.
- Calculators = pure result functions and reducer services. They compute facts,
  result rows, action descriptors, and event descriptors. No `ctx`, no Prisma,
  no pubsub, no logging side-effect requirement.
- Executor = `GameService`. It reads the work orders, runs calculators, writes
  Prisma inside explicit transactions, and publishes only after commit.
- Rule: XState triggers side effects by returning work orders. It never executes
  side effects.

Readable code rules
- Public service names should avoid state-machine jargon where possible:
  prefer `planLifecycleTransition`, `workOrders`, `allowedEvents`, `nextStatus`.
- Keep raw XState snapshot/microstep helpers private unless tests need them.
- Comments should explain lifecycle behavior in game/admin terms first. Mention
  XState only where maintainers need to know which library provides the rule
  check.
- Work-order names should be domain verbs, not library terms:
  `startNextPeriod`, `finishCurrentSegment`, `createPeriodEndResults`,
  `resetPlayerReadiness`, `publishAfterActivateNextPeriod`.

Draft transition work orders

| From + event | To | Work orders |
| --- | --- | --- |
| `SCHEDULED` + `ACTIVATE_NEXT_PERIOD` | `PREPARATION` | `startNextPeriod`, `createPeriodStartResults`, `createPlayerActions`, `publishAfterActivateNextPeriod` |
| `PREPARATION` + `ACTIVATE_NEXT_SEGMENT` | `RUNNING` | `startNextSegment`, `createSegmentStartResults`, `createPlayerActions`, `resetPlayerReadiness`, `publishAfterActivateNextSegment` |
| `PAUSED` + `ACTIVATE_NEXT_SEGMENT` | `RUNNING` | `startNextSegment`, `createSegmentStartResults`, `createPlayerActions`, `resetPlayerReadiness`, `publishAfterActivateNextSegment` |
| `RUNNING` + `ACTIVATE_NEXT_SEGMENT` | `PAUSED` | `finishCurrentSegment`, `createSegmentEndResults`, `createPlayerActions`, `resetPlayerReadiness`, `publishAfterActivateNextSegment` |
| `RUNNING` + `ACTIVATE_NEXT_PERIOD` | `CONSOLIDATION` | `runSegmentBeforeActivationHook`, `finishCurrentSegment`, `consolidateCurrentPeriod`, `createSegmentEndResults`, `createPlayerActions`, `resetPlayerReadiness`, `publishAfterActivateNextPeriod` |
| `CONSOLIDATION` + `ACTIVATE_NEXT_PERIOD` | `RESULTS` | `createPeriodEndResults`, `createPlayerActions`, `createPostCommitPlayerEvents`, `resetPlayerReadiness`, `publishAfterActivateNextPeriod` |
| `RESULTS` + `ACTIVATE_NEXT_PERIOD` | `PREPARATION` | `createPeriodStartResults`, `createPlayerActions`, `resetPlayerReadiness`, `publishAfterActivateNextPeriod` |
| `RESULTS` + `FINISH_GAME` | `COMPLETED` | `finishGame`, `publishAfterFinishGame` |

Notes on table
- Work-order names are contracts, not final function names.
- `createPlayerActions` and `createPostCommitPlayerEvents` consume descriptors
  returned by pure calculators. They are executor work, not machine work.
- Existing behavior publishes `PERIOD_ACTIVATED` after every successful
  `activateNextPeriod` call, even for non-activation target statuses. Work-order
  names use the admin action (`publishAfterActivateNextPeriod`) so the machine
  does not overstate product semantics.
- Post-commit event thunks stay post-commit. Failing achievement/experience
  events must not roll back an already-committed lifecycle transition.

C6A — machine emits work orders, no DB dependency (Strong)
- Problem: current machine gives valid next status and insights, but side-effect
  expectations still live only in the `GameService` switch. Future drift is
  possible.
- Decision: define local status literals in `gameMachine.ts` and remove
  `@prisma/client` import from the machine. Adapter tests keep proving literals
  exactly match `DB.GameStatus`.
- Decision: add typed action/work-order descriptors to XState transitions.
  Use action objects with `type`/small params only. No action implementations,
  no `invoke`, no actors, no async.
- Files:
  - `packages/platform/src/machines/gameMachine.ts`
  - `packages/platform/src/machines/gameMachine.test.ts`
  - `packages/platform/src/services/GameMachineService.test.ts`
- Check:
  - machine tests assert each transition returns expected work-order sequence
    from pure `transition(...)`.
  - grep proves machine has no Prisma client, EventService, pubsub, `invoke`,
    `fromPromise`, `createActor`, or `ctx.prisma`.
  - `tsc`; full platform tests.
- Commit: `refactor(platform): emit lifecycle work orders from xstate`

C6B — adapter returns a plain transition plan (Strong)
- Problem: `GameService` currently asks only for `nextStatus`, so the lifecycle
  rule check and side-effect contract are separate.
- Decision: add `planLifecycleTransition(game, event)`.
  Return null when not allowed. Return this shape when allowed:
  `fromStatus`, `event`, `targetStatus`, `workOrders`, `insights`.
- Decision: keep `nextStatus` as a small wrapper if external callers/tests still
  need it. Prefer the plan API in new lifecycle code.
- Decision: make machine-specific helpers internal where feasible:
  `getGameMachineSnapshot` and raw context builders should not be the primary
  public surface.
- Files:
  - `packages/platform/src/services/GameMachineService.ts`
  - `packages/platform/src/services/GameMachineService.test.ts`
  - maybe `packages/platform/src/index.ts` only if public exports change.
- Check:
  - invalid transition returns null.
  - valid transition returns target + work orders.
  - insights still match C5 behavior.
  - `tsc`; full platform tests.
- Commit: `refactor(platform): expose plain lifecycle transition plans`

C6C — execute plans through explicit handlers (Medium)
- Problem: `activateNextPeriod` / `activateNextSegment` still use large status
  switches. They work, but the side-effect paths are not mechanically tied to
  machine transitions.
- Decision: extract existing switch arms into named handlers keyed by
  `fromStatus + event + targetStatus`. Keep each handler close to current code;
  do not redesign transaction internals in the same slice.
- Decision: add `executeLifecycleTransitionPlan(plan, deps)` as a thin router.
  It selects the handler, passes `targetStatus`, and returns the committed game
  row/result needed by existing API behavior.
- Decision: handler names should read like game operations:
  `scheduledToPreparation`, `preparationToRunning`, `runningToPaused`,
  `runningToConsolidation`, `consolidationToResults`,
  `resultsToPreparation`, `resultsToCompleted`.
- Decision: executor may inspect work-order types for coverage/assertions, but
  Prisma writes stay in the named handlers for this first readable version.
- Files:
  - `packages/platform/src/services/GameService.ts`
  - maybe new `packages/platform/src/services/GameLifecycleExecutor.ts` only if
    `GameService.ts` becomes harder to read. Prefer no new file unless needed.
- Check:
  - behavior tests from S1-S3 still green.
  - no behavior change for returned values or notification timing.
  - `tsc`; full platform tests.
- Commit: `refactor(platform): execute lifecycle transitions from plans`

C6D — enforce completeness and purity (Strong)
- Problem: work orders only help if drift fails tests.
- Decision: add tests that enumerate all allowed representative transitions and
  assert:
  - every transition has at least one work order.
  - every work-order type has executor coverage.
  - every executor handler is referenced by exactly one transition key, unless
    deliberately shared.
  - `GameService` uses `planLifecycleTransition`, not direct status tables.
- Decision: add purity guard tests:
  - machine file must not import Prisma client, EventService, logger, or XState
    actor/invoke helpers.
  - compute result tests prove calculators do not accept `ctx` and do not call
    DB hook services (`updateDBBeforeActivation`, `updateDBAfterEnd`,
    `updateDBAfterInitialize`).
- Files:
  - `packages/platform/src/machines/gameMachine.test.ts`
  - `packages/platform/src/services/GameMachineService.test.ts`
  - `packages/platform/src/services/GameService.results.test.ts`
  - maybe new `packages/platform/src/services/GameLifecycleExecutor.test.ts`.
- Check:
  - targeted tests first.
  - `node_modules/.bin/tsx --test 'src/**/*.test.ts'`.
  - `node_modules/.bin/tsc --noEmit -p tsconfig.json`.
- Commit: `test(platform): enforce lifecycle plan coverage`

C6E — docs, final review, PR update (Medium)
- Problem: once C6 lands, docs and PR text must explain the simple mental model,
  not state-machine internals.
- Decision: update `CONTEXT.md` with:
  "machine decides; work orders describe; calculators compute; executor writes".
- Decision: update this plan `Progress` after each C6 slice.
- Decision: run mandatory final security review after code changes.
- Decision: update PR #152 body via `$df-mr-description-writer` after push
  approval, covering whole branch vs `dev`.
- Files:
  - `CONTEXT.md`
  - this plan
  - PR body only after local branch is pushed/approved.
- Check:
  - stale-jargon grep for misleading "actions execute in machine" wording.
  - full platform checks.
  - final security review.
- Commit: `docs(project): document lifecycle work-order model`

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
      `nextStatus` via XState pure transition evaluation, `availableEvents`, and
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
- [x] C5 XState insight/simplification. Added typed XState tags + state meta
      (`GameLifecyclePhase`, `GameTag`, `GameStateMeta`) and
      `getGameLifecycleInsights` with tags, phase metadata, valid next statuses,
      terminal flag, available events, and existing admin booleans. Simplified
      `getGameLifecycleState` into a projection of the insight object. Avoided
      putting Prisma writes or domain side-effects into XState actions; they
      remain in `GameService` transactions. Replaced deprecated
      `getNextSnapshot` usage with installed `xstate@5.20.1`'s
      `transition(...)`. Review conclusion: current machine uses the right core
      XState capabilities for this PR (guards, pure transition eval,
      tags/meta/terminal snapshots); deeper candidates should be follow-ups:
      server-sourced admin controls via GraphQL, transition-handler coverage
      registry for GameService side-effects, optional player-view state machine
      for result visibility, and optional Stately/graph tooling. Verify:
      `node_modules/.bin/tsc --noEmit -p tsconfig.json` 0;
      `node_modules/.bin/tsx --test 'src/**/*.test.ts'` 30/30;
      `node_modules/.bin/tsx scripts/lifecycle-diagram.ts` 0;
      `rg getNextSnapshot` no code refs; `git diff --check` 0.
- [x] C6 planning only. User clarified Prisma and reducer services must stay
      pure/outside XState; XState should trigger side effects by returning
      plain work orders. Context7 re-check attempted but quota exceeded; plan
      grounded in official Stately docs for pure `transition(...)`, action
      objects, and invoked actor tradeoffs. Added C6A-C6E detailed slices.
      No code changes yet.
- [x] C6A complete. `gameMachine.ts` now owns local persisted-status literals
      (adapter tests prove exact `DB.GameStatus` parity), emits typed
      side-effect-free lifecycle work orders from pure `transition(...)`, and
      has no Prisma/EventService/actor wiring. Review found misleading
      publish-work-order names and duplicate type/list source; fixed with
      neutral `publishAfter...` names and const-derived type. Simplification
      found brittle/noisy tests; fixed with narrower no-Prisma-import check,
      table-driven work-order cases, and blocked-transition empty-order checks.
      Verify: `node_modules/.bin/tsc --noEmit -p tsconfig.json` 0;
      `node_modules/.bin/tsx --test 'src/**/*.test.ts'` 33/33;
      `node_modules/.bin/tsx scripts/lifecycle-diagram.ts` 0;
      forbidden machine grep 0; `git diff --check` 0.
- [x] C6B complete. Added `planLifecycleTransition(game, event)` returning null
      when blocked or `{ fromStatus, event, targetStatus, workOrders,
      insights }` when allowed. `nextStatus` is now a wrapper over the plan for
      compatibility until C6C moves `GameService`. Review found no correctness
      issues; simplification found the plan test over-specified insight details,
      so it now asserts only the plan contract plus a small insight smoke check.
      Verify: `node_modules/.bin/tsc --noEmit -p tsconfig.json` 0;
      `node_modules/.bin/tsx --test 'src/**/*.test.ts'` 34/34;
      `git diff --check` 0.
- [x] C6C complete. `GameService` lifecycle calls now resolve full transition
      plans and route side-effect branches by `from:event:to` key, while
      transaction internals stay unchanged. Review found no correctness issue;
      route-key coverage test remains for C6D. Simplification found duplicate
      key computation; fixed by computing `transitionKey` once per lifecycle fn.
      Verify: `node_modules/.bin/tsc --noEmit -p tsconfig.json` 0;
      `node_modules/.bin/tsx --test 'src/**/*.test.ts'` 34/34;
      `git diff --check` 0; `rg 'nextStatus\(|resolveTargetStatus'`
      shows no `GameService` usage.
- [x] C6D complete. Added lifecycle coverage tests that generate allowed
      machine plans from statuses/events and assert `GameService` route keys
      cover them, work orders have executor coverage, and routing uses
      `planLifecycleTransition` instead of target-only lookup. Added runtime
      work-order coverage assertion in `resolveTransitionPlan`. Removed the last
      logging side effect from pure result computation and added a purity smoke
      test for compute functions. Review found first coverage draft mirrored
      constants instead of routes; fixed by generating plans and checking actual
      route constant usage. Verify: `node_modules/.bin/tsc --noEmit -p
      tsconfig.json` 0; `node_modules/.bin/tsx --test 'src/**/*.test.ts'`
      38/38; `git diff --check` 0.

## Next Steps
- Continue with C6E. Work one slice at a time: implement, verify, review
  subagent, simplification subagent, commit.
- Push local commits only when approved. Then update PR #152 body using
  `$df-mr-description-writer` so it reflects whole branch vs `dev`, including C0-C6.
  Do not mark PR ready until pushed checks pass and PR body/title reflect the
  whole branch.
- Follow-up design options from C5/C6: expose lifecycle insights in GraphQL so
  demo admin controls stop duplicating guard logic; consider a separate
  player-view state machine for visibility/result-state rules if UI drift
  continues; consider Stately/graph tooling only after work-order coverage is
  stable.
- Keep deferred follow-ups unchanged: cross-admin ownership scoping
  (`task_35b0eb3d`), requireAdmin on the 3 setup mutations, previousResults type
  filter, remove dead jest devDeps (`task_696c6e51`), Prisma tx hardening
  (T1-T6), optional GAME_COMPLETED event, resolver-level auth regression test.
