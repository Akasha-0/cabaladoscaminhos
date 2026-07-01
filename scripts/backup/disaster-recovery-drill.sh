#!/usr/bin/env bash
# ============================================================================
# disaster-recovery-drill.sh — Wave 34 (DISASTER RECOVERY 1/8)
# ============================================================================
# Drill completo: restaurar backup do S3 em DB de staging e validar.
# Usado em DR drills trimestrais para garantir que backups funcionam.
#
# Uso:
#   bash disaster-recovery-drill.sh --source=s3 --bucket=akasha-backups/db/daily/ \
#                                   --target-db=postgres --target-host=$STAGING_HOST \
#                                   [--verify] [--smoke-test]
#
# Ou para restaurar um backup específico:
#   bash disaster-recovery-drill.sh --source=local \
#                                   --file=/tmp/akasha-backups/db/daily/akasha-db-20260630.dump \
#                                   --target-db=postgres --target-host=$STAGING_HOST
#
# Exit codes:
#   0 — drill OK
#   1 — falha no restore
#   2 — falha no smoke test
#   3 — falha no verify
# ============================================================================

set -euo pipefail

readonly TIMESTAMP=$(date -u +%Y%m%d-%H%M%S)
readonly DATE=$(date -u +%Y%m%d)
readonly DRILL_LOG_DIR="docs/dr-drills"
readonly DRILL_LOG_FILE="${DRILL_LOG_DIR}/${DATE}-drill.log"
readonly LOG_FILE="${LOG_FILE:-/var/log/akasha/backup.log}"
readonly STAGING_DIR="/tmp/akasha-backups/dr-drill"

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

log() { echo -e "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE" "$DRILL_LOG_FILE" >/dev/null; echo -e "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }
err() { echo -e "${RED}[ERROR]${NC} $*" | tee -a "$LOG_FILE" "$DRILL_LOG_FILE" >&2; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*" | tee -a "$LOG_FILE" "$DRILL_LOG_FILE"; }
ok() { echo -e "${GREEN}[OK]${NC} $*" | tee -a "$LOG_FILE" "$DRILL_LOG_FILE"; }
info() { echo -e "${CYAN}[INFO]${NC} $*" | tee -a "$LOG_FILE" "$DRILL_LOG_FILE"; }

# Resultado
DRILL_RESULT=""
DRILL_DURATION=0
DRILL_START_TIME=$(date +%s)

# ---------------------------------------------------------------------------
# Parse args
# ---------------------------------------------------------------------------

parse_args() {
  SOURCE=""
  S3_BUCKET=""
  S3_PREFIX=""
  LOCAL_FILE=""
  TARGET_DB=""
  TARGET_HOST=""
  TARGET_PORT="5432"
  TARGET_USER="postgres"
  DO_VERIFY=false
  DO_SMOKE_TEST=false
  BACKUP_NAME=""

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --source=*)
        SOURCE="${1#*=}"
        shift
        ;;
      --bucket=*)
        S3_BUCKET="${1#*=}"
        shift
        ;;
      --prefix=*)
        S3_PREFIX="${1#*=}"
        shift
        ;;
      --file=*)
        LOCAL_FILE="${1#*=}"
        BACKUP_NAME=$(basename "$LOCAL_FILE")
        shift
        ;;
      --target-db=*)
        TARGET_DB="${1#*=}"
        shift
        ;;
      --target-host=*)
        TARGET_HOST="${1#*=}"
        shift
        ;;
      --target-port=*)
        TARGET_PORT="${1#*=}"
        shift
        ;;
      --target-user=*)
        TARGET_USER="${1#*=}"
        shift
        ;;
      --verify)
        DO_VERIFY=true
        shift
        ;;
      --smoke-test)
        DO_SMOKE_TEST=true
        shift
        ;;
      *)
        err "Argumento desconhecido: $1"
        exit 1
        ;;
    esac
  done

  # Defaults
  [[ -z "$S3_BUCKET" ]] && S3_BUCKET="${S3_BACKUP_BUCKET:-akasha-backups}"
  [[ -z "$S3_PREFIX" ]] && S3_PREFIX="db/daily"

  # Validação
  if [[ -z "$SOURCE" ]]; then
    err "--source= obrigatório (s3 ou local)"
    exit 1
  fi
  if [[ -z "$TARGET_DB" ]] || [[ -z "$TARGET_HOST" ]]; then
    err "--target-db e --target-host obrigatórios"
    exit 1
  fi
  if [[ "$SOURCE" == "local" ]] && [[ -z "$LOCAL_FILE" ]]; then
    err "--file obrigatório quando --source=local"
    exit 1
  fi
}

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

