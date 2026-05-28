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

# Test results
echo "Test Status:"

# Run JWT tests with node environment (required for jose to work correctly)
jwt_output=$(timeout 60 npx vitest run -c vitest.jwt.config.ts 2>&1 || true)
jwt_passed=$(echo "$jwt_output" | grep -oE "[0-9]+ passed" | tail -1 | awk '{print $1}' || echo 0)
jwt_failed=$(echo "$jwt_output" | grep -oE "[0-9]+ failed" | tail -1 | awk '{print $1}' || echo 0)

# Run other tests with jsdom
other_output=$(timeout 60 npx vitest run 2>&1 || true)
other_passed=$(echo "$other_output" | grep -oE "[0-9]+ passed" | tail -1 | awk '{print $1}' || echo 0)
other_failed=$(echo "$other_output" | grep -oE "[0-9]+ failed" | tail -1 | awk '{print $1}' || echo 0)

# Combine results
total_passed=$((jwt_passed + other_passed))
total_failed=$((jwt_failed + other_failed))

echo "  JWT tests: $jwt_passed passed, $jwt_failed failed"
echo "  Other tests: $other_passed passed, $other_failed failed"
echo "  Total: $total_passed passed, $total_failed failed"

# Convert to simple pass/fail
if [ "$total_failed" -gt 0 ]; then
    tests_status="failing"
elif [ "$total_passed" -gt 0 ]; then
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
echo "METRIC test_passed=$total_passed"
echo "METRIC test_failed=$total_failed"
echo "METRIC tests_status=$tests_status"
echo ""
echo "=== OUTPUT END ==="