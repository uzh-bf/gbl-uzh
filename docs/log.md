# Log

## 2026-09-25

**Update**: [Deploying a Game](deploying-a-game.md) — document the ARM64 GBL production image for startinvest.df-app.ch, digest-pinning gate, and manual data migration prerequisites.

## 2026-09-23

**Update**: [Game Model](game-model.md), [Developing a Game](developing-a-game.md) — revert the XP work from `a11456d6`: restore achievement-only computation, remove seeded lesson rewards and their tests, and restore prior reward-badge validation. Both platform services return to their pre-commit versions. Calendar, countdown, cleanup, and later changes are preserved, as are existing database XP and lesson rewards. Earlier XP implementation and correction entries below remain as historical records.

**Update**: [Developing a Game](developing-a-game.md), [Game Lifecycle](game-lifecycle.md), [UI Building Blocks](ui-components.md) — rename Cockpit to Decisions without changing URLs; show editing-only, side-by-side Bonds/Stocks forecasts with expected-value colors matching Market and no extra navigation link. Limit Ready and readiness reminders to active segments; review screens wait for the instructor.

**Update**: [Developing a Game](developing-a-game.md) — migrate demo-game, platform, and UI tests to Vitest 5 with independent commands, preserve opt-in learning integration coverage, and update UI’s compatible Vite tooling while retaining its browser targets and package exports.

**Update**: [Developing a Game](developing-a-game.md), [Game Model](game-model.md) — remove the temporary reward ledger and repair commands after the local correction; consolidate report helpers, JWT handling, scenario constants, and result tests into their existing owners. Existing corrected XP is preserved.

**Update**: [Game Model](game-model.md), [Developing a Game](developing-a-game.md), [UI Building Blocks](ui-components.md) — document direct 20 XP demo lesson rewards, atomic completion-based duplicate prevention without schema additions, matching countdown notices, fixed three-month segments, and the current-year timeline.

**Update**: [Developing a Game](developing-a-game.md), [UI Building Blocks](ui-components.md) — centralize demo-game facts/result helpers and presentation metadata, reuse signed Market percentages, simplify cockpit and welcome composition, and share browser setup/visual checks while preserving behavior. Group History and Results in one module, keep constants together and avatar names local, remove unused helpers, and correct warning placement and final-period test guidance.

## 2026-09-22

**Update**: [UI Building Blocks](ui-components.md) — added rounded, scrolling History filters with All; unified player header identity and removed the duplicate Team avatar; tightened annual-chart spacing and reference labels, colored accumulated-return percentages, and distinguished completed progress from Stocks.

**Update**: [UI Building Blocks](ui-components.md) — central demo-game mobile sizing roles now cover player tabs, welcome, admin, and portaled content while preserving desktop layouts and the updated cockpit results. Review removed redundant size declarations and unchanged component re-exports, corrected mobile portal fonts, and aligned History padding and allocation hit areas with the sizing contract.

**Update**: [Developing a Game](developing-a-game.md) — reviewed and simplified result adapters and state rendering; shared settlement/sample parsing with History, and fixed year-end progress and opening-balance handling for missing records.

**Update**: [Developing a Game](developing-a-game.md), [UI Building Blocks](ui-components.md), [Game Lifecycle](game-lifecycle.md) — replace the demo cockpit's quarter, consolidation, and year-end reports with the supplied designs; document settled result selection, cumulative chart semantics, annual asset returns, and advisory Ready behavior.

**Update**: [Developing a Game](developing-a-game.md), [UI Building Blocks](ui-components.md) — shortened the comparison heading to “Monthly returns · Month N”; retained existing Market results across quarter and year changes.

**Update**: [UI Building Blocks](ui-components.md) — Market charts show the revealed month below Expected and remove the highlighted year/quarter/month footer.

**Update**: [UI Building Blocks](ui-components.md) — Market probability charts now fit all 11 outcomes without horizontal scrolling at 400px, with narrower bars and compact labels.

**Update**: Demo-game Team and content sheets — documented settled team statistics, released-story rereading and skip semantics, browser-local activity views, accessible responsive sheets, and shared learning-hook draft/error support. Review consolidated quiz drafts and feedback, removed the redundant story-read cache, exposed row status/metadata to screen readers, and fixed stale quiz data after successful submissions finish in the background.

## 2026-09-21

- **Update**: [Developing a Game](developing-a-game.md), [UI Building Blocks](ui-components.md) — implement the History tab with cumulative portfolio values, year-filtered expandable quarters, lifecycle-aware settlement, instructor-controlled dice visibility, and responsive browser coverage.

## 2026-09-17

- **Update**: Market tab — restored scenario-based probability charts in the mobile design, added persisted admin monthly dice reveals and player refresh, and documented the distinction between current outlook and historical returns. Updated developing-a-game, UI components, API, and lifecycle guidance.

- **Update**: [UI Building Blocks](ui-components.md), [Developing a Game](developing-a-game.md) - remove the welcome CSS Module, use shared player tokens and welcome-local Tailwind controls across setup, portaled pickers, and loading/error views, and document responsive and failure/retry browser coverage.

## 2026-09-16

- **Update**: [UI Building Blocks](ui-components.md), [Developing a Game](developing-a-game.md) - replace the cockpit CSS Module with Tailwind utilities and app-local action, notice, and allocation-row components; centralize player tokens and unify welcome/cockpit primary and asset colors while preserving responsive dimensions.

- **Update**: [Developing a Game](developing-a-game.md), [Game Lifecycle](game-lifecycle.md) - document persisted allocation submission, reversible Ready locking, instructor-controlled results, year/quarter labels, and shared cockpit sizing and allocation-bar rendering aligned with the revised references.

