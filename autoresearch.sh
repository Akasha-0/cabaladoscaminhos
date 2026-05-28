#!/bin/bash
# Measure development velocity of the project
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-$HOME/cabala-dos-caminhos}"
cd "$PROJECT_DIR"

echo "=== DEV VELOCITY MEASUREMENT ==="
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Git stats
echo "Git activity:"
git log --since="1 hour ago" --oneline 2>/dev/null | wc -l | xargs echo "Commits (1h):"
git log --since="24 hours ago" --oneline 2>/dev/null | wc -l | xargs echo "Commits (24h):"
echo ""

# Code changes
echo "Code changes:"
git diff --stat HEAD~10..HEAD 2>/dev/null | tail -5 || echo "No recent changes"
echo ""

# Tasks completed in Ralph
if [ -d "$PROJECT_DIR/.ralph" ]; then
    completed=$(find "$PROJECT_DIR/.ralph" -name "*.md" -exec grep -o "\[x\]" {} \; 2>/dev/null | wc -l)
    pending=$(find "$PROJECT_DIR/.ralph" -name "*.md" -exec grep -o "\[ \]" {} \; 2>/dev/null | wc -l)
    echo "Ralph tasks: $completed completed, $pending pending"
else
    completed=0
    pending=0
fi

# Check for running harness
echo ""
echo "Harness status:"
if tmux has-session -t pi-harness 2>/dev/null; then
    harness_status="running"
    pane_content=$(tmux capture-pane -t pi-harness -p 2>/dev/null | tail -10)
    echo "pi-harness: ACTIVE"
    echo "Recent output:"
    echo "$pane_content"
else
    harness_status="not_running"
    echo "pi-harness: NOT RUNNING"
fi

# Calculate velocity
# Simple proxy: commits + completed tasks
dev_velocity=$((completed))

# Files changed (proxy via git)
files_changed=$(git diff --name-only HEAD~5..HEAD 2>/dev/null | wc -l || echo 0)

# Lines added
lines_added=$(git diff --stat HEAD~5..HEAD 2>/dev/null | grep "insertion" | awk '{print $1}' || echo 0)

echo ""
echo "=== METRICS ==="
echo "METRIC dev_velocity=$dev_velocity"
echo "METRIC harness_status=$harness_status"
echo "METRIC tasks_completed=$completed"
echo "METRIC tasks_pending=$pending"
echo "METRIC files_changed=$files_changed"
echo "METRIC lines_added=$lines_added"
echo ""
echo "=== OUTPUT END ==="