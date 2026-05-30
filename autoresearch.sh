#!/bin/bash
cd ~/cabala-dos-caminhos

# Run tests
TEST_OUTPUT=$(npm run test:run 2>&1)
TEST_EXIT=$?

# Parse test results - look for the summary line
SUMMARY=$(echo "$TEST_OUTPUT" | grep "Test Files" | tail -1)
if [ -n "$SUMMARY" ]; then
  PASSING=$(echo "$SUMMARY" | grep -oP '(\d+) passed' | grep -oP '\d+' | head -1)
  TOTAL=$(echo "$SUMMARY" | grep -oP '\((\d+) test' | grep -oP '\d+' | head -1)
fi

# Default
PASSING=${PASSING:-0}
TOTAL=${TOTAL:-0}

# Build check
BUILD_OUTPUT=$(npm run build 2>&1)
if echo "$BUILD_OUTPUT" | grep -q "Compiled"; then
  BUILD_VALID=1
else
  BUILD_VALID=0
fi

echo "METRIC tests_passing=${PASSING}"
echo "METRIC tests_total=${TOTAL}"
echo "METRIC build_valid=${BUILD_VALID}"

# Quality score
if [ "$PASSING" -ge "$TOTAL" ] && [ "$BUILD_VALID" -eq 1 ]; then
  echo "METRIC quality_score=1.01"
else
  FAILURES=$((TOTAL - PASSING))
  SCORE=$(echo "scale=2; 1.0 - ($FAILURES * 0.05)" | bc 2>/dev/null || echo "0.95")
  echo "METRIC quality_score=${SCORE}"
fi

# Worktree status
if [ -z "$(git status --porcelain)" ]; then
  echo "METRIC worktree_clean=true"
else
  echo "METRIC worktree_clean=false"
fi

exit $TEST_EXIT