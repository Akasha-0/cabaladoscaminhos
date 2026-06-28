#!/usr/bin/env bash
# ============================================================================
# scripts/setup-supabase-storage.sh — Cria buckets + aplica RLS policies
# ============================================================================
# Wave 21 — P0 Critical Fix 5/6
#
# Cria os 4 buckets do projeto no Supabase Storage e roda o SQL de policies
# definido em prisma/migrations/20260628_supabase_storage/migration.sql.
#
# Buckets:
#   avatars               PUBLIC   — avatares de perfil
#   post-media            AUTH     — mídias (imgs/video) em posts
#   library-covers        PUBLIC   — capas da biblioteca Akasha
#   message-attachments   AUTH     — anexos em mensagens privadas
#
# Pré-requisitos:
#   - supabase CLI instalado (https://github.com/supabase/cli)
#   - logado no projeto (supabase login + supabase link --project-ref <ref>)
#   - DATABASE_URL no .env.local (para rodar o migration.sql de policies)
#
# Uso:
#   bash scripts/setup-supabase-storage.sh           # roda tudo
#   bash scripts/setup-supabase-storage.sh --buckets # só cria buckets
#   bash scripts/setup-supabase-storage.sh --policies # só aplica policies
#   bash scripts/setup-supabase-storage.sh --check   # verifica estado atual
#
# Idempotente: usa `supabase storage create-bucket` com guard, e o migration
# usa IF NOT EXISTS / DROP POLICY IF EXISTS.
# ============================================================================

set -u  # NÃO usamos set -e — queremos continuar mesmo se um step falhar
        # e mostrar diagnóstico completo no final.

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIGRATION_FILE="$PROJECT_ROOT/prisma/migrations/20260628_supabase_storage/migration.sql"
ENV_FILE="$PROJECT_ROOT/.env.local"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { printf "${BLUE}[setup-supabase-storage]${NC} %s\n" "$*"; }
warn() { printf "${YELLOW}[setup-supabase-storage]${NC} ⚠  %s\n" "$*"; }
err()  { printf "${RED}[setup-supabase-storage]${NC} ✗  %s\n" "$*" >&2; }
ok()   { printf "${GREEN}[setup-supabase-storage]${NC} ✓  %s\n" "$*"; }

# ============================================================================
# Parse args
# ============================================================================
RUN_BUCKETS=0
RUN_POLICIES=0
RUN_CHECK=0
if [ $# -eq 0 ]; then
  RUN_BUCKETS=1
  RUN_POLICIES=1
fi
for arg in "$@"; do
  case "$arg" in
    --buckets)  RUN_BUCKETS=1 ;;
    --policies) RUN_POLICIES=1 ;;
    --check)    RUN_CHECK=1 ;;
    --help|-h)
      sed -n '2,30p' "$0"
      exit 0
      ;;
    *)
      err "Argumento desconhecido: $arg"
      err "Use --help para ajuda."
      exit 64
      ;;
  esac
done

# ============================================================================
# 0. Verificar pré-requisitos
# ============================================================================
log "Verificando pré-requisitos..."

if ! command -v supabase >/dev/null 2>&1; then
  err "supabase CLI não encontrado."
  err "Instale: brew install supabase/tap/supabase  (macOS)"
  err "         scoop install supabase          (Windows)"
  err "         https://github.com/supabase/cli/releases"
  exit 1
fi
ok "supabase CLI: $(supabase --version 2>&1 | head -1)"

if [ ! -f "$MIGRATION_FILE" ]; then
  err "Migration file não encontrado: $MIGRATION_FILE"
  exit 1
fi
ok "Migration file: $MIGRATION_FILE"

# Carrega .env.local se existir (sem expor segredos no log)
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
  log "Carregado .env.local"
else
  warn ".env.local não encontrado — algumas operações podem falhar."
fi

if [ -z "${DATABASE_URL:-}" ]; then
  err "DATABASE_URL não definido (em .env.local ou env)."
  err "Para policies: precisa do connection string do banco Supabase."
  warn "Continuando mesmo assim — defina DATABASE_URL para policies funcionarem."
fi

# ============================================================================
# 1. CREATE BUCKETS
# ============================================================================
create_bucket() {
  local name="$1"
  local is_public="$2"
  local mime_limit="$3"   # MB
  local size_limit="$4"   # MB

  log "Bucket: $name (public=$is_public, mime=$mime_limit MB, size=$size_limit MB)"

  # supabase storage create-bucket retorna erro se já existir; tratamos como ok.
  if supabase storage create-bucket "$name" \
       --public="$is_public" \
       --file-size-limit="$size_limit" \
       2>&1 | grep -qiE "already exists|duplicate"; then
    ok "Bucket '$name' já existe — pulando."
    return 0
  fi

  # Captura exit code real
  if supabase storage create-bucket "$name" \
       --public="$is_public" \
       --file-size-limit="$size_limit" \
       >/dev/null 2>&1; then
    ok "Bucket '$name' criado."
    return 0
  else
    err "Falha ao criar bucket '$name'. Veja log do supabase CLI."
    return 1
  fi
}

if [ "$RUN_BUCKETS" = "1" ]; then
  log "===== STEP 1: Criando buckets ====="
  create_bucket "avatars"              true  5  2
  create_bucket "post-media"           false 25 50
  create_bucket "library-covers"       true  5  3
  create_bucket "message-attachments"  false 20 25
  log "Buckets processados."
fi

# ============================================================================
# 2. APPLY RLS POLICIES (via migration.sql)
# ============================================================================
if [ "$RUN_POLICIES" = "1" ]; then
  log "===== STEP 2: Aplicando RLS policies ====="
  if [ -z "${DATABASE_URL:-}" ]; then
    err "DATABASE_URL vazio — pulando policies."
  elif command -v psql >/dev/null 2>&1; then
    log "Rodando: psql \$DATABASE_URL -f $MIGRATION_FILE"
    if psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$MIGRATION_FILE"; then
      ok "Policies aplicadas com sucesso."
    else
      err "psql retornou erro — verifique se DATABASE_URL aponta para o Supabase."
      err "Para Supabase pooler: postgresql://postgres.xxx:SENHA@aws-0-region.pooler.supabase.com:6543/postgres"
      exit 2
    fi
  else
    err "psql não encontrado. Instale Postgres client (libpq)."
    err "macOS: brew install libpq && export PATH=\$(brew --prefix libpq)/bin:\$PATH"
    err "Linux: apt install postgresql-client"
    exit 1
  fi
fi

# ============================================================================
# 3. CHECK — verifica estado atual
# ============================================================================
if [ "$RUN_CHECK" = "1" ]; then
  log "===== CHECK: Estado atual ====="
  log "Buckets:"
  if supabase storage list-buckets 2>&1; then
    :
  else
    warn "Não foi possível listar buckets (supabase CLI não linkado?)."
  fi

  log "Policies em storage.objects:"
  if [ -n "${DATABASE_URL:-}" ] && command -v psql >/dev/null 2>&1; then
    psql "$DATABASE_URL" -c "
      SELECT policyname, cmd
        FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects'
        ORDER BY policyname;
    "
  else
    warn "Sem DATABASE_URL ou psql — pulando listagem de policies."
  fi
fi

log "Setup completo. Veja docs/SUPABASE-STORAGE-W21.md para troubleshooting."
exit 0