# PR 144 tRPC Migration Finish Plan

Date: 2026-06-17

Branch: `codex/trpc-migration-work-packages`

Target: `dev`

PR: #144, `feat: migrate demo-game and platform from GraphQL to tRPC v11`

Worktree: `/Users/rschlae/Git/gbl/gbl-uzh/.claude/worktrees/pensive-dhawan-df481b`

History:

- `project/trpc-migration-plan.md`
- `project/trpc-migration-work-packages/*.md`
- Handoff: `/var/folders/24/j7k2mlqn42l_dhq64jpqslxh0000gp/T/handoff-demo-game-react-compiler-turbopack-2026-06-17.md`

## Goal

Finish PR #144 after tRPC migration work:

- Prove demo-game/platform migration remains correct.
- Fix merge-blocking CI/deploy/quality checks.
- Keep website upgrade out of scope.
- Prepare PR body and evidence for merge.

## Non-Goals

- No website Next 16 / React 19 / DS v4 / Tailwind 4 upgrade.
- No new feature behavior.
- No broad refactors.
- No dependency major upgrades beyond already-merged branch state.
- No push without explicit user approval.

## Current Evidence

- Branch clean at `c19a751`.
- PR #144 mergeable.
- PR checks:
  - `lint`: pass.
  - `build`: cancelled after 6h, not normal compile failure.
  - `Vercel`: fail.
  - `SonarCloud Code Analysis`: fail.
  - `SonarCloud`: pass.
- Local handoff says demo-game dev/build/font/prettier were verified before push.
- Local diff already removes demo-game GraphQL/Apollo/codegen surface and platform GraphQL compatibility files.

## Assumptions

- Platform GraphQL compatibility removal remains acceptable unless evidence shows external consumers still need it.
- Vercel failure may be website-scope or monorepo config, not necessarily demo-game code.
- CI Docker build failure likely caused by workflow timeout/multi-arch push behavior on PR.
- Existing default-branch Dependabot/security debt is out of this PR unless directly introduced.

## Skill Routing

- `df-sliced-development-workflow`: owns this plan, progress, slice cadence, final review.
- `diagnose`: use for CI/Vercel/Sonar blockers if root cause is unclear.
- `verification-before-completion`: use before claiming any slice done.
- `security-review`: mandatory before PR finish.
- `df-mr-description-writer`: use before updating PR body.

## Progress

- 2026-06-17: Plan file created. Next: Slice 1, diagnose CI build timeout.

## Slice 1: CI Build Timeout

Problem:

- GitHub Actions `build` job for `demo-game.yml` cancelled after 6h.
- Workflow currently builds and pushes multi-arch Docker image on PR.

Do:

- Inspect Dockerfile and workflow behavior.
- Reproduce fastest useful local build path.
- Change workflow only if root cause is workflow design, not app code.
- Likely fix: PR builds use single platform and `push: false`; branch pushes keep multi-arch push.
- Keep Dockerfile changes minimal, only if local build proves actual Docker issue.

Files:

- `.github/workflows/demo-game.yml`
- `apps/demo-game/Dockerfile` only if required.

Check:

- `pnpm -F @gbl-uzh/demo-game build`
- Docker build command scoped to demo-game image if feasible.
- `gh pr checks 144` after push only when user approves push.

Commit boundary:

- `ci(demo-game): avoid multi-arch image push on pull requests`

## Slice 2: Vercel Failure

Problem:

- Vercel deployment failed.
- Handoff suspects website app or monorepo build target.

Do:

- Inspect Vercel deployment logs.
- Identify project root/build command/output target.
- If failure belongs to website upgrade debt, adjust Vercel scope/config without upgrading website.
- If failure belongs to demo-game, fix minimal Next 16/build/env issue.

Files:

- Vercel config if present or required.
- App package config only if logs point there.

Check:

- `npx vercel inspect dpl_4Kkuc3xFWayEoZBTgYMz6f3Lz5z3 --logs`
- Matching local build command.

Commit boundary:

- `ci(vercel): fix preview build target` or narrower actual cause.

## Slice 3: SonarCloud And Cleanup Audit

Problem:

- SonarCloud Code Analysis fails while SonarCloud action also passes.
- Branch has large deletion/addition count; quality gate may flag new issues or coverage/duplication.

Do:

- Inspect SonarCloud failure details.
- Fix only new issues caused by this branch.
- Audit stale GraphQL references in scripts/config.
- Remove or update stale active config, not historical project docs.

Files:

- Files named by SonarCloud.
- Root/package scripts if stale GraphQL watchers remain active.

Check:

- `rg -n "@apollo/client|graphql-yoga|graphql-sse|graphql-codegen|src/graphql/generated|/api/graphql" apps/demo-game packages/platform package.json pnpm-lock.yaml`
- Relevant lint/type/build command for touched app/package.

Commit boundary:

- `fix(trpc): clean remaining migration blockers`

## Slice 4: Local Verification And Runtime Smoke

Problem:

- Branch needs current end-to-end evidence after blocker fixes.

Do:

- Run platform and demo-game checks.
- Start devcontainer demo-game server.
- Verify headed browser pages:
  - `/admin/games`
  - `/admin/games/2`
  - `/admin/reports/<known-id>` if seeded data supports it.
  - `/join/<known-token>` / player flow if seeded data supports it.
  - `/play/welcome`
  - `/play/cockpit`
- Capture screenshots if PR body needs them.

Check:

- `pnpm -F @gbl-uzh/platform build`
- `pnpm -F @gbl-uzh/demo-game check`
- `pnpm -F @gbl-uzh/demo-game test`
- `pnpm -F @gbl-uzh/demo-game build`
- Browser console: no hydration/runtime errors.

Commit boundary:

- No code commit unless fixes are required. Plan progress update may commit separately only with user approval.

## Slice 5: Review And PR Finish Prep

Problem:

- PR body does not cover latest React Compiler/Turbopack/prettier commits.
- Mandatory final reviews still needed.

Do:

- Run review subagent.
- Run simplification subagent.
- Run security review.
- Handle findings or record explicit deferrals.
- Use `df-mr-description-writer` for PR body draft.
- Do not push/update PR without explicit user approval.

Check:

- `git log origin/dev..HEAD --oneline`
- `git diff --stat origin/dev...HEAD`
- `git diff --name-status origin/dev...HEAD`
- Final `gh pr checks 144` after any approved push.

Commit boundary:

- `docs(project): update PR 144 finish progress` if progress file changes need committing.

## Next Steps

1. Slice 1: diagnose/fix CI build timeout.
2. Slice 2: diagnose/fix Vercel.
3. Slice 3: diagnose/fix Sonar and stale active GraphQL config.
4. Slice 4: full local/runtime verification.
5. Slice 5: reviews and PR body prep.
