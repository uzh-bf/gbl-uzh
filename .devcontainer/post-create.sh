#!/usr/bin/env bash
# Runs once when the dev container is created. Installs deps, builds shared
# workspace packages, and prepares the selected game's database.
set -euo pipefail
cd /workspaces/gbl-uzh

# DevPod lifecycle hooks receive env_file values truncated at '=' (e.g. a URL
# ...?schema=public arrives as ...?schema), which makes Prisma emit an empty
# search_path. Re-source the canonical env file so values with '=' are intact.
# The starter config points GBL_ENV_FILE at its own env file.
runtime_workspace="${WORKSPACE:-}"
runtime_game_target="${GBL_GAME_TARGET:-}"
set -a
. "${GBL_ENV_FILE:-/workspaces/gbl-uzh/.devcontainer/devcontainer.env}"
set +a
if [ -n "$runtime_workspace" ]; then
  export WORKSPACE="$runtime_workspace"
fi
if [ -n "$runtime_game_target" ]; then
  export GBL_GAME_TARGET="$runtime_game_target"
fi
. .devcontainer/game-target.sh
resolve_gbl_game_target

# DevPod lifecycle hooks run without a TTY. CI mode auto-confirms replacing a
# stale node_modules volume; post-create owns installation, so disable pnpm's
# redundant install-before-script check.
export CI=true
# The full workspace install can exceed Node's default heap on a fresh
# devcontainer. Keep the override configurable for smaller hosts/CI runners.
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"
pnpm config set verify-deps-before-run false >/dev/null

echo "[post-create] Installing dependencies (pnpm, full workspace)..."
# Full install (not filtered): the design-system's dev-mode src/tailwind.css
# references @tailwindcss/aspect-ratio, which only apps/website declares — a
# filtered demo-game-only install omits it and `next dev` 500s on the DS CSS.
# Skip the Cypress binary (not needed). Tolerate lockfile drift for fresh clones.
export CYPRESS_INSTALL_BINARY=0
pnpm install --no-frozen-lockfile

echo "[post-create] Building shared workspace deps (platform, ui)..."
pnpm -F @gbl-uzh/platform build
pnpm -F @gbl-uzh/ui build

echo "[post-create] Copying platform Prisma schema + generating client for ${GBL_GAME_PACKAGE}..."
pnpm -F "$GBL_GAME_PACKAGE" prisma:copy
pnpm -F "$GBL_GAME_PACKAGE" prisma:generate

# A brand-new Postgres volume has a short warmup window where the Prisma engine
# emits an empty search_path (error 42601) even though pg_isready is healthy.
# Retry generously until push succeeds (a warm DB succeeds on the first try).
echo "[post-create] Pushing schema to the database (retrying through DB warmup)..."
push_ok=0
for attempt in $(seq 1 12); do
  if pnpm -F "$GBL_GAME_PACKAGE" prisma:push; then push_ok=1; break; fi
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
  if pnpm -F "$GBL_GAME_PACKAGE" prisma:seed; then seed_ok=1; break; fi
  echo "[post-create] seed attempt ${attempt} failed; retrying in 5s..."
  sleep 5
done
if [ "$seed_ok" != 1 ]; then
  echo "[post-create] ERROR: prisma seed never succeeded" >&2
  exit 1
fi

echo "[post-create] Done."
