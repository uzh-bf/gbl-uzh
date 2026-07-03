# LLM Wiki + Game-Building Skills Plan

## Identity

- Plan: `project/2026-07-03-llm-wiki-and-game-skills-plan.md`
- Branch: `claude/wonderful-dewdney-b7b7c6` -> target `dev`
- PR: none yet (rename plan when known)

## Goal

- Outside users generate simple GBL learning games with own AI tooling.
- Deliverable 1: LLM wiki in `docs/` (repo root). Ground truth for agents.
- Deliverable 2: agent skills in `.agents/skills/` (repo convention, intent-discoverable).
- Docs explain: game structure (game/period/segment/player/facts), supported game types (synchronous continuation, period flow with reports between), development model (backend = computation-first with optional transactional hooks, frontend = per game + reusable components).

## Non-Goals

- No platform/ui/demo-game code changes.
- No deep GraphQL docs (tRPC migration replaces it). No scaffolding CLI.
- No fixes for observed code quirks (dead `GameFacts.update`, unreachable `COMPLETED`, ui TODOs) — document as caveats only.

## Research (done)

- 10-agent workflow `gbl-architecture-research` + inline reads. Digest: session scratchpad `research-digest.md`.
- Key facts, evidence-backed:
  - Data: Game -> Period -> PeriodSegment, linked lists + active pointers. Facts = untyped Json blobs everywhere (Game/Period/Segment/Player/Result/Action/Decision). Yup validates, not DB. `packages/platform/public/schema.prisma`.
  - State machine: SCHEDULED -> PREPARATION -> RUNNING <-> PAUSED -> CONSOLIDATION -> RESULTS -> PREPARATION(next) -> ... COMPLETED unreachable today. Driven only by admin `activateNextPeriod`/`activateNextSegment`. `GameService.ts:405-1094`.
  - Contract: game backend = `Services` object, 6 modules (GameFacts, Actions, Period, PeriodResult, Segment, SegmentResult), pure fns + optional `updateDB*` tx hooks. `packages/platform/src/types.ts:341-348`. Demo-game: `apps/demo-game/src/services/`.
  - Platform owns: DB writes, transitions, XP/level/achievement engine (EventService), learning/story elements, ready flag, countdown, pub/sub (SSE).
  - Synchronous model: one status per game, all players advance together, ready flag advisory only.
  - Frontend: per game. Player cockpit = one mega query + status switch; realtime = subscription as poke -> refetch. Admin pages: games list, game detail (state machine buttons), reports.
  - UI pkg `@gbl-uzh/ui` v0.4.13: 12 exports (Button, Layout, Logo, NavBar, PlayerDisplay, ProbabilityChart, StorageOverview, Timeline, TimelineAdmin, TimelineEntry, TradingForm, XpBar). Achievement + SegmentEntry internal-only (used by exported components), ListItem dead (commented out). Early stage, unstable. NOT published to npm (platform IS, on v* tags) -> supported new-game path today = work inside monorepo clone/fork with workspace deps.
  - Design system @uzh-bf/design-system 4.1.6, Tailwind v4 CSS-only config, Formik+Yup is form pattern.
  - tRPC branch `codex/trpc-migration-work-packages`: complete rewrite, `createPlatformRouter({services, schemas})` factory, RouterOutputs types, SSE subscriptions via EventEmitter, GraphQL fully removed. Not merged (1 ahead / 53 behind dev).
  - Auth: admin OIDC (Auth0 prod, mock-oauth2 in devcontainer), players passwordless via `/join/[token]` links.
  - No scaffold tool; demo-game = sole reference implementation. Wiki must say claims come from one worked example.
- Limits: demo-game only game -> extension points (roleAssigner, multiple ActionTypes, specificFacts) unproven elsewhere. Some agent-reported frontend "typos" unverified -> exclude from docs.

## Assumptions (user AFK, low risk)

- `docs/` at repo root, markdown, English.
- Skills at `.agents/skills/gbl-*`, SKILL.md frontmatter `name`/`description` like existing two skills. Skills terse playbooks; wiki holds depth; skills link wiki pages by relative path.
- API layer documented transport-agnostic first, tRPC as target (branch cited), GraphQL one short section marked legacy.
- AGENTS.md gets small hand-written pointer section OUTSIDE managed blocks.

## Deliverable Layout

docs/ (each page self-contained, cross-linked, file:line refs into code):

1. `docs/README.md` — index, reading order, "for AI agents" note, currency caveats (tRPC branch, single reference game).
2. `docs/01-platform-overview.md` — what platform is, monorepo map, packages/apps, npm publishing state, who owns what (platform vs game).
3. `docs/02-game-model.md` — data model: game/period/segment nesting, facts blobs, player, results ledger (PERIOD_START/SEGMENT_START/SEGMENT_END/PERIOD_END), decisions vs actions, XP/levels/achievements, learning + story elements.
4. `docs/03-game-lifecycle.md` — state machine diagram (mermaid), transition table (button label -> mutation -> status -> computations), synchronous model, ready/countdown, numbered end-to-end walkthrough (admin + player).
5. `docs/04-game-types.md` — what fits: synchronous continuation games, period/segment decision cycles with reports between, role-based variants, narrative/quiz overlays; what does NOT fit (async self-paced, real-time action, cross-game persistence); worked example = investment demo game; 2-3 sketch examples of other feasible games.
6. `docs/05-developing-a-game.md` — backend: Services contract per module (signatures, when called, facts in/out, immer + seeded RNG patterns), yup schemas, seed script; frontend: required routes, cockpit status-switch pattern, realtime pattern; new-app path = copy demo-game (explicit steps); local dev (devcontainer/devrouter), auth setup.
7. `docs/06-ui-components.md` — @gbl-uzh/ui inventory w/ props + status (stable/dead), design-system usage (top components, Formik+Yup, Tailwind v4 CSS wiring incl. known gotchas: relative CSS import, .aspect-video patch), gaps list for library improvement.
8. `docs/07-api-layer.md` — platform owns transport; CURRENT ground truth on dev = GraphQL/nexus/SSE (kept short per user instruction, but stated as what runs today); UPCOMING = tRPC rewrite on branch `codex/trpc-migration-work-packages` (router factory, RouterOutputs types, invalidation pattern) clearly marked NOT merged; instruction for agents: check for `src/pages/api/trpc` vs `src/pages/api/graphql.ts` to know which is active.

