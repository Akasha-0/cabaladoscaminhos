# Runbook 05 — Backup & Restore

> **Quando usar:** Antes de migration destrutiva, depois de incidente grave,
> ou mensalmente para teste de restore.

---

## Estratégia de backup

| Camada | Frequência | Retenção | Storage | Custo |
|--------|------------|----------|---------|-------|
| **Supabase automático (Pro)** | Diário | 7 dias | S3 gerenciado Supabase | Incluso |
| **Supabase Point-in-time Recovery (PITR)** | Contínuo (WAL) | 7 dias | S3 Supabase | $0.125/GB/mês |
| **Backup manual pre-migration** | Ad-hoc | Permanente | S3 nosso ou local | Variável |
| **Backup de arquivos (Storage)** | Diário | 30 dias | S3 versionado | $0.023/GB/mês |

---

## Supabase — backups automáticos (Pro)

### Configurar

1. Supabase Dashboard → Project → **Database** → **Backups**
2. **Schedule:** diário às 03:00 UTC (baixo tráfego global)
3. **Retention:** 7 dias (Pro plan)
4. **PITR:** habilitado em Pro (recovery até segundo)

### Listar backups

```bash
# Via Supabase CLI
supabase db backups list --project-ref <ref>
```

### Restaurar (usar com cuidado!)

```bash
# ⚠️ Restauração SUBSTITUI o banco atual

# Opção 1: criar novo projeto a partir do backup
supabase db restore <backup-id> --project-ref <new-project-ref>

# Opção 2: restaurar in-place (downtime!)
# Via dashboard: Database → Backups → Restore → Confirm
```

> PITR é menos invasivo: rollback para timestamp específico sem dropar nada.

---

## Backup manual pre-migration

Antes de migration destrutiva (drop table, rename column, etc):

```bash
#!/usr/bin/env bash
# scripts/backup-db.sh
set -euo pipefail

TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP_FILE="backups/db-${TIMESTAMP}.sql.gz"

mkdir -p backups

# Dump compresso (custom format, paralelizável)
pg_dump "$DATABASE_URL" \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-acl \
  --file="$BACKUP_FILE"

echo "✅ Backup criado: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# Upload para S3 (se configurado)
if [ -n "${BACKUP_S3_BUCKET:-}" ]; then
  aws s3 cp "$BACKUP_FILE" "s3://$BACKUP_S3_BUCKET/db-backups/"
  echo "☁️  Uploaded para s3://$BACKUP_S3_BUCKET/db-backups/"
fi
```

```bash
# Rodar
chmod +x scripts/backup-db.sh
./scripts/backup-db.sh
```

### Cron job (backup diário automático)

```bash
# crontab -e
0 3 * * * cd /opt/cabala-dos-caminhos && ./scripts/backup-db.sh >> /var/log/db-backup.log 2>&1
```

---

## Restore

### Cenário 1 — restaurar tabela específica (cirúrgico)

```bash
# 1. Listar tabelas no backup
pg_restore --list backups/db-20260627T030000Z.sql.gz | grep "TABLE.*users"

# 2. Extrair só a tabela desejada
pg_restore --format=custom \
  --table=public."User" \
  --no-owner \
  backups/db-20260627T030000Z.sql.gz > /tmp/users-restore.sql

# 3. Inspecionar (sempre!)
head -20 /tmp/users-restore.sql

# 4. Aplicar em staging primeiro
psql $STAGING_DATABASE_URL -f /tmp/users-restore.sql

# 5. Validar e então aplicar em prod
psql $PROD_DATABASE_URL -f /tmp/users-restore.sql
```

### Cenário 2 — disaster recovery (restore completo)

```bash
# 1. Criar projeto Supabase novo (ou usar existente pausado)

# 2. Restaurar
pg_restore --format=custom \
  --no-owner \
  --no-acl \
  --dbname=$NEW_DATABASE_URL \
  backups/db-20260627T030000Z.sql.gz

# 3. Aplicar migrations posteriores (se houver)
cd /opt/cabala-dos-caminhos
DATABASE_URL=$NEW_DATABASE_URL pnpm prisma migrate deploy

# 4. Atualizar DATABASE_URL na Vercel → redeploy
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production  # nova URL
vercel --prod

# 5. Smoke test
pnpm e2e:smoke
```

### Cenário 3 — PITR (point-in-time, menos invasivo)

