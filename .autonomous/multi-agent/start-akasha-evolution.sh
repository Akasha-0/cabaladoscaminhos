#!/usr/bin/env bash
#
# start-akasha-evolution.sh — OMP entrypoint for Akasha autonomous loop
# Canonical: run-24-7.sh → run-loop-supervised.sh → akasha-loop-daemon-v9.py
#
# Usage:
#   bash start-akasha-evolution.sh start   — Start loop (via supervisor)
#   bash start-akasha-evolution.sh stop    — Stop loop
#   bash start-akasha-evolution.sh status  — Check status
#   bash start-akasha-evolution.sh health  — Health check
#
set -euo pipefail

ROOT="/home/skynet/cabala-dos-caminhos"
MA="$ROOT/.autonomous/multi-agent"
SUPERVISOR="$MA/run-loop-supervised.sh"
STATE_FILE="$MA/state.json"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log(){ echo -e "[$(date +%H:%M:%S)] $1"; }

case "${1:-start}" in
    start)
        log "Starting Akasha Evolution Loop (v9)..."
        bash "$SUPERVISOR" start
        ;;
    stop)
        log "Stopping Akasha Evolution Loop..."
        bash "$SUPERVISOR" stop 2>/dev/null || true
        ;;
    status)
        if [[ -f "$STATE_FILE" ]]; then
            python3 -c "import json; d=json.load(open('$STATE_FILE')); print(f'phase={d[\"phase\"]} iter={d[\"iteration\"]} running={d[\"running\"]}')"
        else
            echo "No state file found"
        fi
        ;;
    health)
        bash "$SUPERVISOR" status 2>/dev/null || log "Supervisor not running"
        ;;
    *)
        echo "Usage: $0 {start|stop|status|health}"
        exit 1
        ;;
esac
