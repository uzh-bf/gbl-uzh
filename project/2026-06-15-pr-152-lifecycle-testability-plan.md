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
- Adapt `GameService` + `PlayService`. NO new services/machines.

Non-goals
- Prisma transaction hardening (T1-T6) — separate branch.
- Cross-admin ownership scoping — follow-up.
- Behavior change for S1/S2/S3 (pure refactors, identical runtime behavior).

Constraints
- platform package has NO prettier config → match style by hand, do NOT run prettier on it.
- demo-game HAS prettier.
- Tests: `tsx --test 'src/**/*.test.ts'` (node:test).
- Baseline (pre-work): platform tests 11/11 pass, `tsc --noEmit` exit 0.

Vocabulary seeded in `CONTEXT.md`: transition table authority, result descriptor,
ActionDescriptor, EventDescriptor, visibility filter.

## Research

None. Internal refactor backed by the architecture review + direct reads of
`GameService.ts`, `PlayService.ts`, `GameTransitions.ts`, `gameMachine.ts`,
`GameMachineService.ts`, admin `[id].tsx`. Evidence is local code, not external.

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

S4 — collapse the xstate machine (user: Collapse fully)
- Evidence: machine has ZERO runtime callers (only `index.ts` re-export); no
  `@statelyai/inspect` dep; `getGameLifecycleState` reads the table, not the machine.
- Decision: delete `machines/gameMachine.ts` + `machines/gameMachine.test.ts`;
  remove actor helpers (`getGameMachineSnapshot`, `hydrateGameActor`) and the
  `xstate` dep from `packages/platform/package.json` (+ lockfile in same commit);
  fold `getGameLifecycleState` into `GameTransitions`; update `index.ts` re-exports;
  re-express the table-level behavioral coverage (lifecycle walk, segment-0,
  FINISH_GAME-after-final, target-known, available-events) as direct
  `GameTransitions` tests so NO coverage is lost. Optional: tiny script emitting
  a Mermaid diagram from `GAME_TRANSITIONS`.
- Files: delete `machines/gameMachine.ts`, `machines/gameMachine.test.ts`;
  edit `services/GameMachineService.ts` (or remove), `services/GameTransitions.ts`,
  `index.ts`, `package.json`, `machines/README.md`; new `services/GameTransitions.test.ts`;
  lockfile.
- Risk: deleting tests loses coverage → re-author against the table first, verify,
  then delete the machine. Admin `[id].tsx` does not import the machine (safe).
- Check: new table tests green; total test count ≥ prior minus machine-internal;
  `tsc` 0; xstate gone from deps; grep confirms no dangling imports.
- Commit: `refactor(platform): collapse xstate machine; GameTransitions is sole authority`

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
- Active: plan complete. See Next Steps.

## Next Steps
- Re-run host CI on head a9d0955 (the green build/lint were on 66f57e5; SonarCloud
  quality-gate + Vercel preview failing — Vercel looks like preview config, not a
  compile break). Confirm before merge.
- Mark PR ready-for-review (currently draft) once CI re-runs green.
- Follow-ups carried in the PR body + chips: cross-admin ownership scoping
  (task_35b0eb3d), requireAdmin on the 3 setup mutations, previousResults type
  filter, remove dead jest devDeps (task_696c6e51), Prisma tx hardening (T1-T6),
  optional GAME_COMPLETED event, resolver-level auth regression test.
