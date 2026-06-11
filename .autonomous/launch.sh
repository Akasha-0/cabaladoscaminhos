#!/usr/bin/env bash
# launch.sh — Entry point único para iniciar o modo autônomo
# Uso:
#   .autonomous/launch.sh                  # auto-detect init vs resume
#   .autonomous/launch.sh --init           # força initializer
#   .autonomous/launch.sh --resume         # força coding loop
#   .autonomous/launch.sh --dry-run        # só mostra o que faria
#   .autonomous/launch.sh --stop           # escreve stop signal e sai
#   .autonomous/launch.sh --status         # mostra estado atual
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

MODE="auto"
MAX_SESSIONS=999
MAX_RUNTIME=86400
DRY_RUN=false
STOP_ONLY=false
STATUS_ONLY=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --init)                MODE="init"; shift ;;
    --resume)              MODE="resume"; shift ;;
    --dry-run)             DRY_RUN=true; shift ;;
    --stop)                STOP_ONLY=true; shift ;;
    --status)              STATUS_ONLY=true; shift ;;
    --max-sessions)        MAX_SESSIONS="$2"; shift 2 ;;
    --max-runtime-seconds) MAX_RUNTIME="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

log() { echo "[launch $(date +%H:%M:%S)] $*"; }

# STATUS
if [[ "$STATUS_ONLY" == true ]]; then
  log "STATUS do autonomous harness"
  echo "════════════════════════════════════════════════════════"
  echo "Project:       $PROJECT_DIR"
  echo "App spec:      $SCRIPT_DIR/app_spec.txt"
  echo "Feature list:  $SCRIPT_DIR/feature_list.json"
  echo "TODO queue:    $PROJECT_DIR/.claude/TODO.md"
  echo "Progress:      $SCRIPT_DIR/claude-progress.txt"
  echo "Sessions log:  $SCRIPT_DIR/sessions/"
  echo "State:         $SCRIPT_DIR/state/"
  echo "════════════════════════════════════════════════════════"
  if [[ -f "$SCRIPT_DIR/feature_list.json" ]]; then
    TOTAL=$(grep -c '"id":' "$SCRIPT_DIR/feature_list.json" 2>/dev/null)
    TOTAL=${TOTAL:-0}
    PASSED=$(grep -c '"passes": true' "$SCRIPT_DIR/feature_list.json" 2>/dev/null)
    PASSED=${PASSED:-0}
    PENDING=$((TOTAL - PASSED))
    echo "Features: $PASSED/$TOTAL passing ($PENDING pending)"
  else
    echo "Features: feature_list.json ausente (run --init)"
  fi
  if [[ -f "$PROJECT_DIR/.claude/TODO.md" ]]; then
    TODO_DONE=$(grep -c '^- \[x\]' "$PROJECT_DIR/.claude/TODO.md" 2>/dev/null)
    TODO_DONE=${TODO_DONE:-0}
    TODO_PENDING=$(grep -c '^- \[ \]' "$PROJECT_DIR/.claude/TODO.md" 2>/dev/null)
    TODO_PENDING=${TODO_PENDING:-0}
    echo "TODO: $TODO_DONE done, $TODO_PENDING pending"
  fi
  if [[ -f "$SCRIPT_DIR/initializer_done.signal" ]]; then
    echo "Phase: coding (initializer done)"
  else
    echo "Phase: initializer pending"
  fi
  if [[ -f "$SCRIPT_DIR/state/stop.signal" ]]; then
    echo "STOP SIGNAL ATIVO: $(cat "$SCRIPT_DIR/state/stop.signal")"
  fi
  echo "════════════════════════════════════════════════════════"
  exit 0
fi

# STOP
if [[ "$STOP_ONLY" == true ]]; then
  mkdir -p "$SCRIPT_DIR/state"
  echo "Manual stop em $(date -Iseconds)" > "$SCRIPT_DIR/state/stop.signal"
  log "Stop signal escrito. Orchestrator encerrará na próxima checagem."
  exit 0
fi

