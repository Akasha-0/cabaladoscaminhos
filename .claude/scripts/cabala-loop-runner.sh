#!/usr/bin/env bash
# cabala-loop-runner.sh — Executa ONE iteration of the cabala-autonomous-loop
# Uso: ./cabala-loop-runner.sh [quick|hourly|night|standup|weekly]

set -euo pipefail

MODE="${1:-hourly}"
PROJECT_DIR="/home/skynet/cabala-dos-caminhos"
MEMORY_DIR="/home/skynet/.claude/projects/-home-skynet-cabala-dos-caminhos/memory"
LOOP_PROMPT="${MEMORY_DIR}/loop-prompt.md"
TASK_QUEUE="${MEMORY_DIR}/task-queue.md"
CYCLE_DIR="${MEMORY_DIR}"

# Guards
if [ ! -d "$PROJECT_DIR/.git" ]; then
  echo "ERROR: $PROJECT_DIR is not a git repo" >&2
  exit 1
fi
if [ ! -f "$LOOP_PROMPT" ]; then
  echo "ERROR: loop-prompt.md not found at $LOOP_PROMPT" >&2
  exit 1
fi

# Lock to prevent concurrent runs
LOCK_DIR="${PROJECT_DIR}/.claude/state/locks/cabala-loop"
mkdir -p "$LOCK_DIR"
if ! mkdir "${LOCK_DIR}/${MODE}.lock" 2>/dev/null; then
  echo "ALREADY_RUNNING: cabala-loop ($MODE) is already running. Exiting." >&2
  exit 0
fi
trap "rm -rf '${LOCK_DIR}/${MODE}.lock' 2>/dev/null || true" EXIT INT TERM

# Mode-specific limits
MAX_BUDGET=45
case "$MODE" in
  quick)   MAX_BUDGET=15 ;;
  hourly)  MAX_BUDGET=45 ;;
  night)   MAX_BUDGET=540 ;;
  standup) MAX_BUDGET=5 ;;
  weekly)  MAX_BUDGET=30 ;;
  *)
    echo "Usage: $0 [quick|hourly|night|standup|weekly]" >&2
    exit 1
    ;;
esac

BUDGET_SECONDS=$((MAX_BUDGET * 60))
START_EPOCH="$(date +%s)"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] CABALA LOOP START — mode=$MODE budget=${MAX_BUDGET}min"

# Build mode instructions
MODE_INSTRUCTIONS=""
case "$MODE" in
  quick)
    MODE_INSTRUCTIONS="Escolha APENAS tarefas P0 ou P1 (<=15min de trabalho).
Execute UMA tarefa, commite, rode verify triad (npm run build + npm run test:run).
Se task-queue vazia, faca pequeno refactor ou doc update." ;;
  hourly)
    MODE_INSTRUCTIONS="Execute 1 iteracao completa do loop-prompt.md (ASSESS → PLAN → EXECUTE → VERIFY → EVOLVE).
Pare se: build falhou 5x consecutivas, budget > 90%, sem tarefas restantes." ;;
  night)
    MODE_INSTRUCTIONS="Execute quantas iteracoes caberem das 23h às 08h (ate ${MAX_BUDGET}min).
Trabalhe P0 → P1 → P2.
Commite apos cada iteracao.
Pare se: build quebrado 5x seguidas, budget > 95%, ou 5+ fases completadas." ;;
  standup)
    MODE_INSTRUCTIONS="Escreva relatorio diario apenas (NAO implemente nada).
Formato: (1) estado do projeto, (2) proxima fase, (3) blockers, (4) test count, (5) 1 acao concreta." ;;
  weekly)
    MODE_INSTRUCTIONS="Execute manutencao semanal apenas (NAO implemente features):
1) python3 ~/.claude/plugins/cache/ecc/ecc/2.0.0-rc.1/skills/continuous-learning-v2/scripts/instinct-cli.py prune
2) instinct-cli evolve --generate
3) Limpe cycle logs velhos (mantenha so ultimos 20)
4) Update MEMORY.md index" ;;
esac

