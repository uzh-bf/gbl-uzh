#!/usr/bin/env bash
# Runs on every container start. Launches the demo-game dev server in the
# background so the app is reachable without a manual step.
set -euo pipefail
cd /workspaces/gbl-uzh

# See post-create.sh: DevPod truncates env_file values at '='. Re-source the
# canonical env file so the dev server gets correct URLs (?schema=public, etc.).
set -a
. /workspaces/gbl-uzh/.devcontainer/devcontainer.env
set +a

# No-TTY pnpm hardening (see post-create.sh): keep the dev server from aborting on
# a node_modules purge or hanging on an implicit verify-deps install. post-create
# already installed dependencies.
export CI=true
export npm_config_verify_deps_before_run=false

if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "[post-start] Dev server already running."
  exit 0
fi

echo "[post-start] Starting demo-game dev server in the background (logs: /tmp/dev.log)..."
# Fully detach: new session (setsid) AND redirect the whole command's fds to the
# log / /dev/null. Redirecting only the inner process leaves the wrapper holding
# DevPod's agent pipe open, which hangs `devpod up` until the server exits.
setsid bash -c 'pnpm -F @gbl-uzh/demo-game dev' >/tmp/dev.log 2>&1 </dev/null &
disown 2>/dev/null || true

cat <<'EOF'
[post-start] App      -> https://demo-game.localhost      (via devrouter; first compile ~30-60s)
[post-start] OIDC mock-> https://oidc.demo-game.localhost/default
[post-start] Routes   -> on the host: for a in app oidc db; do dev app run "$a"; done
[post-start] Logs     -> tail -f /tmp/dev.log
EOF
