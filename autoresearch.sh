#!/bin/bash
cd ~/cabala-dos-caminhos

# Run tests and capture
TEST_OUTPUT=$(npm run test:run 2>&1)
TEST_EXIT=$?

# Parse output - find lines like "Test Files  3 failed | 502 passed | 2 skipped (507)"
SUMMARY=$(echo "$TEST_OUTPUT" | grep -E "Test Files" | tail -1)
if [ -n "$SUMMARY" ]; then
  # Extract counts from format: "Tests  7 failed | 4680 passed | 22 skipped (4709)"
  TESTS_LINE=$(echo "$TEST_OUTPUT" | grep -E "^      Tests " | tail -1)
  if [ -n "$TESTS_LINE" ]; then
    PASSING=$(echo "$TESTS_LINE" | sed -n 's/.*|\([0-9]*\) passed.*/\1/p')
    SKIPPED=$(echo "$TESTS_LINE" | sed -n 's/.*|\([0-9]*\) skipped.*/\1/p')
    TOTAL_STR=$(echo "$TESTS_LINE" | sed -n 's/.*(\([0-9]*\) total.*/\1/p')
    FAILED=$(echo "$TESTS_LINE" | sed -n 's/ *\([0-9]*\) failed.*/\1/p')
    
    TOTAL=${TOTAL_STR:-0}
    [ -z "$FAILED" ] && FAILED=0
    [ -z "$SKIPPED" ] && SKIPPED=0
  else
    PASSING=0
    TOTAL=0
    FAILED=0
    SKIPPED=0
  fi
else
  PASSING=0
  TOTAL=0
  FAILED=0
fi

# Build check
if npm run build >/dev/null 2>&1; then
  BUILD_VALID=1
else
  BUILD_VALID=0
fi

echo "METRIC tests_passing=${PASSING}"
echo "METRIC tests_total=${TOTAL}"
echo "METRIC build_valid=${BUILD_VALID}"
echo "METRIC tests_failed=${FAILED}"
echo "METRIC tests_skipped=${SKIPPED}"

# Quality score
if [ "$FAILED" -eq 0 ] && [ "$BUILD_VALID" -eq 1 ]; then
  echo "METRIC quality_score=1.01"
else
  echo "METRIC quality_score=0.98"
fi

# Worktree
if [ -z "$(git status --porcelain)" ]; then
  echo "METRIC worktree_clean=true"
else
  echo "METRIC worktree_clean=false"
fi

exit $TEST_EXIT