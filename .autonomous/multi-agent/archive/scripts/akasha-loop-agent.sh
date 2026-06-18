#!/usr/bin/env bash
# akasha-loop-agent.sh
# OMP autonomous loop — runs inside OMP as the main agent
# Phase-by-phase execution with OMP task subagents for IMPLEMENTATION
#
# Usage: bash akasha-loop-agent.sh [--continuous] [--phases N]
#
# Architecture:
#   OMP main agent ←→ state.json ←→ Python state utility (akasha-loop-omp.py)
#   OMP main agent ←→ task subagents (parallel IMPLEMENTATION)
#
# Continuous mode: uses ScheduleWakeup to chain phases

set -euo pipefail

ROOT="/home/skynet/cabala-dos-caminhos"
MA="$ROOT/.autonomous/multi-agent"
OMP="$HOME/.bun/bin/omp"
LOOP_PY="$MA/akasha-loop-omp.py"
STATE_FILE="$MA/state.json"
IMPL_FILE="$MA/omp-implementations.json"
RESULTS_FILE="$MA/omp-agent-results.json"
PROMPT_TEMPLATE="$MA/task-agent-prompt.md"

# ── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; NC='\033[0m'
log() { echo -e "${CYAN}[$(date -u +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# ── Phase execution ────────────────────────────────────────────────────────────
run_phase() {
    local phase="$1"
    log "Phase: $phase"
    local start=$(date +%s)
    python3 "$LOOP_PY" "$phase" 2>&1 | grep -v "^LSP" || true
    local rc=$?
    local elapsed=$(($(date +%s) - start))
    log "Phase '$phase' done in ${elapsed}s (rc=$rc)"
    return $rc
}

# ── Get current phase from state.json ────────────────────────────────────────
get_phase() {
    python3 -c "import json; d=json.load(open('$STATE_FILE')); print(d.get('phase','RESEARCH'))" 2>/dev/null || echo "RESEARCH"
}

# ── Get iteration from state.json ──────────────────────────────────────────────
get_iter() {
    python3 -c "import json; d=json.load(open('$STATE_FILE')); print(d.get('iteration',0))" 2>/dev/null || echo "0"
}

# ── Get improvements for IMPLEMENTATION ───────────────────────────────────────
get_improvements() {
    python3 -c "
import json
d = json.load(open('$IMPL_FILE'))
for i, imp in enumerate(d.get('improvements', [])):
    print(f\"{i}|{imp.get('type')}|{imp.get('description','')}|{json.dumps(imp.get('files',[]))}\")
" 2>/dev/null
}

# ── Spawn one task subagent for an improvement ────────────────────────────────
spawn_agent() {
    local idx="$1"
    local imp_type="$2"
    local imp_desc="$3"
    local imp_files="$4"
    local agent_id="ta-$(date +%s)-${idx}"

    log "  Spawning task agent: [$idx] $imp_type — $imp_desc"

    # Build the agent prompt from template
    python3 -c "
import json
template = open('$PROMPT_TEMPLATE').read()
# Replace placeholders
template = template.replace('{{IMPROVEMENT_JSON}}', json.dumps({
    'type': '$imp_type',
    'description': '''$imp_desc''',
    'files': json.loads('''$imp_files''' if '$imp_files' != '[]' else '[]')
}, indent=2))
template = template.replace('{{AGENT_ID}}', '$agent_id')
template = template.replace('{{TYPE}}', '$imp_type')
print(template)
" > "$MA/agent-prompt-${agent_id}.txt"

    # Spawn as background OMP agent
    # Use claude --print in background — lightweight parallel execution
    claude --print "$(cat "$MA/agent-prompt-${agent_id}.txt")" \
        --no-input --output-format stream-json \
        2>&1 | python3 -c "
import sys, json
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    try:
        d = json.loads(line)
        if d.get('type') == 'result':
            print('RESULT:', d.get('content','')[:100])
    except: pass
" &
    local pid=$!
    echo "$agent_id|$pid" >> "$MA/agent-pids.txt"
    log "  Agent $agent_id spawned (PID=$pid)"
}

# ── Wait for all task agents to complete ──────────────────────────────────────
wait_agents() {
    log "Waiting for ${1} task agent(s)..."
    local count=0
    while read -r line; do
        agent_id="${line%%|*}"
        pid="${line#*|}"
        if kill -0 "$pid" 2>/dev/null; then
            wait "$pid" 2>/dev/null || true
        fi
        count=$((count + 1))
    done < "$MA/agent-pids.txt"
    log "All $count task agent(s) finished"
    rm -f "$MA/agent-pids.txt" "$MA/agent-prompt-ta-"*.txt
}

# ── IMPLEMENTATION: spawn task subagents in parallel ───────────────────────────
run_implementation() {
    log "=== IMPLEMENTATION: spawning task subagents ==="

    # Ensure results file exists
    python3 -c "import json; f=open('$RESULTS_FILE','w'); json.dump({'results':[]},f)" 2>/dev/null || true
    rm -f "$MA/agent-pids.txt"

    local count=0
    while IFS='|' read -r idx imp_type imp_desc imp_files; do
        spawn_agent "$idx" "$imp_type" "$imp_desc" "$imp_files" &
        count=$((count + 1))
        # Max 5 parallel
        if [ $count -ge 5 ]; then
            wait -n 2>/dev/null || true
        fi
    done < <(get_improvements)

    # Wait for all
    wait

    # Collect results from agent result files
    log "Collecting task agent results..."
    python3 -c "
import json, glob, os
all_results = []
for f in glob.glob('$MA/agent-results/result-*.json'):
    try:
        d = json.load(open(f))
        all_results.append(d)
    except: pass
d = json.load(open('$RESULTS_FILE'))
d['results'] = all_results + d.get('results', [])
json.dump(d, open('$RESULTS_FILE','w'), indent=2)
ok = sum(1 for r in d['results'] if r.get('success'))
print(f'Collected {len(d[\"results\"])} results ({ok} successful)')
" 2>/dev/null || true

    log "Task subagents complete → advancing to QA"
}

# ── Bootstrap ────────────────────────────────────────────────────────────────
do_bootstrap() {
    log "=== BOOTSTRAP ==="
    run_phase bootstrap
}

# ── Main loop (one phase per call) ───────────────────────────────────────────
run_one_cycle() {
    local phase=$(get_phase)
    local iteration=$(get_iter)

    log "=== CYCLE | phase=$phase | iter=$iteration ==="

    case "$phase" in
        RESEARCH)
            run_phase research
            ;;
        PLANNING)
            run_phase planning
            ;;
        IMPLEMENTATION)
            # Read improvements, spawn task subagents
            if [ -f "$IMPL_FILE" ]; then
                run_implementation
            fi
            run_phase implementation  # records results + advances to QA
            ;;
        QA)
            run_phase qa
            ;;
        VALIDATION)
            run_phase validation
            ;;
        RELEASE)
            run_phase release
            ;;
        *)
            warn "Unknown phase '$phase' — resetting to RESEARCH"
            python3 -c "import json; d=json.load(open('$STATE_FILE')); d['phase']='RESEARCH'; json.dump(d,open('$STATE_FILE','w'),indent=2)" 2>/dev/null
            ;;
    esac
}