# Build prompt
PROMPT="MODO: $MODE
PROJETO: Cabala dos Caminhos
LOOP PROMPT: $LOOP_PROMPT
TASK QUEUE: $TASK_QUEUE

Execute o loop-prompt.md neste projeto.

**INSTRUCOES ESPECIFICAS DO MODO $MODE:**
${MODE_INSTRUCTIONS}

**AMBIENTE:**
- cwd: ${PROJECT_DIR}
- loop-prompt: ${LOOP_PROMPT}
- task-queue: ${TASK_QUEUE}
- memory dir: ${CYCLE_DIR}

Execute e report o resultado final."

# Execute via claude -p (must run from project dir)
CLAUDE_OUTPUT="$(mktemp)"
CLAUDE_ERR="$(mktemp)"
CLAUDE_MODEL="${CLAUDE_MODEL:-MiniMax-M2.7}"
export CLAUDE_MODEL

(cd "$PROJECT_DIR" && claude -p "$PROMPT" > "$CLAUDE_OUTPUT" 2>"$CLAUDE_ERR") || true

# Post-execution bookkeeping
END_EPOCH="$(date +%s)"
ELAPSED=$((END_EPOCH - START_EPOCH))
BUDGET_PCT=0
[ "$BUDGET_SECONDS" -gt 0 ] && BUDGET_PCT=$((ELAPSED * 100 / BUDGET_SECONDS))

CYCLE_NR=$(ls "$CYCLE_DIR"/cycle-*.md 2>/dev/null | sed 's/.*cycle-\([0-9]*\).*/\1/' | sort -n | tail -1)
NEXT_CYCLE=$((CYCLE_NR + 1))
TIMESTAMP="$(date '+%Y-%m-%dT%H:%M:%SZ')"
LOG_FILE="${CYCLE_DIR}/cycle-${NEXT_CYCLE}.md"
mkdir -p "$CYCLE_DIR"

OUTPUT_CONTENT="$(cat "$CLAUDE_OUTPUT" 2>/dev/null | head -100 || echo "(no output)")"
ERR_CONTENT="$(cat "$CLAUDE_ERR" 2>/dev/null | grep -v "^$" | head -20 || echo "")"

# Write cycle log using sed-safe placeholders
{
  echo "---"
  echo "name: cycle-${NEXT_CYCLE}"
  echo "description: Autonomous loop iteration — mode=${MODE}"
  echo "mode: ${MODE}"
  echo "timestamp: ${TIMESTAMP}"
  echo "elapsed_seconds: ${ELAPSED}"
  echo "budget_minutes: ${MAX_BUDGET}"
  echo "exit_code: 0"
  echo "claude_model: ${CLAUDE_MODEL}"
  echo "---"
  echo ""
  echo "# Cycle ${NEXT_CYCLE} — $(date '+%Y-%m-%d %H:%M') — mode=${MODE}"
  echo ""
  echo "Executado em: ${TIMESTAMP}"
  echo "Duracao: ${ELAPSED}s (${MAX_BUDGET}min budget, ${BUDGET_PCT}% usado)"
  echo ""
  echo "## Output"
  echo ""
  echo '```'
  echo "$OUTPUT_CONTENT"
  echo '```'
  echo ""
  echo "## Errors"
  echo ""
  echo '```'
  echo "$ERR_CONTENT"
  echo '```'
} > "$LOG_FILE"

rm -f "$CLAUDE_OUTPUT" "$CLAUDE_ERR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] CABALA LOOP END — elapsed=${ELAPSED}s (${BUDGET_PCT}% budget)"
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

# Update scheduled_tasks.json
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
  if (task) { task.last_run = '$TIMESTAMP'; task.last_status = 'success'; }
  fs.writeFileSync('${PROJECT_DIR}/.claude/scheduled_tasks.json', JSON.stringify(data, null, 2));
} catch(e) {}
" 2>/dev/null || true
  fi
fi
