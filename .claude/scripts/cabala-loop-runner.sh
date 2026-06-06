#!/usr/bin/env bash
# cabala-loop-runner.sh — ONE iteration, MAX_CONCURRENT=1 enforced

CLAUDE_BIN="${CLAUDE_BIN:-${HOME}/.local/bin/claude}"
if ! command -v "$CLAUDE_BIN" 2>/dev/null; then
  CLAUDE_BIN="claude"
fi

set -euo pipefail

MODE="${1:-hourly}"
PROJECT_DIR="/home/skynet/cabala-dos-caminhos"
MEMORY_DIR="/home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory"
LOOP_PROMPT="${MEMORY_DIR}/loop-prompt.md"
TASK_QUEUE="${MEMORY_DIR}/task-queue.md"
CYCLE_DIR="${MEMORY_DIR}"

# MAX CONCURRENT GUARD — grep returns 1 when no match, use ||true to avoid exit
MAX_CONCURRENT="${MAX_CONCURRENT:-1}"
set +e
RUNNING=$(ps aux 2>/dev/null | grep -F "claude -p" 2>/dev/null | grep -v "grep" | grep -v "cabala-loop-runner" | grep -v "mcp\|context7\|github" | wc -l | tr -d " \n" || echo 0)
set -e
if [ "$RUNNING" -ge "$MAX_CONCURRENT" ]; then
  echo "SKIP: $RUNNING >= $MAX_CONCURRENT procesos ja rodando."
  exit 0
fi

# LOCK
LOCK_DIR="${PROJECT_DIR}/.claude/state/locks/cabala-loop"
mkdir -p "$LOCK_DIR"
LOCKFILE="${LOCK_DIR}/${MODE}.lock"
if ! mkdir "$LOCKFILE" 2>/dev/null; then
  echo "SKIP: lock $MODE ja existe"
  exit 0
fi
trap "rm -rf '$LOCKFILE' 2>/dev/null || true" EXIT INT TERM

# LIMITS
MAX_BUDGET=15
case "$MODE" in
  quick)   MAX_BUDGET=15 ;;
  hourly)  MAX_BUDGET=45 ;;
  night)   MAX_BUDGET=540 ;;
  standup) MAX_BUDGET=5 ;;
  weekly)  MAX_BUDGET=30 ;;
  *)
    echo "Usage: $0 [quick|hourly|night|standup|weekly]" >&2; exit 1 ;;
esac

BUDGET_SECONDS=$((MAX_BUDGET * 60))
START_EPOCH="$(date +%s)"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] START — mode=$MODE budget=${MAX_BUDGET}min (running=$RUNNING)"

# MODE INSTRUCTIONS
MODE_INSTRUCTIONS=""
case "$MODE" in
  quick)
    MODE_INSTRUCTIONS="Escolha APENAS tarefas P0 ou P1 (<=15min).
Execute UMA tarefa, commite, rode npm run build + npm run test:run.
Se task-queue vazia, pequeno refactor ou doc update." ;;
  hourly)
    MODE_INSTRUCTIONS="Execute 1 iteracao loop-prompt.md (ASSESS->PLAN->EXECUTE->VERIFY->EVOLVE).
Pare se: build 5x falhou, budget > 90%, sem tarefas." ;;
  night)
    MODE_INSTRUCTIONS="Execute quantas iteracoes caberem ate ${MAX_BUDGET}min.
P0->P1->P2. Commite cada iteracao. Pare: build 5x, budget 95%, 5+ fases." ;;
  standup)
    MODE_INSTRUCTIONS="Relatorio diario APENAS (NAO implemente).
(1) estado, (2) proxima fase, (3) blockers, (4) test count, (5) 1 acao." ;;
  weekly)
    MODE_INSTRUCTIONS="Manutencao semanal APENAS.
1) instinct-cli prune  2) instinct-cli evolve  3) limpe cycle logs  4) MEMORY.md" ;;
esac

PROMPT="MODO: $MODE
PROJETO: Cabala dos Caminhos
LOOP: $LOOP_PROMPT
QUEUE: $TASK_QUEUE

Execute loop-prompt.md neste projeto.

MODO $MODE:
${MODE_INSTRUCTIONS}

