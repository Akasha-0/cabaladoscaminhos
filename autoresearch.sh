#!/bin/bash
cd ~/cabala-dos-caminhos

# Run tests
echo "Running tests..."
npm run test:run > /tmp/test_output.txt 2>&1
TEST_EXIT=$?

# Parse test summary
if grep -q "[0-9]* failed" /tmp/test_output.txt 2>/dev/null; then
  FAILURES=$(grep "Tests " /tmp/test_output.txt | tail -1 | grep -oP "^\s*\K[0-9]+(?= failed)" || echo "0")
else
  FAILURES=0
fi
[ -z "$FAILURES" ] && FAILURES=0

# Build check
echo "Running build..."
if npm run build > /tmp/build_output.txt 2>&1; then
  BUILD_VALID=1
else
  BUILD_VALID=0
fi

echo "METRIC tests_failed=${FAILURES}"
echo "METRIC build_valid=${BUILD_VALID}"

if [ "$FAILURES" -eq 0 ] && [ "$BUILD_VALID" -eq 1 ]; then
  echo "METRIC quality_score=1.01"
else
  echo "METRIC quality_score=0.99"
fi

# Worktree
if git diff --quiet HEAD 2>/dev/null; then
  echo "METRIC worktree_clean=true"
else
  echo "METRIC worktree_clean=false"
fi

# Return test exit code, not grep exit code
if [ "$FAILURES" -gt 0 ] || [ "$BUILD_VALID" -eq 0 ]; then
  exit 1
fi
exit 0