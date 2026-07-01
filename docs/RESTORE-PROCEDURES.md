# Restore Procedures — Akasha Portal (Wave 34)

> **Versão:** 1.0 | **Data:** 2026-07-01 | **Wave:** 34 (DISASTER RECOVERY 1/8)
> **Idioma:** PT-BR (comandos em inglês)
> **Owner:** Coder + Aki (DevOps)
> **Complementa:** `docs/DISASTER-RECOVERY-W34.md`
> **Pré-requisito:** `docs/SECRETS-CHECKLIST-W27.md` lido; acesso a vault + Supabase dashboard + AWS + Vercel

---

## Índice

1. [Database — Point-in-Time Recovery (PITR)](#1-database--point-in-time-recovery-pitr)
2. [Database — Restore de backup S3 (full)](#2-database--restore-de-backup-s3-full)
3. [Database — Restore de backup local (último)](#3-database--restore-de-backup-local-último)
4. [Database — Selective table restore](#4-database--selective-table-restore)
5. [Storage — Re-sync de bucket](#5-storage--re-sync-de-bucket)
6. [Storage — Restore de arquivo individual](#6-storage--restore-de-arquivo-individual)
7. [Configs — Re-injection de vault](#7-configs--re-injection-de-vault)
8. [Code — Restore de release específico](#8-code--restore-de-release-específico)
9. [AI Embeddings — Re-geração](#9-ai-embeddings--re-geração)
10. [Full cluster restore (worst-case)](#10-full-cluster-restore-worst-case)
11. [Validação pós-restore](#11-validação-pós-restore)
12. [Comunicação com usuários](#12-comunicação-com-usuários)
13. [Rollback do restore (se algo der errado)](#13-rollback-do-restore-se-algo-der-errado)
14. [Checklist final](#14-checklist-final)

---

## Quick reference

| Cenário | Severidade | Procedimento | RTO alvo | Seção |
|---------|-----------|--------------|----------|-------|
| DB corrompido (não-catastrófico) | P1 | Restore de S3 | 4h | § 2 |
| DB perdido totalmente | P0 | PITR Supabase + swap URL | 4h | § 1 |
| Tabela individual perdida | P2 | Selective restore | 8h | § 4 |
| Storage bucket deletado | P1 | Re-sync S3 | 8h | § 5 |
| Secrets perdidos | P0 | Vault re-injection | 1h | § 7 |
| Código perdido (GitHub down) | P1 | Restore de tag/release | 2h | § 8 |
| Embeddings perdidos | P2 | Re-geração via OpenAI | 12h | § 9 |
| **Catástrofe total** | **P0** | **Full cluster restore** | **24h** | § 10 |

---

## Antes de começar (universal)

```bash
# 1. Confirmar severidade do incidente (P0/P1/P2/P3)
# 2. Acionar on-call via PagerDuty
# 3. Abrir canal #inc-<timestamp> no Slack
# 4. Avaliar se é REAL ou falso alarme (cross-check Sentry + Vercel status + reports)
# 5. Se confirmado, escolher procedimento abaixo baseado no cenário
# 6. Comunicar usuários ANTES de iniciar restore (banner)
# 7. Atribuir roles:
#    - Incident commander (decide, não mexe)
#    - Executor (roda os comandos)
#    - Communications (atualiza status + responde usuários)
# 8. Começar restore
```

---

## 1. Database — Point-in-Time Recovery (PITR)

> **Quando usar:** DB corrompido ou perdido, precisa restaurar para timestamp específico.
> **Limitação:** PITR no Supabase cria um **novo project**. Requer swap de DATABASE_URL.
> **RTO alvo:** 4h. **RPO alvo:** até 5min (granularidade do WAL).

### 1.1 Pré-requisitos

- Acesso ao Supabase dashboard (https://app.supabase.com/project/akasha)
- Permissão para criar novo project (apenas owner)
- Acesso a Vercel dashboard (para swap de DATABASE_URL)

### 1.2 Passos

#### Step 1 — Identificar timestamp alvo

```bash
# Coletar evidências:
# - Logs de erro em Sentry (https://sentry.io/akasha-portal/issues)
# - User reports em #feedback ou support@akashaportal.com.br
# - Audit log (PostHog events)
# - Última migration aplicada com sucesso:
#   psql $DATABASE_URL -c "SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;"

# Objetivo: identificar timestamp UTC ANTES da corrupção
# Ex: 2026-06-30 14:23:00 UTC
```

#### Step 2 — PITR via Supabase dashboard

1. Acessar https://app.supabase.com/project/akasha/database/backups
2. **IMPORTANTE:** verificar que o projeto Pro tem **PITR enabled** (Settings → Database → Point in Time Recovery).
3. Clicar em "Restore to point in time".
4. Selecionar **Data e hora exata** (UTC).
5. Confirmar. Supabase vai:
   - Criar novo project (nome: `akasha-restored-YYYYMMDD`).
   - Provisionar DB do zero + replay WAL até o timestamp.
   - Provisionar Storage, Auth, etc (estado vazio).
6. **Anotar** novo `DATABASE_URL` e `SUPABASE_URL` (vão para Vercel).
7. Tempo estimado: 30min — 4h (depende do tamanho do DB).

#### Step 3 — Verificar novo project

```bash
# Conectar no novo project e validar:
psql $NEW_DATABASE_URL -c "SELECT count(*) FROM users;"
psql $NEW_DATABASE_URL -c "SELECT count(*) FROM posts;"
psql $NEW_DATABASE_URL -c "SELECT max(created_at) FROM posts;"

# Validar que dados estão consistentes:
psql $NEW_DATABASE_URL -c "SELECT id, email FROM auth.users LIMIT 5;"

# Validar extensões:
psql $NEW_DATABASE_URL -c "SELECT extname FROM pg_extension;"
```

#### Step 4 — Re-criar Storage buckets no novo project

> **CUIDADO:** PITR restaura APENAS o DB. Storage vem vazio.

```bash
# 1. Re-criar buckets via Supabase Studio ou CLI:
supabase storage create avatars --public
supabase storage create posts-media --public
supabase storage create articles --public
supabase storage create temp --public

# 2. Aplicar RLS policies (re-rodar setup):
bash scripts/setup-supabase-storage.sh

# 3. Re-sync Storage de S3 backup (ver § 5)
```

#### Step 5 — Swap DATABASE_URL no Vercel

```bash
# 1. Vercel dashboard → Project → Settings → Environment Variables
# 2. Atualizar:
#    - DATABASE_URL → novo connection string
#    - SUPABASE_URL → novo URL
#    - SUPABASE_ANON_KEY → novo anon key
#    - SUPABASE_SERVICE_ROLE_KEY → novo service role key
# 3. Marcar como Production
# 4. Save → Vercel vai fazer redeploy automático

# OU via CLI:
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
# (colar novo URL)
vercel --prod  # forçar redeploy
```

#### Step 6 — Smoke test

```bash
# Health endpoint
curl -i https://cabaladoscaminhos.com.br/api/health

# Auth flow
curl -X POST https://cabaladoscaminhos.com.br/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"..."}'

# Posts listing
curl https://cabaladoscaminhos.com.br/api/posts?limit=10

# E2E completo
BASE_URL=https://cabaladoscaminhos.com.br npm run test:e2e:smoke
```

#### Step 7 — Cleanup

```bash
# Deletar project antigo (após confirmar que novo está OK):
# Supabase dashboard → Settings → Danger Zone → Delete Project
# Aguardar 7 dias (Supabase retém por segurança)

# Remover alias do Vercel se aplicável
```

#### Step 8 — Post-mortem

Ver template em `docs/DR-DRILL-REPORT-TEMPLATE.md` (adaptar para incidente real).

---

## 2. Database — Restore de backup S3 (full)

> **Quando usar:** DB corrompido mas projeto Supabase ainda existe. Restore in-place.
> **Mais rápido que PITR** porque não precisa criar novo projeto.
> **RTO alvo:** 4h. **RPO alvo:** 24h (último backup diário).

### 2.1 Procedimento

```bash
# 1. Identificar backup alvo:
aws s3 ls s3://akasha-backups/db/daily/ | tail -10

# 2. Listar backups disponíveis com timestamps
# (escolher o mais recente PRÉ-corrupção)

# 3. Baixar backup:
mkdir -p /tmp/akasha-restore/
cd /tmp/akasha-restore/
aws s3 cp s3://akasha-backups/db/daily/akasha-db-20260630.dump .

# 4. Validar checksum:
wget https://akasha-backups/db/daily/akasha-db-20260630.dump.sha256
sha256sum -c akasha-db-20260630.dump.sha256

# 5. Modo de manutenção (bloquear writes):
#    - Ativar feature flag MAINTENANCE_MODE=true no PostHog
#    - Banner de aviso aos usuários

# 6. Dropar + recriar DB:
DATABASE_URL=$CURRENT_DATABASE_URL
psql $DATABASE_URL -c "DROP DATABASE IF EXISTS postgres WITH (FORCE);"
# NOTA: NÃO dropar o DB "postgres" (é o default). Em vez disso, criar DB temporário:
NEW_DB="akasha_restore_$(date +%s)"
psql $DATABASE_URL -c "CREATE DATABASE $NEW_DB;"

# 7. Restore:
pg_restore \
  --host=<supabase-host> \
  --port=5432 \
  --username=postgres \
  --dbname=$NEW_DB \
  --no-owner \
  --no-acl \
  --single-transaction \
  --jobs=4 \
  /tmp/akasha-restore/akasha-db-20260630.dump

# 8. Validar:
psql postgresql://postgres:<pw>@<host>:5432/$NEW_DB -c "SELECT count(*) FROM users;"
psql postgresql://postgres:<pw>@<host>:5432/$NEW_DB -c "SELECT max(created_at) FROM posts;"

# 9. Renomear DBs (swap):
psql $DATABASE_URL -c "ALTER DATABASE postgres RENAME TO postgres_old;"
psql $DATABASE_URL -c "ALTER DATABASE $NEW_DB RENAME TO postgres;"

# 10. Aplicar migrations pendentes (se houver):
DATABASE_URL=$NEW_DATABASE_URL npx prisma migrate deploy

# 11. Desativar maintenance mode

# 12. Smoke test (ver § 11)
```

### 2.2 Alternativa: usar o script `disaster-recovery-drill.sh`

```bash
# O script de drill também serve para restore real (apenas com --target-host apontando para prod)
# CUIDADO: usar com parcimônia. Em produção, preferir restore manual acima.

bash scripts/backup/disaster-recovery-drill.sh \
  --source=s3 \
  --bucket=akasha-backups/db/daily/ \
  --target-db=akasha_restore_temp \
  --target-host=<supabase-host> \
  --verify
```

---

## 3. Database — Restore de backup local (último)

> **Quando usar:** S3 inacessível, restore local-only. Pior cenário.

```bash
# 1. Listar backups locais:
ls -lht /tmp/akasha-backups/db/daily/*.dump | head -5

# 2. Validar checksum:
cd /tmp/akasha-backups/db/daily/
sha256sum -c akasha-db-20260630.dump.sha256

# 3. Mesmo procedimento de § 2.6 a § 2.12, usando o arquivo local.
```

---

## 4. Database — Selective table restore

> **Quando usar:** Apenas uma tabela foi corrompida (não DB inteiro).
> **RTO alvo:** 8h.

### 4.1 Procedimento (Postgres pg_restore + filtro)

```bash
# 1. Identificar tabela alvo
# Ex: tabela "comments" corrompida

# 2. Baixar backup:
aws s3 cp s3://akasha-backups/db/daily/akasha-db-20260630.dump /tmp/restore/

# 3. Listar conteúdo do dump (verificar se a tabela está lá):
pg_restore --list /tmp/restore/akasha-db-20260630.dump | grep comments

# 4. Criar arquivo de filtro (apenas a tabela):
cat > /tmp/restore-filter.txt <<EOF
# Apenas comments + dependencies
TABLE DATA public.comments
TABLE public.comments
# + dependências (FK, indexes, triggers)
EOF

# 5. Restore APENAS da tabela:
pg_restore \
  --host=<host> \
  --dbname=akasha_restore_table \
  --use-list=/tmp/restore-filter.txt \
  --no-owner \
  --no-acl \
  /tmp/restore/akasha-db-20260630.dump

# 6. Export apenas a tabela:
pg_dump --table=public.comments \
  --data-only \
  --no-owner \
  akasha_restore_table > /tmp/comments-restore.sql

# 7. Aplicar ao DB prod:
psql $DATABASE_URL -f /tmp/comments-restore.sql

# 8. Validar integridade referencial:
psql $DATABASE_URL -c "
  SELECT COUNT(*) FROM comments c
  LEFT JOIN posts p ON c.post_id = p.id
  WHERE p.id IS NULL;
"  # deve retornar 0
```

---

## 5. Storage — Re-sync de bucket

> **Quando usar:** Bucket do Supabase Storage corrompido ou deletado.

### 5.1 Procedimento

```bash
# 1. Identificar bucket afetado:
# Ex: "posts-media" perdeu 50% dos arquivos

# 2. Listar arquivos em produção:
supabase storage ls posts-media --recursive > /tmp/prod-listing.txt
wc -l /tmp/prod-listing.txt

# 3. Listar backup S3:
aws s3 ls s3://akasha-backups/storage/posts-media/ --recursive > /tmp/backup-listing.txt
wc -l /tmp/backup-listing.txt

# 4. Identificar faltantes:
diff /tmp/prod-listing.txt /tmp/backup-listing.txt > /tmp/missing.txt
wc -l /tmp/missing.txt

# 5. Re-sync incremental:
aws s3 sync s3://akasha-backups/storage/posts-media/ \
  supabase://posts-media --delete 2>&1 | tee /tmp/resync.log

# NOTA: aws s3 sync → supabase storage não é nativo. Usar script customizado:

cat > /tmp/resync-storage.sh <<'EOF'
#!/bin/bash
set -e
SRC_BUCKET=$1
DEST_BUCKET=$2

aws s3 ls "s3://${SRC_BUCKET}/" --recursive | \
  awk '{print $4}' | \
  while read -r key; do
    local_path="/tmp/storage-restore/$key"
    mkdir -p "$(dirname "$local_path")"
    aws s3 cp "s3://${SRC_BUCKET}/$key" "$local_path" --only-show-errors
    
    # Upload to Supabase
    supabase storage upload "$DEST_BUCKET" "$local_path" "$key"
  done
EOF

chmod +x /tmp/resync-storage.sh
bash /tmp/resync-storage.sh akasha-backups/storage/posts-media posts-media

# 6. Validar via smoke test:
# - Random sample de 10 imagens
# - Verificar checksums batem
# - Smoke test E2E que faz upload + display

# 7. Tempo estimado: depende do volume (10GB ≈ 30min, 100GB ≈ 4h)
```

---

## 6. Storage — Restore de arquivo individual

> **Quando usar:** Arquivo específico reportado como faltando/quebrado.

```bash
# 1. Identificar arquivo (URL/path):
# Ex: https://cabaladoscaminhos.com.br/storage/v1/object/public/posts-media/abc123.jpg

# 2. Encontrar no backup S3:
aws s3 ls s3://akasha-backups/storage/posts-media/ --recursive | grep abc123.jpg

# 3. Download:
aws s3 cp s3://akasha-backups/storage/posts-media/abc123.jpg /tmp/restore/

# 4. Re-upload para Supabase:
supabase storage upload posts-media /tmp/restore/abc123.jpg abc123.jpg

# 5. Validar:
curl -I https://cabaladoscaminhos.com.br/storage/v1/object/public/posts-media/abc123.jpg
# Esperado: HTTP 200, Content-Type: image/jpeg
```

---

## 7. Configs — Re-injection de vault

> **Quando usar:** Env vars perdidas ou Vercel project recriado.

### 7.1 Procedimento

```bash
# 1. Listar secrets necessários (.env.example):
cat .env.example

# 2. Para cada secret, recuperar de 1Password:
# - DATABASE_URL
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - OPENAI_API_KEY
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - SENTRY_DSN
# - POSTHOG_API_KEY
# - RESEND_API_KEY
# - NEXT_PUBLIC_APP_URL
# - CRON_SECRET

# 3. Setar no Vercel:
vercel env rm DATABASE_URL production --yes
vercel env add DATABASE_URL production
# (colar valor)

# Repetir para cada var

# 4. OU via dashboard:
# https://vercel.com/akasha/settings/environment-variables

# 5. Forçar redeploy:
vercel --prod

# 6. Validar:
bash scripts/verify-env.sh
```

### 7.2 Backup de configs (antes de mudanças)

```bash
# Export para arquivo (criptografado):
bash scripts/backup/configs-backup.sh  # a criar em W35

# Manual:
vercel env ls production > /tmp/vercel-prod-$(date +%Y%m%d).env
gpg --symmetric --cipher-algo AES256 /tmp/vercel-prod-*.env
aws s3 cp /tmp/vercel-prod-*.env.gpg s3://akasha-backups/configs/

# Armazenar passphrase em 1Password (team vault, "Backup configs passphrase")
```

---

## 8. Code — Restore de release específico

> **Quando usar:** GitHub indisponível, repo deletado, ou precisa clonar versão antiga.

### 8.1 Procedimento

```bash
# Opção A: Restore de tag release
git clone https://github.com/Akasha-0/cabaladoscaminhos.git
cd cabaladoscaminhos
git checkout v0.33.0  # tag específica

# Opção B: Download release archive
curl -L https://github.com/Akasha-0/cabaladoscaminhos/archive/refs/tags/v0.33.0.tar.gz -o release.tar.gz
tar -xzf release.tar.gz
cd cabaladoscaminhos-0.33.0/

# Opção C: Restore de mirror local (dev sandbox)
git remote add local /workspace/mirror.git
git fetch local main
git checkout main

# Opção D: Re-criar repo no GitHub
# 1. Criar repo vazio em github.com/Akasha-0/cabaladoscaminhos
# 2. Push do mirror local:
git remote set-url origin https://github.com/Akasha-0/cabaladoscaminhos.git
git push origin main --force
```

### 8.2 Validar

```bash
# 1. Install + typecheck:
pnpm install
npx tsc --noEmit

# 2. Validar env vars:
bash scripts/verify-env.sh

# 3. Build:
pnpm build

# 4. Smoke test local:
pnpm dev
# (em outro terminal)
curl http://localhost:3000/api/health
```

---

## 9. AI Embeddings — Re-geração

> **Quando usar:** Embeddings perdidos ou pgvector corrompido.
> **Custo:** ~$10 em OpenAI para 50k articles (1536 dims × $0.02/1M tokens).

### 9.1 Procedimento

```bash
# 1. Identificar articles sem embedding:
psql $DATABASE_URL -c "
  SELECT a.id, a.title
  FROM articles a
  LEFT JOIN article_embeddings e ON e.article_id = a.id
  WHERE e.id IS NULL;
" -t > /tmp/missing-embeddings.txt

wc -l /tmp/missing-embeddings.txt

# 2. Re-gerar embeddings:
# Usar script existente ou criar:
cat > /tmp/regen-embeddings.ts <<'EOF'
import { OpenAI } from "openai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

async function main() {
  const articles = await prisma.$queryRaw<Array<{ id: string; title: string; content: string }>>`
    SELECT a.id, a.title, a.content
    FROM articles a
    LEFT JOIN article_embeddings e ON e.article_id = a.id
    WHERE e.id IS NULL;
  `;

  console.log(`Generating embeddings for ${articles.length} articles...`);

  for (const article of articles) {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: `${article.title}\n\n${article.content}`,
    });

    const embedding = response.data[0].embedding;

    await prisma.$executeRaw`
      INSERT INTO article_embeddings (article_id, embedding, model, created_at)
      VALUES (${article.id}::uuid, ${JSON.stringify(embedding)}::vector, 'text-embedding-3-small', NOW());
    `;
  }

  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
EOF

npx tsx /tmp/regen-embeddings.ts

# 3. Validar:
psql $DATABASE_URL -c "SELECT count(*) FROM article_embeddings;"

# 4. Tempo estimado: 50k articles ≈ 4-8h (rate limited pela OpenAI)
```

---

## 10. Full cluster restore (worst-case)

> **Quando usar:** Catástrofe total — DB + Storage + Configs perdidos.
> **RTO alvo:** 24h. **RPO alvo:** 24h.

### 10.1 Procedimento

```bash
# FASE 1: Database (4h)
# 1. Provisionar novo Supabase project (criar do zero)
# 2. Aplicar migrations:
npx prisma migrate deploy
# 3. Restore do último backup:
bash scripts/backup/disaster-recovery-drill.sh \
  --source=s3 --bucket=akasha-backups/db/daily/ \
  --target-db=postgres --target-host=$NEW_DB_HOST \
  --verify

# FASE 2: Storage (4h)
# 1. Criar buckets vazios no novo project
# 2. Re-sync de S3:
bash scripts/backup/storage-backup.sh restore \
  --source-bucket=akasha-backups/storage/ \
  --target-bucket=avatars,posts-media,articles

# FASE 3: Configs (1h)
# 1. Injetar env vars do 1Password vault:
bash scripts/backup/configs-restore.sh  # a criar W35

# FASE 4: AI Embeddings (8h)
# 1. Re-gerar embeddings (ver § 9)

# FASE 5: Code + Deploy (2h)
# 1. Push código (se repo perdido):
git clone https://github.com/Akasha-0/cabaladoscaminhos.git
# 2. Setar env vars no Vercel (ver § 7)
# 3. Deploy:
vercel --prod

# FASE 6: DNS swap (1h)
# 1. Atualizar DATABASE_URL no Vercel (apontar para novo project)
# 2. Verificar DNS (não precisa mudar — domínio já aponta para Vercel)
# 3. Verificar que storage URLs funcionam

# FASE 7: Validação final (4h)
# 1. E2E smoke tests (16 specs)
# 2. Performance baseline (LCP, CLS)
# 3. Monitoring: Sentry + PostHog + uptime check
# 4. Notificar usuários que está tudo OK

# TOTAL: 4+4+1+8+2+1+4 = 24h
```

---

## 11. Validação pós-restore

### 11.1 Checklist obrigatório (qualquer restore)

```bash
# 1. Health endpoint
curl -i https://cabaladoscaminhos.com.br/api/health
# Esperado: HTTP 200, status: "ok"

# 2. E2E smoke tests
BASE_URL=https://cabaladoscaminhos.com.br npm run test:e2e:smoke
# Esperado: 16 specs passam

# 3. Database integrity
psql $DATABASE_URL -c "
  SELECT
    (SELECT count(*) FROM users) as users_count,
    (SELECT count(*) FROM posts) as posts_count,
    (SELECT count(*) FROM comments) as comments_count,
    (SELECT count(*) FROM articles) as articles_count;
"
# Validar que counts estão dentro de ±5% da baseline

# 4. Auth flow
curl -X POST https://cabaladoscaminhos.com.br/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke-test@example.com","password":"..."}'
# Esperado: HTTP 200 + token JWT

# 5. Storage (imagens)
curl -I https://cabaladoscaminhos.com.br/storage/v1/object/public/posts-media/sample.jpg
# Esperado: HTTP 200, Content-Type: image/jpeg

# 6. Akasha IA
curl -X POST https://cabaladoscaminhos.com.br/api/akasha/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"Olá, Akasha"}'
# Esperado: HTTP 200 + resposta

# 7. Cron jobs (verificar que estão rodando)
curl https://cabaladoscaminhos.com.br/api/cron/publish-scheduled \
  -H "Authorization: Bearer $CRON_SECRET"
# Esperado: HTTP 200

# 8. Monitoring
# Sentry: https://sentry.io/akasha-portal/issues — verificar que não há novos errors
# PostHog: https://posthog.com/akasha — verificar eventos chegando
# Vercel: https://vercel.com/akasha/dashboard — métricas normais

# 9. Performance
# LCP < 2.5s, CLS < 0.1, INP < 200ms (medir via Lighthouse)

# 10. LGPD
# Verificar que dados pessoais ainda estão consistentes (não foram perdidos)
```

### 11.2 Critérios de sucesso

- [ ] Health endpoint retorna 200
- [ ] E2E smoke tests passam (16/16)
- [ ] Counts de tabela dentro de ±5% baseline
- [ ] Auth funciona
- [ ] Storage serve imagens
- [ ] Akasha IA responde
- [ ] Cron jobs rodando
- [ ] Monitoring limpo (sem novos errors)
- [ ] Performance dentro do baseline
- [ ] Sem erros no console do browser

**Se qualquer item falhar:** NÃO considerar restore completo. Investigar + corrigir + re-validar.

---

## 12. Comunicação com usuários

### 12.1 Sequência de comunicações

| Momento | Canal | Mensagem |
|---------|-------|----------|
| **Antes de iniciar** (se planejado) | In-app banner | "Manutenção programada em 5min..." |
| **Durante** | In-app banner + status page | "Investigando instabilidade..." |
| **A cada 15min** | Status page | Update com progresso |
| **Resolvido** | In-app banner + email (se afetou >10%) | "Tudo voltou ao normal..." |
| **24h depois** | Email + post-mortem público | "Resumo do incidente e ações tomadas..." |

### 12.2 Templates

Ver `docs/DISASTER-RECOVERY-W34.md` § 21.

---

## 13. Rollback do restore (se algo der errado)

### 13.1 Cenário: restore piorou a situação

```bash
# Se PITR (criou novo project):
# 1. Atualizar DATABASE_URL de volta para project antigo
vercel env rm DATABASE_URL production --yes
vercel env add DATABASE_URL production
# (colar URL antiga)

# 2. Forçar redeploy:
vercel --prod

# 3. Investigar o que deu errado no novo project (não deletar ainda)

# Se restore in-place (renomeou DBs):
# 1. Renomear de volta:
psql $DATABASE_URL -c "ALTER DATABASE postgres RENAME TO postgres_failed_restore;"
psql $DATABASE_URL -c "ALTER DATABASE postgres_old RENAME TO postgres;"

# 2. Validar:
curl https://cabaladoscaminhos.com.br/api/health
```

### 13.2 Quando considerar rollback

- E2E smoke tests falham após restore
- Counts muito fora do baseline (>10% diff)
- Auth quebrado
- Storage serve 404
- Latência subiu >50%
- Erros 5xx > 1% após 30min

**Regra:** se restore não funcionou em 4h, rollback e investigar offline.

---

## 14. Checklist final

Antes de declarar restore completo:

- [ ] Procedimento escolhido baseado em severidade
- [ ] On-call acionado + canal #inc aberto
- [ ] Backup alvo identificado + checksum validado
- [ ] Restore executado (PG/Storage/Configs/Embeddings)
- [ ] Validação § 11 passou (todos 10 itens)
- [ ] Maintenance mode desativado
- [ ] Banner atualizado para "tudo OK"
- [ ] Status page atualizada
- [ ] Email para usuários afetados (se P0)
- [ ] Post-mortem iniciado (deadline: 48h)
- [ ] Métricas de duração registradas (RTO medido vs alvo)
- [ ] Custos AWS/OpenAI registrados (charge-back)
- [ ] Documentação atualizada com lições aprendidas
- [ ] Runbook atualizado se procedimento falhou

---

## Próximos passos

- **DR strategy overview:** `docs/DISASTER-RECOVERY-W34.md`
- **DR drills template:** `docs/DR-DRILL-REPORT-TEMPLATE.md`
- **Deploy runbook:** `docs/DEPLOY-RUNBOOK-W27.md`
- **OPS runbook:** `docs/ops/OPS-RUNBOOK.md`

---

**Fim do runbook.** Para cenários não cobertos aqui, abrir issue urgente + escalar on-call.