#!/bin/bash
# eval-harness.sh - Métricas do harness

set -euo pipefail

echo "=== HARNESS EVAL ==="
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

SESSION_NAME="${HARNESS_SESSION:-pi-harness}"
PROJECT_DIR="${PROJECT_DIR:-$HOME/cabala-dos-caminhos}"

# Métrica 1: Auto-progression (Working events)
echo "1. Auto-progression events:"
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    auto_prog=$(tmux capture-pane -t "$SESSION_NAME" -p 2>/dev/null | grep -c "Working" || echo 0)
    echo "   Count: $auto_prog (target: > 10)"
else
    echo "   ERROR: Session not running"
fi

# Métrica 2: Tasks completadas
echo ""
echo "2. Tasks completed:"
if [ -d "$PROJECT_DIR/.ralph" ]; then
    tasks=$(find "$PROJECT_DIR/.ralph" -name "*.md" -exec grep -c "\[x\]" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
    echo "   Count: $tasks"
else
    echo "   0 (no .ralph directory)"
fi

# Métrica 3: Git commits
echo ""
echo "3. Recent git commits:"
cd "$PROJECT_DIR"
commits=$(git log --oneline -10 | wc -l)
echo "   Count: $commits"

# Métrica 4: AskUserQuestion count
echo ""
echo "4. AskUserQuestion used:"
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    aq_count=$(tmux capture-pane -t "$SESSION_NAME" -p 2>/dev/null | grep -c "AskUserQuestion" || echo 0)
    echo "   Count: $aq_count (target: 0)"
else
    echo "   0"
fi

# Métrica 5: Context usage (se disponível)
echo ""
echo "5. Recent harness output:"
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    tmux capture-pane -t "$SESSION_NAME" -p -S -15 2>/dev/null | tail -15 || echo "(no output)"
fi

echo ""
echo "=== RESULTADO ==="
