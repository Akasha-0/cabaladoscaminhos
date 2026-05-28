#!/bin/bash
# Measure development velocity + test status
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-$HOME/cabala-dos-caminhos}"
cd "$PROJECT_DIR"

echo "=== DEV METRICS ==="
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Ralph tasks
if [ -d "$PROJECT_DIR/.ralph" ]; then
    completed=$(find "$PROJECT_DIR/.ralph" -name "*.md" -exec grep -o "\[x\]" {} \; 2>/dev/null | wc -l)
    pending=$(find "$PROJECT_DIR/.ralph" -name "*.md" -exec grep -o "\[ \]" {} \; 2>/dev/null | wc -l)
else
    completed=0
    pending=0
fi

# Git stats
files_changed=$(git diff --name-only HEAD~5..HEAD 2>/dev/null | wc -l)
lines_added=$(git diff --stat HEAD~5..HEAD 2>/dev/null | grep "insertion" | awk '{print $1}' || echo 0)

echo "Tasks: $completed completed, $pending pending"
echo "Recent changes: $files_changed files, $lines_added lines"
echo ""

# Test results (save to temp file, read afterwards)
timeout 30 npm test --run > /tmp/test-output.txt 2>&1 || true

# Parse results
test_passed=$(grep -oE "[0-9]+ passed" /tmp/test-output.txt | tail -1 | awk '{print $1}' || echo 0)
test_failed=$(grep -oE "[0-9]+ failed" /tmp/test-output.txt | tail -1 | awk '{print $1}' || echo 0)

echo "Test Status:"
echo "  Passed: $test_passed"
echo "  Failed: $test_failed"

# Convert to simple pass/fail
if [ "$test_failed" -gt 0 ]; then
    tests_status="failing"
elif [ "$test_passed" -gt 0 ]; then
    tests_status="passing"
else
    tests_status="unknown"
fi

echo ""
echo "=== METRICS ==="
echo "METRIC dev_velocity=$completed"
echo "METRIC tasks_completed=$completed"
echo "METRIC tasks_pending=$pending"
echo "METRIC files_changed=$files_changed"
echo "METRIC lines_added=$lines_added"
echo "METRIC test_passed=$test_passed"
echo "METRIC test_failed=$test_failed"
echo "METRIC tests_status=$tests_status"
echo ""
echo "=== OUTPUT END ==="