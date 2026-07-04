#!/usr/bin/env bash
# Runs once when the dev container is created. Installs deps, builds the
# workspace packages demo-game imports, and prepares the database.
set -euo pipefail
cd /workspaces/gbl-uzh

# DevPod lifecycle hooks receive env_file values truncated at '=' (e.g. a URL
# ...?schema=public arrives as ...?schema), which makes Prisma emit an empty
# search_path. Re-source the canonical env file so values with '=' are intact.
# The starter config points GBL_ENV_FILE at its own env file.
runtime_workspace="${WORKSPACE:-}"
set -a
. "${GBL_ENV_FILE:-/workspaces/gbl-uzh/.devcontainer/devcontainer.env}"
set +a
if [ -n "$runtime_workspace" ]; then
  export WORKSPACE="$runtime_workspace"
fi

# devpod lifecycle hooks run without a TTY. Two pnpm behaviours misbehave there:
#   - CI=true auto-confirms purging a stale/partial node_modules volume (else
#     pnpm aborts: ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY).
#   - verify-deps-before-run=false stops every `pnpm -F ... <script>` (build,
#     prisma:*, dev) from re-running an implicit install that would hang on stdin.
# post-create owns dependency installation, so this verification is redundant.
export CI=true
export npm_config_verify_deps_before_run=false

echo "[post-create] Installing dependencies (pnpm, full workspace)..."
# Full install (not filtered): the design-system's dev-mode src/tailwind.css
# references @tailwindcss/aspect-ratio, which only apps/website declares — a
# filtered demo-game-only install omits it and `next dev` 500s on the DS CSS.
# Skip the Cypress binary (not needed). Tolerate lockfile drift for fresh clones.
export CYPRESS_INSTALL_BINARY=0
pnpm install --no-frozen-lockfile

echo "[post-create] Building workspace deps (platform, ui) so demo-game can import their dist..."
pnpm -F @gbl-uzh/platform build
pnpm -F @gbl-uzh/ui build

echo "[post-create] Copying platform Prisma schema + generating client..."
pnpm -F @gbl-uzh/demo-game prisma:copy
pnpm -F @gbl-uzh/demo-game prisma:generate

# A brand-new Postgres volume has a short warmup window where the Prisma engine
# emits an empty search_path (error 42601) even though pg_isready is healthy.
# Retry generously until push succeeds (a warm DB succeeds on the first try).
echo "[post-create] Pushing schema to the database (retrying through DB warmup)..."
push_ok=0
for attempt in $(seq 1 12); do
  if pnpm -F @gbl-uzh/demo-game prisma:push; then push_ok=1; break; fi
  echo "[post-create] push attempt ${attempt} failed; retrying in 5s..."
  sleep 5
done
if [ "$push_ok" != 1 ]; then
  echo "[post-create] ERROR: prisma push never succeeded" >&2
  exit 1
fi

# Seed is idempotent (upserts), so failing hard is safe on rebuilds — and a
# silently empty database looks like a broken app to a first-time user.
echo "[post-create] Seeding reference data (retrying through DB warmup)..."
seed_ok=0
for attempt in $(seq 1 5); do
  if pnpm -F @gbl-uzh/demo-game prisma:seed; then seed_ok=1; break; fi
  echo "[post-create] seed attempt ${attempt} failed; retrying in 5s..."
  sleep 5
done
if [ "$seed_ok" != 1 ]; then
  echo "[post-create] ERROR: prisma seed never succeeded" >&2
  exit 1
fi

echo "[post-create] Done."