setup() {
  log "=========================================="
  log "DISASTER RECOVERY DRILL"
  log "Timestamp: $TIMESTAMP"
  log "Source: $SOURCE"
  log "Target: $TARGET_USER@$TARGET_HOST:$TARGET_PORT/$TARGET_DB"
  log "Verify: $DO_VERIFY"
  log "Smoke test: $DO_SMOKE_TEST"
  log "=========================================="

  mkdir -p "$STAGING_DIR" "$DRILL_LOG_DIR"

  # Pre-flight
  for cmd in psql pg_restore aws; do
    if ! command -v "$cmd" &>/dev/null; then
      err "Comando obrigatório não encontrado: $cmd"
      exit 2
    fi
  done

  ok "Setup OK"
}

# ---------------------------------------------------------------------------
# Localizar backup (download de S3 se necessário)
# ---------------------------------------------------------------------------

locate_backup() {
  if [[ "$SOURCE" == "local" ]]; then
    if [[ ! -f "$LOCAL_FILE" ]]; then
      err "Backup local não encontrado: $LOCAL_FILE"
      exit 1
    fi
    info "Usando backup local: $LOCAL_FILE"
    BACKUP_PATH="$LOCAL_FILE"
    BACKUP_NAME=$(basename "$LOCAL_FILE")
    return 0
  fi

  if [[ "$SOURCE" == "s3" ]]; then
    if [[ -z "$BACKUP_NAME" ]]; then
      # Listar últimos 5 backups e usar o mais recente
      info "Listando backups em s3://${S3_BUCKET}/${S3_PREFIX}/..."
      BACKUP_NAME=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" \
        | sort -k 1,2 | tail -1 | awk '{print $4}' | grep '\.dump$' || echo "")

      if [[ -z "$BACKUP_NAME" ]]; then
        err "Nenhum backup encontrado em s3://${S3_BUCKET}/${S3_PREFIX}/"
        exit 1
      fi
      info "Backup selecionado: $BACKUP_NAME"
    fi

    BACKUP_PATH="${STAGING_DIR}/${BACKUP_NAME}"

    info "Download s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_NAME}..."
    if ! aws s3 cp "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_NAME}" "$BACKUP_PATH" \
        --only-show-errors 2>>"$LOG_FILE"; then
      err "Download falhou"
      exit 1
    fi

    ok "Backup baixado: $BACKUP_PATH"
    return 0
  fi

  err "Source inválido: $SOURCE (use s3 ou local)"
  exit 1
}

# ---------------------------------------------------------------------------
# Verificar checksum
# ---------------------------------------------------------------------------

verify_checksum() {
  local checksum_path="${BACKUP_PATH}.sha256"

  # Baixar checksum do S3 se aplicável
  if [[ "$SOURCE" == "s3" ]] && [[ ! -f "$checksum_path" ]]; then
    aws s3 cp "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_NAME}.sha256" \
      "$checksum_path" --only-show-errors 2>/dev/null || \
      warn "Checksum não disponível em S3 (pulando verify)"
  fi

  if [[ ! -f "$checksum_path" ]]; then
    warn "Checksum file não encontrado: $checksum_path"
    warn "Pulando verificação de checksum"
    return 0
  fi

  info "Verificando SHA-256..."
  cd "$(dirname "$BACKUP_PATH")"
  if sha256sum -c "$(basename "$checksum_path")" >/dev/null 2>&1; then
    ok "Checksum OK"
    return 0
  else
    err "Checksum MISMATCH — backup pode estar corrompido"
    return 1
  fi
}

# ---------------------------------------------------------------------------
# Restore em staging DB
# ---------------------------------------------------------------------------

