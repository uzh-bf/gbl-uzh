# Plan — Prisma transaction hardening

Date: 2026-06-14. Status: NOT STARTED (for later).
Source of findings: [2026-06-14-prisma-transaction-audit.md](2026-06-14-prisma-transaction-audit.md) (38 confirmed, 15 refuted).
Stack: `@prisma/client` ^6.14, PostgreSQL, nexus platform pkg + Next.js demo-game.

## Goal

Bring all `$transaction` usage to Prisma 6 best practice. Reference model already in repo: `PlayService.performAction` (Serializable + 10s timeout + P2025/P2034 retry + side-effects after commit). Make the game-state transitions and EventService match it. Keep changes minimal and behavior-preserving except where a confirmed bug is being fixed.

## Constraints / principles

- Minimal change. No new deps unless a slice's acceptance needs it.
- One verification loop per slice: `tsc` clean + `pnpm run test` green; shadow-run unaffected.
- Platform pkg has NO prettier config — match existing style by hand (2-space, single-quote, no-semi). demo-game HAS prettier — safe to format.
- Each slice = its own commit (conventional commits, scope `platform`/`demo-game`).

---

## Slice T1 — quick wins (low risk, isolated)

**Scope**
- Add missing `await` on `tx.periodSegment.upsert(...)` at GameService.ts:258 (GS-250-1). Match sibling `addPeriod` (line ~136).
- Remove dead `import { withRetry }` at PlayService.ts:12 (PS-44-6).

**Acceptance:** tsc + tests green. No behavior change beyond correct await ordering.
**Risk:** trivial.

## Slice T2 — global transaction defaults + drop the 120s timeouts

**Scope**
- `new PrismaClient()` (apps/demo-game/src/lib/prisma.ts:7) → `new PrismaClient({ transactionOptions: { timeout: 10000, maxWait: 5000 } })`. (Issue #6.)
- Delete the four `{ timeout: 120000 }` overrides in GameService.ts (lines ~613, 744, 1058, 1157). Let the global default apply, OR set explicit `{ timeout: 10000, maxWait: 5000 }` per call. (Issue #2: GS-507-2, GS-682-2, GS-977-2, GS-1073-3.)
- Precondition check: confirm no callback legitimately needs >10s. If a service hook (`updateDBBeforeActivation`, `updateDBAfterEnd`) can be slow, move it before the `$transaction` first (overlaps T4).

**Acceptance:** tsc + tests green. Manual: a normal transition completes well under the new ceiling.
**Risk:** medium — if a hook genuinely needs the long window, T4 must land first. Profile before cutting.

## Slice T3 — graceful OCC (P2025) handling on transitions

**Scope**
- Add a small shared helper (e.g. in lib/util.ts) to run a transition `$transaction` and translate a `PrismaClientKnownRequestError` P2025 into `return null` (transition already happened — matches existing null-return convention). Re-throw all other codes. (Issue #3: GS-454-2, GS-507-4, GS-682-3, GS-815-1, GS-977-4, GS-1073-4, GS-250-4, PS-826-2.)
- Apply at the 6 game-transition `$transaction` sites + addCountdown.
- Do NOT add a retry to admin transitions — a lost OCC race should resolve to null, not retry into a stale state.

**Acceptance:** unit test — two concurrent transitions: one succeeds, the other returns null (not a thrown 500). tsc + tests green.
**Risk:** medium — make sure null propagates cleanly through resolvers (they already handle `if (!results) return`).

## Slice T4 — keep PlayerAction writes inside the interactive transactions

**Scope**
- Thread the `tx` client through `mapAction` (GameService.ts:1342) and `computeSegment*Results` / `computePeriodEndResults` so `playerAction.create` uses `tx`, not `ctx.prisma`. (Issue #1, the headline: GS-507-1, GS-682-1, GS-977-1, GS-977-6, GS-1073-1.)
- For genuine post-commit side-effects keep the thunk pattern; for DB writes that must be atomic with the transition, use `tx`.
- Array-form sites (454, 815): currently correct, but make `mapAction` tx-aware so a future interactive refactor can't silently break atomicity (GS-454-1) — or at least leave an explicit comment.

**Acceptance:** new test — force a transition rollback (simulate OCC miss) and assert no orphan `PlayerAction` rows. tsc + tests green.
**Risk:** higher — touches result-computation call signatures. Needs the rollback test as the feedback loop.

## Slice T5 — Serializable + P2034 retry on transitions

**Scope**
- Add `isolationLevel: Prisma.TransactionIsolationLevel.Serializable` to the interactive transition transactions (Issue #4: GS-507-3, GS-1073-5, GS-977-5; + set `maxWait`, PS-44-5).
- Consolidate retry into ONE util: P2034 only, exponential backoff + full jitter (fixes PS-44-4 too). Use it for the transitions. Keep P2025→null (T3) separate from P2034→retry.

**Acceptance:** tests for the retry util (backoff progression, gives up after N). tsc + tests green.
**Risk:** medium — depends on T3/T4 landed; Serializable raises P2034 frequency, so retry must be solid.

## Slice T6 — EventService achievement RMW atomicity

**Scope**
- Rework `receiveEvent`/`receiveEvents` so the achievement `findUnique`/`findFirst` + `update`/`create` AND the `player.update` run inside ONE interactive `$transaction(async (tx) => …)`, Serializable. (Issue #5: ES-75-2, ES-75-5.)
- Publish notifications (`publishUserNotification`) only AFTER commit (ES-75-3) — return data from the tx, publish in the caller.
- Add types to the functions while here (ES-75-6); drop the `(prisma as any)?.$transaction` dynamic dispatch once typed (ES-75-1 was refuted as a bug but the cast becomes unnecessary).

**Acceptance:** test — concurrent events for same player/achievement don't double-create (no P2002) and count increments correctly. tsc + tests green.
**Risk:** higher — concurrency-sensitive; needs the concurrency test.

## Deferred / lower priority

- Typing cleanup: `results[0] as any` + explicit return type on activateNextPeriod (GS-815-3); typed `updateDBAfterInitialize` callback (GS-130-4).
- Redundant interactive tx when hook absent (GS-250-5); default-timeout on that path (GS-250-3).
- TOCTOU on computed indices / active-segment id (GS-130-3, GS-250-2, PS-826-1) — move the read inside the tx or add a unique constraint + handle P2002. Operationally low-risk today ("one admin at a time").
- PS-44-2: move the two reference `findMany` reads out of the Serializable tx.
- GS-454-5: explicit timeout on the array form with large `extras`.

## Suggested order

T1 → T2 → T3 → T4 → T5 → T6. T1–T3 are safe/fast. T4 is the most valuable correctness fix. T5 builds on T3/T4. T6 is self-contained, can run any time after T1.

## Progress

(none yet)
