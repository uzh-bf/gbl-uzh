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
- [ ] S3 injectable notifier
- [ ] S4 collapse machine
- [ ] Final security review
- [ ] PR #152 body update
- Active: S2 committed, starting S3.
