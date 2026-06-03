#!/usr/bin/env bash
# cabala-loop-runner.sh — Executa ONE iteration of the cabala-autonomous-loop
# Chamado pelo cron ou manualmente.
# Uso: ./cabala-loop-runner.sh [quick|hourly|night|standup|weekly]

set -euo pipefail

MODE="${1:-hourly}"
PROJECT_DIR="/home/skynet/cabala-dos-caminhos"
MEMORY_DIR="/home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory"
LOOP_PROMPT="${MEMORY_DIR}/loop-prompt.md"
TASK_QUEUE="${MEMORY_DIR}/task-queue.md"
CYCLE_DIR="${MEMORY_DIR}"

# ─── Guards ───────────────────────────────────────────────────────────────────
if [ ! -d "$PROJECT_DIR/.git" ]; then
  echo "ERROR: $PROJECT_DIR is not a git repo" >&2
  exit 1
fi

if [ ! -f "$LOOP_PROMPT" ]; then
  echo "ERROR: loop-prompt.md not found at $LOOP_PROMPT" >&2
  exit 1
fi

# Lock to prevent concurrent runs of same mode
LOCK_DIR="${PROJECT_DIR}/.claude/state/locks/cabala-loop"
mkdir -p "$LOCK_DIR"
if ! mkdir "${LOCK_DIR}/${MODE}.lock" 2>/dev/null; then
  echo "ALREADY_RUNNING: cabala-loop ($MODE) is already running. Exiting." >&2
  exit 0
fi
trap "rm -rf '${LOCK_DIR}/${MODE}.lock' 2>/dev/null || true" EXIT INT TERM

cd "$PROJECT_DIR"

# ─── Mode-specific limits ──────────────────────────────────────────────────────
MAX_BUDGET=45
TASK_FILTER=""

case "$MODE" in
  quick)
    MAX_BUDGET=15
    TASK_FILTER="P0|P1"
    ;;
  hourly)
    MAX_BUDGET=45
    TASK_FILTER="P0|P1|P2"
    ;;
  night)
    MAX_BUDGET=540
    TASK_FILTER="P0|P1|P2"
    ;;
  standup)
    MAX_BUDGET=5
    TASK_FILTER=""
    ;;
  weekly)
    MAX_BUDGET=30
    TASK_FILTER=""
    ;;
  *)
    echo "Unknown mode: $MODE" >&2
    echo "Usage: $0 [quick|hourly|night|standup|weekly]" >&2
    exit 1
    ;;
esac

# ─── Budget tracking ─────────────────────────────────────────────────────────
START_EPOCH="$(date +%s)"
BUDGET_SECONDS=$((MAX_BUDGET * 60))

echo "[$(date '+%Y-%m-%d %H:%M:%S')] CABALA LOOP START — mode=$MODE budget=${MAX_BUDGET}min"

# ─── Build prompt ──────────────────────────────────────────────────────────────
MODE_INSTRUCTIONS=""

if [ "$MODE" = "quick" ]; then
  MODE_INSTRUCTIONS="Escolha APENAS tarefas P0 ou P1 (<=15min de trabalho).
Execute UMA tarefa, commite, rode verify triad (npm run build + npm run test:run).
Se task-queue vazia, faça pequeno refactor ou doc update."
elif [ "$MODE" = "night" ]; then
  MODE_INSTRUCTIONS="Execute quantas iterações caberem das 23h às 08h (até ${MAX_BUDGET}min).
Trabalhe P0 → P1 → P2.
Commite após cada iteração.
Pare se: build quebrado 5x seguidas, budget > 95%, ou 5+ fases completadas."
elif [ "$MODE" = "hourly" ]; then
  MODE_INSTRUCTIONS="Execute 1 iteração completa do loop-prompt.md (ASSESS → PLAN → EXECUTE → VERIFY → EVOLVE).
Pare se: build falhou 5x consecutivas, budget > 90%, sem tarefas restantes."
elif [ "$MODE" = "standup" ]; then
  MODE_INSTRUCTIONS="Escreva relatório diário apenas (NÃO implemente nada).
Formato: (1) estado do projeto, (2) próxima fase, (3) blockers, (4) test count, (5) 1 ação concreta."
elif [ "$MODE" = "weekly" ]; then
  MODE_INSTRUCTIONS="Execute manutenção semanal apenas (NÃO implemente features):
1) python3 ~/.claude/plugins/cache/ecc/ecc/2.0.0-rc.1/skills/continuous-learning-v2/scripts/instinct-cli.py prune
2) instinct-cli evolve --generate
3) Limpe cycle logs velhos (mantenha só últimos 20)
4) Update MEMORY.md index"
fi

PROMPT="MODO: $MODE
PROJETO: Cabala dos Caminhos
LOOP PROMPT: $LOOP_PROMPT
TASK QUEUE: $TASK_QUEUE
CLAUDE_OUTPUT="$(mktemp)"
CLAUDE_ERR="$(mktemp)"
CLAUDE_MODEL="${CLAUDE_MODEL:-MiniMax-M2.7}"
export CLAUDE_MODEL
# Run claude -p from within the project directory
(cd "$PROJECT_DIR" && claude -p "$PROMPT" > "$CLAUDE_OUTPUT" 2>"$CLAUDE_ERR") || true
Execute e report o resultado final."

# ─── Execute via claude -p ───────────────────────────────────────────────────
CLAUDE_OUTPUT="$(mktemp)"
CLAUDE_ERR="$(mktemp)"

CLAUDE_MODEL="${CLAUDE_MODEL:-MiniMax-M2.7}"
export CLAUDE_MODEL

claude -p "$PROMPT" \
  --project "$PROJECT_DIR" \
  --output "$CLAUDE_OUTPUT" \
  2>"$CLAUDE_ERR" || true

