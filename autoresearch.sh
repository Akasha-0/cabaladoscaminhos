#!/bin/bash
cd ~/cabala-dos-caminhos

# Run tests and capture results
TEST_OUTPUT=$(npm run test:run 2>&1)
TEST_EXIT=$?

# Parse test counts
PASSING=$(echo "$TEST_OUTPUT" | grep -oP 'Tests\s+\K[\d]+(?= passed)' | head -1)
TOTAL=$(echo "$TEST_OUTPUT" | grep -oP 'Tests\s+[\d]+ passed.*?\K[\d]+(?=\s+\()' | head -1)
if [ -z "$TOTAL" ]; then
  TOTAL=$PASSING
fi

# Build check
BUILD_OUTPUT=$(npm run build 2>&1)
BUILD_EXIT=$?
if [ $BUILD_EXIT -eq 0 ]; then
  BUILD_VALID=1
else
  BUILD_VALID=0
fi

# Default values if parsing failed
PASSING=${PASSING:-0}
TOTAL=${TOTAL:-0}

echo "METRIC tests_passing=${PASSING}"
echo "METRIC tests_total=${TOTAL}"
echo "METRIC build_valid=${BUILD_VALID}"

# Quality score: 1.01 if all passing, penalize failures
if [ "$PASSING" -ge "$TOTAL" ] && [ "$BUILD_VALID" -eq 1 ]; then
  echo "METRIC quality_score=1.01"
else
  FAILURES=$((TOTAL - PASSING))
  SCORE=$(echo "scale=2; 1.0 - ($FAILURES * 0.05)" | bc 2>/dev/null || echo "0.95")
  echo "METRIC quality_score=${SCORE}"
fi

# Commit count
COMMITS=$(git rev-list --count HEAD 2>/dev/null || echo "0")
echo "METRIC commits_progress=${COMMITS}"

# Worktree status
if [ -z "$(git status --porcelain)" ]; then
  echo "METRIC worktree_clean=true"
else
  echo "METRIC worktree_clean=false"
fi

exit $TEST_EXIT