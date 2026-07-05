# Prisma transaction audit — GBL platform

Date: 2026-06-14. Prisma `@prisma/client` ^6.14, PostgreSQL, Next.js demo-game + nexus platform package.
Method: 11 transaction sites reviewed against Prisma 6 docs (Context7), each finding adversarially verified by a second agent. 53 raised → **38 confirmed**, 15 refuted.

## Transaction sites

| Site | File:line | Form | Timeout | Isolation |
|---|---|---|---|---|
| addGamePeriod | GameService.ts:130 | interactive | default 5s | READ COMMITTED |
| addPeriodSegment | GameService.ts:250 | interactive | default 5s | READ COMMITTED |
| activateNextPeriod SCHEDULED→PREPARATION | GameService.ts:454 | array | n/a | default |
| activateNextPeriod RUNNING→CONSOLIDATION | GameService.ts:507 | interactive | **120s** | READ COMMITTED |
| activateNextPeriod CONSOLIDATION→RESULTS | GameService.ts:682 | interactive | **120s** | READ COMMITTED |
| activateNextPeriod RESULTS→PREPARATION | GameService.ts:815 | array | n/a | default |
| activateNextSegment PREPARATION/PAUSED→RUNNING | GameService.ts:977 | interactive | **120s** | READ COMMITTED |
| activateNextSegment RUNNING→PAUSED | GameService.ts:1073 | interactive | **120s** | READ COMMITTED |
| performAction (via performActionWithRetry) | PlayService.ts:44 | interactive | 10s | **Serializable** ✓ |
| addCountdown | PlayService.ts:826 | array | n/a | default |
| receiveEvents | EventService.ts:75 | array (dynamic) | default | default |

## Overall verdict

Transactions are **not yet following best practice**. The atomic-write intent is mostly right, but four recurring problems undermine it: writes that escape the transaction via the outer client, 120s timeouts that can starve the connection pool, zero error handling for the optimistic-concurrency guards, and READ COMMITTED isolation for read-modify-write paths. `PlayService.performAction` is the model the rest should follow (Serializable + 10s + retry + side-effects-after-commit).

## Cross-cutting issues (priority order)

