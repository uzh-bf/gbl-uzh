#!/usr/bin/env bash
# Runs on every container start. Launches the selected game dev server in the
# background so the app is reachable without a manual step.
set -euo pipefail
cd /workspaces/gbl-uzh

# See post-create.sh: DevPod truncates env_file values at '='. Re-source the
# canonical env file so the dev server gets correct URLs (?schema=public, etc.).
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

# Starter mode serves plain http on published localhost ports; its env file
# already carries the final URLs, so the devrouter workspace-host rewrite
# must not overwrite them.
if [ "${GBL_DEV_MODE:-}" != "starter" ]; then
  if [ "${WORKSPACE:-demo-game}" = "demo-game" ]; then
    app_host="demo-game.localhost"
  else
    app_host="demo-game.${WORKSPACE}.localhost"
  fi
  export NEXTAUTH_URL="https://${app_host}"
  export NEXT_PUBLIC_APP_URL="https://${app_host}"
  export NEXT_PUBLIC_API_URL="https://${app_host}/api/graphql"
fi

# No-TTY pnpm hardening (see post-create.sh): keep the dev server from aborting on
# a node_modules purge or hanging on an implicit verify-deps install. post-create
# already installed dependencies.
export CI=true
export npm_config_verify_deps_before_run=false

if pgrep -f "pnpm.*-F ${GBL_GAME_PACKAGE} dev" >/dev/null 2>&1; then
  echo "[post-start] ${GBL_GAME_PACKAGE} dev server already running."
  exit 0
fi
if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "[post-start] Another Next dev server is already using this container; expected ${GBL_GAME_PACKAGE}." >&2
  exit 1
fi

echo "[post-start] Starting ${GBL_GAME_PACKAGE} dev server in the background (logs: /tmp/dev.log)..."
# Fully detach: new session (setsid) AND redirect the whole command's fds to the
# log / /dev/null. Redirecting only the inner process leaves the wrapper holding
# DevPod's agent pipe open, which hangs `devpod up` until the server exits.
setsid bash -c "pnpm -F ${GBL_GAME_PACKAGE} dev" >/tmp/dev.log 2>&1 </dev/null &
disown 2>/dev/null || true

if [ "${GBL_DEV_MODE:-}" = "starter" ]; then
  printf '[post-start] App      -> %s      (first compile ~30-60s)\n' "$NEXTAUTH_URL"
  printf '[post-start] OIDC mock-> %s\n' "$AUTH0_ISSUER"
else
  printf '[post-start] App      -> %s      (via devrouter; first compile ~30-60s)\n' "$NEXTAUTH_URL"
  printf '[post-start] OIDC mock-> %s\n' "$AUTH0_ISSUER"
  printf '[post-start] Routes   -> on the host: for a in app oidc db; do dev app run "$a" --yes; done\n'
fi
printf '[post-start] Logs     -> tail -f /tmp/dev.log\n'
