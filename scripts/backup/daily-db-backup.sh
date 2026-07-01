#!/usr/bin/env bash
# ============================================================================
# daily-db-backup.sh — Wave 34 (DISASTER RECOVERY 1/8)
# ============================================================================
# Faz pg_dump do Postgres (Supabase) e envia para S3 off-site.
# Executar via cron: 0 3 * * * (3h UTC todo dia)
#
# Requisitos:
#   - psql client (apt install postgresql-client)
#   - aws cli (pip install awscli)
#   - gzip + sha256sum
#   - env vars: DATABASE_URL, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
#               S3_BACKUP_BUCKET, KMS_KEY_ID
#
# Saída:
#   - /tmp/akasha-backups/db/daily/akasha-db-YYYYMMDD.dump
#   - /tmp/akasha-backups/db/daily/akasha-db-YYYYMMDD.dump.sha256
#   - s3://$S3_BACKUP_BUCKET/db/daily/akasha-db-YYYYMMDD.dump
#
# Métricas enviadas:
#   - backup_db_duration_seconds (histogram)
#   - backup_db_size_bytes (gauge)
#   - backup_db_status (counter: success/failed)
#
# Em caso de erro: exit 1 + log para /var/log/akasha/backup.log
# ============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuração
# ---------------------------------------------------------------------------

readonly TIMESTAMP=$(date -u +%Y%m%d-%H%M%S)
readonly DATE=$(date -u +%Y%m%d)
readonly BACKUP_DIR="/tmp/akasha-backups/db/daily"
readonly BACKUP_FILE="${BACKUP_DIR}/akasha-db-${DATE}.dump"
readonly CHECKSUM_FILE="${BACKUP_FILE}.sha256"
readonly LOG_FILE="${LOG_FILE:-/var/log/akasha/backup.log}"
readonly S3_BUCKET="${BACKUP_S3_BUCKET:-${S3_BACKUP_BUCKET:-akasha-backups}}"
readonly S3_ENDPOINT="${BACKUP_S3_ENDPOINT:-}"
readonly S3_ACCESS_KEY="${BACKUP_S3_ACCESS_KEY:-${AWS_ACCESS_KEY_ID:-}}"
readonly S3_SECRET_KEY="${BACKUP_S3_SECRET_KEY:-${AWS_SECRET_ACCESS_KEY:-}}"
readonly KMS_KEY_ID="${BACKUP_S3_KMS_KEY_ID:-${KMS_KEY_ID:-alias/akasha-backup}}"
readonly RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-${LOCAL_RETENTION_DAYS:-30}}"
readonly S3_PREFIX="db/daily"
readonly S3_PATH="s3://${S3_BUCKET}/${S3_PREFIX}/akasha-db-${DATE}.dump"
readonly START_TIME=$(date +%s)

# Log effective config (sem expor segredos)
log "Config: S3_BUCKET=$S3_BUCKET S3_ENDPOINT=${S3_ENDPOINT:-<default-aws>} RETENTION_DAYS=$RETENTION_DAYS"

# Cores para output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

