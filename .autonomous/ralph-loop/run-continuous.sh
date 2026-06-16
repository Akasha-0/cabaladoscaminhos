#!/usr/bin/env bash
# run-continuous.sh — Ralph loop continuous runner (singleton)
# Invokes Ralph loop indefinitely, one step per call
# Portuguese promise: NÃO PARE, CONTINUE EVOLVENDO O PROJETO SEM PARAR. SEMPRE FAZENDO MELHORIAS.

set -uo pipefail

ROOT="/home/skynet/cabala-dos-caminhos"
RALPH="$ROOT/.autonomous/ralph-loop/akasha-ralph-loop.py"
LOCK="$ROOT/.autonomous/ralph-loop/.continuous.lock"
PID_FILE="$ROOT/.autonomous/ralph-loop/.continuous.pid"
LOG="$ROOT/.autonomous/ralph-loop/continuous.log"
STOP="$ROOT/.autonomous/ralph-loop/.stop.signal"

log() {
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $1" >> "$LOG"
}

# Ensure single instance via flock
exec 200>"$LOCK"
if ! flock -n 200; then
    log "Another instance is running — exiting."
    exit 0
fi

# Write PID
echo $$ > "$PID_FILE"

# Remove any stale stop signal
rm -f "$STOP"

log "═══ RALPH LOOP CONTINUOUS RUNNER STARTING ═══"
log "PID=$$"
log "Promise: NÃO PARE, CONTINUE EVOLVENDO O PROJETO SEM PARAR. SEMPRE FAZENDO MELHORIAS."

count=0
while true; do
    # Check stop signal
    if [ -f "$STOP" ]; then
        log "Stop signal received — exiting."
        rm -f "$STOP"
        break
    fi

    count=$((count + 1))

    # Run one Ralph loop step
    output=$(python3 "$RALPH" --action=loop 2>&1)
    exitcode=$?

    # Log output (last 3 lines only to avoid log bloat)
    if [ $exitcode -eq 0 ]; then
        echo "$output" | tail -3 >> "$LOG"
    else
        echo "$output" | tail -5 >> "$LOG"
        log "ERROR: Ralph loop exit code $exitcode"
    fi

    # Log heartbeat every 10 iterations
    if [ $((count % 10)) -eq 0 ]; then
        state_iter=$(python3 -c "import json; d=json.load(open('$ROOT/.autonomous/ralph-loop/state.json')); print(d.get('iteration','?'), d.get('phase','?'))" 2>/dev/null || echo "? ?")
        log "❤️  Ralph iter $count | state=$state_iter"
    fi

    # Short sleep between iterations
    sleep 5
done

rm -f "$PID_FILE"
log "Ralph loop continuous runner stopped."
