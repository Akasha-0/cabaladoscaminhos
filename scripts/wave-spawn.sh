#!/usr/bin/env bash
# wave-spawn.sh v3.1 — minimal-scope worker spawner for cabaladoscaminhos
# Usage: wave-spawn.sh <branch> <relfile> <content-file-path>
#   branch: e.g. w31/comments-mentions-notify
#   relfile: e.g. src/lib/w31/comments-mentions-notify.ts
#   content-file-path: absolute path to a file containing the content
set -euo pipefail

BRANCH="${1:?branch required}"
RELFILE="${2:?relfile required}"
CONTENT_FILE="${3:?content-file-path required}"

if [ ! -f "$CONTENT_FILE" ]; then
  echo "FAIL: content file not found: $CONTENT_FILE" >&2
  exit 1
fi

cd /workspace/cabaladoscaminhos

# Pre-flight: ensure GitHub credential is configured (sandbox wipes global config)
if [ -n "${GITHUB_TOKEN:-}" ]; then
  git config --global url."https://x-access-token:${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/" 2>/dev/null || true
fi

# Pre-flight: ensure git identity is set
git config user.email "Mavis@MiniMax.local" >/dev/null 2>&1
git config user.name "Mavis" >/dev/null 2>&1

# Pre-flight: reject if file exists on origin/main
if git cat-file -e "origin/main:$RELFILE" 2>/dev/null; then
  echo "BLOCK: $RELFILE already exists on origin/main" >&2
  exit 2
fi

# Pre-flight: reject if branch exists on origin
if git ls-remote --heads origin "$BRANCH" 2>/dev/null | grep -q "$BRANCH"; then
  echo "BLOCK: branch $BRANCH already exists on origin" >&2
  exit 3
fi

# Cleanup: prune any orphan worktree from prior failed runs
git worktree prune >/dev/null 2>&1 || true
# Cleanup: delete local branch if it exists from prior failed runs
git branch -D "$BRANCH" >/dev/null 2>&1 || true

# Worktree
WORKTREE="/tmp/wt-$BRANCH-$$"
rm -rf "$WORKTREE" 2>/dev/null || true

git fetch origin main >/dev/null 2>&1
git worktree add -b "$BRANCH" "$WORKTREE" origin/main 2>&1 | tail -1

mkdir -p "$(dirname "$WORKTREE/$RELFILE")"
cp "$CONTENT_FILE" "$WORKTREE/$RELFILE"

cd "$WORKTREE"
git add "$RELFILE"
git -c user.email="Mavis@MiniMax.local" -c user.name="Mavis" commit -m "feat($BRANCH): add $(basename "$RELFILE")" >/dev/null 2>&1

PUSH_OUT=$(timeout 60 git push -u origin "$BRANCH" 2>&1)
PUSH_RC=$?
echo "$PUSH_OUT" | tail -3
echo "RC=$PUSH_RC"

cd /workspace/cabaladoscaminhos
git worktree remove --force "$WORKTREE" 2>/dev/null || true
rm -rf "$WORKTREE" 2>/dev/null || true

if [ $PUSH_RC -ne 0 ]; then
  echo "PUSH_FAILED rc=$PUSH_RC" >&2
  exit 4
fi

echo "OK: $BRANCH pushed"
