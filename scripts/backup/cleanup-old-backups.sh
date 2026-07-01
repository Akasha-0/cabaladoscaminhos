#!/usr/bin/env bash
# ============================================================================
# cleanup-old-backups.sh — Wave 34 (DISASTER RECOVERY 1/8)
# ============================================================================
# Rotação de backups:
#   - Local: manter últimos 7 dias, deletar resto
#   - S3: lifecycle policy gerencia (30d Standard-IA → 90d Glacier → delete 120d)
#   - Audit log: lista delecções
#
# Executar via cron: 0 5 * * * (5h UTC todo dia)
#
# Env vars opcionais:
#   LOCAL_RETENTION_DAYS — default 7
#   S3_DRY_RUN           — se "true", não deleta S3 (apenas lista)
#   S3_BUCKET            — default akasha-backups
#
# Saída:
#   - Audit log em /var/log/akasha/cleanup-audit.log
#   - Métrica cleanup_deleted_count para PostHog
# ============================================================================

set -euo pipefail

readonly TIMESTAMP=$(date -u +%Y%m%d-%H%M%S)
readonly DATE=$(date -u +%Y%m%d)
readonly LOCAL_RETENTION_DAYS="${LOCAL_RETENTION_DAYS:-7}"
readonly S3_BUCKET="${S3_BACKUP_BUCKET:-akasha-backups}"
readonly BACKUP_DIR="/tmp/akasha-backups/db/daily"
readonly LOG_FILE="${LOG_FILE:-/var/log/akasha/backup.log}"
readonly AUDIT_LOG="/var/log/akasha/cleanup-audit.log"
readonly S3_DRY_RUN="${S3_DRY_RUN:-false}"

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

log() { echo -e "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" | tee -a "$LOG_FILE"; }
err() { echo -e "${RED}[ERROR]${NC} $*" | tee -a "$LOG_FILE" >&2; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*" | tee -a "$LOG_FILE"; }
ok() { echo -e "${GREEN}[OK]${NC} $*" | tee -a "$LOG_FILE"; }

audit() {
  # Audit log separado — append-only
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [W34-CLEANUP] $*" >> "$AUDIT_LOG"
}

TOTAL_DELETED=0

# ---------------------------------------------------------------------------
# Cleanup local
# ---------------------------------------------------------------------------

cleanup_local() {
  log "Limpando backups locais > ${LOCAL_RETENTION_DAYS} dias em $BACKUP_DIR..."

  if [[ ! -d "$BACKUP_DIR" ]]; then
    warn "Diretório não existe: $BACKUP_DIR (pulando)"
    return 0
  fi

  # Listar antes de deletar (audit)
  local to_delete
  to_delete=$(find "$BACKUP_DIR" -name "akasha-db-*.dump" -mtime +"$LOCAL_RETENTION_DAYS")

  if [[ -z "$to_delete" ]]; then
    log "Nenhum backup local para limpar"
    return 0
  fi

  local deleted_count=0
  while IFS= read -r file; do
    if [[ -n "$file" ]]; then
      local filename
      filename=$(basename "$file")
      audit "LOCAL_DELETE: $filename (size=$(stat -c %s "$file" 2>/dev/null || echo 0) bytes, age_days=$(( ($(date +%s) - $(stat -c %Y "$file")) / 86400 ))"
      rm -f "$file"
      rm -f "${file}.sha256"
      deleted_count=$((deleted_count + 1))
    fi
  done <<< "$to_delete"

  TOTAL_DELETED=$((TOTAL_DELETED + deleted_count))
  ok "Local cleanup: ${deleted_count} backups removidos"
}

# ---------------------------------------------------------------------------
# S3 lifecycle check (report, não deleta)
# ---------------------------------------------------------------------------

# S3 lifecycle é gerenciado pela policy do bucket (não deletamos manualmente).
# Esta função apenas verifica e reporta o que vai expirar nos próximos 7 dias.

check_s3_lifecycle() {
  log "Verificando S3 lifecycle policy..."

  if ! command -v aws &>/dev/null; then
    warn "AWS CLI não disponível — pulando check S3"
    return 0
  fi

  # Listar lifecycle policy atual
  local policy
  policy=$(aws s3api get-bucket-lifecycle-configuration \
    --bucket "$S3_BUCKET" \
    --output json 2>/dev/null || echo "")

  if [[ -z "$policy" ]]; then
    warn "Nenhuma lifecycle policy configurada em s3://${S3_BUCKET}/"
    warn "RECOMENDAÇÃO: configurar policy (ver docs/DISASTER-RECOVERY-W34.md § 16.2)"
    audit "S3_NO_LIFECYCLE: bucket=$S3_BUCKET"
    return 0
  fi

  ok "S3 lifecycle policy ativa"
  audit "S3_LIFECYCLE_OK: bucket=$S3_BUCKET"

  # Listar backups que vão expirar nos próximos 7 dias (estimativa)
  # (S3 não expõe diretamente, então calculamos por mtime + lifecycle rule)
  local cutoff_date
  cutoff_date=$(date -u -d '120 days ago' +%Y%m%d 2>/dev/null || date -u -v-120d +%Y%m%d)

  log "Backups anteriores a ${cutoff_date} podem expirar (lifecycle: 120d)"

  # S3 dry-run: listar o que SERIA deletado
  if [[ "$S3_DRY_RUN" == "true" ]]; then
    log "S3_DRY_RUN=true — listando sem deletar"
    aws s3 ls "s3://${S3_BUCKET}/db/daily/" --recursive 2>/dev/null | \
      awk '{print $4}' | head -20 | tee -a "$LOG_FILE"
  fi
}

# ---------------------------------------------------------------------------
# Report de uso de storage
# ---------------------------------------------------------------------------

report_storage() {
  log "Reportando uso de storage..."

  # Local
  if [[ -d "$BACKUP_DIR" ]]; then
    local local_size
    local_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
    local local_count
    local_count=$(find "$BACKUP_DIR" -name "*.dump" 2>/dev/null | wc -l)
    log "Local: ${local_size} (${local_count} arquivos)"
    audit "STORAGE_LOCAL: size=${local_size} count=${local_count} dir=${BACKUP_DIR}"
  fi

  # S3 (se aws disponível)
  if command -v aws &>/dev/null; then
    local s3_summary
    s3_summary=$(aws s3 ls "s3://${S3_BUCKET}/db/daily/" --recursive --human-readable --summarize 2>/dev/null | tail -3 || echo "")
    if [[ -n "$s3_summary" ]]; then
      log "S3 db/daily/: ${s3_summary}"
      audit "STORAGE_S3: bucket=$S3_BUCKET prefix=db/daily/ summary=${s3_summary}"
    fi
  fi
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
        \"event\": \"backup_cleanup_completed\",
        \"properties\": {
          \"deleted_count\": ${TOTAL_DELETED},
          \"local_retention_days\": ${LOCAL_RETENTION_DAYS},
          \"s3_bucket\": \"${S3_BUCKET}\",
          \"s3_dry_run\": ${S3_DRY_RUN},
          \"wave\": \"W34\"
        }
      }" >/dev/null 2>&1 || true
  fi

  log "Métricas enviadas (deleted=${TOTAL_DELETED})"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

main() {
  log "=========================================="
  log "Iniciando cleanup-old-backups.sh (timestamp=$TIMESTAMP)"

  cleanup_local
  check_s3_lifecycle
  report_storage
  send_metrics

  ok "Cleanup completo: ${TOTAL_DELETED} backups removidos localmente"
  log "=========================================="
  exit 0
}

main "$@"