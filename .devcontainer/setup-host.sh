#!/usr/bin/env bash
# Native host bootstrap — the host-mode counterpart of post-create.sh, which
# runs the same step list inside the devcontainers. Select the game with
# GBL_GAME_TARGET (demo, central-bank, rate-wars); defaults to demo.
#
#   docker compose up -d --wait          # Postgres + OIDC mock first
#   pnpm run setup:host                  # demo game
#   GBL_GAME_TARGET=central-bank pnpm run setup:host
set -euo pipefail

. .devcontainer/game-target.sh
resolve_gbl_game_target

echo "[setup:host] Building shared packages"
pnpm -F @gbl-uzh/platform build
pnpm -F @gbl-uzh/ui build

# Prisma creates the per-game database on push, so only the Postgres service
# itself has to exist beforehand.
echo "[setup:host] Preparing ${GBL_GAME_PACKAGE} database"
pnpm -F "${GBL_GAME_PACKAGE}" prisma:copy
pnpm -F "${GBL_GAME_PACKAGE}" prisma:generate
pnpm -F "${GBL_GAME_PACKAGE}" prisma:push
pnpm -F "${GBL_GAME_PACKAGE}" prisma:seed

echo "[setup:host] Done. Start the game with: pnpm -F ${GBL_GAME_PACKAGE} dev"