```bash
# Supabase Dashboard → Database → Backups → Point in Time
# Selecionar timestamp exato (UTC)
# Confirmar

# ⚠️ Vai rewrite do banco — janela de downtime esperada
```

---

## Backup de arquivos (Supabase Storage)

### Versionamento S3

Supabase Storage tem versionamento built-in (ativar por bucket):

```bash
# Via dashboard: Storage → bucket → Settings → Versioning → Enable
```

### Backup manual de bucket

```bash
# Listar todos os arquivos
supabase storage list --bucket=avatars

# Download recursivo
supabase storage download --bucket=avatars --recursive ./backups/avatars-$(date -I)
```

---

## Teste de restore (mensal!)

> **Por que testar:** backup que nunca foi restaurado é backup que vai falhar no momento que você precisa.

### Checklist mensal

- [ ] Escolher backup aleatório (não o mais recente)
- [ ] Criar Supabase project temporário (`staging-restore-test`)
- [ ] Aplicar backup
- [ ] Rodar smoke tests (`pnpm e2e:smoke` apontando pro staging)
- [ ] Validar: contagem de tabelas, usuários últimos 30 dias, posts recentes
- [ ] Documentar em `docs/HEALTH-LOG.md` (data, quem testou, resultado)

### Script de validação

```bash
#!/usr/bin/env bash
# scripts/verify-backup.sh
set -euo pipefail

BACKUP_FILE=$1
RESTORE_URL=$2

# 1. Drop e recriar schema
psql $RESTORE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 2. Restore
pg_restore --format=custom --no-owner --no-acl --dbname=$RESTORE_URL "$BACKUP_FILE"

# 3. Validar contagens (ajustar conforme schema)
USER_COUNT=$(psql $RESTORE_URL -tAc "SELECT COUNT(*) FROM \"User\";")
POST_COUNT=$(psql $RESTORE_URL -tAc "SELECT COUNT(*) FROM \"Post\" WHERE \"deletedAt\" IS NULL;")
COMMENT_COUNT=$(psql $RESTORE_URL -tAc "SELECT COUNT(*) FROM \"Comment\";")

echo "✅ Restore validado:"
echo "   Users:   $USER_COUNT"
echo "   Posts:   $POST_COUNT"
echo "   Comments: $COMMENT_COUNT"

# 4. Comparar com prod
PROD_USERS=$(psql $PROD_DATABASE_URL -tAc "SELECT COUNT(*) FROM \"User\";")
if [ "$USER_COUNT" -lt "$((PROD_USERS - 100))" ]; then
  echo "⚠️  ATENÇÃO: backup tem $USER_COUNT users, prod tem $PROD_USERS"
  exit 1
fi
```

---

## Custos estimados

| Item | Custo/mês |
|------|-----------|
| PITR (Supabase Pro) | $0.125/GB × ~5GB = $0.63 |
| Backup S3 próprio (100GB) | ~$2.30 |
| Storage versionado (50GB) | ~$1.15 |
| **Total** | **~$4/mês** |

Justificável? Sim — custo de **NÃO ter backup** é 100% dos dados perdidos.

---

## LGPD — considerações

> Backup contém dados pessoais. Tratar com mesmo cuidado que prod.

- [ ] Backups armazenados com **encryption at rest** (S3 AES-256 default)
- [ ] Acesso ao bucket de backup restrito (IAM policy: só Gabriel + service account)
- [ ] Retenção **máxima 90 dias** (após isso, deletar — não énecessário historicamente)
- [ ] Em restore para staging, **mascarar PII** antes (emails, telefones)
- [ ] Logs de acesso ao bucket de backup (CloudTrail)

---

## Quando NÃO confiar no backup

❌ Backup automático falhou silenciosamente (Supabase notifica? verificar!)
❌ Backup tem > 7 dias (PITR expirou)
❌ Não testou restore nos últimos 30 dias
❌ Bucket de backup tem permissão pública (raro mas acontece)

**Mitigação:** sempre rodar `verify-backup.sh` antes de migration destrutiva, mesmo se o backup automático parece OK.

---

## Referências

- [Supabase — Backups](https://supabase.com/docs/guides/platform/backups)
- [Postgres — pg_dump / pg_restore](https://www.postgresql.org/docs/current/backup-dump.html)
- [AWS S3 — Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html)
- `docs/SECURITY-AUDIT.md` — encryption + LGPD
- `docs/runbooks/04-database-migration.md` — quando fazer backup pre-migration