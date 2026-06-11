#!/usr/bin/env bash
# orchestrator.sh — Loop principal: spawn → wait → respawn
# Uso: orchestrator.sh [--init] [--max-sessions N] [--max-runtime-seconds N]
set -euo pipefail

# 2026-06-11: Disable GateGuard/ECC fact-forcing + observer overhead for max autonomy.
# User explicit: "desabilite" (GateGuard). Defense-in-depth (FORBIDDEN_PATTERNS)
# intact — destructive patterns still blocked by our pre-bash-allowlist.
export ECC_GATEGUARD=off
export ECC_DISABLED_HOOKS="pre:bash:gateguard-fact-force pre:edit-write:gateguard-fact-force pre:read:gateguard-fact-force"

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

# 2026-06-11: Detectar trabalho untracked significativo antes de spawn
# (work-in-progress paralelo de outro agente que o loop não deve duplicar).
# Se > 20 arquivos untracked em apps/ ou packages/, avisar a sessão.
UNTRACKED_COUNT=$(git status --porcelain 2>/dev/null | grep -c "^??")
if [[ $UNTRACKED_COUNT -gt 20 ]]; then
  log "⚠ $UNTRACKED_COUNT arquivos untracked detectados (work-in-progress paralelo?)"
  log "  Recomendação: revisar git status antes de modificar apps/ ou packages/"
  log "  Lista: git status --short | head -30"
fi

# 2026-06-11: Self-check feature_list.json antes de spawn.
# Sessão N+7 (supervisor) perdeu ~30 min porque feature_list.json foi
# commitado quebrado (entry R-014 orphan + R-015 missing). Esta check
# detecta JSON inválido e avisa a próxima sessão para corrigir primeiro.
if ! python3 -c "import json; json.load(open('$PROJECT_DIR/.autonomous/feature_list.json'))" 2>/dev/null; then
  log "✗ feature_list.json está INVÁLIDO — corrigir ANTES de começar trabalho"
  log "  Sintoma esperado: 'Expecting , delimiter' ou 'Illegal trailing comma'"
  log "  Fix: cp .autonomous/feature_list.json /tmp/x.json && python3 -c 'import json; ...'"
  log "  Ou: git checkout HEAD~K -- .autonomous/feature_list.json e re-aplicar update"
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


# ─── Pre-flight checks (2026-06-11 N+7 turn 4) ─────────────────────────────────
# Antes de cada spawn, valida:
# 1. feature_list.json é JSON válido (já existia)
# 2. feature_list não tem entries órfãs (id duplicado ou faltando)
# 3. core-astrology index tem exports essenciais (smoke test)
# 4. triad roda sem falhas catastróficas (3 packages)
# Problemas não-bloqueantes (warning) — loop continua mas supervisor pode ver.
log "─── Pre-flight checks ───"

# Check 1: JSON válido
if ! python3 -c "import json; json.load(open('$SCRIPT_DIR/feature_list.json'))" 2>/dev/null; then
  log "✗ FAIL: feature_list.json inválido — não posso spawnar"
  log "  Fix: cp .autonomous/feature_list.json /tmp/x.json && python3 -c 'import json; ...'"
  exit 1
fi