CLAUDE_EXIT=$?

# ─── Post-execution bookkeeping ───────────────────────────────────────────────
END_EPOCH="$(date +%s)"
ELAPSED=$((END_EPOCH - START_EPOCH))
BUDGET_PCT=0
[ "$BUDGET_SECONDS" -gt 0 ] && BUDGET_PCT=$((ELAPSED * 100 / BUDGET_SECONDS))

# Log to cycle memory
CYCLE_NR=$(ls "$CYCLE_DIR"/cycle-*.md 2>/dev/null | sed 's/.*cycle-\([0-9]*\).*/\1/' | sort -n | tail -1)
NEXT_CYCLE=$((CYCLE_NR + 1))
TIMESTAMP="$(date '+%Y-%m-%dT%H:%M:%SZ')"

LOG_FILE="${CYCLE_DIR}/cycle-${NEXT_CYCLE}.md"
mkdir -p "$CYCLE_DIR"

# Capture output safely
OUTPUT_CONTENT="$(cat "$CLAUDE_OUTPUT" 2>/dev/null | head -100 || echo "(no output)")"
ERR_CONTENT="$(cat "$CLAUDE_ERR" 2>/dev/null | grep -v "^$" | head -20 || echo "")"

cat > "$LOG_FILE" <<'CYCLE_EOF'
---
name: cycle-%CYCLE_NR%
description: Autonomous loop iteration — mode=%MODE%
metadata:
  node_type: memory
  type: project
  mode: "%MODE%"
  timestamp: "%TIMESTAMP%"
  elapsed_seconds: %ELAPSED%
  budget_pct: %BUDGET_PCT%
  budget_minutes: %MAX_BUDGET%
  exit_code: %CLAUDE_EXIT%
  claude_model: "%CLAUDE_MODEL%"
---

# Cycle %CYCLE_NR% — %DATE% — mode=%MODE%

**Executado em:** %TIMESTAMP%
**Duracao:** %ELAPSED%s (%MAX_BUDGET%min budget, %BUDGET_PCT%%% usado)
**Exit code:** %CLAUDE_EXIT%

## Output

```
%OUTPUT%
```

## Errors

```
%ERROR%
```

CYCLE_EOF

# Replace placeholders in cycle file
sed -i \
  -e "s/%CYCLE_NR%/${NEXT_CYCLE}/g" \
  -e "s/%MODE%/${MODE}/g" \
  -e "s/%TIMESTAMP%/${TIMESTAMP}/g" \
  -e "s/%ELAPSED%/${ELAPSED}/g" \
  -e "s/%BUDGET_PCT%/${BUDGET_PCT}/g" \
  -e "s/%MAX_BUDGET%/${MAX_BUDGET}/g" \
  -e "s/%CLAUDE_EXIT%/${CLAUDE_EXIT}/g" \
  -e "s/%CLAUDE_MODEL%/${CLAUDE_MODEL}/g" \
  -e "s/%DATE%/$(date '+%Y-%m-%d %H:%M')/g" \
  -e "s/%OUTPUT%/$(printf '%s' "$OUTPUT_CONTENT" | sed 's/\\/\\\\/g' | sed ':a;N;$!ba;s/\n/\\n/g')/g" \
  -e "s/%ERROR%/$(printf '%s' "$ERR_CONTENT" | sed 's/\\/\\\\/g' | sed ':a;N;$!ba;s/\n/\\n/g')/g" \
  "$LOG_FILE"

# Cleanup temp files
rm -f "$CLAUDE_OUTPUT" "$CLAUDE_ERR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] CABALA LOOP END — elapsed=${ELAPSED}s (${BUDGET_PCT}% budget) exit=$CLAUDE_EXIT"
echo "  Cycle log: $LOG_FILE"

# Update MEMORY.md index
if [ -f "${MEMORY_DIR}/MEMORY.md" ]; then
  TMP_MEM=$(mktemp)
  {
    head -5 "${MEMORY_DIR}/MEMORY.md"
    echo "- [Cycle ${NEXT_CYCLE}](cycle-${NEXT_CYCLE}.md) — $MODE — $(date '+%Y-%m-%d') — ${ELAPSED}s"
    tail -n +6 "${MEMORY_DIR}/MEMORY.md" 2>/dev/null || true
  } > "$TMP_MEM" && mv "$TMP_MEM" "${MEMORY_DIR}/MEMORY.md"
fi

# Update scheduled_tasks.json last_run
if [ -f "${PROJECT_DIR}/.claude/scheduled_tasks.json" ]; then
  TASK_ID=""
  case "$MODE" in
    quick)   TASK_ID="cabala-quick-cycle" ;;
    hourly)  TASK_ID="cabala-hourly-cycle" ;;
    night)   TASK_ID="cabala-night-shift" ;;
    standup) TASK_ID="cabala-daily-standup" ;;
    weekly)  TASK_ID="cabala-weekly-evolve" ;;
  esac

  if [ -n "$TASK_ID" ]; then
    node -e "
const fs = require('fs');
try {
  const data = JSON.parse(fs.readFileSync('${PROJECT_DIR}/.claude/scheduled_tasks.json', 'utf8'));
  const task = data.tasks.find(t => t.id === '$TASK_ID');
  if (task) {
    task.last_run = '$TIMESTAMP';
    task.last_status = $CLAUDE_EXIT === 0 ? 'success' : 'failed';
  }
  fs.writeFileSync('${PROJECT_DIR}/.claude/scheduled_tasks.json', JSON.stringify(data, null, 2));
} catch(e) { /* ignore */ }
" 2>/dev/null || true
  fi
fi

exit $CLAUDE_EXIT
