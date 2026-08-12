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
# Postgres and the OIDC mock answer before the game tries to reach them. Say so,
# because this also re-creates a stack you stopped on purpose — and it uses the
# default ports unless GBL_DB_PORT / GBL_OIDC_PORT are set here too. The
# container run modes ship their own services and have no docker socket.
if [ -f /.dockerenv ]; then
  : # already inside a run mode that ships its own services
elif command -v docker >/dev/null 2>&1; then
  echo "[dev] Making sure Postgres and the OIDC mock are up"
  docker compose up -d --wait
else
  echo "[dev] No docker CLI found — expecting Postgres and the OIDC mock" >&2
  echo "[dev] to be reachable at the URLs in the game's .env files." >&2
fi

# The trailing `...` in the filter also starts the watch builds of the shared
# platform and ui packages, so edits there reach the running game. Only the
# game's own GraphQL documents are watched by codegen, so nodemon restarts the
# whole task when the platform's shared operations change.
exec nodemon -w packages/platform/public --ext graphql \
  --exec "turbo run dev --filter=${GBL_GAME_PACKAGE}..."
