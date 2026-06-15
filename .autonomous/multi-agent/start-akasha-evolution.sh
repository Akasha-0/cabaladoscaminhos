#!/usr/bin/env bash
# start-akasha-evolution.sh
# Starts the AKASHA autonomous evolution loop inside OMP.
# Usage: bash start-akasha-evolution.sh [start|status|stop]
#
# The loop runs as a long-running OMP session that:
#   1. Bootstraps fresh project context every iteration
#   2. Spawns 5 specialized sub-agents in parallel
#   3. Executes 6-phase state machine
#   4. Evolves exponentially via memory.json

set -euo pipefail

ROOT="/home/skynet/cabala-dos-caminhos"
MA="$ROOT/.autonomous/multi-agent"
LOOP_SCRIPT="$MA/akasha-evolution-loop.py"
STATE_FILE="$MA/state.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${CYAN}[$(date -u +%Y-%m-%dT%H:%M:%SZ)]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# Ensure stop.signal is removed (allows loop to run)
STOP_FILE="$ROOT/.autonomous/state/stop.signal"
if [ -f "$STOP_FILE" ]; then
    log "Removing stale stop.signal..."
    rm -f "$STOP_FILE"
fi

# Bootstrap: verify prerequisites
log "Checking prerequisites..."

if ! command -v python3 &>/dev/null; then
    err "python3 not found"
    exit 1
fi

if [ ! -f "$LOOP_SCRIPT" ]; then
    err "Loop script not found: $LOOP_SCRIPT"
    exit 1
fi

if [ ! -d "$ROOT/.codegraph" ]; then
    warn "CodeGraph index not found — run: codegraph setup"
fi

# Check OMP binary
OMP="/home/skynet/.bun/bin/omp"
if [ ! -x "$OMP" ]; then
    warn "OMP binary not found at $OMP"
fi

# Check Headroom proxy
if curl -s --max-time 2 http://127.0.0.1:8787/health &>/dev/null; then
    log "Headroom proxy: ✅ running on :8787"
else
    warn "Headroom proxy not responding on :8787 — starting..."
    if [ -x "$ROOT/.headroom-venv/bin/headroom" ]; then
        nohup "$ROOT/.headroom-venv/bin/headroom" serve --port 8787 \
            > "$ROOT/.autonomous/ralph-loop/headroom-proxy.log" 2>&1 &
        sleep 2
    fi
fi

# Ensure codegraph is synced
log "Syncing CodeGraph index..."
cd "$ROOT"
codegraph sync 2>/dev/null || true

# Mark loop as running
python3 "$LOOP_SCRIPT" start

# Run one iteration as smoke test
log "Running smoke test iteration..."
python3 "$LOOP_SCRIPT" run

# Check result
STATE=$(python3 -c "import json; d=json.load(open('$STATE_FILE')); print(d.get('phase','?'))" 2>/dev/null || echo "?")
ITER=$(python3 -c "import json; d=json.load(open('$STATE_FILE')); print(d.get('iteration','?'))" 2>/dev/null || echo "?")

log ""
log "═══ AKASHA Evolution Loop ═══"
log "  Script:   $LOOP_SCRIPT"
log "  Phase:    $STATE"
log "  Iteration: $ITER"
log ""
log "To run the FULL autonomous loop inside OMP:"
log ""
log "  1. In OMP, activate the loop:"
log "       /loop 9999999999"
log "       → say: 'start akasha-evolution'"
log ""
log "  2. Or run iterations manually:"
log "       python3 $LOOP_SCRIPT run"
log ""
log "  3. Check status:"
log "       python3 $LOOP_SCRIPT status"
log ""
log "  4. Stop:"
log "       python3 $LOOP_SCRIPT stop"
log ""
log "The loop will:"
log "  ✅ Bootstrap fresh context every iteration"
log "  ✅ Run RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE"
log "  ✅ Spawn 5 agents in parallel (researcher, architect, coder, qa, validator)"
log "  ✅ Make evidence-based decisions via intelligence.py"
log "  ✅ Accumulate learnings in memory.json (exponential learning)"
log "  ✅ Use CodeGraph for architecture decisions"
log "  ✅ Compress large outputs with Headroom"
log ""
log "Smoke test complete. Phase: $STATE | Iteration: $ITER"
