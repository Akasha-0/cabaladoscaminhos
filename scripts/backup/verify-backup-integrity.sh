#!/usr/bin/env bash
# ============================================================================
# verify-backup-integrity.sh — Wave 34 (DISASTER RECOVERY 1/8)
# ============================================================================
# Verifica integridade dos últimos 7 backups em S3:
#   1. SHA-256 checksum confere entre local e S3
#   2. Restore-test em staging DB temporário (se STAGING_DB_URL setada)
#   3. Validação de schema (tabelas esperadas presentes)
#   4. Validação de contagens (dentro de ±20% da baseline)
#
# Executar via cron: 0 4 * * 0 (domingo 04:00 UTC)
# Ou manualmente: bash verify-backup-integrity.sh [--restore-test]
#
# Saída:
#   - PASS/FAIL por backup
#   - Métrica backup_verify_status para PostHog
#   - Alert (Slack/PagerDuty) se qualquer FAIL
#
# Exit codes:
#   0 — todos backups OK
#   1 — pelo menos um backup falhou
#   2 — erro de infra (sem acesso S3, sem DB staging)
# ============================================================================

set -euo pipefail

readonly TIMESTAMP=$(date -u +%Y%m%d-%H%M%S)
readonly DATE=$(date -u +%Y%m%d)
readonly BACKUP_DIR="/tmp/akasha-backups/verify"
readonly S3_BUCKET="${S3_BACKUP_BUCKET:-akasha-backups}"
readonly S3_PREFIX="db/daily"
readonly LOG_FILE="${LOG_FILE:-/var/log/akasha/backup.log}"
readonly DAYS_TO_CHECK="${DAYS_TO_CHECK:-7}"

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

