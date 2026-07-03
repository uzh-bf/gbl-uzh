#!/usr/bin/env bash
# Runs on every container start. Launches the demo-game dev server in the
# background so the app is reachable without a manual step.
set -euo pipefail
cd /workspaces/gbl-uzh

# See post-create.sh: DevPod truncates env_file values at '='. Re-source the
# canonical env file so the dev server gets correct URLs (?schema=public, etc.).
runtime_workspace="${WORKSPACE:-}"
set -a
. /workspaces/gbl-uzh/.devcontainer/devcontainer.env
set +a
if [ -n "$runtime_workspace" ]; then
  export WORKSPACE="$runtime_workspace"
fi

if [ "${WORKSPACE:-demo-game}" = "demo-game" ]; then
  app_host="demo-game.localhost"
  oidc_host="oidc.demo-game.localhost"
else
  app_host="demo-game.${WORKSPACE}.localhost"
  oidc_host="oidc.demo-game.${WORKSPACE}.localhost"
fi
export NEXTAUTH_URL="https://${app_host}"
export NEXT_PUBLIC_APP_URL="https://${app_host}"
export NEXT_PUBLIC_API_URL="https://${app_host}/api/trpc"
export AUTH0_ISSUER="https://${oidc_host}/default"

# Node honors /etc/hosts for .localhost names; map the active OIDC issuer to
# Traefik on devnet so server-side discovery/token/jwks requests match browser
# URLs. Docker's host-gateway is not reliable under the DevPod Docker provider.
traefik_ip="$(getent hosts devrouter-traefik | awk 'NR == 1 { print $1 }')"
if [ -n "$traefik_ip" ]; then
  hosts_tmp="$(mktemp)"
  grep -v -E '[[:space:]]oidc\.demo-game(\.[^[:space:]]+)?\.localhost$' /etc/hosts >"$hosts_tmp" || true
  cat "$hosts_tmp" >/etc/hosts
  printf '%s\t%s\n' "$traefik_ip" 'oidc.demo-game.localhost' >>/etc/hosts
  if [ "$oidc_host" != "oidc.demo-game.localhost" ]; then
    printf '%s\t%s\n' "$traefik_ip" "$oidc_host" >>/etc/hosts
  fi
  rm -f "$hosts_tmp"
fi

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

printf '[post-start] App      -> %s      (via devrouter; first compile ~30-60s)\n' "$NEXTAUTH_URL"
printf '[post-start] OIDC mock-> %s\n' "$AUTH0_ISSUER"
printf '[post-start] Routes   -> on the host: for a in app oidc db; do dev app run "$a" --yes; done\n'
printf '[post-start] Logs     -> tail -f /tmp/dev.log\n'