- **Update**: [Developing a Game](developing-a-game.md) - document compact cockpit sizing on tablet and desktop, preserving mobile control sizes and the centered, bounded layout.

- **Update**: [Developing a Game](developing-a-game.md) - document the final centered slider labels and handles, directional selection when handles coincide, and endpoint stacking. Simplify cockpit state handling and consolidate browser screenshots under each test's output directory.

## 2026-09-15

**Update**: [Developing a Game](developing-a-game.md), [Game Lifecycle](game-lifecycle.md) — document the demo-game cockpit design, bottom navigation, Team profile/learning activities, and shared decimal allocation validation.

- **Update**: `developing-a-game.md` - clarify the welcome footer layout and locked review controls during saving.

- **Update**: `developing-a-game.md` - document the mobile welcome introduction, bank setup and review, confirmed avatar/canton pickers, validation, and save behavior.

## 2026-09-07

- **Update**: `deploying-a-game.md` - document an isolated Startinvest ARM staging image while preserving existing build URLs and multi-architecture tags.

## 2026-08-12

- **Update**: example auth consumers, container environments, CI, and current auth documentation - all in-repo games now use `resolveAdminOidcConfig()`, starter/devrouter/CI use only `GBL_AUTH_MODE=mock` and `GBL_MOCK_OIDC_*`, native example mock startup remains unsupported, and production forbids mock mode.

## 2026-08-11

- **Update**: `developing-a-game.md`, `deploying-a-game.md`, and local onboarding docs - documented the shared local OIDC service, demo-game's fail-closed provider selection, and native-only real Auth0 opt-in.
- **Update**: `developing-a-game.md` - documented demo-game's ordered env bootstrap so strict mock-auth validation also works before Next.js starts.

## 2026-07-11

- **Update**: `platform-overview.md`, `ui-components.md`, and `developing-a-game.md` - documented the verified public package contract, stable CSS export, external Next.js consumption, release/version workflow, and one-time npm trusted-publishing bootstrap for `@gbl-uzh/ui`.

## 2026-07-10

- **Update**: `developing-a-game.md` - documented the explicit devcontainer game-target contract: `GBL_GAME_TARGET` selects the supported game package and Prisma lifecycle, while `WORKSPACE` remains solely the routing/container identity.

## 2026-07-06

- **Creation**: `deploying-a-game.md` - the easy staging deploy path: a Vercel deployment of one game app backed by a Neon serverless Postgres, CLI-first (`neonctl` + `vercel`), distinct from the k8s production path (`deploy/`). Covers the monorepo build-order gotcha (`prisma/copy.ts` needs `@gbl-uzh/platform` built first), pooled vs direct Neon connection strings, the env-var matrix, and the Auth0/OIDC reality (mock OIDC is local-only).
- **Update**: `developing-a-game.md` - added a "Decontaminate the copy" warning to the scaffolding section (demo-game residue hit-list) and a deploy pointer in the verification loop; `index.md` - added the new page to the reading order and `gbl-deploy-staging` to the skills list.
- **Companion skill updates** (not part of the docs bundle, done in the same pass): new `gbl-deploy-staging` skill; `gbl-new-game-app` gained a decontamination checklist + definition of done; `gbl-playwright-e2e` promoted the starter/Docker path to default, added a spec-adaptation checklist, the fast-submit `toBeEnabled()` idiom, and a prominent sentinel-period callout; `gbl-wiki-maintenance` gained a deployment trigger.
- **Review pass** (branch readiness): `getting-started.md` - made the "start the runtime" steps runtime-agnostic (Rancher/OrbStack/Docker Desktop) to match the install section instead of assuming Docker Desktop's whale icon; `building-with-an-agent.md` - added a troubleshooting row for the container shell `DATABASE_URL` overriding the app's `.env`. Companion skill fixes: `gbl-backend-computations` gained a warning that server-computed segment facts must be `.optional()` (blank `{}` insert otherwise aborts) and a corrected `parseFacts` failure description; `gbl-new-game-app` gained a teardown note (delete a throwaway game's build artifacts + stray trackers, since `apps/<game>/.gitignore` is gone once the source is removed).

## 2026-07-05

- **Creation**: `building-with-an-agent.md` - the external-agent onboarding path: point a host coding agent (Claude Desktop / Codex, Windows or macOS) at a normal `git clone`, bring the starter stack up headlessly with Docker only (no VS Code, no volume-clone), and run repo commands via `docker compose exec`. Bring-up commands verified end-to-end (app 200 on host `localhost:3000`, OIDC issuer match).
- **Update**: `getting-started.md` - added a cross-pointer to the external-agent path; `index.md` - added the new page to the reading order and completed the agent-skills list (`gbl-playwright-e2e`, `gbl-environment-doctor`).

## 2026-07-04

- **Creation**: `getting-started.md` - plain-language onboarding for non-technical game builders (Docker Desktop + VS Code + Dev Containers extension, the "GBL Starter" devcontainer configuration with published localhost ports and preinstalled Claude Code, one-click mock login, first prompts, health-check escalation).
- **Update**: `developing-a-game.md` - local-dev step now names both devcontainer configurations (starter and devrouter) and links the getting-started guide.

## 2026-07-03

- **Creation**: Initial knowledge bundle with seven concepts (platform overview, game model, lifecycle, game types, development guide, UI building blocks, API layer), researched from source and fact-checked page-by-page against `packages/platform`, `apps/demo-game`, and the Playwright flow spec.
- **Update**: Adopted Open Knowledge Format v0.1 - frontmatter on every concept, this log, and `index.md` replacing the former `README.md`; concept files renamed from numbered prefixes to stable names.