# ── Continuous loop (uses ScheduleWakeup) ─────────────────────────────────────
run_continuous() {
    log "Starting CONTINUOUS autonomous loop..."
    log "Press Ctrl+C to stop"
    local cycle=0

    while true; do
        cycle=$((cycle + 1))
        local phase=$(get_phase)
        local iteration=$(get_iter)

        log ""
        log "═══ CYCLE $cycle | phase=$phase | iter=$iteration ═══"

        # Run one phase
        run_one_cycle

        # Small pause between cycles
        sleep 2

        # Check stop signal
        if [ -f "$ROOT/.autonomous/state/stop.signal" ]; then
            log "Stop signal detected — exiting continuous loop"
            break
        fi

        # Log progress every 10 cycles
        if [ $((cycle % 10)) -eq 0 ]; then
            log "📊 Progress: $cycle cycles | phase=$phase | iter=$iteration"
        fi
    done
}

# ── Main ──────────────────────────────────────────────────────────────────────
MODE="${1:-one-shot}"
MAX_CYCLES="${2:-0}"  # 0 = unlimited

log "AKASHA Loop Agent — mode=$MODE"

# Ensure stop signal removed
rm -f "$ROOT/.autonomous/state/stop.signal"

case "$MODE" in
    continuous)
        run_continuous
        ;;
    one-shot|*)
        run_one_cycle
        ;;
esac