# Auto-detect
if [[ "$MODE" == "auto" ]]; then
  if [[ ! -f "$SCRIPT_DIR/initializer_done.signal" ]]; then
    MODE="init"
  else
    MODE="resume"
  fi
fi

# Pre-flight checks
log "Pre-flight checks..."
for f in app_spec.txt feature_list.json initializer_prompt.md coding_prompt.md orchestrator.sh; do
  if [[ ! -f "$SCRIPT_DIR/$f" ]]; then
    log "ERRO: $f ausente. Rode setup novamente."
    exit 1
  fi
done

if [[ ! -f "$PROJECT_DIR/.claude_settings.json" ]]; then
  log "ERRO: .claude_settings.json ausente no projeto."
  exit 1
fi

# ═══ FIX #1: Auto-criar .env se ausente (sem credenciais hardcoded) ═══
ENV_FILE="$PROJECT_DIR/apps/akasha-portal/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  log "FIX #1: .env ausente — criando template vazio (gitignored)"
  JWT_GEN=$(openssl rand -base64 48 2>/dev/null || echo "dev-jwt-fallback-please-rotate")
  cat > "$ENV_FILE" <<ENVEOF
# Dev-only .env (NÃO COMMITA — gitignored via Next.js default)
# Preencha DATABASE_URL com SEU valor. JWT_SECRET já vem gerado.
DATABASE_URL=""
JWT_SECRET="${JWT_GEN}"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENVEOF
  chmod 600 "$ENV_FILE"
  log "✓ .env criado em $ENV_FILE (permissões 600)"
  log "  ⚠ PREENCHA DATABASE_URL antes de iniciar o app."
fi

# ═══ FIX #2: Preflight DB check (só se DATABASE_URL preenchida) ═══
DB_URL=$(grep -E "^DATABASE_URL" "$ENV_FILE" 2>/dev/null | grep -v '=""' | head -1 | cut -d'"' -f2 || echo "")
if [[ -n "$DB_URL" ]] && command -v psql &>/dev/null; then
  DB_HOST=$(echo "$DB_URL" | sed -E 's|.*@([^:/]+).*|\1|')
  DB_PORT=$(echo "$DB_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
  DB_USER=$(echo "$DB_URL" | sed -E 's|.*://([^:]+):.*|\1|')
  if timeout 3 psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c "SELECT 1" &>/dev/null; then
    log "✓ DB pré-flight OK ($DB_HOST:$DB_PORT user=$DB_USER)"
  else
    log "⚠ DB pré-flight falhou: verifique credenciais + peer-auth"
  fi
fi

log "Modo detectado: $MODE"
log "Max sessions: $MAX_SESSIONS | Max runtime: ${MAX_RUNTIME}s"

# Init env se necessário
if [[ ! -d "$PROJECT_DIR/node_modules" ]] || [[ ! -d "$PROJECT_DIR/packages" ]]; then
  log "Rodando init.sh (primeira vez)..."
  bash "$SCRIPT_DIR/init.sh" --no-db 2>&1 | tail -10
fi

# DRY RUN
if [[ "$DRY_RUN" == true ]]; then
  log "════════════ DRY RUN ════════════"
  log "Spawnaria: claude --append-system-prompt-file .autonomous/${MODE}_prompt.md \\"
  log "                          --settings .claude_settings.json \\"
  log "                          --output-format stream-json --verbose \\"
  log "                          --dangerously-skip-permissions"
  log "Loop: respawn a cada exit, max $MAX_SESSIONS sessões ou ${MAX_RUNTIME}s"
  log "════════════════════════════════"
  exit 0
fi

# LAUNCH
log "═══════════════════════════════════════════════════════"
log "  AUTONOMOUS MODE — $MODE"
log "  Logs: tail -f $SCRIPT_DIR/sessions/session-*.log"
log "  Stop: $SCRIPT_DIR/launch.sh --stop"
log "  Status: $SCRIPT_DIR/launch.sh --status"
log "═══════════════════════════════════════════════════════"
exec bash "$SCRIPT_DIR/orchestrator.sh" "--$MODE" \
  --max-sessions "$MAX_SESSIONS" \
  --max-runtime-seconds "$MAX_RUNTIME"
