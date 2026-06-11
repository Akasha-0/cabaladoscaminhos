#!/usr/bin/env bash
# ─── Telemetry para .autonomous loop (2026-06-11 N+7 turn 5) ───────────────────
# Persiste métricas de cada sessão em state/telemetry.json.
#
# Uso:
#   ./telemetry.sh record <session_num> <exit_code> <pending_before> <pending_after> <duration_sec> <feature_id?>
#   ./telemetry.sh summary
#   ./telemetry.sh reset

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
STATE_DIR="$PROJECT_DIR/.autonomous/state"
TELEMETRY_FILE="$STATE_DIR/telemetry.json"

mkdir -p "$STATE_DIR"

PY_RECORD=$(cat <<'PYEOF'
import json, sys
from pathlib import Path

session_num, exit_code, pending_before, pending_after, duration_sec, feature_id = (
    int(sys.argv[1]), int(sys.argv[2]),
    int(sys.argv[3]), int(sys.argv[4]),
    int(sys.argv[5]), sys.argv[6] or None
)
ts = __import__('datetime').datetime.now().isoformat(timespec='seconds')

tele_file = Path("$TELEMETRY_FILE")
if tele_file.exists():
    data = json.load(open(tele_file))
else:
    data = {"started_at": ts, "last_updated": ts, "sessions": []}

data["last_updated"] = ts
data["sessions"].append({
    "session_num": session_num,
    "ts": ts,
    "exit_code": exit_code,
    "success": exit_code == 0,
    "pending_before": pending_before,
    "pending_after": pending_after,
    "features_completed_this_session": pending_after < pending_before,
    "duration_sec": duration_sec,
    "feature_id": feature_id,
})

with open(tele_file, "w") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
PYEOF
)

PY_SUMMARY=$(cat <<'PYEOF'
import json
from pathlib import Path

tele_file = Path("$TELEMETRY_FILE")
if not tele_file.exists():
    print("Nenhuma telemetria gravada ainda.")
    sys.exit(0)

data = json.load(open(tele_file))
sessions = data["sessions"]
total = len(sessions)
success = sum(1 for s in sessions if s["success"])
failed = total - success
features_completed = sum(1 for s in sessions if s["features_completed_this_session"])
avg_duration = sum(s["duration_sec"] for s in sessions) / total if total else 0

print(f"=== Telemetria .autonomous loop ===")
print(f"Started: {data['started_at']}")
print(f"Last:   {data['last_updated']}")
print(f"Sessions: {total} (success: {success}, failed: {failed})")
rate_str = f"{success/total*100:.1f}%" if total else "N/A"
print(f"Success rate: {rate_str}")
print(f"Features completed: {features_completed}")
print(f"Avg duration: {avg_duration/60:.1f} min")
print()
print("Recent 5 sessions:")
for s in sessions[-5:]:
    status = "OK" if s["success"] else "FAIL"
    print(f"  [{status}] #{s['session_num']:03d} {s['ts']} exit={s['exit_code']} pending {s['pending_before']}->{s['pending_after']} dur={s['duration_sec']}s feat={s['feature_id']}")
PYEOF
)

case "${1:-summary}" in
  record)
    record_args=("$@")
    shift
    TELEMETRY_FILE="$TELEMETRY_FILE" python3 -c "$PY_RECORD" "$@"
    ;;
  summary)
    TELEMETRY_FILE="$TELEMETRY_FILE" python3 -c "$PY_SUMMARY"
    ;;
  reset)
    rm -f "$TELEMETRY_FILE"
    echo "Telemetria resetada."
    ;;
  *)
    echo "Uso: $0 {record|summary|reset} [args...]"
    exit 1
    ;;
esac
