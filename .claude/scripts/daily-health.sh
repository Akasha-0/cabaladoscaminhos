#!/usr/bin/env bash
# ============================================================
# Cabala dos Caminhos — Daily Health Check
# Schedule: 0 9 * * 1-5 (9 AM weekdays)
# Pattern: Sequential Pipeline (autonomous-loops skill)
# ============================================================
set -euo pipefail

PROJECT_DIR="/home/skynet/cabala-dos-caminhos"
MEMORY_DIR="$PROJECT_DIR/.claude/projects/cabala-dos-caminhos/memory/daily-health"
TODAY=$(date +%Y-%m-%d)
REPORT="$MEMORY_DIR/health-$TODAY.md"

mkdir -p "$MEMORY_DIR"

echo "📊 Daily Health Check — $TODAY"
echo "================================"

# Step 1: Run test suite and capture results
echo "🧪 Running test suite..."
TEST_OUTPUT=$(cd "$PROJECT_DIR" && npm run test:run 2>&1 | tail -30 || echo "TEST_FAILED")
echo "$TEST_OUTPUT" > "$MEMORY_DIR/test-$TODAY.log"

# Extract failure count
FAILURES=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= failure)' | head -1 || echo "0")
PASSING=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= passing)' | head -1 || echo "0")
echo "   Tests: $PASSING passing, $FAILURES failures"

# Step 2: Run build
echo "🏗️  Running build..."
BUILD_OUTPUT=$(cd "$PROJECT_DIR" && npm run build 2>&1 | tail -10 || echo "BUILD_FAILED")
BUILD_OK=$(echo "$BUILD_OUTPUT" | grep -c "compiled successfully\|Build complete\|✓" || echo "0")
echo "   Build: $([ "$BUILD_OK" -gt 0 ] && echo '✅ OK' || echo '❌ FAILED')"

# Step 3: Check git status
echo "📁 Checking git status..."
cd "$PROJECT_DIR"
GIT_STATUS=$(git status --short 2>/dev/null)
UNCOMMITTED=$(echo "$GIT_STATUS" | grep -c "^[ MADRCU]" || echo "0")
echo "   Uncommitted files: $UNCOMMITTED"

# Step 4: Write report
cat > "$REPORT" << EOF
# Daily Health Report — $TODAY

## Test Suite
- Passing: $PASSING
- Failures: $FAILURES
- Log: test-$TODAY.log

## Build
- Status: $([ "$BUILD_OK" -gt 0 ] && echo '✅ OK' || echo '❌ FAILED')

## Git Status
- Uncommitted files: $UNCOMMITTED
$(if [ "$UNCOMMITTED" -gt 0 ]; then
  echo "\`\`\`"
  echo "$GIT_STATUS"
  echo "\`\`\`"
fi)

## Alerts
$(if [ "$FAILURES" -gt 80 ]; then
  echo "⚠️  FAILURES above threshold (>80)"
elif [ "$UNCOMMITTED" -gt 5 ]; then
  echo "⚠️  Many uncommitted files — consider committing"
elif [ "$BUILD_OK" -eq 0 ]; then
  echo "🚨 BUILD FAILED — investigate immediately"
else
  echo "✅ All systems nominal"
fi)

---
Checked at: $(date -Iseconds)
EOF

echo ""
echo "📝 Report: $REPORT"
echo "$([ "$FAILURES" -le 80 ] && echo "✅ Tests OK" || echo "⚠️  Check failures")"
