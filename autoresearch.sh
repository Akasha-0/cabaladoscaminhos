#!/bin/bash
# Cabala dos Caminhos — Autoresearch Harness Benchmark

set -euo pipefail
cd "$(dirname "$0")"

echo "=== Cabala dos Caminhos — Evolution Harness ==="
echo ""

# Run test suite
echo "Running tests..."
TEST_OUTPUT=$(npm run test:run 2>&1 || true)

# Extract test metrics
TESTS_LINE=$(echo "$TEST_OUTPUT" | grep -E "^s+Testss+" | tail -1)
TESTS_PASSING=$(echo "$TESTS_LINE" | grep -oP 'd+(?= passed)' || echo "0")
TESTS_SKIPPED=$(echo "$TESTS_LINE" | grep -oP 'd+(?= skipped)' || echo "0")
TESTS_TOTAL=$(echo "$TESTS_LINE" | grep -oP 'd+)$' | tr -d ')' || echo "0")

# Build check
echo "Running build..."
BUILD_OK="false"
npm run build >/dev/null 2>&1 && BUILD_OK="true"

# Calculate metrics
TEST_RATIO=$(echo "scale=4; $TESTS_PASSING / $TESTS_TOTAL" | bc 2>/dev/null || echo "0")
BUILD_VAL=0
[ "$BUILD_OK" = "true" ] && BUILD_VAL=1
QUALITY_SCORE=$(echo "scale=4; ($TEST_RATIO * 0.3) + ($BUILD_VAL * 0.2) + 0.5" | bc 2>/dev/null || echo "0.0000")

# Evolution metrics
COMMITS_AHEAD=$(git log --oneline main..HEAD 2>/dev/null | wc -l || echo "0")
GIT_CLEAN=$(git status --porcelain 2>/dev/null | grep -c "." || echo "0")
STATUS_CLEAN="false"
[ "$GIT_CLEAN" -eq 0 ] && STATUS_CLEAN="true"

echo "=== Results ==="
echo "Tests: $TESTS_PASSING / $TESTS_TOTAL ($TESTS_SKIPPED skipped)"
echo "Build: $BUILD_OK"
echo "Quality Score: $QUALITY_SCORE"
echo "Evolution: $COMMITS_AHEAD commits since baseline"
echo ""

# METRIC output for autoresearch
echo "METRIC tests_passing=$TESTS_PASSING"
echo "METRIC tests_total=$TESTS_TOTAL"
echo "METRIC quality_score=$QUALITY_SCORE"
echo "METRIC build_valid=$BUILD_VAL"
echo "METRIC commits_progress=$COMMITS_AHEAD"
echo "METRIC worktree_clean=$STATUS_CLEAN"

# Success
exit 0
