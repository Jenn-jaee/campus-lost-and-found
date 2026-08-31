#!/usr/bin/env bash
# Flush GitHub's sticky sidebar contributors cache (separate from REST API).
set -euo pipefail
cd "$(dirname "$0")/.."

TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null | awk -F= '/^password=/{print $2}')
REPO="Jenn-jaee/campus-lost-and-found"
SHA=$(git rev-parse HEAD)

export GIT_AUTHOR_NAME="Obinwanne Jennifer"
export GIT_AUTHOR_EMAIL="124430261+Jenn-jaee@users.noreply.github.com"
export GIT_COMMITTER_NAME="Obinwanne Jennifer"
export GIT_COMMITTER_EMAIL="124430261+Jenn-jaee@users.noreply.github.com"

api() {
  curl -s -X "$1" -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/${REPO}" "${@:2}"
}

echo "→ Creating temporary branch cache-flush..."
git branch -f cache-flush "$SHA"
git push -u origin cache-flush

echo "→ Switching default branch to cache-flush..."
api PATCH -d '{"default_branch":"cache-flush"}' | python3 -c "import json,sys; print('default:', json.load(sys.stdin).get('default_branch'))"
sleep 5

echo "→ Switching default branch back to main..."
api PATCH -d '{"default_branch":"main"}' | python3 -c "import json,sys; print('default:', json.load(sys.stdin).get('default_branch'))"
sleep 5

echo "→ Deleting temporary branch..."
git push origin --delete cache-flush
git branch -D cache-flush

echo "→ Pushing empty contributors-cache refresh commit..."
TREE=$(git write-tree)
PARENT=$(git rev-parse HEAD)
NEW=$(git commit-tree "$TREE" -p "$PARENT" -m "chore: refresh GitHub contributors cache")
git reset --hard "$NEW"
git push origin main

echo "→ Waiting for GitHub to recompute..."
sleep 15

curl -s -H "Authorization: Bearer $TOKEN" "https://api.github.com/repos/${REPO}/contributors" | \
  python3 -c "import json,sys; d=json.load(sys.stdin); print('REST API contributors:', [x['login'] for x in d])"

echo "Done. Hard-refresh your repo page (Cmd+Shift+R)."
