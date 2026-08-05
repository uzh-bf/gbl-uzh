#!/usr/bin/env bash
# Mode-agnostic smoke check: verifies the app and the OIDC mock are up and
# agree on the issuer. Works identically in all three run modes — pass or
# export the URLs of the mode under test:
#
#   host mode (defaults):  bash .devcontainer/smoke.sh
#   starter devcontainer:  bash .devcontainer/smoke.sh   # env carries the URLs
#   devrouter:             bash .devcontainer/smoke.sh https://demo-game.localhost \
#                            https://oidc.demo-game.localhost/default
set -euo pipefail

APP_URL="${1:-${NEXT_PUBLIC_APP_URL:-http://localhost:3000}}"
ISSUER="${2:-${AUTH0_ISSUER:-http://localhost:8090/default}}"

# curl does not read NODE_EXTRA_CA_CERTS; reuse the mkcert CA when present
# (devrouter mode) so https:// checks verify instead of failing.
curl_args=(--fail --silent --show-error --max-time 10)
if [ -n "${NODE_EXTRA_CA_CERTS:-}" ] && [ -f "${NODE_EXTRA_CA_CERTS}" ]; then
  curl_args+=(--cacert "${NODE_EXTRA_CA_CERTS}")
fi

echo "[smoke] OIDC discovery: ${ISSUER}/.well-known/openid-configuration"
discovery="$(curl "${curl_args[@]}" "${ISSUER}/.well-known/openid-configuration")"
if ! printf '%s' "$discovery" | grep -q "\"issuer\" *: *\"${ISSUER}\""; then
  echo "[smoke] FAIL: discovery issuer does not match ${ISSUER}" >&2
  printf '%s\n' "$discovery" | head -c 400 >&2
  exit 1
fi
echo "[smoke] OK: issuer matches"

echo "[smoke] App: ${APP_URL} (first compile can take ~60s)"
for attempt in $(seq 1 30); do
  if curl "${curl_args[@]}" --output /dev/null "${APP_URL}"; then
    app_ok=1
    break
  fi
  app_ok=0
  sleep 5
done
if [ "${app_ok:-0}" != 1 ]; then
  echo "[smoke] FAIL: app never responded at ${APP_URL}" >&2
  exit 1
fi
echo "[smoke] OK: app responds"

echo "[smoke] Admin login page: ${APP_URL}/admin/login"
curl "${curl_args[@]}" --output /dev/null "${APP_URL}/admin/login"
echo "[smoke] OK: admin login page renders"

echo "[smoke] PASS — click the login button on ${APP_URL}/admin/login to complete a one-click login."
