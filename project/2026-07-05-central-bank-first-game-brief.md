# Build a GBL learning game with me — and tell us how it went

You are a coding agent running on the user's own computer (Windows or macOS). The user is **not** a developer. Your job is to take them from *nothing installed* to a **working custom learning game** on the GBL platform (repo: `uzh-bf/gbl-uzh`), and to keep an honest log of how well this repo's onboarding and skills guided you — that feedback is a first-class deliverable, as important as the game.

Work in three phases: **set up the platform**, **build the game**, **write the feedback report**. Optimize for a thin, working, browser-verified slice over polish. Cut scope aggressively for v1 as long as one full game loop runs end to end.

## Phase 1 — Set up the platform (Docker only, no VS Code)

The full reference is `docs/building-with-an-agent.md` (you'll have it once cloned). Essentials:

1. **Ensure a Docker-compatible runtime is installed and running.** Recommended: **[Rancher Desktop](https://rancherdesktop.io/)** on Windows (select the **dockerd/moby** engine), **[OrbStack](https://orbstack.dev/)** or **[Rancher Desktop](https://rancherdesktop.io/)** on macOS. Docker Desktop also works. If nothing is installed, ask the user to install one of these and start it. You can't click through the installer or Windows security prompts for them — guide them, then confirm with `docker version`.
2. **Clone the repo onto their disk** (a normal clone, so you can read and edit the code) and bring the stack up headlessly:

   ```bash
   git clone https://github.com/uzh-bf/gbl-uzh
   cd gbl-uzh
   docker compose -f .devcontainer/starter/docker-compose.yml -p gbl up -d --build
   docker compose -p gbl exec app bash /workspaces/gbl-uzh/.devcontainer/post-create.sh
   docker compose -p gbl exec app bash /workspaces/gbl-uzh/.devcontainer/post-start.sh
   ```

3. **Verify:** `docker compose -p gbl exec app curl -s -o /dev/null -w '%{http_code}' http://localhost:3000` returns `200` (curl runs inside the container, so it works from PowerShell too). Have the user open <http://localhost:3000> and log in at <http://localhost:3000/admin/login> — one click, no password; they become admin `gbl-dev@df.uzh.ch`.
4. **From now on:** edit game code in the host clone (those are the files you can see and edit); run **every** repo command inside the container with `docker compose -p gbl exec app bash -lc 'cd /workspaces/gbl-uzh && <command>'`. Never run `pnpm install` on the host.
5. If anything is off (app won't load, login fails, empty admin UI), invoke the **`gbl-environment-doctor`** skill (run its checks via the exec prefix) before debugging code.

Note anything confusing or broken here — it's feedback.

## Phase 2 — Build the game

**Working title: "Central Bank" — a monetary-policy simulation.** (Rename if you find something punchier.)

Each player (or team) is the governor of their own central bank, steering an economy through several rounds. It teaches the core tradeoff of monetary policy: how the policy interest rate pushes inflation, unemployment, and growth around, and how hard it is to hit an inflation target while keeping people employed.

- **Learning goal:** intuition for the dual mandate — why setting rates under uncertainty is hard, and the inflation/unemployment tradeoff.
- **Round (period):** one policy cycle. Aim for 3–4 periods per session.
- **Player decision (each round):** set your **policy interest rate** — a single number (e.g. 0–10%). One lever only for v1.
- **What the economy does (computed each round):** given the rate and the current state, update **inflation, unemployment, and growth** with a small, hand-checkable response model **plus a seeded random shock** each round, so players must react rather than find one "correct" rate. Rough shape: raising rates cools inflation but lifts unemployment / slows growth (with a lag); lowering does the opposite. Keep the coefficients legible enough to verify a round by hand. There is a fixed **inflation target** (e.g. 2%).
- **Scoring / leaderboard:** each round adds a penalty for missing the mandate, e.g. `(inflation − target)² + λ·(unemployment − natural_rate)²`; lowest cumulative penalty wins. A **leaderboard by cumulative penalty** (or a friendly inverted "score") is the headline results screen.
- **Admin / facilitator:** creates the game, optionally tunes per-round difficulty/shocks, advances rounds, and shows the leaderboard.

**Out of scope for v1** (note them, don't build them): multiple policy levers, achievements / story / learning content, historical scenarios, animation polish.

### Important framing — don't just reskin the demo

The bundled demo game is itself an asset-allocation / portfolio game (players split wealth across cash/bonds/stocks and returns compound). Do **not** pick portfolio allocation and do **not** merely relabel the demo. The point is a game with a **genuinely different mechanic** — a single-lever control loop with a feedback model — so the design → new facts types → new backend computation → new UI path actually gets exercised. If you catch yourself only changing labels, stop and reconsider.

### Use the skills, in this order

Actually invoke/read each skill and the docs it points to rather than working from assumptions. Remember: edit files in the host clone, run commands via the `docker compose -p gbl exec app …` prefix.

1. **`gbl-environment-doctor`** — already used in Phase 1. Re-invoke whenever a later step hits an environment error; run it before debugging application code.
2. **`gbl-game-design` — FIRST, before any code.** Fit-check the Central Bank idea against `docs/game-types.md`, fill in the design mapping (period / segment / decision / facts / roles / computation), and sanity-check the computation against what's available at segment-result and period-result time. Produce the design doc it asks for. Interview the user only where a decision genuinely needs their input.
3. **`gbl-new-game-app`** — scaffold by copying `apps/demo-game` (e.g. `apps/central-bank`), fix the package name, install, point it at a fresh DB. Run the skill's first-run browser verification before writing any new feature.
4. **`gbl-backend-computations`** — implement the six-module `Services` contract: new facts types + yup schemas (`src/types/`), the macro response model in the segment/period result computation (replacing the demo's asset-return math), `Actions.apply` validation for the rate, and seed data (the `PlayerLevel` ladder is mandatory). Hand-verify the numbers for one round.
5. **`gbl-frontend-game-ui`** — build the cockpit: the RUNNING decision form (rate input + current economy state + target), the CONSOLIDATION/RESULTS views (inflation / unemployment vs. target charts), and the **leaderboard** — expected to be genuinely new work, since the platform has no leaderboard today. Reuse `@uzh-bf/design-system` and `@gbl-uzh/ui` components first.
6. **`gbl-playwright-e2e`** — adapt the demo-game lifecycle spec to the new decision + assertions and get one multi-player full-lifecycle run green. **Skip the skill's "Local Stack" section** (it's for the devrouter/DevPod setup) — here the app is already at `http://localhost:3000`; run Playwright inside the container via the exec prefix, installing browsers once with `... exec app bash -lc 'cd /workspaces/gbl-uzh && pnpm exec playwright install --with-deps chromium'`.
7. **`gbl-wiki-maintenance`** — you probably will **not** need this (a new game app doesn't change shared `packages/platform` / `packages/ui` behavior). If you feel pulled to edit `docs/`, note why.

Throughout: **verify in a real browser** (log in as admin, create the game, join as one or two players via the join links, drive a full period → segment → consolidation → results loop) — not just static checks.

Keep the work on a branch with small, clear commits.

## Phase 3 — The feedback report (the real deliverable)

Keep a running log. At the end, write `project/<date>-central-bank-dogfood-feedback.md` covering:

- **Setup (Phase 1)**: were the install + clone + headless bring-up + first-login steps accurate and smooth? Which step caused the most friction? Did anything in `docs/building-with-an-agent.md` mislead you? Did you have to run `gbl-environment-doctor` to recover, and did it work? Could the user have done this without you?
- **Per skill** (`gbl-environment-doctor`, `gbl-game-design`, `gbl-new-game-app`, `gbl-backend-computations`, `gbl-frontend-game-ui`, `gbl-playwright-e2e`, and whether `gbl-wiki-maintenance` came up): did it trigger when it should have? Were its steps accurate against the real code? Where did it help most? Where was it wrong, stale, ambiguous, or missing a step? Did it hand off cleanly to the next skill? Did the "run commands via `docker compose exec`" bridge cause any trouble?
- **Per doc page you used** (`docs/*.md`): was the reading order right? Anything inaccurate or missing?
- **Biggest friction points** — where you had to improvise, guess, or fight the platform. Did the skills help you avoid just reskinning the demo?
- **Did the predictions hold?** e.g. was the leaderboard genuinely new work?
- **Concrete suggested edits** to specific skills/docs (file + exactly what to change), ranked by impact.
- **Honest verdict:** could a non-technical person really have driven this end to end — from nothing installed through a working game — with only a coding agent? Where would they have gotten stuck?

Be candid and specific. "Skill X step 4 said to run Y but the real command is Z" is worth far more than "the skills were helpful."
