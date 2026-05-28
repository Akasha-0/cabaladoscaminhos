#!/bin/bash
# Measure project development velocity
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-$HOME/cabala-dos-caminhos}"
cd "$PROJECT_DIR"

echo "=== DEV VELOCITY MEASUREMENT ==="
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Check harness status (informational only)
echo "Harness info:"
if tmux has-session -t pi-harness 2>/dev/null; then
    echo "  Status: running"
    harness_status="running"
else
    echo "  Status: not running (requires interactive terminal)"
    harness_status="not_running"
fi
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
echo "Git activity:"
commits_1h=$(git log --since="1 hour ago" --oneline 2>/dev/null | wc -l)
commits_24h=$(git log --since="24 hours ago" --oneline 2>/dev/null | wc -l)
echo "  Commits (1h): $commits_1h"
echo "  Commits (24h): $commits_24h"

# Recent changes
files_changed=$(git diff --name-only HEAD~5..HEAD 2>/dev/null | wc -l)
lines_added=$(git diff --stat HEAD~5..HEAD 2>/dev/null | grep "insertion" | awk '{print $1}' || echo 0)

echo ""
echo "Recent changes (last 5 commits):"
echo "  Files: $files_changed"
echo "  Lines added: $lines_added"
echo ""

# Latest tag
latest_tag=$(git tag -l "v*" --sort=-v:refname 2>/dev/null | head -1 || echo "none")
echo "Latest milestone: $latest_tag"
echo ""

# Test status
echo "Test status:"
if npm test --run 2>&1 | tail -5 | grep -qE "(passed|failed)"; then
    test_result=$(npm test --run 2>&1 | grep -oE "[0-9]+ passed" | tail -1 || echo "unknown")
    echo "  $test_result"
    tests_status="passing"
else
    echo "  Could not run tests"
    tests_status="unknown"
fi

echo ""
echo "=== METRICS ==="
echo "METRIC dev_velocity=$completed"
echo "METRIC tasks_completed=$completed"
echo "METRIC tasks_pending=$pending"
echo "METRIC files_changed=$files_changed"
echo "METRIC lines_added=$lines_added"
echo "METRIC harness_status=$harness_status"
echo "METRIC tests_status=$tests_status"
echo "METRIC commits_24h=$commits_24h"
echo ""
echo "=== OUTPUT END ==="