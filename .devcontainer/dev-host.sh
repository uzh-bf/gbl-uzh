#!/usr/bin/env bash
# Native host dev server for a single game. Run `pnpm bootstrap [game]` once
# before the first start.
#
#   pnpm dev                 # demo game
#   pnpm dev central-bank    # or rate-wars
set -euo pipefail

. .devcontainer/game-target.sh
resolve_gbl_game_target "${1:-}"

# Docker Desktop does not bring the stack back after a restart, so make sure
# Postgres and the OIDC mock answer before the game tries to reach them. The
# container run modes ship their own services and have no docker socket.
if [ ! -f /.dockerenv ] && command -v docker >/dev/null 2>&1; then
  docker compose up -d --wait
fi

# The trailing `...` in the filter also starts the watch builds of the shared
# platform and ui packages, so edits there reach the running game. Only the
# game's own GraphQL documents are watched by codegen, so nodemon restarts the
# whole task when the platform's shared operations change.
exec nodemon -w packages/platform/public --ext graphql \
  --exec "turbo run dev --filter=${GBL_GAME_PACKAGE}..."
