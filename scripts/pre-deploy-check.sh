#!/usr/bin/env bash
# ============================================================================
# scripts/pre-deploy-check.sh — Gate pré-deploy (Wave 11)
# ============================================================================
# Verifica que tudo está OK ANTES de fazer `vercel deploy --prod`:
#   1. Env vars obrigatórias estão setadas (em .env.local ou ambiente)
#   2. TypeScript compila sem erros (tsc --noEmit)
#   3. Migrations do Prisma estão aplicadas (sem pendentes)
#   4. Broken imports scan (grep por imports de paths que não existem)
#   5. ESLint passa (best-effort — não bloqueia se warnings)
#
# Exit codes:
#   0 = tudo OK, pode deployar
#   1 = tem erro bloqueante (env var faltando, TSC quebrado, etc)
#   2 = só warnings (TSC passa mas com type bypass, lint com warnings)
#
# Uso:
#   bash scripts/pre-deploy-check.sh              # roda tudo
#   bash scripts/pre-deploy-check.sh --skip-tsc   # pula TSC (build OOM em sandbox)
#   bash scripts/pre-deploy-check.sh --skip-mig   # pula check de migrations
#   bash scripts/pre-deploy-check.sh --strict     # trata warnings como erro
#
# Em sandbox/CI OOM, é OK rodar com --skip-tsc (TSC roda no CI real).
# ============================================================================

set -u  # NÃO usamos set -e — continuamos mesmo se uma fase falhar e reportamos tudo

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Parse args
SKIP_TSC=0
SKIP_MIG=0
SKIP_IMPORTS=0
SKIP_LINT=0
SKIP_ENV=0
STRICT=0
for arg in "$@"; do
  case "$arg" in
    --skip-tsc) SKIP_TSC=1 ;;
    --skip-mig|--skip-migrations) SKIP_MIG=1 ;;
    --skip-imports) SKIP_IMPORTS=1 ;;
    --skip-lint) SKIP_LINT=1 ;;
    --skip-env) SKIP_ENV=1 ;;
    --strict) STRICT=1 ;;
    --help|-h)
      cat <<EOF
Uso: bash scripts/pre-deploy-check.sh [opções]

Opções:
  --skip-tsc        Pula TypeScript check (recomendado em sandbox OOM)
  --skip-mig        Pula check de migrations pendentes
  --skip-imports    Pula scan de broken imports
  --skip-lint       Pula ESLint
  --skip-env        Pula check de env vars (rodar com env já validado)
  --strict          Warnings viram erro (exit 1 em vez de 2)
  --help, -h        Mostra esta ajuda

Exit codes:
  0 = tudo OK
  1 = erro bloqueante
  2 = só warnings (apenas se não --strict)

Exemplos:
  bash scripts/pre-deploy-check.sh
  bash scripts/pre-deploy-check.sh --skip-tsc              # sandbox
  bash scripts/pre-deploy-check.sh --strict                # production gate
EOF
      exit 0
      ;;
    *)
      echo "⚠️  Argumento desconhecido: $arg (use --help)" >&2
      ;;
  esac
done

# Cores (TTY only)
if [[ -t 1 ]]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  BOLD='\033[1m'
  RESET='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; BOLD=''; RESET=''
fi

# Carrega .env.local se existir (env vars reais; .env.example é só template)
ENV_FILE="$PROJECT_ROOT/.env.local"
if [[ -f "$ENV_FILE" && $SKIP_ENV -eq 0 ]]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
  echo -e "${BLUE}ℹ${RESET} Carregado .env.local ($(grep -c '=' "$ENV_FILE" 2>/dev/null || echo 0) vars)"
fi

# Bucket de status
declare -A CHECK_STATUS
declare -A CHECK_DETAIL
HAS_BLOCKING=0
HAS_WARNING=0

