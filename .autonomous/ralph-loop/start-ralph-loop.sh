#!/usr/bin/env bash
# start-ralph-loop.sh — Boot everything needed for the Ralph autonomous loop.
#
# 1. Headroom proxy (port 8787) — compresses tool outputs in-flight
# 2. Ralph-loop state initialization (if not already done)
# 3. Verifies CodeGraph index health
#
# Usage: ./start-ralph-loop.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VENV="$ROOT/.headroom-venv"
PROXY_LOG="$ROOT/.autonomous/ralph-loop/headroom-proxy.log"
PY="$VENV/bin/python"
LOOP="$ROOT/.autonomous/ralph-loop/akasha-ralph-loop.py"
PROXY_PID_FILE="$ROOT/.autonomous/ralph-loop/.headroom-proxy.pid"

echo "[ralph-start] Starting AKASHA Ralph-loop infrastructure..."

# ── 1. Headroom proxy ───────────────────────────────────────────────────────
if curl -fsS http://127.0.0.1:8787/livez >/dev/null 2>&1; then
    echo "[ralph-start] Headroom proxy already running on port 8787 ✅"
else
    echo "[ralph-start] Starting Headroom proxy on port 8787..."
    "$VENV/bin/headroom" proxy --port 8787 >"$PROXY_LOG" 2>&1 &
    PROXY_PID=$!
    echo $PROXY_PID >"$PROXY_PID_FILE"
    for i in {1..15}; do
        if curl -fsS http://127.0.0.1:8787/livez >/dev/null 2>&1; then
            echo "[ralph-start] Headroom proxy ready (pid=$PROXY_PID) ✅"
            break
        fi
        sleep 0.5
    done
fi

# ── 2. CodeGraph health check ────────────────────────────────────────────────
echo "[ralph-start] Checking CodeGraph index..."
CG_STATUS=$(codegraph status 2>&1 | head -3)
echo "$CG_STATUS"
if echo "$CG_STATUS" | grep -q "Already up to date\|Pending Changes: 0"; then
    echo "[ralph-start] CodeGraph index healthy ✅"
else
    echo "[ralph-start] CodeGraph has pending changes — run: codegraph sync"
fi

# ── 3. Ralph-loop state ─────────────────────────────────────────────────────
echo "[ralph-start] Checking Ralph-loop state..."
"$PY" "$LOOP" --action=status

echo ""
echo "[ralph-start] ✅ All infrastructure ready."
echo ""
echo "Next steps:"
echo "  1. Start the autonomous loop inside OMP:"
echo "       /loop 5m python3 .autonomous/ralph-loop/akasha-ralph-loop.py --action=loop"
echo ""
echo "  2. Or run a single step manually:"
echo "       python3 .autonomous/ralph-loop/akasha-ralph-loop.py --action=loop"
echo ""
echo "  3. Check status anytime:"
echo "       python3 .autonomous/ralph-loop/akasha-ralph-loop.py --action=status"
echo ""
echo "  4. Stop the loop:"
echo "       python3 .autonomous/ralph-loop/akasha-ralph-loop.py --action=stop"
