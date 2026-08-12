#!/usr/bin/env bash
# Mode-agnostic smoke check: verifies the app and the OIDC mock are up and
# agree on the issuer. Works identically in all three run modes — pass or
# export the URLs of the mode under test:
#
#   host mode (defaults follow PORT / GBL_OIDC_PORT overrides):
#                          bash .devcontainer/smoke.sh
#   starter devcontainer:  bash .devcontainer/smoke.sh   # env carries the URLs
#   devrouter (container): bash .devcontainer/smoke.sh http://localhost:3000 \
#                            https://oidc.demo-game.localhost/default
set -euo pipefail

APP_URL="${1:-http://localhost:${PORT:-3000}}"
ISSUER="${2:-${GBL_MOCK_OIDC_ISSUER:-http://localhost:${GBL_OIDC_PORT:-8090}/default}}"
. .devcontainer/game-target.sh
resolve_gbl_game_target
GAME_PACKAGE="${GBL_GAME_PACKAGE}"

echo "[smoke] OIDC discovery: ${ISSUER}/.well-known/openid-configuration"
# Node uses NODE_EXTRA_CA_CERTS and the container's host mapping in devrouter
# mode, matching the server-side OIDC path used by NextAuth.
node --input-type=module -e '
  const issuer = process.argv[1]
  const response = await fetch(`${issuer}/.well-known/openid-configuration`, {
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`OIDC discovery returned ${response.status}`)
  const discovery = await response.json()
  if (discovery.issuer !== issuer) throw new Error("OIDC discovery issuer mismatch")
' "$ISSUER"
echo "[smoke] OK: issuer matches"

echo "[smoke] Admin login page: ${APP_URL}/admin/login"
login_ok=0
for attempt in $(seq 1 30); do
  if login_page="$(curl --fail --silent --show-error --max-time 10 \
    "${APP_URL}/admin/login")"; then
    if printf '%s' "$login_page" | grep -Fq 'Not signed in' && \
      printf '%s' "$login_page" | grep -Fq 'Sign in'; then
      login_ok=1
      break
    fi
    echo "[smoke] admin login response lacks the expected sign-in UI (${attempt}/30)"
  else
    echo "[smoke] waiting for admin login page (${attempt}/30)"
  fi
  sleep 5
done
if [ "$login_ok" != 1 ]; then
  echo "[smoke] FAIL: admin login page did not render the expected sign-in UI at ${APP_URL}/admin/login" >&2
  exit 1
fi
echo "[smoke] OK: admin login page renders the expected sign-in UI"

echo "[smoke] Seed: ${GAME_PACKAGE} PlayerLevel rows"
if ! pnpm -F "${GAME_PACKAGE}" exec tsx --eval \
  '
    import prisma from "./src/lib/prisma"
    prisma.playerLevel.count()
      .then(count => {
        console.log(`[smoke] PlayerLevel rows: ${count}`)
        return prisma.$disconnect().then(() => process.exit(count > 0 ? 0 : 1))
      })
      .catch(error => { console.error(`[smoke] ${error.message}`); process.exit(2) })
  '; then
  echo "[smoke] FAIL: database is not seeded for ${GAME_PACKAGE}" >&2
  exit 1
fi

echo "[smoke] OK: issuer, app, and seed checks passed. Run the Playwright auth check to verify the callback."