.agents/skills/:

1. `gbl-game-design/SKILL.md` — pick/shape game idea for platform; structure vocabulary; fit checklist; maps idea -> periods/segments/decisions/facts.
2. `gbl-backend-computations/SKILL.md` — implement 6-module Services contract; per-hook cheat sheet; immer/isDirty/RNG idioms; validation; test via seed + admin flow.
3. `gbl-frontend-game-ui/SKILL.md` — build player cockpit + admin pages; status-switch skeleton; realtime wiring; ui pkg + design system component tables; Formik pattern.
4. `gbl-new-game-app/SKILL.md` — scaffold new apps/<name> from demo-game: copy list, rename list, prisma copy step, workspace registration, env/auth, run + verify loop.

Plus: AGENTS.md pointer section; root README.md link to docs/; short stale-notice + wiki pointer at top of `apps/demo-game/README.md` (its setup/reducer prose is outdated and would mislead LLM entrypoints — do not rewrite it, just redirect).

## Slices

1. **Plan commit** — this file alone. `docs(project): add llm wiki and game skills plan`.
2. **Wiki concepts** — README + 01 + 02 + 03 + 04. Verify: prettier --check, relative links resolve, spot-check 10 factual claims vs code. Review + simplify subagents. `docs(wiki): add llm wiki concept pages`.
3. **Wiki dev guide** — 05 + 06 + 07. Same verification. `docs(wiki): add game development guide pages`.
4. **Skills** — 4 SKILL.md. Verify: frontmatter matches convention, wiki links resolve, no duplication of wiki depth. `docs(skills): add game-building agent skills`.
5. **Pointers + finish** — AGENTS.md section, root README link, demo-game README stale-notice, plan Progress final. Security review subagent (docs-scope: secrets/PII/internal-URL leaks), final branch review (independent tool), PR via $df-mr-description-writer. `docs: link llm wiki from agent entrypoints`.

## Verification

- Per slice: `pnpm --dir apps/demo-game exec prettier --check --config apps/demo-game/.prettierrc.js <new md files>` (root has no prettier; demo-game's format script skips md, so invoke prettier directly). Link check via script (grep relative links, test -f).
- Factual accuracy: review subagent per slice cross-checks claims vs code with file refs.
- No build/test impact expected (docs only) — confirm `git status` clean of code paths.

## Independent Plan Review

- Reviewer: codex CLI (gpt, independent model; approved by default for workflow-scoped review, plan file only shared). Status: DONE_WITH_CONCERNS. All 6 findings accepted + integrated:
  1. Critical: API page must present GraphQL as current dev ground truth, tRPC as unmerged upcoming -> 07 page reframed.
  2. Important: stale `apps/demo-game/README.md` misleads LLM entrypoints -> stale-notice + wiki pointer added to slice 5.
  3. Important: "3 dead ui files" wrong -> corrected (ListItem dead; Achievement/SegmentEntry internal-only).
  4. Important: outside users can't consume @gbl-uzh/ui from npm -> wiki states monorepo clone/fork as supported path.
  5. Important: prettier not runnable from root -> pinned command via demo-game devDependency.
  6. Minor: "backend = computations only" too absolute -> "computation-first + optional transactional hooks".

## Progress

- [x] Slice 1 plan commit (d789a3f3)
- [x] Slice 2 wiki concepts (bc9cd7ce) — fact-check subagent DONE_WITH_CONCERNS: all 13 load-bearing claims verified, 3 precision fixes applied (Game.version scope, LEVEL_UP condition, isReady SCHEDULED edge). Simplify subagent: accepted README section merge, glossary Decision row fix, walkthrough compression, 04 filler cuts; deferred coordination-mechanics reorder + 04 ASCII loop removal (self-contained pages for LLM readers).
- [x] Slice 3 wiki dev guide (74c2c455) — fact-check DONE: no criticals; fixed script names (check/check:ts, no typecheck), PlayerDisplay flat props, Timeline vs TimelineEntry props, SegmentEntry rendered by TimelineAdmin, tRPC router order, spelled out event enums. Simplify: 3 accepted edits (ui table statuses, gaps trailing sentence, GraphQL idiom).
- [x] Slice 4 skills (1ae28a4d) — review subagent DONE_WITH_CONCERNS: fixed Critical data-testid claim (Button emits data-cy/data-test; playwright testIdAttribute=data-cy), pnpm --filter form, isDirty TODO caveat, FormikMultiSelectField path. Links + frontmatter verified.
- [x] Slice 5 pointers + finish (3b6ba7b4 + final commit) — security review subagent: CLEAN all 4 categories (no secrets/PII; loginAsTeam rate-limit gap judged non-amplifying, code public). Final branch review (codex, independent): DONE_WITH_CONCERNS, no criticals; accepted: plan Progress refresh, README Node 18+ -> 24+, "two key components" -> list wording. Spot-checks passed.

## Next Steps (post-merge candidates)

- Publish @gbl-uzh/ui or mark internal; fill ui gaps list.
- Update wiki API page when tRPC merges to dev.
- Consider create-gbl-game scaffold script.
