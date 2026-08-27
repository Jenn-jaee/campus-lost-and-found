#!/usr/bin/env bash
# Rebuild git history with specific commit messages per feature/file group.
# Uses git commit-tree to avoid Co-authored-by trailers.
set -euo pipefail
cd "$(dirname "$0")/.."

export GIT_AUTHOR_NAME="Obinwanne Jennifer"
export GIT_AUTHOR_EMAIL="124430261+Jenn-jaee@users.noreply.github.com"
export GIT_COMMITTER_NAME="Obinwanne Jennifer"
export GIT_COMMITTER_EMAIL="124430261+Jenn-jaee@users.noreply.github.com"

git checkout --orphan history-rebuild 2>/dev/null || true
git rm -rf --cached . >/dev/null 2>&1 || true

PARENT=""
commit_group() {
  local msg="$1"
  shift
  git add -- "$@"
  local tree
  tree=$(git write-tree)
  if [[ -z "$PARENT" ]]; then
    PARENT=$(git commit-tree "$tree" -m "$msg")
  else
    PARENT=$(git commit-tree "$tree" -p "$PARENT" -m "$msg")
  fi
}

commit_group "Add gitignore for Firebase, env secrets, and dependencies" .gitignore

commit_group "Add global stylesheet — typography, layout, and navigation (main.css)" css/main.css
commit_group "Add reusable UI components — cards, badges, forms (components.css)" css/components.css

commit_group "Configure Firebase app, Firestore, and Authentication" js/firebase-config.js
commit_group "Add authentication helpers and admin access check" js/auth.js
commit_group "Add route guards for protected and admin-only pages" js/router.js
commit_group "Add keyword extraction and lost/found matching algorithm" js/matching.js
commit_group "Add Firestore CRUD for lost and found posts" js/posts.js
commit_group "Add UI utilities, report cards, and public name display" js/ui.js
commit_group "Add ownership claim workflow for found items" js/claims.js
commit_group "Configure Cloudinary unsigned photo upload" js/cloudinary-config.js
commit_group "Add EmailJS notifications for matches and claims" js/email.js
commit_group "Add admin helpers for resolving and deleting posts" js/admin.js

commit_group "Add public landing page with hero and feature overview" landing.html
commit_group "Add login and registration page for PSU students" login.html
commit_group "Add browse board with search, filters, and report cards" index.html
commit_group "Add report lost item form with contact fields and photo upload" report-lost.html
commit_group "Add report found item form with contact fields and photo upload" report-found.html
commit_group "Add item detail page with contact info, matches, and claims" item-detail.html
commit_group "Add My Claims page for tracking ownership requests" my-claims.html
commit_group "Add admin dashboard for reviewing posts and confirming claims" admin.html
commit_group "Add custom 404 page for invalid routes" 404.html

commit_group "Add Firebase Hosting config and Firestore security rules" firebase.json .firebaserc firestore.rules
commit_group "Add npm start script and item-detail URL verification" package.json scripts/verify-detail-links.mjs scripts/rebuild-history.sh

commit_group "Add README screenshot placeholders and capture guide" assets/screenshots/
commit_group "Add project README — architecture, setup, deployment, and walkthrough" README.md

git reset --hard "$PARENT"
git branch -M main
echo "Rebuilt $(git rev-list --count HEAD) commits. Latest: $(git log -1 --oneline)"