run_check() {
  local id="$1"
  local label="$2"
  local fn="$3"

  echo ""
  echo -e "${BOLD}▶ ${label}${RESET}"

  local out exit_code
  out=$($fn 2>&1)
  exit_code=$?

  if [[ $exit_code -eq 0 ]]; then
    echo -e "  ${GREEN}✅ PASS${RESET} — $label"
    CHECK_STATUS[$id]="PASS"
    CHECK_DETAIL[$id]=""
  elif [[ $exit_code -eq 2 ]]; then
    echo -e "  ${YELLOW}⚠️  WARN${RESET} — $label"
    CHECK_STATUS[$id]="WARN"
    CHECK_DETAIL[$id]="$out"
    HAS_WARNING=1
  else
    echo -e "  ${RED}❌ FAIL${RESET} — $label (exit $exit_code)"
    CHECK_STATUS[$id]="FAIL"
    CHECK_DETAIL[$id]="$out"
    HAS_BLOCKING=1
  fi

  # Mostra detalhe (tail) se houve output
  if [[ -n "$out" ]]; then
    echo "$out" | tail -n 15 | sed 's/^/    /'
  fi
}

# ───────────────────────────────────────────────────────────────────────────
# Check 1: Env vars obrigatórias
# ───────────────────────────────────────────────────────────────────────────
check_env_vars() {
  local missing=()
  # Server-only vars essenciais (production)
  local required=(
    "DATABASE_URL"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "OPENAI_API_KEY"
    "NEXT_PUBLIC_APP_URL"
    "CRON_SECRET"
  )
  for v in "${required[@]}"; do
    if [[ -z "${!v:-}" ]] || [[ "${!v:-}" == *"placeholder"* ]] || [[ "${!v:-}" == *"your-"* ]]; then
      missing+=("$v")
    fi
  done

  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "Env vars ausentes ou placeholder:"
    for v in "${missing[@]}"; do
      echo "  - $v"
    done
    echo ""
    echo "Setar via Vercel Project → Settings → Environment Variables"
    echo "Ou localmente em .env.local (copie de .env.example)"
    return 1
  fi

  echo "Todas as ${#required[@]} env vars obrigatórias estão setadas e não-placeholder."
  return 0
}

# ───────────────────────────────────────────────────────────────────────────
# Check 2: TypeScript (tsc --noEmit)
# ───────────────────────────────────────────────────────────────────────────
check_typescript() {
  if [[ ! -d "$PROJECT_ROOT/node_modules/typescript" ]]; then
    echo "node_modules/typescript ausente — rode: pnpm install"
    return 1
  fi

  # Aumenta heap em sandbox (TSC usa muita RAM no monorepo)
  export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"

  local tsc_log
  tsc_log=$(mktemp)
  if npx tsc --noEmit --skipLibCheck > "$tsc_log" 2>&1; then
    rm -f "$tsc_log"
    echo "TypeScript: zero erros."
    return 0
  else
    local exit_code=$?
    echo "TypeScript: erros encontrados (exit $exit_code)"
    echo "--- últimas 30 linhas do log ---"
    tail -n 30 "$tsc_log" | sed 's/^/  /'
    echo "--- log completo: $tsc_log ---"
    return $exit_code
  fi
}

# ───────────────────────────────────────────────────────────────────────────
# Check 3: Prisma migrations (sem pendentes)
# ───────────────────────────────────────────────────────────────────────────
check_migrations() {
  if [[ ! -d "$PROJECT_ROOT/prisma" ]]; then
    echo "prisma/ não encontrado"
    return 1
  fi

  # Sem DATABASE_URL, não dá pra consultar — apenas verifica schema válido
  if [[ -z "${DATABASE_URL:-}" ]] || [[ "${DATABASE_URL:-}" == *"placeholder"* ]]; then
    echo "DATABASE_URL não setada — pulando check de migrations aplicadas."
    echo "  Em produção, garanta que DATABASE_URL aponta pro Supabase pooler."
    return 0
  fi

  # Valida que schema.prisma é válido (formato)
  if ! npx prisma validate > /dev/null 2>&1; then
    echo "prisma/schema.prisma inválido:"
    npx prisma validate 2>&1 | head -20 | sed 's/^/  /'
    return 1
  fi

  # Verifica migrations pendentes (dry-run)
  local mig_log
  mig_log=$(mktemp)
  if npx prisma migrate status > "$mig_log" 2>&1; then
    echo "Prisma: schema válido, migrations aplicadas."
    rm -f "$mig_log"
    return 0
  else
    local exit_code=$?
    echo "Prisma: status de migrations reportou pendentes:"
    tail -n 30 "$mig_log" | sed 's/^/  /'
    echo ""
    echo "Para aplicar pendentes:"
    echo "  npx prisma migrate deploy   # produção"
    echo "  npx prisma migrate dev      # dev"
    rm -f "$mig_log"
    return $exit_code
  fi
}

