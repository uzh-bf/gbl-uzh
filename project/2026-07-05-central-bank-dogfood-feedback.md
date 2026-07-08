# Dogfood Feedback Report: GBL Platform Onboarding & Game Creation

**Date**: July 5, 2026  
**Game Built**: Central Bank (Monetary Policy Simulation)  
**Task**: Build a learning game and evaluate the developer onboarding flow, GBL documentation, and skills.

---

## 1. Executive Summary
The GBL platform is an elegant, modular framework for building learning games, utilizing Docker namespaces for shared networking and Nexus/GraphQL for structured mutations. We successfully scaffolded and ran the **Central Bank** game loop end-to-end, validating it with a multi-team Playwright suite. However, several friction points in container environments, schema validation, type mismatches, and E2E testing were identified and resolved. 

---

## 2. Onboarding & Platform Setup Friction
* **Host vs. Container Database URL Conflict**:
  * **Symptom**: Local `.env` files specifying `DATABASE_URL=postgres://prisma:prisma@postgres:5432/central_bank?schema=public` were ignored by Next.js and Prisma because the docker container injected a global shell environment variable `DATABASE_URL=postgres://prisma:prisma@postgres:5432/prisma?schema=public`.
  * **Friction**: In Node.js, shell-level variables override `.env` files. The server was silently writing to the default `prisma` database instead of the game's `central_bank` database.
  * **Feedback**: Onboarding documents should remind developers that when running inside docker-compose, container shell environment variables take precedence over local package `.env` files.
* **Database Synchronization**:
  * We had to run `prisma db push` inside the container targeting the new database:
    `DATABASE_URL="postgres://prisma:prisma@postgres:5432/central_bank?schema=public" npx prisma db push --schema=prisma/schema`
  * This was necessary to isolate the new game's schema from the existing demo game.

---

## 3. API & Schema Validation Gotchas
* **GraphQL Mutation Validation Failure**:
  * **Symptom**: The "Add segment" button in the admin interface seemed to click, but the segment was never added to the database (`segments: []`).
  * **Root Cause**: The admin panel submits `{}` as the initial facts payload for new segments, which are subsequently filled on the server via `SegmentService.initialize`. However, `PeriodSegmentFactsSchema` in `types/Period.ts` marked `shock` and `roll` as `.required()`. This caused `schema.validateSync(facts)` to throw a ValidationError and abort the mutation.
  * **Fix**: Change `shock` and `roll` to optional in the input validation schema (`yup.number().optional()`).
  * **Feedback**: Platform documentation should clarify that client-provided segment `facts` must either support partial schemas or the platform's input validator schema should be flexible to allow initial blank inserts.

---

## 4. Playwright E2E Testing Challenges
* **NextAuth State Cookie Loss (OAuth Callback)**:
  * **Symptom**: Headless tests crashed with `OAUTH_CALLBACK_ERROR State cookie was missing`.
  * **Root Cause**: Next.js ran with `NEXTAUTH_URL=http://localhost:3000` (from `starter.env`), but Playwright was configured with `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000`. The redirection from `127.0.0.1` to the `localhost` oauth callback resulted in cookie origin mismatches.
  * **Fix**: Align the Playwright target base URL precisely: `PLAYWRIGHT_BASE_URL=http://localhost:3000`.
* **Placeholder DOM Race Condition**:
  * **Symptom**: Admin could not add multiple periods sequentially because the "Add period" button remained disabled.
  * **Root Cause**: The admin dashboard renders segment placeholder cards immediately based on the planned `segmentCount` (e.g. 2 placeholders). In E2E tests, checking for element presence via `[data-cy^="period-0-segment-"]` matched placeholders and immediately returned a count of `2` instead of waiting for the server-side database write to complete.
  * **Fix**: Update the locator to wait for the `"Roll:"` text inside the segment, which is only rendered when the database segment entry has been initialized and returned:
    ```ts
    const segmentIndex = await page.getByTestId(`period-${periodIndex}`).locator('text=Roll:').count()
    ```
* **Button Disabled State Assertion Flakiness**:
  * **Symptom**: Asserting `expect(submitButton).toBeDisabled()` after clicking "Submit Policy Rate" failed.
  * **Root Cause**: GraphQL submissions are fast. By the time Playwright verified the disabled state, the mutation had resolved and the button was re-enabled.
  * **Fix**: Expect the button to be `enabled` (`toBeEnabled()`) to confirm the mutation finished processing.

---

## 5. Documentation & Skill Accuracy
* **Platform Wiki (`docs/`)**:
  * The wiki was highly accurate regarding the conceptual flow of periods, segments, decisions, and results.
  * The `gbl-playwright-e2e` skill instructions provided solid framework guidelines but could be improved by highlighting common authentication domain discrepancies (e.g., `127.0.0.1` vs `localhost` nextauth URL mismatch) and race condition traps involving static placeholder cards.

---

## 6. Post-Initial-Report Findings

### Prisma Enum Frontend Crash (Critical)
* **Symptom**: `TypeError: can't access property "RESULTS", _prisma_client__WEBPACK_IMPORTED_MODULE_2__.GameStatus is undefined` when creating a game and adding a period.
* **Root Cause**: `packages/platform/src/lib/util.ts` imported `@prisma/client` and used `DB.GameStatus.RESULTS` at runtime. Next.js strips `@prisma/client` from client bundles, making the enum `undefined`.
* **Fix**: Replaced all `DB.GameStatus.*` references with string literals (`'RESULTS'`, `'PAUSED'`, etc.) and changed the import to `import type * as DB from '@prisma/client'`.
* **Skill Gap**: Neither `gbl-backend-computations` nor `gbl-frontend-game-ui` warned about this. The Prisma client is a server-only dependency — any shared code path that uses its enums at runtime will crash the frontend.

### Volta EACCES Error (Host Toolchain)
* **Symptom**: `ERROR: spawn /Users/…/.volta/tools/image/pnpm/11.6.0/bin/pnpm.cjs EACCES` when running `pnpm run dev` or `pnpm run build` on the host.
* **Root Cause**: `npm-run-all` (`run-s`) spawns pnpm sub-commands, but Volta's shim path is not executable by the child process.
* **Workaround**: Run commands inside the Docker container, or execute the sub-commands from the `run-s` sequence directly.
* **Doc Gap**: `building-with-an-agent.md` had no troubleshooting section for host-toolchain issues.

### UI State Persistence
* **Symptom**: Event newsflash banners disappeared during `PAUSED`/`CONSOLIDATION`/`RESULTS` states, leaving players without context for why their numbers changed.
* **Fix**: Extracted the event banner to render across all post-decision game states.
* **Skill Gap**: `gbl-game-design` and `gbl-frontend-game-ui` didn't mention that narrative context needs to persist beyond `RUNNING`.
