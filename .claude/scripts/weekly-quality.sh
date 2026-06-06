#!/usr/bin/env bash
# ============================================================
# Cabala dos Caminhos — Weekly Quality Regression
# Schedule: 0 10 * * 1 (Monday 10 AM)
# Pattern: Sequential Pipeline (autonomous-loops skill)
# ============================================================
set -euo pipefail

PROJECT_DIR="/home/skynet/cabala-dos-caminhos"
MEMORY_DIR="$PROJECT_DIR/.claude/projects/cabala-dos-caminhos/memory"
WEEKLY_DIR="$MEMORY_DIR/weekly-reports"
TODAY=$(date +%Y-%m-%d)
WEEK=$(date +%G-W%V)
REPORT="$WEEKLY_DIR/quality-$WEEK.md"

mkdir -p "$WEEKLY_DIR"

echo "📈 Weekly Quality Regression — $TODAY"
echo "======================================"

# Step 1: Run quality check
echo "🔍 Running quality analysis..."
cd "$PROJECT_DIR"
QUALITY_OUTPUT=$(npm run quality 2>&1 | tail -20 || echo "QUALITY_FAILED")
QUALITY_OK=$(echo "$QUALITY_OUTPUT" | grep -c "QUALITY_SCORE\|passed\|A-\|91" || echo "0")
SCORE=$(echo "$QUALITY_OUTPUT" | grep -oP 'QUALITY_SCORE[:\s]+\K[\d.]+' | head -1 || echo "unknown")
echo "   Quality score: $SCORE"

# Step 2: Full test suite
echo "🧪 Running full test suite..."
TEST_OUTPUT=$(npm run test:run 2>&1 | tail -20 || echo "TEST_FAILED")
FAILURES=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= failure)' | head -1 || echo "0")
PASSING=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= passing)' | head -1 || echo "0")
echo "   Tests: $PASSING passing, $FAILURES failures"

# Step 3: Build
echo "🏗️  Building..."
BUILD_OK=$(npm run build 2>&1 | grep -c "compiled successfully\|Build complete\|✓" || echo "0")
echo "   Build: $([ "$BUILD_OK" -gt 0 ] && echo '✅ OK' || echo '❌ FAILED')"

# Step 4: Git log since last week
echo "📜 Git changes since last week..."
GIT_LOG=$(git log --since="$WEEK ago" --oneline --format="%h %s" 2>/dev/null | head -20 || echo "No changes")
GIT_COUNT=$(echo "$GIT_LOG" | grep -c "." || echo "0")
echo "   Commits: $GIT_COUNT"

# Step 5: Write report
cat > "$REPORT" << EOF
# Weekly Quality Report — $WEEK ($TODAY)

## Quality Score
- Score: $SCORE
- Target: >= 0.91

## Test Suite
- Passing: $PASSING
- Failures: $FAILURES

## Build
- Status: $([ "$BUILD_OK" -gt 0 ] && echo '✅ OK' || echo '❌ FAILED')

## Commits This Week
- Count: $GIT_COUNT
\`\`\`
$GIT_LOG
\`\`\`

## Analysis
$(if [[ "$SCORE" != "unknown" ]]; then
  SCORE_NUM=$(echo "$SCORE" | cut -d. -f1)
  if [ "$SCORE_NUM" -ge 91 ]; then
    echo "✅ Quality score above target (≥91)"
  elif [ "$SCORE_NUM" -ge 85 ]; then
    echo "⚠️  Quality score below target — review bottom metrics"
  else
    echo "🚨 Quality score significantly below target"
  fi
else
  echo "⚠️  Could not determine quality score"
fi)

$(if [ "$FAILURES" -gt 100 ]; then
  echo "🚨 High test failure count — investigate"
elif [ "$FAILURES" -lt 50 ]; then
  echo "✅ Test suite healthy"
fi)

## Recommendations
$(if [[ "$SCORE" != "unknown" ]]; then
  SCORE_NUM=$(echo "$SCORE" | cut -d. -f1)
  if [ "$SCORE_NUM" -lt 91 ]; then
    echo "1. Run \`npm run quality -- --verbose\` to identify bottom metrics"
    echo "2. Focus on coverage and type safety"
  fi
fi)
$(if [ "$FAILURES" -gt 80 ]; then
  echo "3. Prioritize fixing integration test failures"
fi)

---
Generated: $(date -Iseconds)
EOF

echo ""
echo "📝 Report: $REPORT"
echo "$([ "$BUILD_OK" -gt 0 ] && [ "$FAILURES" -lt 100 ] && echo "✅ Week nominal" || echo "⚠️  Review needed")"