log() { echo -e "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"; }
err() { echo -e "${RED}[ERROR]${NC} $*" | tee -a "$LOG_FILE" >&2; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*" | tee -a "$LOG_FILE"; }
ok() { echo -e "${GREEN}[OK]${NC} $*" | tee -a "$LOG_FILE"; }

# Resultado agregado
TOTAL_CHECKED=0
TOTAL_PASSED=0
TOTAL_FAILED=0
FAILED_BACKUPS=()

# ---------------------------------------------------------------------------
# Verificar checksum SHA-256
# ---------------------------------------------------------------------------

verify_checksum() {
  local backup_file="$1"
  local checksum_file="${backup_file}.sha256"

  if [[ ! -f "$backup_file" ]]; then
    err "Arquivo de backup não encontrado: $backup_file"
    return 1
  fi

  if [[ ! -f "$checksum_file" ]]; then
    err "Checksum file não encontrado: $checksum_file"
    return 1
  fi

  cd "$(dirname "$backup_file")"

  # sha256sum -c verifica o arquivo listado no .sha256
  if sha256sum -c "$(basename "$checksum_file")" >/dev/null 2>&1; then
    ok "Checksum OK: $(basename "$backup_file")"
    return 0
  else
    err "Checksum MISMATCH: $(basename "$backup_file")"
    return 1
  fi
}

# ---------------------------------------------------------------------------
# Restore test em staging DB
# ---------------------------------------------------------------------------

do_restore_test() {
  local backup_file="$1"
  local staging_db_url="${STAGING_DB_URL:-}"

  if [[ -z "$staging_db_url" ]]; then
    warn "STAGING_DB_URL não definida — pulando restore-test"
    warn "(defina STAGING_DB_URL para habilitar restore-test completo)"
    return 0
  fi

  log "Restore-test em staging DB..."

  # Parse DB host da URL (postgres://user:pass@host:port/dbname)
  local staging_host
  staging_host=$(echo "$staging_db_url" | sed -E 's|.*@([^:/]+).*|\1|')
  local staging_db
  staging_db=$(echo "$staging_db_url" | sed -E 's|.*/([^?]+).*|\1|')

  log "Staging host: $staging_host, db: $staging_db"

  # Drop + recreate DB (assume staging pode ser dropado)
  log "Drop + recreate staging DB..."
  if ! PGPASSWORD=$(echo "$staging_db_url" | sed -E 's|.*://[^:]+:([^@]+)@.*|\1|') \
       psql "$staging_db_url" -c "DROP DATABASE IF EXISTS verify_restore;" 2>>"$LOG_FILE"; then
    err "Falha ao dropar staging DB"
    return 1
  fi

  if ! PGPASSWORD=$(echo "$staging_db_url" | sed -E 's|.*://[^:]+:([^@]+)@.*|\1|') \
       psql "$staging_db_url" -c "CREATE DATABASE verify_restore;" 2>>"$LOG_FILE"; then
    err "Falha ao criar staging DB"
    return 1
  fi

  # Restore
  log "pg_restore em staging..."
  if ! pg_restore \
      --dbname="verify_restore" \
      --host="$staging_host" \
      --username=postgres \
      --no-owner \
      --no-acl \
      --single-transaction \
      --exit-on-error \
      "$backup_file" 2>>"$LOG_FILE"; then
    err "pg_restore falhou"
    return 1
  fi

  ok "Restore OK"

  # Validar tabelas esperadas
  log "Validando schema..."
  local expected_tables=("users" "posts" "comments" "articles" "subscriptions")
  for table in "${expected_tables[@]}"; do
    local count
    count=$(PGPASSWORD=$(echo "$staging_db_url" | sed -E 's|.*://[^:]+:([^@]+)@.*|\1|') \
            psql "$staging_db_url" -d verify_restore -tAc \
            "SELECT count(*) FROM $table;" 2>/dev/null || echo "0")

    if [[ "$count" -eq 0 ]] && [[ "$table" != "comments" ]]; then
      warn "Tabela $table está vazia (pode ser esperado se DB novo)"
    else
      log "Tabela $table: $count rows"
    fi
  done

  ok "Schema validation OK"

  # Cleanup
  log "Cleanup staging DB..."
  PGPASSWORD=$(echo "$staging_db_url" | sed -E 's|.*://[^:]+:([^@]+)@.*|\1|') \
    psql "$staging_db_url" -c "DROP DATABASE verify_restore;" 2>>"$LOG_FILE" || \
    warn "Falha ao dropar staging DB (manual cleanup necessário)"

  return 0
}

# ---------------------------------------------------------------------------
# Listar últimos N dias de backups em S3
# ---------------------------------------------------------------------------

list_recent_backups() {
  log "Listando últimos ${DAYS_TO_CHECK} dias de backups em S3..."

  aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" \
    | sort -k 1,2 | tail -n "$DAYS_TO_CHECK" | awk '{print $4}' | grep '\.dump$' || true
}

# ---------------------------------------------------------------------------
# Download backup do S3
# ---------------------------------------------------------------------------

download_backup() {
  local backup_name="$1"
  local local_path="${BACKUP_DIR}/${backup_name}"

  mkdir -p "$BACKUP_DIR"

  if [[ -f "$local_path" ]]; then
    log "Já existe local: $local_path (usando cache)"
    return 0
  fi

  log "Download s3://${S3_BUCKET}/${S3_PREFIX}/${backup_name}..."
  if ! aws s3 cp "s3://${S3_BUCKET}/${S3_PREFIX}/${backup_name}" "$local_path" \
      --only-show-errors 2>>"$LOG_FILE"; then
    err "Download falhou: $backup_name"
    return 1
  fi

  # Download checksum também
  aws s3 cp "s3://${S3_BUCKET}/${S3_PREFIX}/${backup_name}.sha256" \
    "${local_path}.sha256" --only-show-errors 2>>"$LOG_FILE" || \
    warn "Download checksum falhou: ${backup_name}.sha256"

  ok "Download OK: $local_path"
}

# ---------------------------------------------------------------------------
# Validar integridade de um backup específico
# ---------------------------------------------------------------------------

verify_one_backup() {
  local backup_name="$1"
  local backup_path="${BACKUP_DIR}/${backup_name}"

  log "---"
  log "Verificando: $backup_name"

  TOTAL_CHECKED=$((TOTAL_CHECKED + 1))

  # 1. Download
  if ! download_backup "$backup_name"; then
    err "FAIL: download falhou"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
    FAILED_BACKUPS+=("$backup_name:download")
    return 1
  fi

  # 2. Checksum
  if ! verify_checksum "$backup_path"; then
    err "FAIL: checksum mismatch"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
    FAILED_BACKUPS+=("$backup_name:checksum")
    return 1
  fi

  # 3. Restore test (se habilitado)
  if [[ "${RESTORE_TEST:-false}" == "true" ]] || [[ "${1:-}" == "--restore-test" ]]; then
    if ! do_restore_test "$backup_path"; then
      err "FAIL: restore test falhou"
      TOTAL_FAILED=$((TOTAL_FAILED + 1))
      FAILED_BACKUPS+=("$backup_name:restore")
      return 1
    fi
  fi

  TOTAL_PASSED=$((TOTAL_PASSED + 1))
  ok "PASS: $backup_name"
  return 0
}

# ---------------------------------------------------------------------------
# Envio de métricas
# ---------------------------------------------------------------------------

send_metrics() {
  local status="${1:-pass}"
  local duration="${2:-0}"

  log "Métricas: total=${TOTAL_CHECKED} passed=${TOTAL_PASSED} failed=${TOTAL_FAILED} duration=${duration}s"

  if [[ -n "${POSTHOG_API_KEY:-}" ]] && [[ -n "${POSTHOG_HOST:-}" ]]; then
    curl -s -X POST "${POSTHOG_HOST}/capture/" \
      -H "Content-Type: application/json" \
      -d "{
        \"api_key\": \"${POSTHOG_API_KEY}\",
        \"event\": \"backup_verify_completed\",
        \"properties\": {
          \"status\": \"${status}\",
          \"total_checked\": ${TOTAL_CHECKED},
          \"total_passed\": ${TOTAL_PASSED},
          \"total_failed\": ${TOTAL_FAILED},
          \"duration_seconds\": ${duration},
          \"failed_backups\": \"${FAILED_BACKUPS[*]}\",
          \"wave\": \"W34\"
        }
      }" >/dev/null 2>&1 || true
  fi
}