cwd: $PROJECT_DIR
prompt: $LOOP_PROMPT
queue: $TASK_QUEUE
memory: $CYCLE_DIR

Execute e commite."

# EXECUTE
CLAUDE_OUTPUT="$(mktemp)"
CLAUDE_ERR="$(mktemp)"
CLAUDE_MODEL="${CLAUDE_MODEL:-MiniMax-M2.7}"
export CLAUDE_MODEL

(cd "$PROJECT_DIR" && "$CLAUDE_BIN" -p --permission-mode=bypassPermissions "$PROMPT" > "$CLAUDE_OUTPUT" 2>"$CLAUDE_ERR") || true

# BOOKKEEPING
END_EPOCH="$(date +%s)"
ELAPSED=$((END_EPOCH - START_EPOCH))
BUDGET_PCT=0
[ "$BUDGET_SECONDS" -gt 0 ] && BUDGET_PCT=$((ELAPSED * 100 / BUDGET_SECONDS))

CYCLE_NR=$(ls "$CYCLE_DIR"/cycle-*.md 2>/dev/null | sed 's/.*cycle-\([0-9]*\).*/\1/' | sort -n | tail -1)
NEXT_CYCLE=$((CYCLE_NR + 1))
TIMESTAMP="$(date '+%Y-%m-%dT%H:%M:%SZ')"
LOG_FILE="${CYCLE_DIR}/cycle-${NEXT_CYCLE}.md"
mkdir -p "$CYCLE_DIR"

OUTPUT_CONTENT="$(cat "$CLAUDE_OUTPUT" 2>/dev/null | head -100 || echo '(no output)')"
ERR_CONTENT="$(cat "$CLAUDE_ERR" 2>/dev/null | grep -v '^$' | head -20 || echo '')"

{
  echo "---"
  echo "name: cycle-${NEXT_CYCLE}"
  echo "mode: ${MODE}"
  echo "timestamp: ${TIMESTAMP}"
  echo "elapsed_seconds: ${ELAPSED}"
  echo "budget_minutes: ${MAX_BUDGET}"
  echo "exit_code: 0"
  echo "claude_model: ${CLAUDE_MODEL}"
  echo "---"
  echo ""
  echo "# Cycle ${NEXT_CYCLE} — $(date '+%Y-%m-%d %H:%M') — ${MODE}"
  echo ""
  echo "Executado: ${TIMESTAMP} | Duracao: ${ELAPSED}s | Budget: ${MAX_BUDGET}min (${BUDGET_PCT}% usado)"
  echo ""
  echo "## Output"
  echo '```'
  echo "$OUTPUT_CONTENT"
  echo '```'
  echo ""
  echo "## Errors"
  echo '```'
  echo "$ERR_CONTENT"
  echo '```'
} > "$LOG_FILE"

rm -f "$CLAUDE_OUTPUT" "$CLAUDE_ERR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] END — cycle-${NEXT_CYCLE} — ${ELAPSED}s (${BUDGET_PCT}% budget)"
echo "  Log: $LOG_FILE"

# MEMORY.md index
if [ -f "${MEMORY_DIR}/MEMORY.md" ]; then
  TMP="$(mktemp)"
  { head -5 "${MEMORY_DIR}/MEMORY.md"; echo "- [cycle-${NEXT_CYCLE}](cycle-${NEXT_CYCLE}.md) — $MODE — $(date '+%Y-%m-%d') — ${ELAPSED}s"; tail -n +6 "${MEMORY_DIR}/MEMORY.md" 2>/dev/null || true; } > "$TMP" && mv "$TMP" "${MEMORY_DIR}/MEMORY.md"
fi

# scheduled_tasks.json
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
const fs=require('fs');
try{var d=JSON.parse(fs.readFileSync('${PROJECT_DIR}/.claude/scheduled_tasks.json','utf8'));
var t=d.tasks.find(function(x){return x.id=='$TASK_ID'});
if(t){t.last_run='$TIMESTAMP';t.last_status='success';}
fs.writeFileSync('${PROJECT_DIR}/.claude/scheduled_tasks.json',JSON.stringify(d,null,2));}catch(e){}
" 2>/dev/null || true
  fi
fi
