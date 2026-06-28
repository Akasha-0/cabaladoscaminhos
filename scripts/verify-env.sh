#!/usr/bin/env bash
# ============================================================================
# scripts/verify-env.sh — Wave 27 — Verificador de env vars + conectividade
# ============================================================================
# Verifica que:
#   1. Todas as env vars REQUIRED estão setadas (server-only + client-safe)
#   2. DATABASE_URL conecta em um SELECT 1 (timeout 5s)
#   3. Supabase responde em /auth/v1/health (timeout 3s)
#   4. OpenAI API key válida (GET /v1/models — timeout 5s)
#   5. [opcional] Anthropic / MiniMax — idem
#   6. [opcional] Redis ping
#
# Output:
#   🟢 GREEN  → var setada / connectivity OK
#   🟡 YELLOW → var opcional faltando / connectivity failed mas tolerável
#   🔴 RED    → var required faltando / connectivity failed
#
# Exit codes:
#   0 = tudo green (ou yellow-only)
#   1 = pelo menos um RED
#
# Uso:
#   bash scripts/verify-env.sh                       # usa .env.local
#   bash scripts/verify-env.sh --env-file=.env.prod  # arquivo específico
#   bash scripts/verify-env.sh --skip-connectivity   # só checa vars
#   bash scripts/verify-env.sh --dry-run             # só lista required vars
#   bash scripts/verify-env.sh --help
#
# NÃO modifica nada — read-only check.
# ============================================================================

set -u

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# ---------------------------------------------------------------------------
# Args
# ---------------------------------------------------------------------------

ENV_FILE="${PROJECT_ROOT}/.env.local"
SKIP_CONNECTIVITY=0
DRY_RUN=0
VERBOSE=0

for arg in "$@"; do
  case "$arg" in
    --env-file=*)
      ENV_FILE="${arg#*=}"
      ;;
    --skip-connectivity)
      SKIP_CONNECTIVITY=1
      ;;
    --dry-run)
      DRY_RUN=1
      SKIP_CONNECTIVITY=1
      ;;
    --verbose|-v)
      VERBOSE=1
      ;;
    --help|-h)
      cat <<EOF
Uso: bash scripts/verify-env.sh [opções]

Opções:
  --env-file=PATH        Carrega env vars de PATH (default: .env.local)
  --skip-connectivity    Só checa vars, não testa DB/Supabase/OpenAI
  --dry-run              Lista required vars e sai
  --verbose, -v          Mostra detalhes de cada check
  --help, -h             Esta ajuda

Exit codes:
  0 = todos os checks verdes (yellow OK)
  1 = pelo menos um RED

Exemplos:
  bash scripts/verify-env.sh
  bash scripts/verify-env.sh --env-file=.env.production
  bash scripts/verify-env.sh --skip-connectivity  # rápido
  bash scripts/verify-env.sh --dry-run             # CI matrix
EOF
      exit 0
      ;;
    *)
      echo "⚠️  Argumento desconhecido: $arg (use --help)" >&2
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Cores
# ---------------------------------------------------------------------------

if [[ -t 1 ]]; then
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  RED='\033[0;31m'
  BLUE='\033[0;34m'
  BOLD='\033[1m'
  DIM='\033[2m'
  RESET='\033[0m'
else
  GREEN=''; YELLOW=''; RED=''; BLUE=''; BOLD=''; DIM=''; RESET=''
fi

# ---------------------------------------------------------------------------
# Banner
# ---------------------------------------------------------------------------

echo -e "${BOLD}╔════════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║  Cabala dos Caminhos — verify-env.sh (Wave 27)                 ║${RESET}"
echo -e "${BOLD}╚════════════════════════════════════════════════════════════════╝${RESET}"
echo ""

# ---------------------------------------------------------------------------
# Carregar env file
# ---------------------------------------------------------------------------

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
  echo -e "${BLUE}ℹ${RESET} Carregado env file: ${BOLD}$ENV_FILE${RESET} ($(grep -c '=' "$ENV_FILE" 2>/dev/null || echo 0) vars)"
else
  echo -e "${YELLOW}⚠${RESET} Env file não encontrado: $ENV_FILE (usando ambiente shell)"
fi
echo ""

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

RED_COUNT=0
YELLOW_COUNT=0
GREEN_COUNT=0

