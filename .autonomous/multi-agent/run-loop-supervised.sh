#!/usr/bin/env bash
#
# run-loop-supervised.sh
# Supervisor that keeps akasha-loop-daemon.py alive with process supervision.
# - Starts daemon via setsid (new session, immune to terminal signals)
# - Writes PID to loop-daemon.pid
# - Monitors daemon PID file, restarts with backoff if it dies
# - Logs all restarts to loop-supervisor.log
# - Cleans stale state (socket, pids, zombie agents) on start

set -uo pipefail

ROOT="/home/skynet/cabala-dos-caminhos"
MA="$ROOT/.autonomous/multi-agent"
DAEMON="$MA/akasha-loop-daemon.py"
SOCK="$MA/loop-daemon.sock"
PID_FILE="$MA/loop-daemon.pid"
LOG_FILE="$MA/loop-supervisor.log"
STDOUT_LOG="/tmp/daemon-stdout.log"
STDERR_LOG="/tmp/daemon-stderr.log"
STATE_FILE="$MA/state.json"
AGENT_PIDS_FILE="$MA/agent-pids.txt"

# Backoff settings
INITIAL_DELAY=5
MAX_DELAY=120
BACKOFF_FACTOR=2

# ── Helpers ───────────────────────────────────────────────────────────────────

log(){
    local ts; ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    echo -e "[$ts] [SUP] $1" | tee -a "$LOG_FILE"
}

log_restart(){
    local reason="$1"
    local delay="$2"
    local ts; ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    echo -e "[$ts] [SUP] 🔄 RESTART reason=$reason delay=${delay}s" | tee -a "$LOG_FILE"
}

log_start(){
    local ts; ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    echo -e "[$ts] [SUP] 🚀 STARTING DAEMON" | tee -a "$LOG_FILE"
}

log_running(){
    local pid="$1"
    local ts; ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    echo -e "[$ts] [SUP] ✅ DAEMON RUNNING PID=$pid" | tee -a "$LOG_FILE"
}

log_already(){
    local pid="$1"
    local ts; ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    echo -e "[$ts] [SUP] ⚠️  DAEMON ALREADY RUNNING PID=$pid (not restarting)" | tee -a "$LOG_FILE"
}

# ── State cleanup ─────────────────────────────────────────────────────────────

cleanup_state(){
    log "Cleaning stale state..."

    # Remove stale socket
    if [ -S "$SOCK" ]; then
        rm -f "$SOCK"
        log "  Removed stale socket: $SOCK"
    fi

    # Remove stale PID file
    if [ -f "$PID_FILE" ]; then
        rm -f "$PID_FILE"
        log "  Removed stale PID file: $PID_FILE"
    fi

    # Kill any zombie task agents from previous runs
    if [ -f "$AGENT_PIDS_FILE" ]; then
        while IFS='|' read -r name pid; do
            [ -z "$pid" ] && continue
            if kill -0 "$pid" 2>/dev/null; then
                log "  Killing stale agent $name (PID=$pid)"
                kill "$pid" 2>/dev/null || true
            fi
        done < "$AGENT_PIDS_FILE"
        : > "$AGENT_PIDS_FILE"
    fi

    # Clear stale daemon_pid in state.json
    if [ -f "$STATE_FILE" ] && python3 -c "import json; d=json.load(open('$STATE_FILE')); d.pop('daemon_pid', None); d['running']=True; d['phase']=d.get('phase','RESEARCH'); json.dump(d, open('$STATE_FILE','w'))" 2>/dev/null; then
        log "  Cleared stale daemon_pid from state.json"
    fi

    log "  Cleanup complete."
}

# ── Daemon start ──────────────────────────────────────────────────────────────

start_daemon(){
    # setsid creates a new session: daemon is immune to terminal SIGHUP/SIGINT
    setsid python3 "$DAEMON" </dev/null >>"$STDOUT_LOG" 2>>"$STDERR_LOG" &
    local new_pid=$!
    echo "$new_pid" > "$PID_FILE"
    log_start
    log_running "$new_pid"
    return 0
}

# ── Status ─────────────────────────────────────────────────────────────────────

