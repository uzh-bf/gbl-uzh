# Central Bank Game — Cleanup Plan (make it a committable second reference game)

## Identity

- Plan: `project/2026-07-06-central-bank-cleanup-plan.md`
- Branch: `feat/central-bank` -> target `dev` (draft PR)
- PR: uzh-bf/gbl-uzh #TBD (draft, base `dev`) — backfill the number into this filename in a metadata commit once assigned
- History: game built in the dogfood exercise (brief: `project/2026-07-05-central-bank-first-game-brief.md`; friction log: `project/2026-07-05-central-bank-dogfood-feedback.md`). The reusable skill/doc improvements are already split out into the decontaminated docs PR (branch `docs/skills-deploy-decontaminate`).

## Goal

- Problem: the Central Bank game proves the skills path works with a genuinely different mechanic — a single-lever policy-rate control loop feeding a legible macro model (inflation/unemployment/growth), a dual-mandate quadratic penalty, a leaderboard, and cross-player rate spillovers. But the app was copied from `apps/demo-game` and never fully decontaminated: it fails the `gbl-new-game-app` "Definition of done" it helped motivate, and two critical residue bugs would ship/deploy demo-game under central-bank's name.
- Goal: get the game clean enough to commit next to `apps/demo-game` as a second reference — pass its own DoD (no demo residue, `check` green), fix the deploy-time criticals, and tighten code quality.
- Non-goals: no new gameplay features; no changes to shared `packages/platform` / `packages/ui` beyond what the game needs; no expansion of the macro model.

## Status

- **This PR only adds this plan. No cleanup performed yet.** Kept as a draft until the tasks below are done and verified. The task list is derived from a verified review of the branch (file/line references confirmed against `feat/central-bank`).

## Cleanup tasks (ranked; each item ≈ one small slice/commit)

### Critical — would ship or deploy demo-game

- [ ] `apps/central-bank/Dockerfile`: replace every `@gbl-uzh/demo-game` / `apps/demo-game` reference with central-bank — the `turbo prune --scope` (line 24), the four `COPY --from=builder … /apps/demo-game/…` paths (53-56), and `CMD ["node","apps/demo-game/server.js"]` (62). As-is the Dockerfile prunes, copies, and runs demo-game, so building this image ships the wrong app under central-bank's name.
- [ ] `apps/central-bank/.env.production` + `.env.production.prd`: all three URLs (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `NEXTAUTH_URL`) point at `https://demo-game.stg.env.bf-app.ch`. Repoint to central-bank's own domain, or blank them and inject at deploy time (see `docs/deploying-a-game.md`). Left as-is, auth callbacks/API traffic cross-wire into demo-game.

### High — demo content on the game surface

- [ ] `src/pages/index.tsx`: the `/` route is still the unmodified demo portfolio showcase (`TradingForm`, `StorageOverview`, `ProbabilityChart`, "hello world", mock `cashBalance`/`spotPrice`/`futuresPrice` data). Replace with a central-bank landing page or a redirect to `/play/welcome`.
- [ ] `src/lib/analysis.ts`: dead demo portfolio analytics (`assetsWithReturns`, `accBankBenchmarkReturn`, `sharpeRatio`, …) — unused, and references fields that only exist in demo-game's facts. Delete the file.

### Medium — thematic + dead residue

- [ ] `src/services/GameFactsService.ts` + `src/types/Game.ts`: still increment the meaningless demo `myInt` counter on every game-fact update. Replace `GameFacts` with an empty/minimal schema and make `GameFactsService.update` a no-op stub (the monetary-policy state lives in period/segment result facts, not game facts).
- [ ] `src/lib/constants.ts`: `AVATARS` are demo savings-animal puns (`sparschwein`, `sparbaer`, `sparhai`, …) — incoherent for a central-bank governor — plus dead `MONTHS`/`NUM_MONTHS`/`NUM_MONTHS_PER_SEGMENT`. Replace avatars with central-bank-appropriate imagery (or placeholder only), delete the time constants; keep `LOCATIONS`/`COLORS`.
- [ ] `src/pages/admin/dice/[id]/[...roll].tsx`: orphaned demo per-asset (bonds/stocks) dice-forecast page, incompatible with central-bank's single seeded event roll per segment. Delete it (or rewrite against the real event table in `SegmentService` if an admin viz is wanted).

### Low — code quality (only matters if it becomes a maintained reference)

- [ ] Single source of truth for macro constants: `src/pages/play/cockpit.tsx` (Taylor-Rule advisor, ~line 586) hardcodes neutral rate `4.0` and trend `2.5` independently of `src/services/SegmentResultService.ts`, which hardcodes the same `4.0`. Extract shared constants (ideally derive from scenario config) so the advisor and the model can't drift.
- [ ] `src/pages/play/cockpit.tsx` (~1436 lines): the event-newsflash banner and the four MetricCards are triplicated near-verbatim across the RUNNING, PAUSED/CONSOLIDATION, and RESULTS branches. Extract shared components and reduce the `any` casts.
- [ ] `src/types/facts.ts`: prune `exchangeRateIndex` / `tradeBalance` if they stay unwired (the `spillover*` fields ARE used — `PeriodResultService` applies a cross-player rate externality — so keep those).

## Definition of done (gate before flipping this PR to ready)

- [ ] `pnpm --filter @gbl-uzh/central-bank run check` green (lint + `check:ts`; no unused imports, no demo-game types).
- [ ] Residue grep clean: `rg "assetsWithReturns|spotPrice|futuresPrice|cashBalance|storageAmount" apps/central-bank/src` returns nothing.
- [ ] `/` route renders central-bank, not demo content.
- [ ] Dockerfile builds and runs central-bank; `.env.production*` carry no demo-game domain.
- [ ] One full multi-player lifecycle green via `playwright/tests/central-bank-flow.spec.ts` (including the unplayed sentinel period).
- [ ] Maintainer decision recorded: commit as a permanent second reference game (doubles the CI + upkeep surface — every platform change must keep two apps green) vs keep it as a demonstrator only.

## Notes

- What is genuinely good and should be preserved: the mechanic (single-lever control loop, deterministic seeded shocks via the shared `diceRoll`, quadratic dual-mandate penalty), the leaderboard (net-new work — the platform ships no leaderboard component), and the cross-player spillover model in `PeriodResultService`.
- This branch also carries an earlier copy of the skill/doc improvements that landed cleanly in the docs PR. When rebasing/merging, let the docs PR own those; keep this branch focused on the game app.
