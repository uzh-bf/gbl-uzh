#!/usr/bin/env bash
# Native host bootstrap — the host-mode counterpart of post-create.sh, which
# runs the same step list inside the devcontainers. Run it once per game; after
# that `pnpm dev [game]` is enough.
#
#   pnpm bootstrap                 # demo game
#   pnpm bootstrap central-bank    # or rate-wars
set -euo pipefail

. .devcontainer/game-target.sh
resolve_gbl_game_target "${1:-}"

# Docker Desktop does not bring the stack back after a restart, so make sure
# Postgres and the OIDC mock answer before Prisma talks to them. The container
# run modes ship their own services and have no docker socket.
if [ ! -f /.dockerenv ] && command -v docker >/dev/null 2>&1; then
  echo "[bootstrap] Starting Postgres and the OIDC mock"
  docker compose up -d --wait
fi

echo "[bootstrap] Building shared packages"
pnpm -F @gbl-uzh/platform build
pnpm -F @gbl-uzh/ui build

# Prisma creates the per-game database on push, so only the Postgres service
# itself has to exist beforehand.
echo "[bootstrap] Preparing ${GBL_GAME_PACKAGE} database"
pnpm -F "${GBL_GAME_PACKAGE}" prisma:copy
pnpm -F "${GBL_GAME_PACKAGE}" prisma:generate
pnpm -F "${GBL_GAME_PACKAGE}" prisma:push
pnpm -F "${GBL_GAME_PACKAGE}" prisma:seed

echo "[bootstrap] Done. Start the game with: pnpm dev ${GBL_GAME_TARGET}"