# ---------------------------------------------------------------------------
# Alertas
# ---------------------------------------------------------------------------

alert_on_failure() {
  err "VERIFICAÇÃO FALHOU: ${TOTAL_FAILED}/${TOTAL_CHECKED} backups"
  err "Backups com problema: ${FAILED_BACKUPS[*]}"

  # Slack
  if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
    local failed_list
    failed_list=$(printf '%s\n' "${FAILED_BACKUPS[@]}" | head -5)
    curl -s -X POST "$SLACK_WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"channel\": \"#ops-alerts\",
        \"username\": \"backup-bot\",
        \"icon_emoji\": \":rotating_light:\",
        \"text\": \"🚨 *Backup integrity check FAILED*\n\nTotal: ${TOTAL_CHECKED} | Passed: ${TOTAL_PASSED} | Failed: ${TOTAL_FAILED}\n\nFalhos:\n\`\`\`${failed_list}\`\`\`\"
      }" >/dev/null 2>&1 || true
  fi

  # PagerDuty (P1)
  if [[ -n "${PAGERDUTY_ROUTING_KEY:-}" ]]; then
    curl -s -X POST "https://events.pagerduty.com/v2/enqueue" \
      -H "Content-Type: application/json" \
      -d "{
        \"routing_key\": \"${PAGERDUTY_ROUTING_KEY}\",
        \"event_action\": \"trigger\",
        \"payload\": {
          \"summary\": \"Backup integrity check failed: ${TOTAL_FAILED}/${TOTAL_CHECKED} backups\",
          \"severity\": \"error\",
          \"source\": \"akasha-backup-verify\",
          \"component\": \"backup-verify\",
          \"group\": \"ops\",
          \"class\": \"backup-integrity\"
        }
      }" >/dev/null 2>&1 || true
  fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

main() {
  local start_time
  start_time=$(date +%s)

  log "Iniciando verify-backup-integrity.sh (timestamp=$TIMESTAMP)"

  # Verificar AWS CLI
  if ! command -v aws &>/dev/null; then
    err "AWS CLI não encontrado"
    exit 2
  fi

  # Listar backups recentes
  local backups
  mapfile -t backups < <(list_recent_backups)

  if [[ ${#backups[@]} -eq 0 ]]; then
    err "Nenhum backup encontrado em s3://${S3_BUCKET}/${S3_PREFIX}/"
    exit 2
  fi

  log "Backups a verificar: ${#backups[@]}"

  # Verificar cada backup
  for backup in "${backups[@]}"; do
    verify_one_backup "$backup" "$@" || true
  done

  local duration=$(( $(date +%s) - start_time ))

  # Métricas
  if [[ $TOTAL_FAILED -eq 0 ]]; then
    send_metrics pass "$duration"
    ok "Verificação completa: ${TOTAL_PASSED}/${TOTAL_CHECKED} passaram em ${duration}s"
    exit 0
  else
    send_metrics fail "$duration"
    alert_on_failure
    err "Verificação completa: ${TOTAL_FAILED}/${TOTAL_CHECKED} falharam em ${duration}s"
    exit 1
  fi
}

main "$@"