### 1. HIGH — `extras`/`mapAction` writes escape the interactive transactions
`mapAction` (GameService.ts:1342) returns `ctx.prisma.playerAction.create(...)` — a promise on the **outer** client. In the four interactive transitions (507, 682, 977, 1073) these are built with `ctx.prisma`, then merely `await`ed inside the `tx` callback. They run on a separate connection, outside the BEGIN/COMMIT boundary. If the transaction rolls back (e.g. OCC miss throws P2025, or the 120s timeout fires), the game state rolls back but the `PlayerAction` rows are already committed → permanent inconsistency. Also documented Prisma trap (client-extension/outer-client inside tx, GH #20678).
- Confirmed: GS-507-1, GS-682-1, GS-977-1, GS-977-6, GS-1073-1.
- Fix: thread `tx` into `mapAction`/`computeSegment*Results`/`computePeriodEndResults`, or return plain data and create rows with `tx` inside the callback. The `computePeriodEndResults` *thunk* pattern (deferred, run after commit) is the right model for genuine side-effects; for DB writes that must be atomic with the transition, use `tx`.
- Note: the two **array-form** sites (454, 815) pass outer-client promises into `$transaction([...])` — that is *correct* usage today, so they are atomic. But the same `mapAction` shape makes them fragile if ever refactored to interactive form (GS-454-1, MEDIUM).

### 2. HIGH/MEDIUM — 120s interactive-transaction timeouts starve the pool
Four sites use `{ timeout: 120000 }`. Each interactive tx holds exactly one pooled connection for its whole window. Default pool = `num_cpus*2+1` (~5–9). A handful of concurrent transitions can exhaust the pool; subsequent queries queue behind the default `maxWait` (2s) then throw P2024/P2028. Docs: "get in and out as quick as possible." The DB work here should finish well under 5s once issue #1 moves heavy work out.
- Confirmed: GS-507-2, GS-682-2, GS-977-2, GS-1073-3.
- Fix: drop to `{ timeout: 10000, maxWait: 5000 }` (match PlayService) after #1. Move any slow hooks/compute before the callback.

### 3. MEDIUM — no error handling for the OCC `status` guard (P2025)
Every `game.update` uses `where: { id, status: game.status }`. On a lost race the update matches zero rows → P2025. There is **no try/catch anywhere in GameService.ts** (`grep -c catch` = 0), and the resolvers don't catch either, so a concurrent admin double-click surfaces as a raw 500 instead of a graceful no-op.
- Confirmed: GS-454-2, GS-507-4, GS-682-3, GS-815-1, GS-977-4, GS-1073-4, GS-250-4, PS-826-2.
- Fix: catch `PrismaClientKnownRequestError` P2025 at the transition sites and return `null` (the transition already happened — matches the existing null-return convention). Re-throw everything else.
- Refines the earlier XState security review: bypassing the retry wrapper is still correct (don't retry an admin transition into a stale state), but the OCC miss should fail *gracefully*, not as a 500.

### 4. MEDIUM — READ COMMITTED for read-modify-write transitions
The interactive transitions read game/segment state then write based on it, at PostgreSQL's default READ COMMITTED, with no `isolationLevel`. The `status` guard catches the simple double-transition but not non-repeatable/phantom reads in the result computation. PlayService already uses Serializable for the analogous player-action RMW.
- Confirmed: GS-507-3, GS-1073-5, GS-977-5 (+ PS-44-5 `maxWait` unset).
- Fix: add `isolationLevel: Serializable` to the transition transactions **with** a P2034 retry loop (pairs with #3).

### 5. HIGH — EventService achievement read-modify-write races + form mismatch
In `receiveEvent`, the achievement `findUnique`/`findFirst` then `update`/`create` run **outside** the transaction (awaited eagerly); only the final `player.update` is enqueued into the `$transaction([...])` batch. Two concurrent events for the same player/achievement can both read null and both `create` → P2002 on the unique key, or both read count=N and write N+1 (under-count). And the batch gives the *appearance* of atomicity across achievement+player writes while only covering the player update — if the player update fails, the achievement writes are not rolled back.
- Confirmed: ES-75-2 (race, HIGH), ES-75-5 (form mismatch, HIGH), ES-75-3 (notifications published before commit, MEDIUM).
- Fix: move the whole achievement RMW + player update into one interactive `$transaction(async (tx) => …)` (Serializable), publish notifications only after it commits.

### 6. Config — no global defaults, no logging
`new PrismaClient()` is bare (apps/demo-game/src/lib/prisma.ts:7): no `transactionOptions`, no `log`. Prod singleton guard only runs when `NODE_ENV !== 'production'`. Setting global `transactionOptions: { timeout: 10000, maxWait: 5000 }` would give every site a sane ceiling; per-call overrides still win.

## Standout concrete bugs

- **GS-250-1 (MEDIUM): missing `await`** on `tx.periodSegment.upsert(...)` at GameService.ts:258 — the callback returns a `Promise<PeriodSegment>` not the row; breaks the causal ordering with the preceding `updateDBAfterInitialize` hook. Sibling `addPeriod` (line 136) correctly `await`s. One-word fix.
- **PS-44-6 (LOW): dead `withRetry` import** at PlayService.ts:12 — unused; two divergent retry implementations exist (util.ts `withRetry` linear/P2034-only vs the inline P2025|P2034 fixed-jitter loop). Consolidate.

## Lower-priority confirmed

- GS-815-3, GS-130-4, ES-75-6 (typing: `any` returns/params, `results[0] as any`, untyped callbacks).
- GS-250-5, GS-250-3 (redundant interactive tx + default timeout when `updateDBAfterInitialize` absent).
- GS-130-3, GS-250-2, PS-826-1 (TOCTOU: period/segment index and active-segment id computed from a read outside the tx).
- PS-44-2 (two unfiltered `findMany` reference reads inside the Serializable tx widen the predicate-lock footprint — read them before the tx).
- PS-44-4 (retry backoff: fixed [50,100]ms window, no exponential/full jitter → thundering herd).
- GS-454-5 (no explicit timeout on the array form with large `extras`).

## Already correct ✓

- `PlayService.performAction`: Serializable + 10s timeout + P2025/P2034 retry + side-effects (notifications) after commit. The reference pattern.
- The status-based OCC guard itself is sound (rejected finding GS-1073-2 argued version must be used — refuted: the `status` guard is sufficient for the transition race).
- The recent XState slice: `computePeriodEndResults` thunks now run after commit (GS-682 side-effects correctly deferred); `Promise.allSettled` hardening.
- Array-form atomicity at GS-454/GS-815 is genuinely correct today.

## Refuted (15) — not real, for the record

ES-75-1/4, GS-977-3, GS-1073-2, GS-130-1/2, GS-454-3/4, GS-507-5, GS-682-4, GS-815-2/4, PS-44-1/3, PS-826-3. Mostly: misread Postgres UPDATE semantics, claimed-missing error handling that exists, or "version not used in OCC" (status guard is sufficient).

## Action plan (impact ÷ effort)

**Quick wins (low risk, isolated):**
1. Add `await` at GameService.ts:258 (GS-250-1). Remove dead import PlayService.ts:12 (PS-44-6).
2. Set global `transactionOptions: { timeout: 10000, maxWait: 5000 }` on `new PrismaClient()`; delete the four `{ timeout: 120000 }` overrides (#2).
3. Add P2025 → `return null` handling around the transition `$transaction` calls (#3). Small shared helper.

**Medium (correctness, needs care + a test):**
4. Thread `tx` through `mapAction`/compute fns so `PlayerAction` writes are atomic in the interactive transitions (#1).
5. Add `isolationLevel: Serializable` + P2034 retry to the transition transactions, reusing one consolidated retry util (#4, pairs with #3).
6. Rework `EventService.receiveEvent` into a single interactive Serializable tx, notifications after commit (#5).

**Larger (optional):** typing cleanup, TOCTOU index locking, retry-util consolidation with exponential/full-jitter backoff.
