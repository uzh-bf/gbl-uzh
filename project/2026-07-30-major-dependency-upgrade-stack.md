# Major dependency upgrade stack

## Goal

- Problem: The active workspace spans incompatible formatter generations and remains on pre-native TypeScript, the website's legacy React/Next pair, and Prisma 6.
- Decision: Deliver the approved upgrades as five independently green GitHub stack layers rooted directly on `dev`.
- Check: Every layer must be buildable, reviewable, and safe at its own tip; the completed stack must remain draft until Gate 3 approval.

## Plan identity

- Plan: `project/2026-07-30-major-dependency-upgrade-stack.md`
- Worktree: `/Users/rschlae/Git/gbl/gbl-uzh/trees/major-dependency-upgrades`
- Base: `dev` at `5cac12cfc2813e7b68b10649a43a1fd942e2dd79`
- Provider: GitHub stacked PRs with `gh stack`
- Mode: Progressive, with the separately required disposable PostgreSQL approval before Prisma database verification.
- Related history: PR [#144](https://github.com/uzh-bf/gbl-uzh/pull/144) owns the tRPC migration and compatible dependency refresh; this stack does not inherit from it.
- ADRs: None. The approved version and layer choices are branch execution decisions, not repository-wide architectural records.

## Non-goals

- Do not duplicate PR #144's tRPC, devrouter 0.0.35, pnpm 11.18.0, or compatible dependency refresh.
- Do not migrate `apps/advisor` or `apps/escapp` unless the root workspace install exposes a regression caused by this stack.
- Do not change database models or production data.
- Do not deploy, merge, queue, unstack, reorder, close, or delete any layer.
- Do not move the website from the Pages Router, static export, or webpack path unless a verified incompatibility forces a new user decision.

## Research

- Evidence: The package registry exposes every approved target: Prettier 3.9.6, TypeScript 6.0.2 and 7.0.2, React/React DOM 19.2.8, Next.js 16.2.12, and Prisma packages 7.9.1.
- Evidence: TypeScript 6 deprecates `baseUrl`, ES5, and Node 10/classic resolution before TypeScript 7 removes them. Those settings exist on `dev`.
- Evidence: Next.js 16 supports the Pages Router and React 19; static export remains `output: 'export'`.
- Evidence: Prisma 7 requires `prisma.config.ts`, an explicit generated-client output, and a driver adapter.
- Evidence: `apps/quartz` is a root workspace package and therefore participates in formatter and TypeScript compatibility verification.
- Limitation: TypeScript documents the 6-to-7 compiler-option transition, but not this repository's exact side-by-side package alias for JavaScript-API consumers. Layer 5 must prove that bridge locally before accepting it.
- Sources:
  - [TypeScript repository](https://github.com/microsoft/TypeScript)
  - [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
  - [React 19 upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
  - [Prisma 7 upgrade guide](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7)

## Independent plan review

- Reviewer: `agy` with Gemini 3.6 Flash High in read-only plan mode against commit `731ff6f`.
- Result: `DONE`; no scope, topology, or validation changes required.
- Important advisory: Preserve the explicit approval gate before starting disposable PostgreSQL for layer 4. Accepted; already encoded in the plan and goal.
- Minor advisory: Prove the undocumented repository-specific TypeScript 6/7 alias bridge through side-by-side diagnostics in layer 5. Accepted; already encoded in the layer acceptance gate.

## Approved stack

```yaml
feature: major-dependency-upgrades
provider: github
base: dev
mode: progressive

layers:
  - id: 01
    name: formatter-v3
    responsibility: standardize the active workspace on Prettier 3.9.6 and compatible plugins
    depends_on: dev
    reviewer_focus:
      - configuration compatibility and behavior-preserving mechanical formatting
    validation:
      - formatter checks
      - lint and type checks
      - production builds
    activation: complete
    risk: medium
  - id: 02
    name: typescript-6-bridge
    responsibility: remove TypeScript 7-incompatible compiler options under TypeScript 6.0.2
    depends_on: 01
    reviewer_focus:
      - path and module-resolution behavior without deprecation suppression
    validation:
      - every workspace TypeScript check
      - lint, tests, and production builds
    activation: complete
    risk: medium
  - id: 03
    name: website-react-next
    responsibility: upgrade the website to React 19.2.8 and Next.js 16.2.12
    depends_on: 02
    reviewer_focus:
      - Pages Router, static export, webpack, and strict TypeScript behavior
    validation:
      - website type, lint, and production build
      - exported-route browser proof on desktop and mobile
    activation: complete
    risk: medium
  - id: 04
    name: prisma-7
    responsibility: migrate platform and all three games to Prisma 7.9.1 without model changes
    depends_on: 03
    reviewer_focus:
      - generated-client boundaries, adapter lifetime, seed behavior, and schema equivalence
    validation:
      - validate, generate, db push, and seed
      - platform and three-game builds
      - complete three-game Playwright suite
    activation: complete
    risk: high
  - id: 05
    name: typescript-7-native
    responsibility: enable TypeScript 7.0.2 native checks while retaining TypeScript 6 for API consumers
    depends_on: 04
    reviewer_focus:
      - deterministic compiler selection and equivalent TS6/TS7 diagnostics
    validation:
      - clean TypeScript 6 and TypeScript 7 diagnostics
      - all builds, tests, lint, and formatting
    activation: complete
    risk: high
```

## Slices

### Layer 1 — Formatter v3

- Branch: `codex/upgrade-formatters-v3`
- Decision: Pin Prettier 3.9.6 and compatible plugins in every parent-owned formatter consumer.
- Boundary: Keep the clean Quartz submodule on its committed Prettier 3.3.3 resolution. Its own `check` already reports 125 formatting differences at the pinned commit, and forcing 3.9.6 from the parent adds four more; changing those files requires a separately authorized cross-repository commit.
- Do: Keep formatter configuration/toolchain changes separate from mechanical formatting commits.
- Check: Run formatter checks first, prove Quartz retains its baseline formatter result, then run affected lint, type checks, and production builds.
- Commit: `build(format): standardize Prettier 3 toolchain`, followed by a mechanical-formatting commit when needed.

### Layer 2 — TypeScript 6 bridge

- Branch: `codex/upgrade-typescript-6-bridge`
- Decision: Pin TypeScript 6.0.2, remove `baseUrl`, legacy Node resolution, and the Cypress ES5 target, and make new defaults explicit where behavior would otherwise drift.
- Do: Cover Quartz, Cypress, Playwright, examples, packages, games, and website; do not use `ignoreDeprecations`.
- Check: Run every package TypeScript check, lint, tests, and production builds at this layer's tip.
- Commit: `build(typescript): prepare workspace for native compiler`.

### Layer 3 — Website React 19 and Next.js 16

- Branch: `codex/upgrade-website-react-next`
- Decision: Pin React/React DOM 19.2.8 and Next.js 16.2.12 and remove `typescript.ignoreBuildErrors`.
- Do: Preserve Pages Router, static export, webpack, and existing route behavior.
- Check: Build the export and exercise representative routes using the real devrouter path at desktop and mobile viewports; capture screenshots for the PR.
- Commit: `build(website): upgrade to React 19 and Next.js 16`.

### Layer 4 — Prisma 7

- Branch: `codex/upgrade-prisma-7`
- Decision: Pin Prisma CLI/client/adapter 7.9.1, add `prisma.config.ts`, generate clients into explicit outputs, and construct clients through the PostgreSQL adapter.
- Do: Update platform and game imports, client lifetimes, and seeds without changing schema models.
- Risk: Starting disposable PostgreSQL consumes local Docker/devrouter resources and requires a separate approval before execution.
- Check: Validate and generate every schema, run db push and seed against disposable PostgreSQL, build platform and all games, then run all three Playwright suites.
- Commit: `build(prisma): migrate platform and games to Prisma 7`.

### Layer 5 — TypeScript 7 native

- Branch: `codex/upgrade-typescript-7-native`
- Decision: Use TypeScript 7.0.2 for native checks and retain TypeScript 6.0.2 only for ESLint, Jest, and other JavaScript-API consumers.
- Do: Make compiler selection explicit and reproducible; do not rely on ambient binary ordering.
- Check: Compare TS6 and TS7 diagnostics, then run all builds, tests, lint, formatting, and applicable E2E verification.
- Commit: `build(typescript): enable TypeScript 7 native checks`.

## Review and publication

- Check: Commit and independently review this approved plan before implementation.
- Check: After each implementation commit, run separate exact-range correctness and simplification reviews using the repository review rubric.
- Check: Resolve verified findings in the owning layer and re-run its evidence before adding the next branch.
- Check: Submit each active stack as drafts with `gh stack submit --auto --remote origin`; customize and read back every PR title, body, base, head, draft state, and checks.
- Check: Before cascading rebase or sync, create recovery refs for every layer and verify `needsRebase: false` afterward.
- Check: At the completed-stack finish gate, run a bounded code-level security review, the mandatory thermo-nuclear maintainability review, and an independent final branch review.

## Progress

- 2026-07-30 — Gate 1: Approved in the origin session.
- 2026-07-30 — Preparation: Live `dev` verified at `5cac12c`; GitHub stack preview enabled; target versions and migration seams verified; shared devrouter healthy.
- 2026-07-30 — Plan review: Independent read-only review of `731ff6f` returned `DONE`; both advisories were already represented and remain accepted execution gates.
- 2026-07-30 — Layer 1 baseline: The four parent-owned formatter consumers resolve Prettier 3.9.6 with compatible plugins; Quartz remains clean on 3.3.3 with its 125-file pre-existing formatter debt preserved.
- 2026-07-30 — Layer 1 toolchain: Commit `d75524d` passed separate correctness and simplification reviews with no actionable findings.
- 2026-07-30 — Layer 1 verification: All four owned formatter checks pass; Quartz reports the same 125 files as its 3.3.3 baseline; platform, UI, demo-game, website, Rate Wars, and Central Bank production builds pass. Central Bank used `NEXT_PUBLIC_API_URL=http://localhost:3000/api/graphql` for its required static-build input.
- 2026-07-30 — Layer 1 inherited checks: Central Bank's complete check passes. Demo-game and Rate Wars lint with warnings but retain existing TypeScript errors; website retains its existing React 18/19 type split and ESLint 9 flat-config failure. The successful production builds are the behavior gate for this formatter-only layer; layers 2 and 3 own the TypeScript and website remediation.
- 2026-07-30 — Layer 1 mechanical review: Correctness found no actionable issue. Simplification found that generated GraphQL outputs caused 86% of added lines and are overwritten by builds; accepted by ignoring those directories and restoring generator-owned output.
- 2026-07-30 — Layer 1 correction: Commit `22f895d` restores all 12 generated artifacts byte-for-byte to `origin/dev` and excludes only their three generator-owned directories. Separate correctness and simplification reviews found no actionable issue.
- 2026-07-30 — Layer 1 stability: Demo-game, Rate Wars, and Central Bank builds regenerate their GraphQL artifacts successfully; all three formatter checks pass immediately afterward and the worktree stays clean. The rerun used installed pnpm 11.13.1 with the documented one-command `pmOnFail=ignore` override because restricted network access prevented pnpm from downloading the pinned 11.6.0 binary.
- 2026-07-30 — Layer 1 publication: Draft PR [#177](https://github.com/uzh-bf/gbl-uzh/pull/177) targets `dev` from `codex/upgrade-formatters-v3` at `bfedbee`.
- 2026-07-30 — Layer 2 implementation: Commit `398e857` pins TypeScript 6.0.2 across every owned compiler consumer, migrates removed compiler options without suppressing deprecations, adds a parent-owned Quartz compatibility wrapper, preserves the website's React 18 type boundary until layer 3, restores valid UI declarations, and corrects the three game list queries to consume generated schema fields.
- 2026-07-30 — Layer 2 verification: Every TypeScript check, owned package check, production build, Quartz test, empty Jest discovery, UI package verifier, external Next consumer build, and frozen offline install passes. Existing lint-warning baselines remain in the four game and website apps; the host Node 26 runtime also retains Cypress's declared Node 20 engine warning.
- 2026-07-30 — Layer 2 review: Separate exact-commit correctness and simplification reviews found no actionable issue. The reviewers confirmed that the Quartz wrapper, temporary website React type paths, non-rolled UI declarations, minimal `players` query addition, generated client deltas, and lockfile peer-context churn are justified compatibility work.
- 2026-07-30 — Layer 2 publication: Draft PR [#178](https://github.com/uzh-bf/gbl-uzh/pull/178) targets `codex/upgrade-formatters-v3` from `codex/upgrade-typescript-6-bridge`; GitHub readback confirmed the linked stack, draft state, customized metadata, and `needsRebase: false`.
- 2026-07-30 — Layer 3 implementation: Commit `be712f6` pins React/React DOM 19.2.8 and Next.js 16.2.12, removes the build-error suppression, preserves webpack and the Pages Router static export, migrates to ESLint 9 flat configuration, and upgrades the design system and Tailwind stack required by the React 19 runtime.
- 2026-07-30 — Layer 3 verification: The website TypeScript, formatter, and ESLint checks pass with four existing `no-img-element` warnings; the Next.js production build compiles, type-checks, generates all 32 static pages, and exports successfully; a frozen offline install passes.
- 2026-07-30 — Layer 3 browser proof: The real devrouter HTTPS route rendered the home and games pages at 1440×900 and the home page plus open navigation at 390×844 with no application runtime exceptions. Evidence is stored under `project/screenshots/pr-180/`; residual development-only noise is Next.js's HMR `isrManifest` warning and the existing games-page LCP advisory.
- 2026-07-30 — Layer 3 review: Correctness found no actionable issue. Simplification narrowed the Syncpack exception to the four deliberate framework dependencies and the development-origin allowlist to the devrouter website host shape; exact-commit re-review confirmed both findings resolved with no remaining actionable issue.
- 2026-07-30 — Active: Publishing the website React 19 and Next.js 16 layer.
- Next: Add Layer 4, then pause for explicit approval before starting disposable PostgreSQL.

## Expected Gate 3 evidence

- Five linked draft PRs in bottom-to-top review order.
- Per-layer head SHAs, human-authored versus generated delta, verification results, review focus, and residual risk.
- Website desktop/mobile screenshots and route evidence.
- Prisma disposable-database and complete three-game Playwright evidence.
- Whole-stack TS6/TS7, build, test, lint, format, security, maintainability, and final-review results.
- Explicit confirmation that no layer was merged and no production or unrelated runtime was changed.