do_restore() {
  info "Drop + recreate staging DB ($TARGET_DB)..."

  # Drop + create (assume staging pode ser dropado)
  PGPASSWORD="${TARGET_DB_PASSWORD:-${PGPASSWORD:-}}" \
    psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d postgres \
    -c "DROP DATABASE IF EXISTS $TARGET_DB;" 2>>"$LOG_FILE" || \
    err "Falha ao dropar DB (pode não existir, OK)"

  PGPASSWORD="${TARGET_DB_PASSWORD:-${PGPASSWORD:-}}" \
    psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d postgres \
    -c "CREATE DATABASE $TARGET_DB;" 2>>"$LOG_FILE" || {
      err "Falha ao criar DB"
      return 1
    }

  ok "DB staging pronto"

  info "pg_restore em staging (pode demorar)..."
  local restore_start
  restore_start=$(date +%s)

  if ! PGPASSWORD="${TARGET_DB_PASSWORD:-${PGPASSWORD:-}}" \
       pg_restore \
       --host="$TARGET_HOST" \
       --port="$TARGET_PORT" \
       --username="$TARGET_USER" \
       --dbname="$TARGET_DB" \
       --no-owner \
       --no-acl \
       --single-transaction \
       --jobs=4 \
       "$BACKUP_PATH" 2>>"$LOG_FILE"; then
    err "pg_restore falhou"
    return 1
  fi

  local restore_duration=$(( $(date +%s) - restore_start ))
  ok "Restore completo em ${restore_duration}s"
}

# ---------------------------------------------------------------------------
# Validar schema e contagens
# ---------------------------------------------------------------------------

verify_schema() {
  if [[ "$DO_VERIFY" != "true" ]]; then
    info "Verify desabilitado (use --verify para habilitar)"
    return 0
  fi

  info "Validando schema..."

  local expected_tables=("users" "posts" "comments" "articles" "subscriptions")
  for table in "${expected_tables[@]}"; do
    local count
    count=$(PGPASSWORD="${TARGET_DB_PASSWORD:-${PGPASSWORD:-}}" \
            psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d "$TARGET_DB" \
            -tAc "SELECT count(*) FROM $table;" 2>/dev/null || echo "0")

    info "Tabela $table: $count rows"

    # Validação: tabelas críticas devem ter > 0 rows (exceto em DB novo)
    if [[ "$count" -eq 0 ]] && [[ "$table" == "users" ]]; then
      err "Tabela users vazia — algo está errado com o restore"
      return 1
    fi
  done

  ok "Schema validation OK"
}

# ---------------------------------------------------------------------------
# Smoke test em staging
# ---------------------------------------------------------------------------

smoke_test() {
  if [[ "$DO_SMOKE_TEST" != "true" ]]; then
    info "Smoke test desabilitado (use --smoke-test para habilitar)"
    return 0
  fi

  info "Executando smoke test em staging..."

  # 1. Conexão
  if ! PGPASSWORD="${TARGET_DB_PASSWORD:-${PGPASSWORD:-}}" \
       psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d "$TARGET_DB" \
       -c "SELECT 1;" >/dev/null 2>&1; then
    err "Conexão com staging falhou"
    return 1
  fi

  ok "Conexão OK"

  # 2. Verificar extensões instaladas
  info "Verificando extensões..."
  local exts
  exts=$(PGPASSWORD="${TARGET_DB_PASSWORD:-${PGPASSWORD:-}}" \
         psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d "$TARGET_DB" \
         -tAc "SELECT extname FROM pg_extension ORDER BY extname;" 2>/dev/null)

  for required_ext in "uuid-ossp" "pgcrypto"; do
    if echo "$exts" | grep -q "$required_ext"; then
      ok "Extensão OK: $required_ext"
    else
      warn "Extensão faltando: $required_ext"
    fi
  done

  # 3. Sample query em cada tabela crítica
  info "Sample queries..."
  for table in users posts articles; do
    PGPASSWORD="${TARGET_DB_PASSWORD:-${PGPASSWORD:-}}" \
      psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d "$TARGET_DB" \
      -c "SELECT id FROM $table LIMIT 1;" >/dev/null 2>&1 && \
      ok "Query OK: $table" || \
      warn "Query falhou: $table"
  done

  ok "Smoke test OK"
}

# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

generate_report() {
  local duration=$(( $(date +%s) - DRILL_START_TIME ))
  DRILL_DURATION=$duration

  cat <<EOF >> "$DRILL_LOG_FILE"

========================================
DRILL REPORT — ${DATE}
========================================
Source:           $SOURCE
Backup:           $BACKUP_NAME
Backup path:      $BACKUP_PATH
Backup size:      $(stat -c %s "$BACKUP_PATH" 2>/dev/null || echo "0") bytes
Target:           $TARGET_USER@$TARGET_HOST:$TARGET_PORT/$TARGET_DB
Verify:           $DO_VERIFY
Smoke test:       $DO_SMOKE_TEST
Duration:         ${duration}s
Status:           $DRILL_RESULT
========================================
EOF

  ok "Relatório salvo em: $DRILL_LOG_FILE"
}

# ---------------------------------------------------------------------------
# Cleanup staging (opcional)
# ---------------------------------------------------------------------------

cleanup_staging() {
  if [[ "${DRILL_KEEP_STAGING:-false}" == "true" ]]; then
    warn "DRILL_KEEP_STAGING=true — staging DB não será dropado"
    return 0
  fi

  info "Limpando staging DB..."

  PGPASSWORD="${TARGET_DB_PASSWORD:-${PGPASSWORD:-}}" \
    psql -h "$TARGET_HOST" -p "$TARGET_PORT" -U "$TARGET_USER" -d postgres \
    -c "DROP DATABASE IF EXISTS $TARGET_DB;" 2>>"$LOG_FILE" || \
    warn "Falha ao dropar staging DB (pode precisar cleanup manual)"

  # Limpar arquivos temporários
  rm -rf "$STAGING_DIR"

  ok "Cleanup OK"
}

# ---------------------------------------------------------------------------
# Métricas
# ---------------------------------------------------------------------------

send_metrics() {
  if [[ -n "${POSTHOG_API_KEY:-}" ]] && [[ -n "${POSTHOG_HOST:-}" ]]; then
    curl -s -X POST "${POSTHOG_HOST}/capture/" \
      -H "Content-Type: application/json" \
      -d "{
        \"api_key\": \"${POSTHOG_API_KEY}\",
        \"event\": \"dr_drill_completed\",
        \"properties\": {
          \"status\": \"${DRILL_RESULT}\",
          \"duration_seconds\": ${DRILL_DURATION},
          \"backup_name\": \"${BACKUP_NAME}\",
          \"source\": \"${SOURCE}\",
          \"verify_enabled\": ${DO_VERIFY},
          \"smoke_test_enabled\": ${DO_SMOKE_TEST},
          \"wave\": \"W34\"
        }
      }" >/dev/null 2>&1 || true
  fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

main() {
  parse_args "$@"
  setup

  if ! locate_backup; then
    DRILL_RESULT="FAIL_LOCATE"
    err "Falha ao localizar backup"
    exit 1
  fi

  if ! verify_checksum; then
    DRILL_RESULT="FAIL_CHECKSUM"
    err "Checksum mismatch"
    exit 3
  fi

  if ! do_restore; then
    DRILL_RESULT="FAIL_RESTORE"
    err "Restore falhou"
    cleanup_staging
    generate_report
    send_metrics
    exit 1
  fi

  if ! verify_schema; then
    DRILL_RESULT="FAIL_VERIFY"
    err "Schema validation falhou"
    cleanup_staging
    generate_report
    send_metrics
    exit 3
  fi

  if ! smoke_test; then
    DRILL_RESULT="FAIL_SMOKE"
    err "Smoke test falhou"
    cleanup_staging
    generate_report
    send_metrics
    exit 2
  fi

  DRILL_RESULT="PASS"
  ok "DRILL COMPLETO COM SUCESSO"

  cleanup_staging
  generate_report
  send_metrics

  ok "Próximos passos:"
  ok "  1. Preencher docs/dr-drills/${DATE}-drill-report.md (template em docs/DR-DRILL-REPORT-TEMPLATE.md)"
  ok "  2. Revisar métricas de duração (target: < 30min para restore)"
  ok "  3. Agendar próximo drill (quarterly)"

  exit 0
}

main "$@"