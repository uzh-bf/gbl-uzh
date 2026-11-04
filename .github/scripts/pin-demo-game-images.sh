#!/usr/bin/env bash
# Pins the demo-game app and migration images in a deploy/demo-game overlay,
# records the source commit, and pushes the change to dev. Commits that are not
# newer than the pinned one are skipped, so a slow older run cannot overwrite a
# newer STG deploy. PRD is never pinned by CI (see deploy/demo-game/README.md).
# Usage: pin-demo-game-images.sh <overlay> <commit> <app-digest> <migration-digest>
set -euo pipefail

overlay=$1 commit=$2 app_digest=$3 migration_digest=$4
for digest in "$app_digest" "$migration_digest"; do
  [[ $digest =~ ^sha256:[0-9a-f]{64}$ ]] || { echo "invalid digest: '$digest'" >&2; exit 1; }
done
git cat-file -e "$commit^{commit}"

source_file=$overlay/SOURCE_COMMIT
if [[ -s $source_file ]]; then
  pinned=$(cat "$source_file")
  if ! git merge-base --is-ancestor "$pinned" "$commit" || [[ $pinned == "$commit" ]]; then
    echo "$overlay already pins $pinned, which is not older than $commit; skipping."
    exit 0
  fi
fi

APP_DIGEST=$app_digest MIGRATION_DIGEST=$migration_digest yq -i '
  (.images[] | select(.name == "demo-game")).digest = strenv(APP_DIGEST) |
  (.images[] | select(.name == "demo-game-migration")).digest = strenv(MIGRATION_DIGEST)
' "$overlay/kustomization.yaml"
echo "$commit" > "$source_file"

if git diff --quiet -- "$overlay"; then
  echo "$overlay is already up to date."
  exit 0
fi

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git add "$overlay"
git commit -m "deploy(demo-game): pin $(basename "$overlay") images to ${commit:0:7} [skip ci]"
for attempt in 1 2 3; do
  git push origin HEAD:dev && exit 0
  sleep $((attempt * 5))
  git pull --rebase origin dev
done
echo "could not push to dev" >&2
exit 1
