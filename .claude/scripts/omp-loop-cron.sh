#!/usr/bin/env bash
# ============================================================
# OMP Loop Cron — Instala/remover crons usando OMP loop runner
# ============================================================
set -euo pipefail

ACTION="${1:-status}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OMP_RUNNER="$SCRIPT_DIR/omp-loop-runner.sh"
PROJECT_DIR="/home/skynet/cabala-dos-caminhos"
MEMORY_DIR="$PROJECT_DIR/.claude/projects/-home-skynet-cabala-dos-caminhos/memory"
CRON_MARKER="# CABALA-OMP-LOOP"

install() {
  echo "=== Installing OMP Loop crontab entries ==="

  # Remove existing entries first
  uninstall >/dev/null 2>&1 || true

  (crontab -l 2>/dev/null | grep -v "$CRON_MARKER"; cat <<CRON
${CRON_MARKER}
# Cabala Quick Cycle — every 30 min via OMP
*/30 * * * * CLAUDE_MODEL=MiniMax-M2.7 $OMP_RUNNER quick >> $MEMORY_DIR/omp-loop-quick.log 2>&1
# Cabala Daily Standup — weekdays 9am via OMP
0 9 * * 1-5 CLAUDE_MODEL=MiniMax-M2.7 $OMP_RUNNER daily >> $MEMORY_DIR/omp-loop-daily.log 2>&1
# Cabala Weekly Quality — Monday 10am via OMP
0 10 * * 1 CLAUDE_MODEL=MiniMax-M2.7 $OMP_RUNNER weekly >> $MEMORY_DIR/omp-loop-weekly.log 2>&1
# Cabala Spiritual Monitor — weekdays 8am via OMP
0 8 * * 1-5 CLAUDE_MODEL=MiniMax-M2.7 $OMP_RUNNER spiritual >> $MEMORY_DIR/omp-loop-spiritual.log 2>&1
CRON
  ) | crontab -

  echo "✅ OMP Loop crons installed"
  echo ""
  echo "View logs:"
  echo "  tail -f $MEMORY_DIR/omp-loop-quick.log"
  echo "  tail -f $MEMORY_DIR/omp-loop-daily.log"
  echo "  tail -f $MEMORY_DIR/omp-loop-weekly.log"
}

uninstall() {
  echo "=== Removing OMP Loop crontab entries ==="
  crontab -l 2>/dev/null | grep -v "$CRON_MARKER" | crontab - || true
  echo "✅ OMP Loop crons removed"
}

status() {
  echo "=== OMP Loop Cron Status ==="
  echo ""
  echo "Configured cycles:"
  echo "  • quick (every 30 min)"
  echo "  • daily (weekdays 9am)"
  echo "  • weekly (Monday 10am)"
  echo "  • spiritual (weekdays 8am)"
  echo ""
  echo "Active crontab entries:"
  crontab -l 2>/dev/null | grep "$CRON_MARKER" || echo "  (none)"
  echo ""
  echo "Usage:"
  echo "  $0 install   — Install crons"
  echo "  $0 uninstall — Remove crons"
  echo "  $0 status    — Show this status"
}

case "$ACTION" in
  install)
    install
    ;;
  uninstall)
    uninstall
    ;;
  status)
    status
    ;;
  *)
    echo "Usage: $0 [install|uninstall|status]"
    exit 1
    ;;
esac