check_var() {
  local name="$1"
  local required="${2:-required}"  # required | optional

  local value="${!name:-}"

  if [[ -z "$value" ]]; then
    if [[ "$required" == "required" ]]; then
      echo -e "  ${RED}✗${RESET} ${BOLD}$name${RESET} ${RED}MISSING (required)${RESET}"
      RED_COUNT=$((RED_COUNT + 1))
    else
      echo -e "  ${YELLOW}○${RESET} ${DIM}$name${RESET} ${YELLOW}not set (optional)${RESET}"
      YELLOW_COUNT=$((YELLOW_COUNT + 1))
    fi
  else
    if [[ "$required" == "required" ]]; then
      # Mask secrets
      local masked="${value:0:4}***${value: -4}"
      [[ ${#value} -le 12 ]] && masked="***"
      echo -e "  ${GREEN}✓${RESET} ${BOLD}$name${RESET} ${GREEN}set${RESET} ${DIM}($masked)${RESET}"
      GREEN_COUNT=$((GREEN_COUNT + 1))
    else
      [[ $VERBOSE -eq 1 ]] && echo -e "  ${GREEN}✓${RESET} ${DIM}$name${RESET} ${GREEN}set${RESET}"
      [[ $VERBOSE -eq 1 ]] && GREEN_COUNT=$((GREEN_COUNT + 1))
      [[ $VERBOSE -eq 0 ]] && GREEN_COUNT=$((GREEN_COUNT + 1))
    fi
  fi
}

check_connectivity() {
  local label="$1"
  local url="$2"
  local timeout="${3:-5}"
  local method="${4:-GET}"

  if [[ -z "$url" ]]; then
    echo -e "  ${YELLOW}○${RESET} ${label}: ${YELLOW}skip${RESET} (no URL)"
    YELLOW_COUNT=$((YELLOW_COUNT + 1))
    return 0
  fi

  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$timeout" -X "$method" "$url" 2>/dev/null || echo "000")

  if [[ "$http_code" =~ ^(200|201|204|301|302|401|403)$ ]]; then
    # 401/403 ainda é OK — significa que o endpoint existe e respondeu (auth required)
    echo -e "  ${GREEN}✓${RESET} ${label}: ${GREEN}reachable${RESET} ${DIM}(HTTP $http_code)${RESET}"
    GREEN_COUNT=$((GREEN_COUNT + 1))
    return 0
  else
    echo -e "  ${RED}✗${RESET} ${label}: ${RED}unreachable${RESET} ${DIM}(HTTP $http_code)${RESET}"
    RED_COUNT=$((RED_COUNT + 1))
    return 1
  fi
}

# ---------------------------------------------------------------------------
# 1. Required vars
# ---------------------------------------------------------------------------

echo -e "${BOLD}── Required env vars ──${RESET}"
check_var "DATABASE_URL" "required"
check_var "NEXT_PUBLIC_SUPABASE_URL" "required"
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "required"
echo ""

# ---------------------------------------------------------------------------
# 2. Strongly recommended (warning se faltar)
# ---------------------------------------------------------------------------

echo -e "${BOLD}── Strongly recommended (warning se faltar) ──${RESET}"
check_var "SUPABASE_SERVICE_ROLE_KEY" "optional"
check_var "OPENAI_API_KEY" "optional"
check_var "RESEND_API_KEY" "optional"
check_var "SENTRY_DSN" "optional"
check_var "NEXT_PUBLIC_POSTHOG_KEY" "optional"
check_var "CRON_SECRET" "optional"
check_var "NEXT_PUBLIC_VAPID_PUBLIC_KEY" "optional"
check_var "VAPID_PRIVATE_KEY" "optional"
check_var "NEXT_PUBLIC_APP_URL" "optional"
echo ""

# ---------------------------------------------------------------------------
# 3. Optional (low priority)
# ---------------------------------------------------------------------------

if [[ $VERBOSE -eq 1 ]]; then
  echo -e "${BOLD}── Optional ──${RESET}"
  check_var "REDIS_URL" "optional"
  check_var "ANTHROPIC_AUTH_TOKEN" "optional"
  check_var "MINIMAX_API_TOKEN" "optional"
  check_var "ALLOWED_ORIGINS" "optional"
  check_var "ADMIN_EMAILS" "optional"
  check_var "AUDIT_IP_SALT" "optional"
  echo ""
fi

# ---------------------------------------------------------------------------
# Dry run — só lista required e sai
# ---------------------------------------------------------------------------

if [[ $DRY_RUN -eq 1 ]]; then
  echo -e "${BLUE}ℹ${RESET} Dry-run — pulando connectivity checks"
  echo ""
  echo -e "${BOLD}── Resumo ──${RESET}"
  echo -e "  ${GREEN}green${RESET}:  $GREEN_COUNT"
  echo -e "  ${YELLOW}yellow${RESET}: $YELLOW_COUNT"
  echo -e "  ${RED}red${RESET}:    $RED_COUNT"
  exit 0
fi

# ---------------------------------------------------------------------------
# 4. Connectivity
# ---------------------------------------------------------------------------

if [[ $SKIP_CONNECTIVITY -eq 1 ]]; then
  echo -e "${BLUE}ℹ${RESET} --skip-connectivity — pulando testes de rede"
  echo ""
  echo -e "${BOLD}── Resumo ──${RESET}"
  echo -e "  ${GREEN}green${RESET}:  $GREEN_COUNT"
  echo -e "  ${YELLOW}yellow${RESET}: $YELLOW_COUNT"
  echo -e "  ${RED}red${RESET}:    $RED_COUNT"
  [[ $RED_COUNT -gt 0 ]] && exit 1
  exit 0
fi

echo -e "${BOLD}── Connectivity checks ──${RESET}"

# Database
if [[ -n "${DATABASE_URL:-}" ]]; then
  # Tenta `psql`; se não tiver, faz HTTP-like check via Node.js + pg
  if command -v psql &>/dev/null; then
    if timeout 5 psql "${DATABASE_URL}" -c "SELECT 1" &>/dev/null; then
      echo -e "  ${GREEN}✓${RESET} DATABASE_URL: ${GREEN}conectou${RESET} ${DIM}(via psql)${RESET}"
      GREEN_COUNT=$((GREEN_COUNT + 1))
    else
      echo -e "  ${RED}✗${RESET} DATABASE_URL: ${RED}falhou SELECT 1${RESET}"
      RED_COUNT=$((RED_COUNT + 1))
    fi
  else
    # Fallback: tenta via Node.js (assumindo node_modules instalado)
    if [[ -f "node_modules/pg/package.json" ]]; then
      local_result=$(node -e "
        const { Client } = require('pg');
        const c = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
        c.connect()
          .then(() => c.query('SELECT 1'))
          .then(() => { console.log('OK'); process.exit(0); })
          .catch(e => { console.error('FAIL:', e.message); process.exit(1); })
          .finally(() => c.end());
      " 2>&1)
      if [[ $? -eq 0 ]]; then
        echo -e "  ${GREEN}✓${RESET} DATABASE_URL: ${GREEN}conectou${RESET} ${DIM}(via node pg)${RESET}"
        GREEN_COUNT=$((GREEN_COUNT + 1))
      else
        echo -e "  ${RED}✗${RESET} DATABASE_URL: ${RED}falhou${RESET} ${DIM}($local_result)${RESET}"
        RED_COUNT=$((RED_COUNT + 1))
      fi
    else
      echo -e "  ${YELLOW}○${RESET} DATABASE_URL: ${YELLOW}skip${RESET} ${DIM}(psql não disponível, pg não instalado)${RESET}"
      YELLOW_COUNT=$((YELLOW_COUNT + 1))
    fi
  fi
else
  echo -e "  ${YELLOW}○${RESET} DATABASE_URL: ${YELLOW}skip${RESET} (não setada)"
  YELLOW_COUNT=$((YELLOW_COUNT + 1))
fi

# Supabase
if [[ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" ]]; then
  check_connectivity "Supabase /auth/v1/health" "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health" 3
else
  echo -e "  ${YELLOW}○${RESET} Supabase: ${YELLOW}skip${RESET} (NEXT_PUBLIC_SUPABASE_URL não setada)"
  YELLOW_COUNT=$((YELLOW_COUNT + 1))
fi

# OpenAI
if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  OPENAI_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
    -H "Authorization: Bearer ${OPENAI_API_KEY}" \
    "https://api.openai.com/v1/models" 2>/dev/null || echo "000")
  if [[ "$OPENAI_HTTP" == "200" ]]; then
    echo -e "  ${GREEN}✓${RESET} OpenAI: ${GREEN}key válida${RESET} ${DIM}(GET /v1/models HTTP 200)${RESET}"
    GREEN_COUNT=$((GREEN_COUNT + 1))
  else
    echo -e "  ${RED}✗${RESET} OpenAI: ${RED}key inválida${RESET} ${DIM}(HTTP $OPENAI_HTTP)${RESET}"
    RED_COUNT=$((RED_COUNT + 1))
  fi
else
  echo -e "  ${YELLOW}○${RESET} OpenAI: ${YELLOW}skip${RESET} (OPENAI_API_KEY não setada)"
  YELLOW_COUNT=$((YELLOW_COUNT + 1))
fi

# Anthropic / MiniMax (optional)
if [[ -n "${ANTHROPIC_AUTH_TOKEN:-}" && -n "${ANTHROPIC_BASE_URL:-}" ]]; then
  ANTHROPIC_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
    -H "x-api-key: ${ANTHROPIC_AUTH_TOKEN}" \
    -H "anthropic-version: 2023-06-01" \
    "${ANTHROPIC_BASE_URL}/v1/models" 2>/dev/null || echo "000")
  if [[ "$ANTHROPIC_HTTP" =~ ^(200|404)$ ]]; then
    echo -e "  ${GREEN}✓${RESET} Anthropic/MiniMax: ${GREEN}reachable${RESET} ${DIM}(HTTP $ANTHROPIC_HTTP)${RESET}"
    GREEN_COUNT=$((GREEN_COUNT + 1))
  else
    echo -e "  ${YELLOW}○${RESET} Anthropic/MiniMax: ${YELLOW}unreachable${RESET} ${DIM}(HTTP $ANTHROPIC_HTTP)${RESET}"
    YELLOW_COUNT=$((YELLOW_COUNT + 1))
  fi
fi

# PostHog
if [[ -n "${NEXT_PUBLIC_POSTHOG_KEY:-}" ]]; then
  POSTHOG_HOST="${NEXT_PUBLIC_POSTHOG_HOST:-https://us.i.posthog.com}"
  check_connectivity "PostHog" "${POSTHOG_HOST}/_health" 5
fi

# Redis (opcional)
if [[ -n "${REDIS_URL:-}" && "${REDIS_URL}" != "redis://localhost:6379" ]]; then
  if command -v redis-cli &>/dev/null; then
    if timeout 3 redis-cli -u "$REDIS_URL" ping 2>/dev/null | grep -q "PONG"; then
      echo -e "  ${GREEN}✓${RESET} Redis: ${GREEN}PONG${RESET}"
      GREEN_COUNT=$((GREEN_COUNT + 1))
    else
      echo -e "  ${YELLOW}○${RESET} Redis: ${YELLOW}unreachable${RESET}"
      YELLOW_COUNT=$((YELLOW_COUNT + 1))
    fi
  else
    echo -e "  ${YELLOW}○${RESET} Redis: ${YELLOW}skip${RESET} ${DIM}(redis-cli não disponível)${RESET}"
    YELLOW_COUNT=$((YELLOW_COUNT + 1))
  fi
fi

echo ""

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

echo -e "${BOLD}── Resumo ──${RESET}"
echo -e "  ${GREEN}✓ green${RESET}:  $GREEN_COUNT"
echo -e "  ${YELLOW}○ yellow${RESET}: $YELLOW_COUNT"
echo -e "  ${RED}✗ red${RESET}:    $RED_COUNT"
echo ""

if [[ $RED_COUNT -gt 0 ]]; then
  echo -e "${RED}❌ FAIL${RESET} — $RED_COUNT check(s) bloqueante(s)"
  echo -e "   → Veja ${BOLD}docs/SECRETS-CHECKLIST-W27.md${RESET} para como resolver"
  exit 1
elif [[ $YELLOW_COUNT -gt 0 ]]; then
  echo -e "${YELLOW}⚠ PASS (com warnings)${RESET} — $YELLOW_COUNT check(s) opcionais pendentes"
  echo -e "   → Deploy possível, mas considere resolver antes de ir pra prod"
  exit 0
else
  echo -e "${GREEN}✅ PASS${RESET} — todos os checks verdes"
  exit 0
fi