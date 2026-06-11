#!/usr/bin/env bash
# orchestrator.sh — Loop principal: spawn → wait → respawn
# Uso: orchestrator.sh [--init] [--max-sessions N] [--max-runtime-seconds N]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

STATE_DIR="$SCRIPT_DIR/state"
SESSIONS_DIR="$SCRIPT_DIR/sessions"
PROGRESS="$SCRIPT_DIR/claude-progress.txt"

mkdir -p "$STATE_DIR" "$SESSIONS_DIR"
touch "$PROGRESS"

MODE="resume"
MAX_SESSIONS=999
MAX_RUNTIME=86400   # 24h
START_TS=$(date +%s)

while [[ $# -gt 0 ]]; do
  case "$1" in
    --init)                MODE="init"; shift ;;
    --max-sessions)        MAX_SESSIONS="$2"; shift 2 ;;
    --max-runtime-seconds) MAX_RUNTIME="$2"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

log() { echo "[orch $(date +%H:%M:%S)] $*"; }

# Stop signal
stop_signal="$STATE_DIR/stop.signal"
if [[ -f "$stop_signal" ]]; then
  log "Stop signal presente em $stop_signal — encerrando."
  cat "$stop_signal"
  exit 0
fi

# Selecionar prompt
if [[ "$MODE" == "init" || ! -f "$SCRIPT_DIR/initializer_done.signal" ]]; then
  PROMPT_FILE="$SCRIPT_DIR/initializer_prompt.md"
  log "Modo: INIT (primeira sessão)"
else
  PROMPT_FILE="$SCRIPT_DIR/coding_prompt.md"
  log "Modo: RESUME (continuação)"
fi

SESSION_NUM=$(ls "$SESSIONS_DIR"/session-*.log 2>/dev/null | wc -l)
SESSION_NUM=$((SESSION_NUM + 1))

log "═══════════════════════════════════════════════════════"
log "Sessão #$SESSION_NUM (max=$MAX_SESSIONS, runtime_max=${MAX_RUNTIME}s)"
log "Prompt: $(basename "$PROMPT_FILE")"
log "═══════════════════════════════════════════════════════"

SETTINGS_FILE="$PROJECT_DIR/.claude_settings.json"
SESSION_LOG="$SESSIONS_DIR/session-$(printf '%03d' "$SESSION_NUM").log"

EXIT_CODE=0
# 2026-06-11 FIX: claude 2.1.168 em modo non-TTY falha com "Input must be provided"
# e mostra trust dialog TUI mesmo com --dangerously-skip-permissions.
# Solução: --print + stdin pipe de bootstrap prompt JSON. Sem `script` wrapper
# (script consome stdin, não passa pro child). Headless puro.
BOOTSTRAP_PROMPT="$SCRIPT_DIR/bootstrap-prompt.json"
if [[ -f "$BOOTSTRAP_PROMPT" ]]; then
  cat "$BOOTSTRAP_PROMPT" | claude \
    --print \
    --append-system-prompt-file "$PROMPT_FILE" \
    --settings "$SETTINGS_FILE" \
    --input-format stream-json \
    --output-format stream-json \
    --verbose \
    --dangerously-skip-permissions \
    2>&1 | tee "$SESSION_LOG" || EXIT_CODE=$?
else
  log "ERRO: $BOOTSTRAP_PROMPT ausente"
  exit 1
fi

log "Sessão #$SESSION_NUM terminou com exit=$EXIT_CODE"

if [[ "$PROMPT_FILE" == *"initializer"* ]]; then
  touch "$SCRIPT_DIR/initializer_done.signal"
  log "Initializer concluído — próximas sessões usarão coding_prompt.md"
fi

PENDING=$(grep -c '"passes": false' "$SCRIPT_DIR/feature_list.json" 2>/dev/null)
PENDING=${PENDING:-0}
TODO_PENDING=$(grep -c '^- \[ \]' "$PROJECT_DIR/.claude/TODO.md" 2>/dev/null)
TODO_PENDING=${TODO_PENDING:-0}
log "Estado: $PENDING features pendentes | $TODO_PENDING TODOs pendentes"

if [[ $PENDING -eq 0 && $TODO_PENDING -eq 0 ]]; then
  log "✓ Fila vazia — autonomous work completo!"
  echo "Fila vazia em $(date -Iseconds)" > "$stop_signal"
  exit 0
fi

if [[ -f "$stop_signal" ]]; then
  log "Stop signal apareceu durante a sessão — encerrando."
  exit 0
fi

ELAPSED=$(( $(date +%s) - START_TS ))
if [[ $ELAPSED -ge $MAX_RUNTIME ]]; then
  log "Runtime max atingido (${ELAPSED}s/${MAX_RUNTIME}s) — encerrando."
  exit 0
fi

if [[ $SESSION_NUM -ge $MAX_SESSIONS ]]; then
  log "Max sessions atingido ($SESSION_NUM) — encerrando."
  exit 0
fi

log "Respawn em 3s..."
sleep 3
exec "$0" --max-sessions "$MAX_SESSIONS" --max-runtime-seconds "$MAX_RUNTIME"
