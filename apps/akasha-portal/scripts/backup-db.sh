#!/usr/bin/env bash
# backup-db.sh — Backup diário do PostgreSQL (Doc 22 §9.4)
#
# Cria dump compactado do banco em /var/backups/cabala/db-YYYY-MM-DD.sql.gz
# Retém últimos BACKUP_RETENTION_DAYS (default 7) e purga os mais antigos.
#
# Uso:
#   sudo BACKUP_DIR=/var/backups/cabala BACKUP_RETENTION_DAYS=7 ./scripts/backup-db.sh
#
# Configuração via env:
#   DATABASE_URL          — string de conexão (default: parseada de /etc/cabala/app.env)
#   BACKUP_DIR            — diretório de destino (default: /var/backups/cabala)
#   BACKUP_RETENTION_DAYS — dias de retenção (default: 7)
#
# Requisitos: pg_dump no PATH (apt install postgresql-client-16)

set -euo pipefail

# Carrega env do app se DATABASE_URL não estiver setado
if [[ -z "${DATABASE_URL:-}" && -f /etc/cabala/app.env ]]; then
  # shellcheck disable=SC1091
  set -a; source /etc/cabala/app.env; set +a
fi

BACKUP_DIR="${BACKUP_DIR:-/var/backups/cabala}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
DATE="$(date -u +%F)"
FILENAME="db-${DATE}.sql.gz"
TMP_FILE="$(mktemp -t cabala-backup.XXXXXX.sql.gz)"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[backup-db] FATAL: DATABASE_URL não definido" >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

echo "[backup-db] Iniciando backup em ${DATE} → ${BACKUP_DIR}/${FILENAME}"

# pg_dump via URL. -Fc = custom format (compactado, suporta pg_restore).
# Redireciona stderr para log.
if ! pg_dump "${DATABASE_URL}" --format=custom --no-owner --no-privileges \
    --compress=9 --file="${TMP_FILE}" 2>/tmp/pg_dump_stderr.log; then
  echo "[backup-db] pg_dump FALHOU:" >&2
  cat /tmp/pg_dump_stderr.log >&2
  rm -f "${TMP_FILE}"
  exit 2
fi

# Move para destino final
mv "${TMP_FILE}" "${BACKUP_DIR}/${FILENAME}"

# Calcula tamanho
SIZE=$(du -h "${BACKUP_DIR}/${FILENAME}" | cut -f1)
echo "[backup-db] OK: ${FILENAME} (${SIZE})"

# Purga backups antigos
PURGED=$(find "${BACKUP_DIR}" -name 'db-*.sql.gz' -mtime "+${RETENTION_DAYS}" -print -delete | wc -l)
if [[ "${PURGED}" -gt 0 ]]; then
  echo "[backup-db] Purgados ${PURGED} backups > ${RETENTION_DAYS} dias"
fi

# Resumo final
echo "[backup-db] Total de backups retidos: $(ls -1 "${BACKUP_DIR}"/db-*.sql.gz 2>/dev/null | wc -l)"
