# Non-Technical Onboarding: Starter Devcontainer + Getting-Started Guide + Environment-Doctor Skill

## Identity

- Plan: `project/2026-07-04-starter-onboarding-plan.md`
- Branch: `claude/starter-onboarding` -> target `dev`
- PR: none yet (rename plan when ID known)
- History: builds on `project/2026-07-03-pr-156-llm-wiki-and-game-skills-plan.md` (merged PR #156: OKF wiki + gbl-* skills)

## Goal

- Problem: wiki + skills (PR #156) make agents capable, but a non-technical human cannot reach a running environment. Current path needs devrouter + DevPod host CLIs, Homebrew, manual route registration, terminal fluency. "Only install Docker" promise is false today.
- Goal: person installs Docker Desktop + VS Code + Dev Containers extension (GUI installs only), opens repo in a self-contained starter devcontainer, and from then on a preinstalled coding agent does all technical work. Works on Windows + macOS. New skill lets the agent self-repair the environment.
- Non-goals: no change to the existing devrouter/DevPod maintainer flow (stays default-capable). No Codespaces support (localhost URL rewriting breaks; follow-up). No scaffold CLI. No tRPC work.

## Research

Source: Workflow run `wf_cedf340c-958` (5 parallel audit agents + live-testing critic), 2026-07-04. Full output: session task `wl5hoibft`.

- Evidence: devcontainer works end-to-end automatically. Critic LIVE-RAN build + post-create on this Mac: clean build, prisma push ok, seed ok (5 PlayerLevel rows, 23 tables), ~72s warm cache. Zero credentials, zero prompts. (`.devcontainer/post-create.sh`, live run)
- Evidence: app is UNREACHABLE without manual host-side devrouter route registration. Live: `https://demo-game.localhost` -> 404 with `next dev` fully up; only `dev app run app/oidc/db --yes` fixes it. This gates everything, not just login. (live curl; `.devcontainer/README.md:29`; `post-start.sh:46`)
- Evidence: compose requires external `devnet` network created by host devrouter CLI before container start. (`docker-compose.yml:119-122`)
- Evidence: worktree checkouts register a DIFFERENT route hostname (`demo-game.<worktree-slug>.localhost`) than the baked-in `demo-game.localhost` env -> 404/502 divergence. Doctor skill must derive URLs, never hardcode. (live `dev ls` + curl)
- Evidence: Windows gaps: (1) no root `.gitattributes`; CRLF checkout breaks lifecycle scripts — reproduced `set: pipefail: invalid option name` (only `packages/platform/.gitattributes` exists); (2) mkcert CA mount defaults to macOS-only path, no Windows override documented (`docker-compose.yml:75-78`); (3) WSL2 requirement documented nowhere.
- Evidence: no AI agent CLI/extension in container (grep zero matches). Anthropic ships official devcontainer feature `ghcr.io/anthropics/devcontainer-features/claude-code:1.0` + reference container; auth survives rebuilds only with named volume for `~/.claude`; browser sign-in with paste-code fallback. (code.claude.com/docs/en/devcontainer)
- Evidence: oidc service shares app netns (`network_mode: service:app`) -> `localhost:8090` valid server-side AND browser-side (published/forwarded). Enables devrouter-free HTTP mode. (`docker-compose.yml:88-90`)
- Evidence: plain-HTTP OIDC login is ALREADY PROVEN in CI: playwright-testing.yml runs the full admin login with `NEXTAUTH_URL=http://127.0.0.1:3000`, `AUTH0_ISSUER=http://oidc:8090/default`. (`.github/workflows/playwright-testing.yml:39-45`; found by plan review)
- Evidence: footguns agents/novices hit: stale `apps/demo-game/docker-compose.yml` (publishes 80/443/8080/5432, collides with devrouter), `_run.sh` + `apps/demo-game/_run.sh` invoke it, stale npm-based README sections. Seed is best-effort (no exit 1) -> silent empty DB possible. Filtered install breaks design-system CSS (`post-create.sh:28-33`). Prisma 42601 = warmup race, not config bug (`post-create.sh:43-56`). DevPod truncates env_file values at `=` (`post-create.sh:7-16`).
- Evidence: no CI references to `apps/demo-game/docker-compose.yml` or `_run.sh` (grep `.github/`, package.jsons, playwright/ -> zero hits) -> deletion safe from CI's perspective.
- Limitation: Windows never live-tested (no Windows machine here). Design removes Windows-specific deps instead; manual verification item.
- Limitation: `devpod up` behavior not exercised; irrelevant for starter path (VS Code Dev Containers), stays maintainer-only.
- Limitation: official claude-code feature vs compose-delegated devcontainer.json compatibility unverified -> test in S3, fallback = Dockerfile install (proven pattern).
- Limitation: cold-start timing unknown (72s was warm). Measure in S7 before writing wait-time copy.
- Limitation: VS Code config-picker + clone-in-volume UX cannot be driven headlessly -> devcontainer-CLI checks in S2/S3, GUI flow = manual verification (guide ships screenshots).

## Decisions

- Decision: bypass devrouter for beginners, do not automate it. New self-contained config `.devcontainer/starter/`: own network, PUBLISHED localhost ports, plain HTTP env. Existing config untouched.
- Decision (plan review): starter compose PUBLISHES `127.0.0.1:3000:3000` and `127.0.0.1:8090:8090` instead of relying on `forwardPorts`. Fixes two review Criticals: exact port identity for auth URLs (no VS Code remap risk) and testability with plain `docker compose` (forwardPorts only works under devcontainer tooling). `portsAttributes` kept for labels/openBrowser UX.
- Decision (plan review): lifecycle scripts get parameterized, default-preserving hooks: env file via `GBL_ENV_FILE` (default `.devcontainer/devcontainer.env`) and a starter-mode guard around post-start's devrouter URL rewrite. Maintainer path byte-identical when vars unset.
- Decision: starter lives in subfolder (VS Code shows config picker); flipping it to default is a fallback if picker UX fails validation (would touch maintainer flow — user decides then). Mitigation: starter config `name` says "start here".
- Decision: entry flow = "Dev Containers: Clone Repository in Container Volume" -> no host git/Node/Homebrew, avoids Windows bind-mount perf + most CRLF risk.
- Decision: preinstall Claude Code only (CLI + VS Code extension + auth-persistence volume); guide says any agent works.
- Decision: minimal `.gitattributes` (`*.sh`, `*.env`, `*.sql` -> LF), no repo-wide renormalization churn.
- Decision: KEEP footgun deletion (review suggested cutting as scope creep). Pushback rationale: research showed agents repeatedly discover the stale compose stack and it actively collides with both flows; user-approved in proposal; isolated in its own commit for easy revert.
- Decision: skill name `gbl-environment-doctor`.
- Decision: independent reviews via Codex CLI, not agy (user killed agy review last session: "it wont ever finish").

## Risks

- Risk: http-issuer login — largely retired by CI precedent (playwright-testing.yml). Residual: dual-namespace localhost + published-port exactness -> S2 live login check stays the tracer bullet.
- Risk: port 3000/8090 already taken on user host -> published bind fails with clear error; doctor skill gets the signature. Accepted (rare for target audience).
- Risk: shared-script edits break devrouter flow -> guards default to current behavior; verify with bash -n + simulated default-mode env diff; residual risk called out in PR for maintainer re-test.
- Risk: seed silently empty -> S2 decides hard-fail vs loud-warning based on seed.ts idempotency check (hard-fail only if re-runnable); doctor checks `PlayerLevel` rows either way.
- Risk: deleting `apps/demo-game/docker-compose.yml` breaks something unseen -> CI grep clean; own commit; revertable.
- Risk: Windows untested -> explicit manual-verification item in PR body.

## Slices

### S1: Root .gitattributes

- Do: root `.gitattributes`: `*.sh text eol=lf`, `*.env text eol=lf`, `*.sql text eol=lf`.
- Check: `git check-attr` on `.devcontainer/*.sh`; `git status` clean (files already LF).
- Commit: `chore: enforce LF line endings for shell/env/sql files`

### S2: Starter devcontainer config (tracer bullet)

- Do: `.devcontainer/starter/devcontainer.json` + `docker-compose.yml` + `starter.env`. Reuse existing Dockerfile + lifecycle scripts via parameterization (above). Paths from starter/: build context `..` (dockerfile `Dockerfile`), init sql `../docker/init-shadow-db.sql`, workspace bind `../..:/workspaces/gbl-uzh`. Own bridge network (no devnet), no mkcert mount, no extra_hosts. Ports published `127.0.0.1:3000:3000`, `127.0.0.1:8090:8090`. `portsAttributes`: 3000 label "Demo Game" openBrowser, 8090 label "Login service" silent. starter.env: `GBL_DEV_MODE=starter`, `NEXTAUTH_URL=http://localhost:3000`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`, `NEXT_PUBLIC_API_URL=http://localhost:3000/api/graphql`, `AUTH0_ISSUER=http://localhost:8090/default`, same DB URLs/client creds, no NODE_EXTRA_CA_CERTS. Seed: check `prisma/seed.ts` idempotency -> hard-fail or loud-warn + summary line.
- Check (order): (1) `docker compose config` valid for BOTH compose files; (2) `bash -n` both scripts + simulated default-mode env parity (no devrouter regression); (3) live `up -d` under isolated project `gbl-starter-check`; (4) run post-create + post-start inside; (5) `curl -sf http://127.0.0.1:3000` -> HTML; (6) `curl -sf http://127.0.0.1:8090/default/.well-known/openid-configuration` -> issuer `http://localhost:8090/default`... (verify host-consistency); (7) admin login end-to-end via browser tool (go/no-go); (8) `npx @devcontainers/cli read-configuration` on starter config; (9) teardown test project.
- Commit: `feat(devcontainer): add self-contained starter configuration (no devrouter)`

### S3: Claude Code preinstalled in starter

- Do: try `features: { "ghcr.io/anthropics/devcontainer-features/claude-code:1.0": {} }` in starter devcontainer.json; verify with `npx @devcontainers/cli up --config .devcontainer/starter/devcontainer.json` (plain docker compose ignores features). If incompatible: install CLI via starter-only step (Dockerfile build arg or starter post-create hook). Add `anthropic.claude-code` to customizations. Named volume for the container user's `~/.claude` so sign-in survives rebuilds.
- Check: `claude --version` inside built container; volume persists across rebuild; maintainer config untouched.
- Commit: `feat(devcontainer): preinstall Claude Code in starter config`

### S4: docs/getting-started.md

- Do: new OKF concept page, plain language, screenshots-ready structure: what you need (Docker Desktop / VS Code / Dev Containers extension, install links, Windows WSL2 note), clone-in-container-volume walkthrough incl. config picker ("choose GBL Starter"), what the first boot looks like + realistic wait (from S7), one-click mock login (who you are: gbl-dev@df.uzh.ch), 3 example first prompts for the agent, "when stuck: tell your agent to run a health check". Link sites: `docs/index.md` (first bullet), root `README.md` (new Getting Started section), `AGENTS.md`, `apps/demo-game/README.md` banner, `docs/developing-a-game.md` step 5 simplification. House rules: frontmatter, index entry, `log.md` entry, timestamps.
- Check: prettier `--no-config` via demo-game; embedded python OKF/link checker from `gbl-wiki-maintenance`.
- Commit: `docs: add plain-language getting-started guide for game builders`

### S5: gbl-environment-doctor skill

- Do: `.agents/skills/gbl-environment-doctor/SKILL.md`. Content: (1) detect mode (starter vs devrouter: `GBL_DEV_MODE`, URL reachability; derive devrouter URLs from `dev ls`, never hardcode); (2) ordered health checks (container? `pgrep next dev`? `/tmp/dev.log` tail? app URL 200? OIDC discovery 200? `PlayerLevel` row count > 0? full workspace install present?); (3) symptom->cause->fix table from research signatures (404 devrouter routes; port already allocated on 3000/8090; 42601 warmup; empty DB seed; CRLF `pipefail` error; DevPod `=` truncation; filtered-install CSS 500; stale compose collision; Playwright browsers absent in devcontainer image); (4) human-must-do list in plain copy-paste language (Docker Desktop not running, WSL2 features, BIOS virtualization) with vendor links. Routing: one-line preamble in AGENTS.md + `gbl-game-design`/`gbl-new-game-app`/`gbl-playwright-e2e`: "app unreachable or env broken -> gbl-environment-doctor first".
- Check: frontmatter matches `.agents/skills` convention; dry-run each health-check command inside the starter container from S2.
- Commit: `feat(skills): add gbl-environment-doctor troubleshooting skill`

### S6: De-footgun cleanup + doc accuracy

- Do: delete `apps/demo-game/docker-compose.yml`, `_run.sh`, `apps/demo-game/_run.sh` (CI grep already clean); replace stale demo-game README local-setup/troubleshooting sections with pointer (banner stays); root README: Getting Started link + requirements fixed (Docker-only for starter path; Node/pnpm only for bare-metal work); `.devcontainer/README.md`: document both configs + Windows mkcert CAROOT note for devrouter path; wiki `log.md` entries + timestamp bumps for touched concepts.
- Check: grep zero remaining references to deleted files; prettier + OKF checker on touched docs.
- Commit: `chore: remove stale local-dev footguns, align onboarding docs`

### S7: End-to-end validation + finish gate

- Do: cold-ish validation on this Mac: fresh compose project + fresh volumes (`--no-cache` build, new project name), starter flow only, no devrouter. Measure first-boot wall time -> patch getting-started copy. Browser-tool run of naive-user script: open http://localhost:3000, one-click login, screenshot login + admin cockpit for PR. Confirm skills discoverable in container (`npx @tanstack/intent list`). GUI picker/clone-in-volume: manual-verification item (headless limit).
- Then finish gate: security review subagent (scope: new env surface, committed dev creds stay dev-only, doctor skill no dangerous commands); independent final branch review via Codex; `$df-mr-description-writer` draft PR -> `dev` with screenshots + explicit "Windows manual verification" item.
- Commit: fixes as needed + PR.

## Progress

- [x] S1 .gitattributes — attributes verified via `git check-attr`, zero churn; commit `b6126252`. (Trivial slice: covered by plan review, no separate subagents.)
- [x] S2 starter devcontainer — TRACER PASSED: live stack under project `gbl-starter-check`: post-create 86s on fresh volumes (seed hard-fail added; seed.ts verified idempotent/upserts), app 200 at ~106s, OIDC discovery ok, FULL admin login via curl cookie jar -> session `gbl-dev@df.uzh.ch` role ADMIN over plain http/localhost. `docker compose config` valid both files; `bash -n` clean; devcontainer CLI `read-configuration` resolves starter config. Review subagent: no Critical/Important (maintainer parity confirmed; portsAttributes applies to published ports per spec; note: default `overrideCommand` collides harmlessly with `command: sleep infinity` — watch in S3). Simplify subagent: clean; 2 comment improvements applied (GBL_ENV_FILE purpose, JSON_CONFIG keep-in-sync notes both compose files). Test stack left running for S3/S5 checks; teardown in S7.
- [x] S3 Claude Code preinstall — official feature `ghcr.io/anthropics/devcontainer-features/claude-code:1.0` IS compatible with the compose-delegated config (open question resolved, no Dockerfile fallback needed). Live-verified via `devcontainer up` (outcome success, 99s, project `starter`): `claude --version` -> 2.1.201 inside container; `/root/.claude` mounted from named volume `starter_claude_config`; app 200 + issuer exact through the same stack. `anthropic.claude-code` added to VS Code extensions. Micro-slice (~10 lines): live verification + compose/CLI validation in lieu of per-slice subagents; covered by S7 final branch review.
- [x] S4 getting-started page — docs/getting-started.md + link sites (docs/index.md first bullet, docs/log.md entries, README.md Getting Started + Requirements reframe [pulled forward from S6], AGENTS.md pointer, demo-game README banner, developing-a-game.md step 5 rewrite + timestamp bump). prettier --no-config + OKF checker -> OKF OK. Review subagent: no Critical/Important; all factual claims verified against code (config name, ports, login identity, clone URL, join flow); 2 Minor deferred (GUI Ports-panel claim un-drivable headlessly -> S7 manual item; 10-20min wait copy = placeholder to true-up after S7 cold measurement). Simplify subagent: accepted cuts applied (runtime table + For-developers section removed, WSL2 note compressed; kept uninstall reassurance line). Note: prettier normalized all of apps/demo-game/README.md (was unnormalized); churn transient, S6 rewrites those sections.
- [x] S5 gbl-environment-doctor skill — SKILL.md with mode detection (never hardcode devrouter hostnames), 6 ordered health checks, signature table, human-must-do list; routing preambles in AGENTS.md + gbl-game-design + gbl-new-game-app + gbl-playwright-e2e. All commands dry-run PASSED inside the live starter container (pgrep/curl/tsx PlayerLevel count rows:5 exit 0; python3 confirmed absent from image and unused by skill). Review subagent: 1 Critical fixed ("removed from the repo" claim was false pre-S6 -> reworded to "superseded"); all signature rows verified against source; no dangerous commands. Simplify subagent: 1 accepted cut applied (empty-DB row duplicated Step-1 check 5).
- [x] S6 footgun cleanup — deleted apps/demo-game/docker-compose.yml + both _run.sh + orphaned apps/demo-game/util/ (Traefik config consumed only by the deleted compose; found by review subagent, folded in). Demo-game README stale sections -> devcontainer pointers, banner reworded truthfully; .devcontainer/README.md now names both configs + Linux/Windows mkcert CAROOT overrides; maintainer compose comment-only edit (rendered `docker compose config` verified byte-identical). Review subagent: repo-wide reference grep clean (only intentional doctor-skill row), Auth0 section byte-identical, all links resolve; 1 Minor (util/ orphan) accepted + applied. Root-README item was done in S4. Feature lockfile committed separately (claude-code 1.0.5 digest-pinned).
- [x] S7 validation + finish gate (PR pending below) — Cold-ish rerun (fresh project `gbl-cold-check`, `--no-cache` build, fresh volumes): build 15s, post-create 96s, app 200 at 118s total (~2 min; base images pre-pulled + fast network -> guide copy set to "typically 5-15 minutes"). REAL-BROWSER naive-user run via agent-browser: /admin/login -> one-click sign-in -> /admin/games authenticated -> created "Starter Validation Game" (Id 1, SCHEDULED) through the UI; screenshots committed under project/screenshots/. Security review subagent: DONE, no Critical/Important; deletions net security improvement (old compose exposed LAN Postgres + insecure Traefik dashboard); loopback-only binds verified; starter.env same dev-only class as existing env. KNOWN GAP (pre-existing, not this branch): `npx @tanstack/intent list` finds no skills anywhere (host + container, 1060 package.jsons scanned, 0 intent-enabled) — agents rely on AGENTS.md prose paths instead; spun off as separate task chip. Test stacks torn down (starter, gbl-cold-check, gbl-starter-check + volumes); user's own default-gb-a3e67 DevPod stack untouched. Generated-file test artifacts (platform.prisma binaryTargets, ops.ts) reverted.

## Plan Review

- Reviewer: Codex CLI (`codex exec`, read-only, 2026-07-04; agy skipped per user decision last session). Verdict: DONE_WITH_CONCERNS. Dispositions:
  - Critical "curl after plain compose invalid (forwardPorts != compose)" -> ACCEPTED: starter publishes 127.0.0.1 ports; forwardPorts dropped as mechanism, portsAttributes kept for UX.
  - Critical "port remap breaks fixed auth URLs" -> ACCEPTED: published exact ports remove remap; NEXTAUTH_URL/NEXT_PUBLIC_APP_URL/AUTH0_ISSUER stay literal.
  - Important "lifecycle scripts hard-source devcontainer.env + rewrite URLs" -> ACCEPTED: GBL_ENV_FILE parameter + starter-mode guard, defaults byte-identical.
  - Important "starter compose relative paths wrong if copied" -> ACCEPTED: context `..`, `../docker/...`, `../..:/workspaces/gbl-uzh` specified in S2.
  - Important "don't break devrouter via shared scripts" -> ACCEPTED: default-preserving guards + parity check in S2, maintainer re-test noted in PR.
  - Important "seed should hard-fail for novices" -> PARTIAL: decide by seed idempotency in S2 (hard-fail only if re-runnable), else loud warning + doctor row-count check.
  - Important "validate picker earlier" -> PARTIAL: devcontainer-CLI checks pulled into S2/S3; GUI picker is un-drivable headlessly -> named config + screenshots + manual verification.
  - Important "http issuer already proven in CI" -> INTEGRATED as evidence (de-risks tracer).
  - Minor "footgun deletion = scope creep, cut" -> REJECTED with rationale (agents repeatedly hit these; user-approved; isolated commit).
  - Minor "no CI guard for starter devcontainer" -> DEFERRED to Follow-Up (devcontainer build job on .devcontainer/** changes).

## Next Steps / Manual Verification (expected at end)

- Windows end-to-end test (Docker Desktop + WSL2 + clone-in-volume) — cannot be done from this machine.
- VS Code GUI: config picker shows both configs, "GBL Starter" clearly selectable; clone-in-volume works with compose-based config.
- Decide picker vs default-flip after seeing validation UX.
- Follow-up: CI job running `devcontainer build` for `.devcontainer/**` changes.
- Cleanup of merged PR #156 worktree/branch still pending separate approval.