# ───────────────────────────────────────────────────────────────────────────
# Check 4: Broken imports scan (imports que apontam pra paths inexistentes)
# ───────────────────────────────────────────────────────────────────────────
check_broken_imports() {
  # Procura imports relativos (@/ ou ../) que não resolvem pra arquivos reais.
  # Heurística simples: extrai strings de import e verifica se file existe.

  local broken_count=0
  local sample=""

  # Coleta arquivos TS/TSX (excluindo node_modules, .next, etc)
  while IFS= read -r -d '' file; do
    # Extrai imports do tipo "from '@/...'" ou "from '../...'"
    grep -oE "from ['\"]@/[^'\"]+['\"]" "$file" 2>/dev/null | \
      sed -E "s|from ['\"]@/([^'\"]+)['\"]|\1|" | \
      while IFS= read -r path; do
        # Resolve @/ pra ./src
        local target="$PROJECT_ROOT/src/$path"
        # Tenta resolver com extensões comuns
        local found=0
        for ext in "" ".ts" ".tsx" ".js" ".jsx" "/index.ts" "/index.tsx" "/index.js"; do
          if [[ -e "${target}${ext}" ]]; then
            found=1
            break
          fi
        done
        if [[ $found -eq 0 ]]; then
          echo "BROKEN: $file → @/$path"
        fi
      done
  done < <(find "$PROJECT_ROOT/src" -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 2>/dev/null) > /tmp/broken-imports-$$.txt

  if [[ -s /tmp/broken-imports-$$.txt ]]; then
    broken_count=$(wc -l < /tmp/broken-imports-$$.txt)
    sample=$(head -n 20 /tmp/broken-imports-$$.txt)
    echo "Broken imports encontrados: $broken_count"
    echo "$sample" | sed 's/^/  /'
    if [[ $broken_count -gt 20 ]]; then
      echo "  ... e mais $((broken_count - 20)) (veja /tmp/broken-imports-$$.txt)"
    fi
    rm -f /tmp/broken-imports-$$.txt
    return 1
  fi

  rm -f /tmp/broken-imports-$$.txt
  echo "Broken imports: zero encontrados."
  return 0
}

# ───────────────────────────────────────────────────────────────────────────
# Check 5: ESLint (best-effort)
# ───────────────────────────────────────────────────────────────────────────
check_lint() {
  if [[ ! -d "$PROJECT_ROOT/node_modules/eslint" ]]; then
    echo "ESLint não instalado (ok se projeto não usa lint)"
    return 0
  fi

  export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"

  local lint_log
  lint_log=$(mktemp)
  if npx eslint . --max-warnings 50 > "$lint_log" 2>&1; then
    echo "ESLint: zero erros, < 50 warnings."
    rm -f "$lint_log"
    return 0
  else
    local exit_code=$?
    # ESLint retorna 1 = erro, 2 = warning (com --max-warnings 0)
    if [[ $exit_code -eq 2 ]]; then
      echo "ESLint: warnings (não-bloqueante)"
      tail -n 20 "$lint_log" | sed 's/^/  /'
      rm -f "$lint_log"
      return 2
    fi
    echo "ESLint: erros encontrados"
    tail -n 20 "$lint_log" | sed 's/^/  /'
    rm -f "$lint_log"
    return 1
  fi
}

