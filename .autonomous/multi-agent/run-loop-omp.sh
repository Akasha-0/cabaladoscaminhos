#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/skynet/cabala-dos-caminhos"
MA="$ROOT/.autonomous/multi-agent"
SOCK="$MA/loop-daemon.sock"
IMPL_FILE="$MA/omp-implementations.json"
AGENT_RESULTS_DIR="$MA/agent-results"
STATE_FILE="$MA/state.json"

MAX_PARALLEL=5

log()  { echo -e "[$(date +%H:%M:%S)] [OMP] $1"; }
log_ok(){ echo -e "[$(date +%H:%M:%S)] [OMP] ✅ $1"; }
log_err(){ echo -e "[$(date +%H:%M:%S)] [OMP] ❌ $1"; }

send_cmd(){
    local cmd="$1"; local timeout="${2:-300}"
    # Daemon is synchronous per phase: socket stays open until phase completes
    python3 -c "
import socket, json, sys
s=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM)
s.settimeout($timeout)
try:
    s.connect('$SOCK')
    s.send(('$cmd\n').encode())
    d=s.recv(16384).decode().strip()
    print(d if d else '{"error":"empty_response"}')
except socket.timeout:
    print('{"error":"timeout"}')
except Exception as e:
    print(f'{{"error":"{e}"}}')
finally:
    try: s.close()
    except: pass
" 2>/dev/null || echo '{"error":"socket_failed"}'
}

get_phase(){ python3 -c "import json; print(json.load(open('$STATE_FILE')).get('phase','?'))" 2>/dev/null || echo "?"; }
get_iter(){ python3 -c "import json; print(json.load(open('$STATE_FILE')).get('iteration',0))" 2>/dev/null || echo "0"; }

wait_daemon(){
    for i in $(seq 1 60); do
        [ -S "$SOCK" ] || { sleep 1; continue; }
        # Socket exists -- verify daemon is responsive
        local resp
        resp=$(python3 -c "
import socket
s=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM)
s.settimeout(2)
try:
    s.connect('$SOCK')
    s.send(b'status\n')
    d=s.recv(4096)
    print(d.decode().strip() if d else 'EMPTY')
    s.close()
except Exception as e:
    print('ERR:'+str(e))
" 2>/dev/null) || resp="ERR"
        [[ "$resp" == "ERR"* ]] && { sleep 1; continue; }
        [[ "$resp" == "EMPTY" ]] && { sleep 1; continue; }
        return 0
    done
    log_err "Daemon socket not ready after 60s"
    return 1
}

# ── Spawn parallel task agents ───────────────────────────────
spawn_agents(){
    local iteration="$1"
    rm -f "$AGENT_RESULTS_DIR"/result-*.json
    rm -f "$MA"/agent-pids.txt
    rm -f "$MA"/.agent-prompt-*.txt

    local count
    count=$(python3 -c "import json; print(len(json.load(open('$IMPL_FILE')).get('improvements',[])))" 2>/dev/null || echo 0)
    [ "$count" -eq 0 ] && { log "No improvements to implement"; return 0; }
    [ "$count" -gt $MAX_PARALLEL ] && count=$MAX_PARALLEL

    log "Spawning $count parallel task agent(s)..."

    # Get improvements as JSON lines
    python3 "$MA/spawn-agents.py" "$iteration"

}

# ── Run agent prompt from JSON ──────────────────────────────
run_agent(){
    local agent_id="$1"; local prompt="$2"
    (
        cd "$ROOT"
        claude --print "$prompt" --no-input > /dev/null 2>&1
    ) &
    echo "$agent_id|$!" >> "$MA/agent-pids.txt"
    log "  Agent [$agent_id] spawned PID=$!"
}

# ── Wait for all agents ─────────────────────────────────────
wait_agents(){
    local max_wait=600; local waited=0
    while true; do
        local running=0
        if [ -f "$MA/agent-pids.txt" ]; then
            while IFS='|' read -r aid pid; do
                [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null && running=$((running+1))
            done < "$MA/agent-pids.txt"
        fi
        [ $running -eq 0 ] && { log_ok "All agents finished"; return 0; }
        log "  Waiting: $running agent(s) still running... (${waited}s)"
        sleep 10; waited=$((waited+10))
        [ $waited -ge $max_wait ] && { log_err "Agent timeout"; return 1; }
    done
}

# ── Full iteration ──────────────────────────────────────────
run_iteration(){
    local iter=$(get_iter)
    log ""
    log "══════════════════════════════════════════"
    log "ITERATION $iter"
    log "══════════════════════════════════════════"

    # RESEARCH
    log "[1/6] RESEARCH..."
    send_cmd "phase research" 600

    local impl_count
    impl_count=$(python3 -c "import json; print(len(json.load(open('$IMPL_FILE')).get('improvements',[])))" 2>/dev/null || echo 0)
    log "  Found $impl_count improvement(s)"

    if [ "$impl_count" -eq 0 ]; then
        log "  No improvements — skipping to RELEASE"
        send_cmd "phase release" 60
        return 0
    fi

    # PLANNING
    log "[2/6] PLANNING..."
    send_cmd "phase planning" 60

    # IMPLEMENTATION — spawn parallel agents
    log "[3/6] IMPLEMENTATION (spawning $impl_count parallel agents)..."
    
    # Spawn agents via Python (handles backgrounding + PID tracking)
    log "  Spawning agents..."
    MA="$MA" ROOT="$ROOT" IMPL_FILE="$IMPL_FILE"         AGENT_RESULTS_DIR="$AGENT_RESULTS_DIR" PIDS_FILE="$MA/agent-pids.txt"         MAX_PARALLEL="$MAX_PARALLEL"         python3 "$MA/spawn-agents.py"

    # Wait for all spawned agents
    wait_agents || true

    # Collect results and advance
    log "[4/6] QA..."
    send_cmd "phase qa" 600

    log "[5/6] VALIDATION..."
    send_cmd "phase validation" 120

    log "[6/6] RELEASE..."
    send_cmd "phase release" 300

    log_ok "Iteration $(get_iter) COMPLETE"
}

# ── Main ────────────────────────────────────────────────────
main(){
    local max_iters="${1:-999999}"; local continuous="${2:-}"

    log "AKASHA OMP-native Loop starting..."
    log "Max iterations: $max_iters"

    # Start daemon if not running
    if ! [ -S "$SOCK" ]; then
        log "Starting socket daemon..."
        rm -f "$SOCK" "$STATE_FILE"
        python3 "$MA/akasha-loop-daemon.py" &
        sleep 3
        wait_daemon || exit 1
    else
        log "Daemon already running"
    fi

    log_ok "Daemon ready"

    local it=0
    while [ $it -lt $max_iters ]; do
        it=$(get_iter)
        run_iteration
        it=$(get_iter)
        [ -z "$continuous" ] && break
        sleep 3
    done

    log_ok "Loop complete. Iteration: $(get_iter)"
}

main "$@"
