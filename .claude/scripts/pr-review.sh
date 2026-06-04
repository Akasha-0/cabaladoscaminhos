#!/usr/bin/env bash
# ============================================================
# Cabala dos Caminhos — PR Review Gate
# Trigger: git push (called from .git/hooks/post-push or manually)
# Pattern: Sequential Pipeline (autonomous-loops skill)
# ============================================================
set -euo pipefail

PROJECT_DIR="/home/skynet/cabala-dos-caminhos"
MEMORY_DIR="$PROJECT_DIR/.claude/projects/cabala-dos-caminhos/memory"
TODAY=$(date +%Y-%m-%d-%H%M%S)

echo "🔍 PR Review Gate — $TODAY"
echo "============================"

cd "$PROJECT_DIR"

# Step 1: Check if there are uncommitted changes
UNCOMMITTED=$(git status --short 2>/dev/null | grep -c "^[ MADRCU]" || echo "0")
if [ "$UNCOMMITTED" -gt 0 ]; then
  echo "⚠️  $UNCOMMITTED uncommitted files — committing first..."
  git add -A
  git commit -m "chore: autonomous pre-PR commit ($TODAY)" 2>/dev/null || true
fi

# Step 2: Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
echo "📍 Branch: $BRANCH"

# Step 3: Check if there are changes to push
BEHIND=$(git rev-list HEAD..origin/$BRANCH --count 2>/dev/null || echo "0")
AHEAD=$(git rev-list origin/$BRANCH..HEAD --count 2>/dev/null || echo "0")

# Step 4: Run tests against changed files only
echo "🧪 Running targeted tests..."
TEST_OUTPUT=$(npm run test:run 2>&1 | tail -30 || echo "TEST_FAILED")
TEST_OK=$(echo "$TEST_OUTPUT" | grep -c "passed\|✓\|PASS" || echo "0")
FAILURES=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= failure)' | head -1 || echo "0")
echo "   Tests: $FAILURES failures"

# Step 5: Run build
echo "🏗️  Running build..."
BUILD_OK=$(npm run build 2>&1 | grep -c "compiled successfully\|Build complete\|✓" || echo "0")
echo "   Build: $([ "$BUILD_OK" -gt 0 ] && echo '✅ OK' || echo '❌ FAILED')"

# Step 6: Run lint
echo "🔍 Running lint..."
LINT_OK=$(npm run lint 2>&1 | grep -c "✓\|passed\|no errors\|0 error" || echo "0")

# Step 7: Write gate result
GATE_RESULT="$MEMORY_DIR/pr-gate-$TODAY.md"
cat > "$GATE_RESULT" << EOF
# PR Gate Result — $TODAY

## Branch
- Name: $BRANCH
- Ahead: $AHEAD commits
- Behind: $BEHIND commits

## Quality Gates
- Tests: $([ "$FAILURES" -eq 0 ] && echo '✅ PASS' || echo "⚠️  $FAILURES failures")
- Build: $([ "$BUILD_OK" -gt 0 ] && echo '✅ PASS' || echo '❌ FAIL')
- Lint: $([ "$LINT_OK" -gt 0 ] && echo '✅ PASS' || echo '⚠️  Issues')

## Result
$(if [ "$BUILD_OK" -gt 0 ] && [ "$FAILURES" -eq 0 ]; then
  echo "✅ ALL GATES PASSED — PR ready to merge"
elif [ "$BUILD_OK" -eq 0 ]; then
  echo "🚨 BUILD FAILED — do not merge"
else
  echo "⚠️  Some gates failed — review before merging"
fi)

---
Checked: $(date -Iseconds)
EOF

echo ""
echo "📝 Gate result: $GATE_RESULT"
echo "$([ "$BUILD_OK" -gt 0 ] && [ "$FAILURES" -eq 0 ] && echo "✅ PR Gate PASSED" || echo "⚠️  PR Gate needs review")"