status_check(){
    if [ ! -f "$PID_FILE" ]; then
        echo "SUPERVISOR: No PID file — daemon not managed"
        return 1
    fi
    local pid; pid=$(cat "$PID_FILE")
    if kill -0 "$pid" 2>/dev/null; then
        echo "SUPERVISOR: daemon alive PID=$pid"
        return 0
    else
        echo "SUPERVISOR: daemon dead (PID=$pid stale)"
        return 2
    fi
}

# ── Monitor loop ───────────────────────────────────────────────────────────────

monitor(){
    log "=== SUPERVISOR MONITOR STARTING (PID=$$) ==="
    log "Daemon: $DAEMON"
    log "PID file: $PID_FILE"
    log "Log: $LOG_FILE"
    log "Stdout: $STDOUT_LOG"
    log "Stderr: $STDERR_LOG"

    cleanup_state

    local delay=$INITIAL_DELAY
    local iter=0

    while true; do
        iter=$((iter + 1))

        # Check if daemon is alive
        if [ -f "$PID_FILE" ]; then
            local pid; pid=$(cat "$PID_FILE" 2>/dev/null || echo "")
            if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
                # Daemon is alive — reset backoff on success
                if [ $delay != $INITIAL_DELAY ]; then
                    log "Daemon healthy — resetting backoff to ${INITIAL_DELAY}s"
                    delay=$INITIAL_DELAY
                fi
                sleep $((delay < 30 ? delay : 30))
                continue
            fi
        fi

        # Daemon is dead or PID file missing — restart
        log_restart "daemon_dead_or_missing" "$delay"

        # Double-check no stale daemon is running from the state file
        if [ -f "$STATE_FILE" ]; then
            local stale_pid; stale_pid=$(python3 -c "import json; print(json.load(open('$STATE_FILE')).get('daemon_pid',''))" 2>/dev/null || echo "")
            if [ -n "$stale_pid" ] && kill -0 "$stale_pid" 2>/dev/null; then
                log "  Killing stale daemon from state.json PID=$stale_pid"
                kill "$stale_pid" 2>/dev/null || true
                sleep 1
            fi
        fi

        # Final cleanup before restart
        [ -S "$SOCK" ] && rm -f "$SOCK"
        [ -f "$PID_FILE" ] && rm -f "$PID_FILE"

        start_daemon

        # Wait for daemon to initialize
        sleep 3

        # Verify it started
        if [ -f "$PID_FILE" ]; then
            local new_pid; new_pid=$(cat "$PID_FILE")
            if kill -0 "$new_pid" 2>/dev/null; then
                log "Daemon confirmed alive PID=$new_pid (attempt $iter)"
                delay=$INITIAL_DELAY
                sleep $((delay < 30 ? delay : 30))
                continue
            fi
        fi

        log "⚠️  Daemon may have exited immediately — checking logs..."
        if [ -f "$STDERR_LOG" ]; then
            tail -5 "$STDERR_LOG" >> "$LOG_FILE" 2>/dev/null || true
        fi

        # Exponential backoff
        log "Restart attempt $iter failed — backing off ${delay}s (max ${MAX_DELAY}s)"
        sleep $delay
        delay=$((delay * BACKOFF_FACTOR))
        [ $delay -gt $MAX_DELAY ] && delay=$MAX_DELAY
    done
}

# ── CLI ───────────────────────────────────────────────────────────────────────

case "${1:-run}" in
    run)
        monitor
        ;;
    start)
        cleanup_state
        if [ -f "$PID_FILE" ]; then
            local pid; pid=$(cat "$PID_FILE")
            if kill -0 "$pid" 2>/dev/null; then
                log_already "$pid"
                exit 0
            fi
        fi
        start_daemon
        echo "Daemon started PID=$(cat $PID_FILE)"
        ;;
    stop)
        if [ -f "$PID_FILE" ]; then
            local pid; pid=$(cat "$PID_FILE")
            log "Stopping daemon PID=$pid"
            kill "$pid" 2>/dev/null || true
            rm -f "$PID_FILE"
        fi
        log "Supervisor stop complete"
        ;;
    status)
        status_check
        ;;
    restart)
        "$0" stop
        sleep 2
        "$0" start
        ;;
    *)
        echo "Usage: $0 {run|start|stop|status|restart}"
        exit 1
        ;;
esac
