#!/usr/bin/env bash
# pre-commit.sh — PreToolUse hook for Bash (commit operations)
# Blocks if triad (typecheck / test / lint) is red.
# stdin: full tool input JSON; stdout: {} (allow) or {"decision":"block","reason":"..."}
set -euo pipefail

INPUT=$(cat)

# Match only commit-related bash commands
COMMAND=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | head -1 | sed 's/"command":"//;s/"$//')
if [[ -z "$COMMAND" ]]; then
  COMMAND=$(echo "$INPUT" | grep -o '"command": "[^"]*"' | head -1 | sed "s/\"command\": \"//;s/\"$//")
fi

if [[ -z "$COMMAND" ]]; then
  echo '{}'
  exit 0
fi

# Only guard commit/git operations
if ! echo "$COMMAND" | grep -qE '(git commit|omp commit|git push)'; then
  echo '{}'
  exit 0
fi

# ── Triad check ─────────────────────────────────────────────────────────────
cd ~/cabala-dos-caminhos

# typecheck
echo "Running typecheck…" >&2
if ! bun run typecheck >/dev/null 2>&1; then
  echo '{"decision":"block","reason":"TRIAD RED: typecheck falhou. Corrija antes de commitar."}' >&1
  exit 0
fi

# test
echo "Running test…" >&2
if ! bun run test --run >/dev/null 2>&1; then
  echo '{"decision":"block","reason":"TRIAD RED: test falhou. Corrija antes de commitar."}' >&1
  exit 0
fi

# lint (if configured)
if grep -q '"lint"' package.json 2>/dev/null; then
  echo "Running lint…" >&2
  if ! bun run lint >/dev/null 2>&1; then
    echo '{"decision":"block","reason":"TRIAD RED: lint falhou. Corrija antes de commitar."}' >&1
    exit 0
  fi
fi

echo '{}'
exit 0