# Check 2: detectar entries órfãs (id duplicado ou faltando)
ORPHAN_COUNT=$(python3 -c "
import json
data = json.load(open('$SCRIPT_DIR/feature_list.json'))
seen = set()
dups = 0
missing_id = 0
for f in data:
    if 'id' not in f:
        missing_id += 1
    elif f['id'] in seen:
        dups += 1
    else:
        seen.add(f['id'])
print(missing_id + dups)
" 2>/dev/null || echo 0)
if [[ $ORPHAN_COUNT -gt 0 ]]; then
  log "⚠ $ORPHAN_COUNT entries órfãs em feature_list.json (id duplicado ou faltando)"
  log "  Recomendação: revisar e corrigir antes de commitar"
fi

# Check 3: smoke test (rodar 3 packages; timeout 60s)
SMOKE_RESULT=$(timeout 60 pnpm exec vitest run packages/akasha-core/ packages/core-astrology/ packages/core-iching/ 2>&1 | tail -3 | grep -E "Tests +[0-9]+ passed|FAIL")
if [[ "$SMOKE_RESULT" == *"FAIL"* ]]; then
  log "⚠ Smoke test falhou (mas vou spawnar — supervisor decide)"
else
  log "✓ Smoke test: $SMOKE_RESULT"
fi

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

PENDING=$(python3 -c "
import json
try:
    data = json.load(open('$SCRIPT_DIR/feature_list.json'))
    print(sum(1 for f in data if not f.get('passes', False)))
except Exception:
    print(0)
" 2>/dev/null || echo 0)
TODO_PENDING=$(grep -c '^- \[ \]' "$PROJECT_DIR/.claude/TODO.md" 2>/dev/null || echo 0)
PENDING=${PENDING:-0}
TODO_PENDING=${TODO_PENDING:-0}
log "Estado: $PENDING features pendentes | $TODO_PENDING TODOs pendentes"

# ─── General failure-rate circuit-breaker (2026-06-11 N+7) ─────────────────
# Além do 429, se exit != 0 E features pendentes não diminuíram, contar
# failure consecutiva. Após 5 failures consecutivos → auto-stop.
# (429 já tem circuit-breaker próprio; este cobre outros failure modes)
STATE_FAIL="$STATE_DIR/fail-counter"
if [[ $EXIT_CODE -ne 0 && $PENDING -gt 0 ]]; then
  FAIL_COUNT=$(cat "$STATE_FAIL" 2>/dev/null || echo 0)
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "$FAIL_COUNT" > "$STATE_FAIL"
  log "⚠ Sessão falhou (exit=$EXIT_CODE, fail_count=$FAIL_COUNT)"
  if [[ $FAIL_COUNT -ge 5 ]]; then
    log "✗ 5+ sessões consecutivas falhando — auto-stop (loop travado em padrão de erro)"
    echo "Auto-stop: 5+ sessões consecutivas falhando em $(date -Iseconds)" > "$stop_signal"
    exit 0
  fi
else
  # Sessão bem-sucedida (exit 0 ou fila vazia) — resetar contador
  [[ -f "$STATE_FAIL" ]] && rm -f "$STATE_FAIL"
fi


if [[ $PENDING -eq 0 && $TODO_PENDING -eq 0 ]]; then
  log "✓ Fila vazia — autonomous work completo!"
  echo "Fila vazia em $(date -Iseconds)" > "$stop_signal"
  exit 0
fi

if [[ -f "$stop_signal" ]]; then
  log "Stop signal apareceu durante a sessão — encerrando."
  exit 0
fi

# ─── Circuit-breaker para 429 Token Plan (2026-06-11) ─────────────────────
# Sessão morre com 429 = token plan exhausted. Sem circuit-breaker, loop
# respawna 3+ vezes em sequência desperdiçando ~10 min wall-clock cada.
# Fix: detectar "429" ou "Token Plan" no log + contar consecutivos em
# state/429-counter. Após 3 consecutivos → stop.signal automático.
STATE_429="$STATE_DIR/429-counter"
if [[ -f "$SESSION_LOG" ]] && grep -qE "429|Token Plan|rate_limit" "$SESSION_LOG" 2>/dev/null; then
  COUNT=$(cat "$STATE_429" 2>/dev/null || echo 0)
  COUNT=$((COUNT + 1))
  echo "$COUNT" > "$STATE_429"
  log "⚠ 429 detectado (count=$COUNT) — backoff ${COUNT}0s antes do próximo respawn"
  sleep $((COUNT * 10))
  if [[ $COUNT -ge 3 ]]; then
    log "✗ 3+ sessões consecutivas com 429 — escrevendo stop.signal (token plan exhausted, reset necessário)"
    echo "Auto-stop: 3+ sessões consecutivas com 429 Token Plan exhausted em $(date -Iseconds)" > "$stop_signal"
    exit 0
  fi
else
  # Sessão bem-sucedida (sem 429) — resetar contador
  [[ -f "$STATE_429" ]] && rm -f "$STATE_429"
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
