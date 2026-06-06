#!/usr/bin/env bash
# restore-db.sh — Restore de backup PostgreSQL (Doc 22 §9.4)
#
# Restaura dump criado por backup-db.sh em uma instância Postgres.
# ATENÇÃO: este script DROP e RECREATE o banco alvo — destrutivo.
#
# Uso:
#   sudo DATABASE_URL=postgresql://cabala:***@localhost:5432/cabala \
#        ./scripts/restore-db.sh /var/backups/cabala/db-2026-06-06.sql.gz
#
# Pré-requisitos:
#   - pgvector instalado: CREATE EXTENSION vector;
#   - DATABASE_URL aponta para o banco ALVO (será dropado)
#   - dump file existe e é legível por pg_restore
#
# Após restore, recomenda-se: npm run grimoire:sync (reindexa embeddings)

set -euo pipefail

DUMP_FILE="${1:-}"

if [[ -z "${DUMP_FILE}" ]]; then
  echo "[restore-db] Uso: $0 <caminho-do-dump.sql.gz>" >&2
  exit 1
fi

if [[ ! -f "${DUMP_FILE}" ]]; then
  echo "[restore-db] FATAL: arquivo ${DUMP_FILE} não existe" >&2
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[restore-db] FATAL: DATABASE_URL não definido" >&2
  exit 2
fi

# Extrai database name da URL
# postgresql://user:pass@host:port/dbname?params
DB_NAME=$(echo "${DATABASE_URL}" | sed -E 's|.*/([^/?]+)(\?.*)?$|\1|')
ADMIN_URL=$(echo "${DATABASE_URL}" | sed -E "s|/[^/?]+(\?.*)?$|/postgres\1|")

if [[ -z "${DB_NAME}" || "${DB_NAME}" == "postgres" ]]; then
  echo "[restore-db] FATAL: não foi possível extrair DB_NAME de DATABASE_URL" >&2
  exit 3
fi

echo "[restore-db] ATENÇÃO: este script apaga o banco ${DB_NAME}"
echo "[restore-db] Dump: ${DUMP_FILE}"
echo "[restore-db] TARGET: ${DATABASE_URL}"
read -rp "Confirmar? (digite 'sim' para continuar): " CONFIRM
if [[ "${CONFIRM}" != "sim" ]]; then
  echo "[restore-db] Cancelado pelo usuário"
  exit 0
fi

echo "[restore-db] Drop + recreate ${DB_NAME}"
psql "${ADMIN_URL}" -c "DROP DATABASE IF EXISTS \"${DB_NAME}\" WITH (FORCE);"
psql "${ADMIN_URL}" -c "CREATE DATABASE \"${DB_NAME}\";"

# Habilita pgvector (idempotente)
psql "${ADMIN_URL}" -d "${DB_NAME}" -c "CREATE EXTENSION IF NOT EXISTS vector;" \
  || echo "[restore-db] WARN: CREATE EXTENSION vector falhou (verifique instalação de pgvector)"

echo "[restore-db] Aplicando dump (pode demorar)..."
# pg_restore aceita tanto .sql.gz (custom format) quanto .sql plain
# Detecta pelo header
if head -c 4 "${DUMP_FILE}" | xxd | grep -q "pg_dump"; then
  # Custom format (compactado) — pg_restore
  gunzip -c "${DUMP_FILE}" | pg_restore --no-owner --no-privileges --clean --if-exists \
    --dbname="${DATABASE_URL}"
else
  # Plain SQL
  gunzip -c "${DUMP_FILE}" | psql "${DATABASE_URL}" --single-transaction
fi

echo "[restore-db] Verificando integridade..."
TABLES=$(psql "${DATABASE_URL}" -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
USERS=$(psql "${DATABASE_URL}" -tAc "SELECT count(*) FROM \"User\";" 2>/dev/null || echo "?")
echo "[restore-db] OK: ${TABLES} tabelas, ${USERS} usuários em ${DB_NAME}"
echo "[restore-db] Próximo passo recomendado: npm run grimoire:sync"