log() { echo -e "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"; }
err() { echo -e "${RED}[ERROR]${NC} $*" | tee -a "$LOG_FILE" >&2; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*" | tee -a "$LOG_FILE"; }
ok() { echo -e "${GREEN}[OK]${NC} $*" | tee -a "$LOG_FILE"; }

# ---------------------------------------------------------------------------
# Pré-flight checks
# ---------------------------------------------------------------------------

preflight() {
  log "Iniciando daily-db-backup.sh (timestamp=$TIMESTAMP)"

  # Verificar deps
  for cmd in psql pg_dump gzip sha256sum aws; do
    if ! command -v "$cmd" &>/dev/null; then
      err "Comando obrigatório não encontrado: $cmd"
      return 1
    fi
  done

  # Verificar env vars
  if [[ -z "${DATABASE_URL:-}" ]]; then
    err "DATABASE_URL não definida"
    return 1
  fi
  if [[ -z "${AWS_ACCESS_KEY_ID:-}" ]] || [[ -z "${AWS_SECRET_ACCESS_KEY:-}" ]]; then
    err "AWS credentials não definidas"
    return 1
  fi

  # Criar diretório
  mkdir -p "$BACKUP_DIR"

  ok "Pre-flight OK"
}

# ---------------------------------------------------------------------------
# pg_dump
# ---------------------------------------------------------------------------

do_dump() {
  log "Executando pg_dump..."

  # --format=custom: compressed binary format (pg_restore only)
  # --no-owner --no-acl: skip grants (vamos aplicar via migrations)
  # --compress=9: max compression
  # --verbose: para log

  if ! pg_dump "$DATABASE_URL" \
      --format=custom \
      --no-owner \
      --no-acl \
      --compress=9 \
      --verbose \
      --file="$BACKUP_FILE" 2>>"$LOG_FILE"; then
    err "pg_dump falhou"
    return 1
  fi

  local size_bytes
  size_bytes=$(stat -c %s "$BACKUP_FILE" 2>/dev/null || stat -f %z "$BACKUP_FILE")
  log "Dump criado: $BACKUP_FILE (${size_bytes} bytes)"

  ok "pg_dump OK ($((size_bytes / 1024 / 1024)) MB)"
}

# ---------------------------------------------------------------------------
# Checksum SHA-256
# ---------------------------------------------------------------------------

do_checksum() {
  log "Gerando SHA-256 checksum..."

  cd "$BACKUP_DIR"
  sha256sum "akasha-db-${DATE}.dump" > "akasha-db-${DATE}.dump.sha256"
  cd - >/dev/null

  ok "Checksum OK"
}

# ---------------------------------------------------------------------------
# Upload para S3
# ---------------------------------------------------------------------------

do_upload_s3() {
  log "Upload para S3 ($S3_PATH)..."

  # Storage class STANDARD_IA: infrequent access (mais barato, leve latência)
  # Server-side encryption: AES256 + KMS key
  # Metadata: tag para auditoria

  local aws_extra=()
  if [[ -n "$S3_ENDPOINT" ]]; then
    aws_extra+=(--endpoint-url "$S3_ENDPOINT")
  fi

  if ! aws s3 cp "$BACKUP_FILE" "$S3_PATH" \
      "${aws_extra[@]}" \
      --storage-class STANDARD_IA \
      --sse aws:kms \
      --sse-kms-key-id "$KMS_KEY_ID" \
      --metadata "encrypted=true,backup-date=${DATE},retention-days=${RETENTION_DAYS},wave=W34" \
      --only-show-errors 2>>"$LOG_FILE"; then
    err "Upload S3 falhou"
    return 1
  fi

  # Upload checksum também
  if ! aws s3 cp "$CHECKSUM_FILE" "${S3_PATH}.sha256" \
      "${aws_extra[@]}" \
      --storage-class STANDARD_IA \
      --sse aws:kms \
      --sse-kms-key-id "$KMS_KEY_ID" \
      --only-show-errors 2>>"$LOG_FILE"; then
    warn "Upload checksum S3 falhou (não crítico)"
  fi

  ok "Upload S3 OK"
}

# ---------------------------------------------------------------------------
# Envio de métricas para PostHog
# ---------------------------------------------------------------------------

do_metrics() {
  local duration=$(( $(date +%s) - START_TIME ))
  local size_bytes
  size_bytes=$(stat -c %s "$BACKUP_FILE" 2>/dev/null || stat -f %z "$BACKUP_FILE")
  local status="${1:-success}"

  log "Métricas: duration=${duration}s size=${size_bytes}B status=${status}"

  # PostHog event (se configurado)
  if [[ -n "${POSTHOG_API_KEY:-}" ]] && [[ -n "${POSTHOG_HOST:-}" ]]; then
    curl -s -X POST "${POSTHOG_HOST}/capture/" \
      -H "Content-Type: application/json" \
      -d "{
        \"api_key\": \"${POSTHOG_API_KEY}\",
        \"event\": \"backup_db_completed\",
        \"properties\": {
          \"duration_seconds\": ${duration},
          \"size_bytes\": ${size_bytes},
          \"status\": \"${status}\",
          \"date\": \"${DATE}\",
          \"wave\": \"W34\",
          \"s3_bucket\": \"${S3_BUCKET}\",
          \"s3_path\": \"${S3_PATH}\"
        }
      }" >/dev/null 2>&1 || warn "Falha ao enviar métrica para PostHog"
  fi

  # Sempre log (PostHog é nice-to-have)
  log "Métricas enviadas (duration=${duration}s, size=$((size_bytes / 1024 / 1024))MB, status=${status})"
}