# ───────────────────────────────────────────────────────────────────────────
# Check 6: package.json sanity (sem deps quebradas)
# ───────────────────────────────────────────────────────────────────────────
check_package_json() {
  if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
    echo "package.json não encontrado"
    return 1
  fi

  # Verifica que package.json parseia como JSON válido
  if ! node -e "JSON.parse(require('fs').readFileSync('$PROJECT_ROOT/package.json','utf8'))" 2>/dev/null; then
    echo "package.json inválido (não-JSON)"
    return 1
  fi

  # Verifica scripts essenciais
  local required_scripts=("build" "start" "lint" "test" "db:generate")
  local missing_scripts=()
  for s in "${required_scripts[@]}"; do
    if ! grep -q "\"$s\"" "$PROJECT_ROOT/package.json"; then
      missing_scripts+=("$s")
    fi
  done

  if [[ ${#missing_scripts[@]} -gt 0 ]]; then
    echo "Scripts faltando em package.json: ${missing_scripts[*]}"
    return 1
  fi

  echo "package.json: válido, scripts essenciais presentes."
  return 0
}

# ───────────────────────────────────────────────────────────────────────────
# Execução
# ───────────────────────────────────────────────────────────────────────────
echo -e "${BOLD}═══════════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}  Pre-Deploy Check — Akasha Portal${RESET}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════════${RESET}"
echo "  Project: $(basename "$PROJECT_ROOT")"
echo "  Branch:  $(git branch --show-current 2>/dev/null || echo unknown)"
echo "  Commit:  $(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
echo "  Date:    $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo ""

run_check "package"   "package.json sanity"     check_package_json

if [[ $SKIP_ENV -eq 0 ]]; then
  run_check "env"      "Env vars obrigatórias"  check_env_vars
else
  echo -e "${YELLOW}⏭  Pulando check de env vars (--skip-env)${RESET}"
fi

if [[ $SKIP_TSC -eq 0 ]]; then
  run_check "tsc"      "TypeScript (tsc --noEmit)" check_typescript
else
  echo -e "${YELLOW}⏭  Pulando TSC (--skip-tsc) — Vercel CI roda isso${RESET}"
fi

if [[ $SKIP_MIG -eq 0 ]]; then
  run_check "migrations" "Prisma migrations" check_migrations
else
  echo -e "${YELLOW}⏭  Pulando check de migrations (--skip-mig)${RESET}"
fi

if [[ $SKIP_IMPORTS -eq 0 ]]; then
  run_check "imports"  "Broken imports scan"  check_broken_imports
else
  echo -e "${YELLOW}⏭  Pulando scan de broken imports (--skip-imports)${RESET}"
fi

if [[ $SKIP_LINT -eq 0 ]]; then
  run_check "lint"     "ESLint (best-effort)"  check_lint
else
  echo -e "${YELLOW}⏭  Pulando ESLint (--skip-lint)${RESET}"
fi

# ───────────────────────────────────────────────────────────────────────────
# Resumo
# ───────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}  Resumo${RESET}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════════${RESET}"

PASS=0; FAIL=0; WARN=0
for k in "${!CHECK_STATUS[@]}"; do
  case "${CHECK_STATUS[$k]}" in
    PASS) PASS=$((PASS+1)) ;;
    WARN) WARN=$((WARN+1)) ;;
    FAIL) FAIL=$((FAIL+1)) ;;
  esac
done

printf "  %-15s %s\n" "PASS:"   "$PASS"
printf "  %-15s %s\n" "WARN:"   "$WARN"
printf "  %-15s %s\n" "FAIL:"   "$FAIL"
echo ""

# Exit code
if [[ $HAS_BLOCKING -eq 1 ]]; then
  echo -e "${RED}${BOLD}❌ BLOQUEADO — corrija os FAILs acima antes de deployar.${RESET}"
  exit 1
elif [[ $HAS_WARNING -eq 1 ]]; then
  if [[ $STRICT -eq 1 ]]; then
    echo -e "${RED}${BOLD}❌ STRICT MODE — warnings viraram erro.${RESET}"
    exit 1
  fi
  echo -e "${YELLOW}${BOLD}⚠️  WARNINGS — pode deployar, mas reveja antes.${RESET}"
  exit 2
else
  echo -e "${GREEN}${BOLD}✅ TUDO OK — pode deployar com segurança.${RESET}"
  exit 0
fi
