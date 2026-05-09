#!/usr/bin/env bash
# Pull master, apply content from content-updates.json, commit, push.
# Netlify rebuilds automatically on push to master.

set -euo pipefail

BRANCH="master"
CONTENT_FILE="content-updates.json"
APPLIER="./apply-content.py"

if [[ ! -d .git ]]; then
  echo "Error: run this from the repo root." >&2
  exit 1
fi
if [[ ! -f "$CONTENT_FILE" ]]; then
  echo "Error: $CONTENT_FILE not found." >&2
  exit 1
fi
if [[ ! -x "$APPLIER" ]]; then
  echo "Error: $APPLIER not found or not executable. Run: chmod +x $APPLIER" >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree has uncommitted changes. Commit or stash first." >&2
  git status --short
  exit 1
fi

echo "==> Switching to $BRANCH and pulling latest"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> Applying content from $CONTENT_FILE"
python3 "$APPLIER" "$CONTENT_FILE"

if [[ -z "$(git status --porcelain)" ]]; then
  echo "==> No changes after applying content. Exiting."
  exit 0
fi

echo "==> Files changed:"
git status --short

read -rp "Commit message (blank to abort): " MSG
if [[ -z "$MSG" ]]; then
  echo "Aborted. Run 'git checkout -- .' to discard, or commit manually."
  exit 1
fi

git add -A
git commit -m "$MSG"

read -rp "Push to origin/$BRANCH now? [y/N] " CONFIRM
if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
  git push origin "$BRANCH"
  echo "==> Pushed. Netlify will rebuild automatically."
else
  echo "==> Commit made locally, not pushed. Push with: git push origin $BRANCH"
fi