# ---------------------------------------------------------------------------
# Cleanup local (manter últimos 7 dias)
# ---------------------------------------------------------------------------

do_cleanup_local() {
  log "Limpando backups locais > 7 dias..."

  local deleted
  deleted=$(find "$BACKUP_DIR" -name "akasha-db-*.dump" -mtime +7 -delete -print | wc -l)
  deleted=$((deleted + $(find "$BACKUP_DIR" -name "akasha-db-*.dump.sha256" -mtime +7 -delete -print | wc -l)))

  ok "Cleanup local: ${deleted} arquivos removidos"
}

# ---------------------------------------------------------------------------
# Sentry / alerting (falha)
# ---------------------------------------------------------------------------

alert_on_failure() {
  local err_msg="$1"

  err "BACKUP FALHOU: $err_msg"

  # Sentry capture (se configurado)
  if [[ -n "${SENTRY_DSN:-}" ]]; then
    curl -s -X POST "https://${SENTRY_HOST:-sentry.io}/api/${SENTRY_PROJECT_ID}/store/" \
      -H "Content-Type: application/json" \
      -H "X-Sentry-Auth: Sentry sentry_key=${SENTRY_DSN##*/}" \
      -d "{
        \"message\": {\"formatted\": \"Daily DB backup failed: ${err_msg}\"},
        \"level\": \"error\",
        \"tags\": {\"component\": \"backup\", \"wave\": \"W34\"}
      }" >/dev/null 2>&1 || true
  fi

  # PagerDuty (se PagerDuty Events API v2 key setada)
  if [[ -n "${PAGERDUTY_ROUTING_KEY:-}" ]]; then
    curl -s -X POST "https://events.pagerduty.com/v2/enqueue" \
      -H "Content-Type: application/json" \
      -d "{
        \"routing_key\": \"${PAGERDUTY_ROUTING_KEY}\",
        \"event_action\": \"trigger\",
        \"payload\": {
          \"summary\": \"Daily DB backup failed: ${err_msg}\",
          \"severity\": \"error\",
          \"source\": \"akasha-backup-cron\",
          \"component\": \"database-backup\",
          \"group\": \"ops\"
        }
      }" >/dev/null 2>&1 || true
  fi

  # Slack webhook (opcional)
  if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
    curl -s -X POST "$SLACK_WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"channel\": \"#ops-alerts\",
        \"username\": \"backup-bot\",
        \"icon_emoji\": \":warning:\",
        \"text\": \"🚨 Daily DB backup failed: ${err_msg}\"
      }" >/dev/null 2>&1 || true
  fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

main() {
  if ! preflight; then
    alert_on_failure "preflight failed"
    exit 1
  fi

  if ! do_dump; then
    alert_on_failure "pg_dump failed"
    do_metrics failed
    exit 1
  fi

  if ! do_checksum; then
    alert_on_failure "checksum failed"
    do_metrics failed
    exit 1
  fi

  if ! do_upload_s3; then
    alert_on_failure "S3 upload failed"
    do_metrics failed
    exit 1
  fi

  do_cleanup_local
  do_metrics success

  local duration=$(( $(date +%s) - START_TIME ))
  ok "Backup completo em ${duration}s"
  log "=========================================="
  exit 0
}

main "$@"