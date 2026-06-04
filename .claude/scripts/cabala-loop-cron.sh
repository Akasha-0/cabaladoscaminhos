#!/usr/bin/env bash
# cabala-loop-cron.sh — Ativa os crons via crontab (fallback se systemd indisponível)
# Uso: ./cabala-loop-cron.sh [install|uninstall|status]
# Requer: cron + access a crontab do usuario

set -euo pipefail

ACTION="${1:-status}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="/home/skynet/cabala-dos-caminhos"

CRON_MARKER="# CABALA-AUTONOMOUS-LOOP"

install() {
  echo "=== Installing Cabala Loop crontab entries ==="

  # Remove existing entries first
  uninstall >/dev/null 2>&1 || true

  (crontab -l 2>/dev/null | grep -v "$CRON_MARKER"; cat <<CRON
${CRON_MARKER}
# Cabala Quick Cycle — every 20 min (:13, :33, :53)
13,33,53 * * * * CLAUDE_MODEL=MiniMax-M2.7 ${SCRIPT_DIR}/cabala-loop-runner.sh quick >> /home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-quick.log 2>&1
# Cabala Hourly Cycle — every hour at :07
7 * * * * CLAUDE_MODEL=MiniMax-M2.7 ${SCRIPT_DIR}/cabala-loop-runner.sh hourly >> /home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-hourly.log 2>&1
# Cabala Night Shift — 23:00 daily
0 23 * * * CLAUDE_MODEL=MiniMax-M2.7 ${SCRIPT_DIR}/cabala-loop-runner.sh night >> /home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-night.log 2>&1
# Cabala Daily Standup — weekdays 9am
0 9 * * 1-5 CLAUDE_MODEL=MiniMax-M2.7 ${SCRIPT_DIR}/cabala-loop-runner.sh standup >> /home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-standup.log 2>&1
CRON
) | crontab -

  echo "Crontab installed. Current crontab:"
  crontab -l | grep -v "^# " | grep -v "^$" || echo "(empty)"
  echo ""
  echo "View logs:"
  echo "  tail -f /home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-quick.log"
}

uninstall() {
  echo "=== Removing Cabala Loop crontab entries ==="
  crontab -l 2>/dev/null | grep -v "$CRON_MARKER" | grep -v "^$" > /tmp/crontab.$$.tmp
  crontab /tmp/crontab.$$.tmp 2>/dev/null || true
  rm -f /tmp/crontab.$$.tmp
  echo "Done."
}

status() {
  echo "=== Cabala Loop cron status ==="
  echo ""
  echo "--- Active cabala crons ---"
  (crontab -l 2>/dev/null | grep "$CRON_MARKER" || echo "No cabala crons installed") | sed 's/^/  /'
  echo ""
  echo "--- Recent log lines ---"
  for svc in quick hourly night standup; do
    LOG="/home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory/cabala-${svc}.log"
    if [ -f "$LOG" ]; then
      echo "=== ${svc} (last 2 lines) ==="
      tail -2 "$LOG" 2>/dev/null | sed 's/^/  /'
    fi
  done
}

case "$ACTION" in
  install)   install ;;
  uninstall) uninstall ;;
  status)    status ;;
  *)         echo "Usage: $0 [install|uninstall|status]" ;;
esac
