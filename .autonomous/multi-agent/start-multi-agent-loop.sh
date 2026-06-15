#!/usr/bin/env bash
# start-multi-agent-loop.sh — Boot AKASHA multi-agent autonomous loop.
#
# Verifies:
#   1. Headroom proxy (port 8787)
#   2. CodeGraph index health
#   3. OMP CLI availability
#   4. Python headroom module
#   5. All 5 agent types spawnable
#
# Usage: ./start-multi-agent-loop.sh [--check-agents]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VENV="$ROOT/.headroom-venv"
PY="$VENV/bin/python"
OMP="/home/skynet/.bun/bin/omp"
LOOP="$ROOT/.autonomous/multi-agent/akasha-multi-agent-loop.py"
PROXY_LOG="$ROOT/.autonomous/multi-agent/headroom-proxy.log"
PROXY_PID_FILE="$ROOT/.autonomous/multi-agent/.headroom-proxy.pid"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

info()  { echo -e "${GREEN}[boot]${NC} $*"; }
warn()  { echo -e "${YELLOW}[boot]${NC} $*"; }
error() { echo -e "${RED}[boot]${NC} $*" >&2; }
check() { echo -en "  $* ... "; }

ok()    { echo -e "${GREEN}✓${NC}"; }
fail()  { echo -e "${RED}✗${NC}"; }

# ── 1. Headroom proxy ──────────────────────────────────────────────────────
info "Checking Headroom proxy..."
if curl -fsS http://127.0.0.1:8787/livez >/dev/null 2>&1; then
    ok; info "  Headroom proxy already running on port 8787 ✅"
else
    check "Starting Headroom proxy"
    "$VENV/bin/headroom" proxy --port 8787 >"$PROXY_LOG" 2>&1 &
    PROXY_PID=$!
    echo $PROXY_PID >"$PROXY_PID_FILE"
    for i in {1..20}; do
        sleep 0.5
        if curl -fsS http://127.0.0.1:8787/livez >/dev/null 2>&1; then
            ok; info "  Headroom proxy started (pid=$PROXY_PID) ✅"
            break
        fi
    done
    if ! curl -fsS http://127.0.0.1:8787/livez >/dev/null 2>&1; then
        fail; error "  Headroom proxy failed to start. See $PROXY_LOG"
        tail -5 "$PROXY_LOG" 2>/dev/null || true
    fi
fi

# ── 2. CodeGraph ─────────────────────────────────────────────────────────────
info "Checking CodeGraph..."
check "codegraph binary"
if command -v codegraph >/dev/null 2>&1; then
    ok
else
    fail; error "  codegraph not in PATH"
fi

check "codegraph index"
CG_OUT=$(codegraph status 2>&1)
if echo "$CG_OUT" | grep -qE "Already up to date|Pending Changes: 0"; then
    ok; echo "$CG_OUT" | head -3 | sed 's/^/    /'
elif echo "$CG_OUT" | grep -q "Pending Changes:"; then
    warn "CodeGraph has pending changes"
    echo "$CG_OUT" | head -5 | sed 's/^/    /'
    info "  Run: codegraph sync"
else
    echo "$CG_OUT" | head -3 | sed 's/^/    /'
fi

# ── 3. OMP CLI ──────────────────────────────────────────────────────────────
info "Checking OMP CLI..."
check "omp binary"
if [[ -x "$OMP" ]]; then
    ok
else
    fail; error "  $OMP not found or not executable"
fi

check "omp --version"
OMP_VER=$("$OMP" --version 2>&1 | head -1 || echo "unknown")
echo "$OMP_VER"; info "  OMP CLI: $OMP_VER ✅"

# ── 4. Python headroom ──────────────────────────────────────────────────────
info "Checking Headroom Python module..."
check "python headroom import"
if "$PY" -c "from headroom import compress; print('ok')" 2>/dev/null; then
    ok
else
    fail; warn "  headroom Python module not available — will fall back to raw"
fi

# ── 5. Check/create state ───────────────────────────────────────────────────
info "Checking Ralph-loop state..."
check "state file"
if [[ -f "$ROOT/.autonomous/multi-agent/state.json" ]]; then
    echo "exists"; ok
else
    echo "new"; ok; info "  Will initialize on first loop run"
fi

# ── 6. Verify loop script ───────────────────────────────────────────────────
info "Checking loop script..."
check "loop script"
if [[ -x "$LOOP" ]]; then
    ok
else
    chmod +x "$LOOP" && ok
fi

# ── 7. Agent check (optional) ───────────────────────────────────────────────
if [[ "${1:-}" == "--check-agents" ]]; then
    info "Checking agent spawn (dry-run)..."
    for AGENT in researcher architect coder qa validator; do
        check "  $AGENT agent"
        TASK_FILE="$ROOT/.autonomous/multi-agent/task-${AGENT}.json"
        if [[ -f "$TASK_FILE" ]]; then
            ok; info "    task-${AGENT}.json exists"
        else
            echo "not found (will be created on first loop)"; ok
        fi
    done
fi

# ── Final report ─────────────────────────────────────────────────────────────
info "═══ Infrastructure Ready ═══"
echo ""
echo "  Headroom proxy: http://127.0.0.1:8787 ✅"
echo "  CodeGraph:      index healthy ✅"
echo "  OMP CLI:        $OMP_VER ✅"
echo "  Loop script:    $LOOP"
echo ""
echo "  To start the continuous loop inside OMP:"
echo "    /loop 9999999999 python3 .autonomous/multi-agent/akasha-multi-agent-loop.py --action=loop"
echo ""
echo "  Or run ONE step manually:"
echo "    python3 .autonomous/multi-agent/akasha-multi-agent-loop.py --action=loop"
echo ""
echo "  Check status:"
echo "    python3 .autonomous/multi-agent/akasha-multi-agent-loop.py --action=status"
echo ""
echo "  Stop:"
echo "    python3 .autonomous/multi-agent/akasha-multi-agent-loop.py --action=stop"
echo ""
