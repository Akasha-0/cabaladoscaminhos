# Disaster Recovery — Akasha Portal (Wave 34)

> **Versão:** 1.0 | **Data:** 2026-07-01 | **Wave:** 34 (DISASTER RECOVERY 1/8)
> **Idioma:** PT-BR (comandos em inglês)
> **Stack:** Vercel (Edge) · Supabase (Postgres + Storage) · Stripe · OpenAI · MiniMax · Sentry · PostHog · S3 (off-site backup)
> **Owner:** Coder + Aki (DevOps)
> **On-call:** ver PagerDuty interno
> **Status:** ✅ DELIVERED — complementa `docs/ops/OPS-RUNBOOK.md` (W32-6) e `docs/DEPLOY-RUNBOOK-W27.md` (W27)
> **Branch:** main @ 8f81350b

---

## Índice

1. [Visão geral e princípios](#1-visão-geral-e-princípios)
2. [Glossário (RTO / RPO / MTTR)](#2-glossário-rto--rpo--mttr)
3. [Classificação de incidentes e severidades](#3-classificação-de-incidentes-e-severidades)
4. [Estratégia de backup por componente](#4-estratégia-de-backup-por-componente)
5. [Database (PostgreSQL via Supabase)](#5-database-postgresql-via-supabase)
6. [Storage (Supabase Storage)](#6-storage-supabase-storage)
7. [Code (GitHub)](#7-code-github)
8. [Configs / Secrets (.env.example)](#8-configs--secrets-envexample)
9. [User uploads (posts/articles/media)](#9-user-uploads-postsarticlesmedia)
10. [AI artifacts (embeddings, prompt cache)](#10-ai-artifacts-embeddings-prompt-cache)
11. [Observabilidade e logs](#11-observabilidade-e-logs)
12. [RTO/RPO targets](#12-rtorpo-targets)
13. [Cenários de falha e procedimentos](#13-cenários-de-falha-e-procedimentos)
14. [Backup cron scripts](#14-backup-cron-scripts)
15. [Verificação de integridade](#15-verificação-de-integridade)
16. [Rotação de backups (30 dias)](#16-rotação-de-backups-30-dias)
17. [DR drills — execução](#17-dr-drills--execução)
18. [Compliance LGPD nos backups](#18-compliance-lgpd-nos-backups)
19. [Criptografia at-rest e in-transit](#19-criptografia-at-rest-e-in-transit)
20. [Monitoring e alertas](#20-monitoring-e-alertas)
21. [Comunicação com usuários (downtime banner)](#21-comunicação-com-usuários-downtime-banner)
22. [Escalation path](#22-escalation-path)
23. [Post-mortem template](#23-post-mortem-template)
24. [Validação trimestral (checklist)](#24-validação-trimestral-checklist)
25. [Contatos e referências](#25-contatos-e-referências)
26. [Apêndice A — Comandos úteis](#26-apêndice-a--comandos-úteis)
27. [Apêndice B — Custos estimados](#27-apêndice-b--custos-estimados)
28. [Apêndice C — Histórico de revisões](#28-apêndice-c--histórico-de-revisões)

---

## 1. Visão geral e princípios

Este documento define a **estratégia de disaster recovery (DR)** para a Akasha Portal. Ele cobre:

- **Backup automatizado** de todos os dados críticos (DB, Storage, configs, AI artifacts).
- **Procedimentos de restore** testados em ambiente de staging.
- **RTO/RPO targets** declarados e mensuráveis.
- **DR drills trimestrais** para validar que os backups funcionam sob pressão.
- **Compliance LGPD** (criptografia at-rest, retenção 30 dias, exclusão em restore cross-failover).

### 1.1 Princípios (ordem de prioridade)

1. **Disponibilidade > Consistência eventual** — preferir failover rápido (RPO maior) em vez de downtime longo.
2. **Backup != Restore** — backup que nunca foi testado é wishful thinking. Todo backup é **verificado mensalmente**.
3. **Defense in depth** — multi-camada (Supabase nativo + S3 off-site + GitHub releases).
4. **LGPD by default** — qualquer backup contém dados pessoais; tratar como PII (criptografado, audit log, acesso restrito).
5. **Drills > Theory** — DR plan não exercitado é teatro. Drills trimestrais obrigatórios.
6. **Comunicação honesta** — downtime banner ligado ANTES do início do restore. Nunca silenciar.

### 1.2 Escopo

| IN scope | OUT of scope |
|----------|--------------|
| Database (Postgres via Supabase) | Disaster naturais extremos (war, EMP) |
| Storage (Supabase Storage + S3) | Falhas de provedores upstream (Vercel/Supabase ambos down) |
| GitHub (código + releases) | Recuperação de devices individuais de usuários |
| Vault (configs/secrets) | LGPD Art. 18 direito ao esquecimento (ver `docs/LGPD-EXPORT-W34.md`) |
| AI artifacts (embeddings) | Disaster fora da jurisdição BR/EU |

---

## 2. Glossário (RTO / RPO / MTTR)

| Termo | Definição | Valor Akasha |
|-------|-----------|--------------|
| **RTO** (Recovery Time Objective) | Tempo máximo entre **detecção** e **restauração completa** do serviço | 1h (geral), 4h (critical tier) |
| **RPO** (Recovery Point Objective) | Janela máxima de **perda de dados aceitável** | 24h (daily backup) ou 6h (critical tier) |
| **MTTR** (Mean Time To Recover) | Tempo médio histórico de restore (medido pós-drill) | target ≤ 45min |
| **MTBF** (Mean Time Between Failures) | Frequência média de incidentes que requerem DR | target ≥ 90 dias |
| **PITR** (Point-in-Time Recovery) | Capacidade de restaurar DB para timestamp específico | ATIVO no Supabase Pro |
| **MFA** (Multi-Factor Auth) | Autenticação de 2+ fatores para acesso a backups/vault | OBRIGATÓRIO para on-call |
| **WAL** (Write-Ahead Log) | Log de transações do Postgres (base do PITR) | Retido 7d (Supabase Pro) |

---

## 3. Classificação de incidentes e severidades

> **Complementa:** `docs/ops/OPS-RUNBOOK.md` § 5.

| Sev | Definição | RTO alvo | RPO alvo | Resposta |
|-----|-----------|----------|----------|----------|
| **P0** | Plataforma totalmente down | < 1h | < 24h | Todos em chamada. Page CTO em 30min. |
| **P1** | DB corrupto / Storage inacessível | < 4h | < 6h | On-call + DevOps. Backup restore imediato. |
| **P2** | Region degradation (latência alta) | < 8h | < 24h | On-call investiga. Failover se degradar. |
| **P3** | Backup falhou (sem impact em produção) | < 24h | — | DevOps investiga no horário comercial. |
| **P4** | DR drill programado | — | — | Sem alerta a usuários. Doc em `docs/dr-drills/`. |

---

## 4. Estratégia de backup por componente

### 4.1 Matriz de cobertura

| Componente | Frequência | Retenção | Local primário | Local secundário | Encryption |
|------------|-----------|----------|----------------|------------------|------------|
| **Database (Postgres)** | Diária (03:00 UTC) + contínua (WAL) | 30d backup + 7d WAL | Supabase Pro PITR | S3 off-site (`s3://akasha-backups/db/`) | AES-256 |
| **Storage (media)** | Cross-region replication | Indefinida | Supabase Storage (us-east-1) | Supabase Storage (us-west-1) | AES-256 |
| **Storage (backups off-site)** | Semanal (domingo 02:00 UTC) | 30d | S3 (`akasha-backups` bucket) | Glacier (90d archive) | AES-256 + KMS |
| **Code (GitHub)** | A cada commit | Indefinida | GitHub `main` branch | GitHub releases (tags) | N/A (público se MIT) |
| **Configs / Secrets** | A cada mudança | 30d | Vault (1Password / Vercel env) | GitHub Actions secrets + cofre local | AES-256 |
| **User uploads** (posts/articles/media) | Cross-region replication | 30d drafts / indefinida público | Supabase Storage | S3 (`akasha-uploads`) | AES-256 |
| **AI embeddings** (pgvector) | Diária junto com DB dump | 30d | Supabase pgvector | S3 embeddings export | AES-256 |
| **Logs** (Sentry/PostHog) | Retenção default do provider | 90d | Sentry + PostHog | N/A (logs não críticos p/ DR) | AES-256 |

### 4.2 Backup tiers

- **Tier 1 (Critical):** DB + Storage + Secrets — backup **diário** + **verificação semanal** + **drill trimestral**.
- **Tier 2 (Important):** AI embeddings + User uploads — backup **diário** + **verificação mensal**.
- **Tier 3 (Standard):** Logs + Analytics — backup via provider (retention default), verificação anual.

---

## 5. Database (PostgreSQL via Supabase)

### 5.1 Camadas de proteção

#### Camada 1 — Supabase Pro PITR (Point-in-Time Recovery)

- **O quê:** backup contínuo de WAL (Write-Ahead Log) a cada ~5min.
- **Retenção:** 7 dias (default Pro). Expansível para 30 dias ($$$).
- **Restore:** dashboard Supabase → Database → Backups → "Restore to point in time".
- **Granularidade:** timestamp exato (UTC).
- **Custo:** incluído no plano Pro (~$25/mês).

#### Camada 2 — Daily pg_dump off-site

- **O quê:** snapshot lógico completo via `pg_dump --format=custom`.
- **Schedule:** `0 3 * * *` (3h UTC todo dia) — ver `scripts/backup/daily-db-backup.sh`.
- **Retenção:** 30 dias local + 90 dias em S3 Glacier.
- **Local:** `/tmp/akasha-backups/db/daily/akasha-db-YYYYMMDD.dump` → upload S3.
- **Verificação:** checksum SHA-256 + restore-test em staging semanal.

#### Camada 3 — S3 cross-region replication

- **Bucket:** `s3://akasha-backups/db/` (region `sa-east-1` São Paulo, replicado para `us-east-1`).
- **Versioning:** habilitado (proteção contra delete acidental).
- **Lifecycle policy:** 30d S3 Standard → 90d S3 Glacier → delete após 120d.
- **Custo estimado:** ~$5/mês (10GB compressed dumps × $0.023/GB).

### 5.2 Procedimento de backup diário

```bash
# scripts/backup/daily-db-backup.sh
# Executado via cron no servidor de backup (NÃO no DB primário)

1. PGPASSWORD=$DB_PASSWORD pg_dump \
     -h $DB_HOST \
     -U postgres \
     -d postgres \
     --format=custom \
     --no-owner \
     --no-acl \
     --compress=9 \
     --file=/tmp/akasha-backups/db/daily/akasha-db-$(date +%Y%m%d).dump

2. sha256sum akasha-db-YYYYMMDD.dump > akasha-db-YYYYMMDD.dump.sha256

3. aws s3 cp /tmp/akasha-backups/db/daily/ s3://akasha-backups/db/daily/ \
     --recursive \
     --storage-class STANDARD_IA \
     --metadata "encrypted=true,kms-key-id=$KMS_KEY"

4. Limpar arquivos locais > 7 dias (manter cópia S3)

5. Enviar métrica para PostHog:
   - backup_db_size_bytes
   - backup_db_duration_seconds
   - backup_db_status (success/failed)
```

### 5.3 Procedimento de restore (resumo)

Ver `docs/RESTORE-PROCEDURES.md` § 1 para detalhes completos.

```bash
# Cenário: DB corrompido, precisa restaurar último backup
bash scripts/backup/disaster-recovery-drill.sh \
  --source=s3 \
  --bucket=akasha-backups/db/daily/akasha-db-20260630.dump \
  --target-db=postgres \
  --target-host=$DB_HOST \
  --verify
```

### 5.4 PITR (Point-in-Time Recovery) direto no Supabase

```bash
# Cenário: precisa restaurar para timestamp específico (ex: 2026-06-30 14:23 UTC)
# Via Dashboard Supabase:
# 1. Project → Database → Backups
# 2. "Restore to point in time"
# 3. Selecionar timestamp UTC
# 4. Confirmar (cria novo project, copia dados)
# 5. Atualizar DATABASE_URL no Vercel para novo project
# 6. Smoke test em preview deployment
# 7. Swap produção (DNS update ou alias swap)
```

**Limitação:** PITR no Supabase cria um **novo projeto**. Não é inplace restore. Requer swap de DATABASE_URL no Vercel.

---

## 6. Storage (Supabase Storage)

### 6.1 Estratégia

- **Replicação nativa:** Supabase Pro replica cross-region (configurado no dashboard).
- **Regiões:** primária `us-east-1`, secundária `us-west-1` (configurável).
- **Backups off-site semanais:** `scripts/backup/daily-db-backup.sh` estendido ou separado.

### 6.2 Buckets críticos

| Bucket | Conteúdo | Retenção | Replicação |
|--------|----------|----------|------------|
| `avatars` | Fotos de perfil | Indefinida | Cross-region |
| `posts-media` | Imagens/vídeos em posts | Indefinida (público) / 30d (drafts) | Cross-region |
| `articles` | Capas de artigos | Indefinida | Cross-region |
| `temp` | Uploads temporários | 7d | Não replicado (efêmero) |

### 6.3 Backup de Storage (off-site semanal)

```bash
# scripts/backup/storage-backup.sh (a criar em W35)
# Semanal: domingo 02:00 UTC
# Usa supabase CLI para listar + sync S3
supabase storage download --bucket avatars --recursive /tmp/storage/avatars
aws s3 sync /tmp/storage/ s3://akasha-backups/storage/ --storage-class GLACIER
```

---

## 7. Code (GitHub)

### 7.1 Proteção

- **Branch `main`:** protected, requer 1 approving review + status checks verdes (CI).
- **Tag releases:** `v0.X.Y` (semver), assinado por maintainer.
- **Mirror:** GitHub é fonte primária; mirror local em `/workspace/cabaladoscaminhos` (dev sandbox).
- **WORM storage:** não usar (código é open-source via GitHub público).

### 7.2 Procedimento de recuperação de código

Cenário: GitHub indisponível ou repo deletado.

```bash
# Opção A: restaurar de mirror local
git remote add local /path/to/mirror.git
git fetch local main
git checkout main

# Opção B: restaurar de release archive
curl -L https://github.com/Akasha-0/cabaladoscaminhos/archive/refs/tags/v0.34.0.tar.gz -o release.tar.gz
tar -xzf release.tar.gz

# Opção C: clonar fresh após restaurar repo no GitHub
git clone https://github.com/Akasha-0/cabaladoscaminhos.git
```

### 7.3 Tags importantes

- `v0.33.0` — W33 i18n (HEAD atual)
- `v0.32.0` — Beta launch
- `v0.27.0` — Deploy runbook
- `v0.11.0` — Deploy inicial

---

## 8. Configs / Secrets (.env.example)

### 8.1 Vault hierarchy

| Camada | Onde | Quem acessa | MFA? |
|--------|------|-------------|------|
| **1Password** (team vault) | 1Password.com | Lead + DevOps + CTO | Sim |
| **Vercel Environment Variables** | vercel.com/dashboard | Lead + DevOps | Sim (SSO) |
| **GitHub Actions Secrets** | github.com/settings/secrets | CI only (automated) | N/A |
| **Cofre offline** | local physical | CTO + 1 backup holder | Sim (chave física) |

### 8.2 Rotação

- **Trimestral:** todos os API keys (OpenAI, Stripe, Supabase service_role).
- **Imediata em caso de leak:** ver `docs/SECRETS-CHECKLIST-W27.md` § Incident Response.
- **Logging:** toda rotação registrada em `docs/secrets-audit.log` (append-only).

### 8.3 Backup de configs

```bash
# scripts/backup/configs-backup.sh (executar antes de mudanças grandes)
# 1. Listar env vars (via vercel CLI):
vercel env ls production > /tmp/configs/vercel-prod-$(date +%Y%m%d).env

# 2. Listar GitHub secrets (via API):
gh secret list --env production > /tmp/configs/gh-secrets-$(date +%Y%m%d).txt

# 3. Encrypt + upload:
gpg --symmetric --cipher-algo AES256 /tmp/configs/vercel-prod-*.env
aws s3 cp /tmp/configs/ s3://akasha-backups/configs/ --recursive
```

---

## 9. User uploads (posts/articles/media)

### 9.1 Backup strategy

- **Primário:** Supabase Storage com replicação cross-region (nativo).
- **Secundário:** S3 weekly sync (Glacier, 90d retention).
- **Deduplicação:** por SHA-256 do conteúdo (não duplicar mesmo arquivo).

### 9.2 Restore de uploads

```bash
# Cenário: bucket posts-media corrompido
# 1. Identificar arquivos faltantes via:
supabase storage ls posts-media --recursive > /tmp/prod-listing.txt
aws s3 ls s3://akasha-backups/storage/posts-media/ --recursive > /tmp/backup-listing.txt
diff /tmp/prod-listing.txt /tmp/backup-listing.txt

# 2. Re-sync arquivos faltantes:
aws s3 sync s3://akasha-backups/storage/posts-media/ \
  supabase://posts-media --delete

# 3. Verificar via smoke test (download + checksum).
```

---

## 10. AI artifacts (embeddings, prompt cache)

### 10.1 Embeddings (pgvector)

- **Localização:** tabela `article_embeddings` (vector(1536)).
- **Backup:** incluído no pg_dump diário (tabela regular).
- **Restore:** automático junto com DB.
- **Custo de regeneração:** ~$10 em OpenAI API (50k articles × 1536 dims).

### 10.2 Prompt cache (OpenAI)

- **Não persiste:** cache é efêmero (TTL ~5-10min).
- **Mitigação:** rate limiter + retry logic. Sem necessidade de backup.

### 10.3 MiniMax (Akasha persona)

- **System prompt versionado em GitHub** (`src/lib/ai/prompts/`).
- **Persona config:** `data/persona-config.json` (checked-in).
- **Backup:** via Git + S3 sync semanal.

---

## 11. Observabilidade e logs

### 11.1 Retenção

| Plataforma | Retenção | Custo extra |
|------------|----------|-------------|
| Sentry | 90d (default) | $26/mês para 180d |
| PostHog | 90d (default) | $0 (plano free até 1M events) |
| Vercel logs | 1h real-time + 30d archive | incluído |
| Supabase logs | 7d (default) | Pro: 30d |

### 11.2 Logs críticos para DR

- **Sentry:** erros 5xx (sinal de regressão pós-restore).
- **PostHog:** eventos `backup_db_status` (success/failed).
- **Vercel:** logs de cron jobs (publish-scheduled, etc.) — sinal de que a plataforma está viva.
- **Custom:** `/api/health` retorna 200 com version + uptime.

---

## 12. RTO/RPO targets

### 12.1 Tabela consolidada

| Cenário | Sev | RTO | RPO | Procedimento |
|---------|-----|-----|-----|--------------|
| **DB corruption (não-catastrófica)** | P1 | 4h | 24h | Restore do pg_dump + replay WAL |
| **DB corruption (catastrófica)** | P0 | 4h | 6h | PITR via Supabase dashboard |
| **Region outage (us-east-1)** | P1 | 1h | < 1h | Vercel failover automático + Supabase cross-region |
| **Storage bucket deletion** | P1 | 8h | 24h | S3 weekly restore |
| **Secret leak** | P0 | 1h | — | Rotação imediata + invalidação de tokens |
| **Account compromise (admin)** | P0 | 2h | — | Reset + revoke sessions + audit |
| **Ransomware em infra** | P0 | 12h | 24h | Restore full cluster de S3 Glacier |
| **Backup falhou (detectado)** | P3 | 24h | — | Re-run backup + investigar |

### 12.2 Critical tier (RTO 4h, RPO 6h)

Define como **critical**:

- Database inteiro (Postgres).
- Auth subsystem (Supabase Auth).
- Storage de uploads públicos.

**Critical tier RTO 4h** significa: tempo entre "decidimos restaurar" e "tudo está de volta online" deve ser < 4h em 95% dos casos (medido em drills).

**Critical tier RPO 6h** significa: aceitamos perder até 6h de dados novos (worst-case = restore do último backup de 6h atrás). Isto requer **WAL archiving ativo** com frequência ≥ 6h.

### 12.3 Non-critical tier (RTO 1h, RPO 24h)

- Analytics (PostHog).
- Feature flags.
- Logs antigos.

Aceitável restaurar de backup diário (24h atrás).

---

## 13. Cenários de falha e procedimentos

### 13.1 Database corrompido

**Sintomas:** queries falham, dados inconsistentes, CHECK constraint violations em massa.

**Detecção:** Sentry alert + reports de usuários.

**Resposta:**

1. **P0/P1**: acionar on-call. Abrir canal `#inc-<timestamp>`.
2. **Avaliar escopo:** query específica? Tabela? DB inteiro?
3. **Se escopo amplo:** iniciar restore PITR (ver § 5.4).
4. **Comunicação:** status banner "Investigando instabilidade no banco de dados".
5. **Restore:** `bash scripts/backup/disaster-recovery-drill.sh --source=s3 --target-db=postgres --verify`.
6. **Smoke test:** 16 specs E2E + curl health endpoint.
7. **Swap DNS / DB connection string** se PITR criou novo project.
8. **Post-mortem** em 48h.

### 13.2 Region outage

**Sintomas:** 5xx em massa, Vercel status page reporta degradation.

**Detecção:** Sentry + Vercel monitoring.

**Resposta:**

1. **Avaliar:** Vercel/Supabase tem failover automático? (Sim para Edge, manual para Supabase).
2. **Vercel:** Edge functions tem multi-region automático.
3. **Supabase:** Se region primária down, promover secondary via dashboard.
4. **DATABASE_URL swap** no Vercel → apontar para nova região.
5. **Smoke test** + status banner.
6. **Post-mortem** (foi degradação ou total outage?).

### 13.3 Storage bucket corrupto/deletado

**Sintomas:** imagens quebradas, uploads falham, Sentry 500 em endpoints de media.

**Detecção:** Sentry + reports.

**Resposta:**

1. **Verificar:** qual bucket? Quantos arquivos afetados?
2. **Restore de S3 backup semanal** (ver § 6.3).
3. **Re-sync incremental:** diff listing → `aws s3 sync`.
4. **Verificar** via checksum.

### 13.4 Secret leak

**Sintomas:** secret em log público, GitHub secret scanning alerta, ou report externo.

**Detecção:** GitHub secret scanning + manual report.

**Resposta:**

1. **Imediato:** rotacionar secret no provider (OpenAI/Stripe/etc).
2. **Invalidar tokens emitidos** com secret leakado.
3. **Audit logs:** verificar uso suspeito (Stripe dashboard, OpenAI usage).
4. **Comunicação:** se afetou usuários, notificar + rotação de senhas forçada.
5. **Post-mortem** + atualizar `docs/SECRETS-CHECKLIST-W27.md`.

### 13.5 Account compromise (admin)

**Sintomas:** login suspeito em horário atípico, ações não autorizadas em audit log.

**Resposta:**

1. **Lock account:** reset password + revoke all sessions.
2. **Audit:** revisar log de ações (PostHog events).
3. **Rotacionar chaves** se suspeita de persistência.
4. **Forçar MFA enrollment** se ainda não estava.
5. **Post-mortem** + atualizar ACL.

### 13.6 Ransomware em infra (worst-case)

**Cenário:** atacante conseguiu acesso SSH/RCE e criptografou dados em produção.

**Resposta:**

1. **Imediato:** isolar instâncias (Vercel + Supabase via dashboard).
2. **NÃO pagar resgate.**
3. **Restore full cluster** de S3 Glacier backup (último snapshot pré-ataque).
4. **Rotacionar TODOS os secrets** (acesso presumido comprometido).
5. **Forensic:** contratar empresa de IR, preservar logs.
6. **Comunicação:** disclosure LGPD Art. 48 (ANPD) em até 2 dias úteis se afetar dados pessoais.
7. **Post-mortem** público (transparência obrigatória).

---

## 14. Backup cron scripts

Localização: `scripts/backup/`.

### 14.1 `daily-db-backup.sh`

```bash
# Executar diariamente às 03:00 UTC via cron
# Requer: AWS CLI, psql client, gzip
# Ver § 5.2 para detalhes.
```

### 14.2 `verify-backup-integrity.sh`

```bash
# Executar semanalmente (domingo 04:00 UTC) via cron
# Verifica SHA-256 + restore-test em staging
# Ver § 15 para detalhes.
```

### 14.3 `cleanup-old-backups.sh`

```bash
# Executar diariamente às 05:00 UTC via cron
# Rotação: 30d local + 90d S3 Glacier
# Ver § 16 para detalhes.
```

### 14.4 `disaster-recovery-drill.sh`

```bash
# Executar manualmente em drills trimestrais
# Full restore do último backup S3 para staging DB
# Ver § 17 para detalhes.
```

### 14.5 Cron schedule

```cron
# /etc/cron.d/akasha-backups

# Daily DB backup
0 3 * * * root /workspace/cabaladoscaminhos/scripts/backup/daily-db-backup.sh >> /var/log/akasha/backup.log 2>&1

# Weekly integrity verification
0 4 * * 0 root /workspace/cabaladoscaminhos/scripts/backup/verify-backup-integrity.sh >> /var/log/akasha/backup.log 2>&1

# Daily cleanup
0 5 * * * root /workspace/cabaladoscaminhos/scripts/backup/cleanup-old-backups.sh >> /var/log/akasha/backup.log 2>&1
```

---

## 15. Verificação de integridade

### 15.1 Por que verificar?

- **Backup que nunca foi testado é fake.** Silent corruption (disco com bad blocks, partial write) só é detectado no restore.
- **LGPD Art. 46:** medidas técnicas adequadas para proteger dados. Backup não-verificável não é "adequado".

### 15.2 O que verificar?

- **Checksum SHA-256** confere entre local e S3.
- **Restore-test em staging**: baixar dump, restaurar em DB temporário, smoke test.
- **Schema validation**: tabelas esperadas presentes, contagens dentro de ±20% da baseline.
- **Sample data integrity**: 10 rows aleatórias por tabela crítica, validar tipos.

### 15.3 Procedimento

Ver `scripts/backup/verify-backup-integrity.sh` para implementação completa.

```bash
# Pipeline:
1. Listar últimos 7 backups em S3
2. Para cada backup:
   a. Download para /tmp/verify/
   b. sha256sum -c <checksum>
   c. pg_restore em DB de staging temporário
   d. psql -c "SELECT count(*) FROM <tabela>" para 5 tabelas críticas
   e. Validar result dentro de ±20% da baseline
   f. Drop staging DB
3. Report:
   - PASS: todos backups OK
   - FAIL: lista quais falharam e por quê
   - Enviar métrica backup_verify_status
```

### 15.4 Frequency

- **Weekly:** automatic (cron).
- **Monthly:** manual review pelo DevOps.
- **Quarterly:** drill completo (inclui restore test em staging).

---

## 16. Rotação de backups (30 dias)

### 16.1 Policy

- **Local:** 7 dias (mantido em `/tmp/akasha-backups/`).
- **S3 Standard-IA:** 30 dias.
- **S3 Glacier:** 90 dias (archive de longo prazo).
- **Delete automático:** após 120 dias.

### 16.2 Lifecycle rule (S3)

```json
{
  "Rules": [
    {
      "Id": "akasha-db-backup-lifecycle",
      "Status": "Enabled",
      "Prefix": "db/",
      "Transitions": [
        { "Days": 30, "StorageClass": "GLACIER" }
      ],
      "Expiration": { "Days": 120 }
    },
    {
      "Id": "akasha-storage-backup-lifecycle",
      "Status": "Enabled",
      "Prefix": "storage/",
      "Transitions": [
        { "Days": 30, "StorageClass": "GLACIER" }
      ],
      "Expiration": { "Days": 120 }
    }
  ]
}
```

### 16.3 Procedimento de limpeza

Ver `scripts/backup/cleanup-old-backups.sh`:

```bash
# Local cleanup (mantém últimos 7 dias)
find /tmp/akasha-backups/db/daily/ -name "*.dump" -mtime +7 -delete
find /tmp/akasha-backups/db/daily/ -name "*.sha256" -mtime +7 -delete

# S3 lifecycle é gerenciado pela policy acima (automático)
```

---

## 17. DR drills — execução

### 17.1 Frequência

- **Trimestral** (1ª drill pós-beta: Q3 2026).
- **Sempre que:** infraestrutura crítica mudar (Supabase plan upgrade, Vercel migration).

### 17.2 Tipos de drill

| Tipo | Escopo | Duração | Impacto produção |
|------|--------|---------|------------------|
| **Tabletop** | Walkthrough teórico, sem ação | 2h | Zero |
| **Restore test** | Restore em staging de último backup | 4h | Zero |
| **Failover test** | Promover Supabase secondary | 8h | Latência +5-10% |
| **Full DR** | Restore full cluster de S3 Glacier | 24h | Downtime parcial |

### 17.3 Schedule anual

| Quarter | Drill type | Owner |
|---------|-----------|-------|
| Q3 2026 (pós-beta) | Tabletop | DevOps |
| Q4 2026 | Restore test | DevOps + Coder |
| Q1 2027 | Failover test | DevOps + Supabase support |
| Q2 2027 | Full DR | Todos + CTO |

### 17.4 Passos para simular falha (Restore test)

```bash
# 1. Avisar time (24h antes): Slack #ops-alerts + email
# 2. Manter produção intocada (drill em staging)

# 3. Provisionar staging DB fresh
supabase projects create akasha-dr-staging --region us-east-1

# 4. Rodar drill
bash scripts/backup/disaster-recovery-drill.sh \
  --source=s3 \
  --bucket=akasha-backups/db/daily/ \
  --target-db=postgres \
  --target-host=$STAGING_DB_HOST \
  --verify

# 5. Smoke test em staging
BASE_URL=https://akasha-dr-staging.vercel.app npm run test:e2e:smoke

# 6. Validar métricas
- Tempo total de restore (target: < 30min)
- Checksum OK
- Tabelas com count correto
- E2E 100% pass

# 7. Cleanup
supabase projects delete akasha-dr-staging

# 8. Documentar em docs/dr-drills/YYYY-QX-drill.md
```

### 17.5 Verification checklist

Ver `docs/DR-DRILL-REPORT-TEMPLATE.md`.

---

## 18. Compliance LGPD nos backups

### 18.1 Princípios

- **LGPD Art. 46:** medidas técnicas adequadas para proteger dados pessoais.
- **LGPD Art. 48:** comunicar incidente de segurança em até 2 dias úteis (se afetar dados pessoais).
- **LGPD Art. 18:** titular pode pedir exclusão. Backup precisa permitir selective purge.

### 18.2 Implementação

- **Criptografia at-rest:** AES-256 (S3 + Supabase nativo).
- **Criptografia in-transit:** TLS 1.3 (S3 endpoint, Supabase connection).
- **Acesso restrito:** IAM policy S3 apenas para role `akasha-backup-writer`. Leitura requer MFA + audit log.
- **Audit log:** todo acesso a backup logado em `logs/backup-access.log`.
- **Selective purge:** quando titular pedir exclusão (Art. 18), executar `pg_dump` filtrado ou restaurar+delete+re-dump.

### 18.3 Retenção LGPD

- **Dados pessoais em backup:** até 30 dias após deleção do usuário (para cobrir janela de restore).
- **Após 30 dias:** novo backup não conterá mais os dados.
- **Backups antigos (Glacier):** deletados após 120 dias via lifecycle policy.

### 18.4 Cross-border

- **S3 region primária:** `sa-east-1` (São Paulo) — dados não saem do BR.
- **S3 replicação:** `us-east-1` (Virginia) — adequado para DR, dentro de jurisdição aceitável.
- **LGPD adequacy:** US não tem decisão de adequacy, mas contrato DPA + SCCs cobrem.

---

## 19. Criptografia at-rest e in-transit

### 19.1 At-rest

| Componente | Encryption | Key management |
|------------|------------|----------------|
| Supabase DB | AES-256 (nativo Pro) | Supabase-managed |
| Supabase Storage | AES-256 (nativo Pro) | Supabase-managed |
| S3 backups | AES-256 + SSE-KMS | AWS KMS (`akasha-backup-key`) |
| Local /tmp backups | Não criptografado (efêmero) | N/A (apagado em 7d) |
| Vault (1Password) | AES-256 | 1Password-managed |

### 19.2 In-transit

- **DB connection:** TLS 1.3 obrigatório (Supabase força).
- **S3 upload:** HTTPS obrigatório (aws s3 cp default).
- **Vercel ↔ Supabase:** TLS 1.3 (provider-managed).

### 19.3 Key rotation

- **AWS KMS:** annual rotation (default).
- **Supabase:** provider-managed (não customizável).
- **1Password:** quarterly rotation de master password.

---

## 20. Monitoring e alertas

### 20.1 Métricas enviadas para PostHog

| Metric | Type | Tags | Threshold |
|--------|------|------|-----------|
| `backup_db_duration_seconds` | histogram | `env=prod` | alert if p95 > 600s |
| `backup_db_size_bytes` | gauge | `env=prod` | alert if > 5GB |
| `backup_db_status` | counter | `status=success\|failed` | alert if failed > 0 |
| `backup_verify_status` | counter | `status=pass\|fail` | alert if fail > 0 |
| `backup_storage_used_bytes` | gauge | `bucket=akasha-backups` | alert if > 50GB |

### 20.2 Alertas (Sentry + PagerDuty)

| Condição | Sev | Canal |
|----------|-----|-------|
| Backup failed | P3 | Slack `#ops-alerts` |
| Backup failed 2x seguidas | P1 | PagerDuty + Slack |
| Backup integrity check failed | P1 | PagerDuty + Slack |
| Backup storage > 80% quota | P2 | Slack |
| DR region health degraded | P2 | Slack |
| WAL archiving stopped | P1 | PagerDuty + Slack |

### 20.3 Status page

- **URL:** https://status.cabaladoscaminhos.com.br (a configurar em W35+).
- **Provider:** Statuspage (alternativa: BetterStack).
- **Updates:** manual ou via API quando incidente.

---

## 21. Comunicação com usuários (downtime banner)

### 21.1 Quando acionar

- **Restore PITR programado** (mesmo que < 30min).
- **Storage re-sync** que cause lentidão.
- **Qualquer incidente P0/P1** mesmo sem downtime efetivo (transparência).

### 21.2 Templates

#### Banner proativo (antes)

```
🔧 Manutenção programada em 5min.
Estamos restaurando backups para garantir integridade dos dados.
Tempo estimado: 30min. Acompanhe: https://status.cabaladoscaminhos.com.br
```

#### Banner durante (P1)

```
🚧 Investigando instabilidade. Algumas funcionalidades podem estar lentas.
Nossa equipe já está trabalhando. Atualização em 15min.
```

#### Banner resolvido

```
✅ Tudo voltou ao normal.
Resumo: <one-liner>. Post-mortem em 48h: https://github.com/.../postmortems/
```

### 21.3 Canais

- **In-app banner:** `<MaintenanceBanner />` (componente a criar — flag `NEXT_PUBLIC_MAINTENANCE_BANNER`).
- **Status page:** update via API.
- **Twitter/X:** @akashaportal (opcional, apenas P0).
- **Email:** apenas se afetou > 10% de usuários ou dados perdidos.

---

## 22. Escalation path

1. **On-call engineer** (PagerDuty — 24/7).
2. **DevOps lead** (se P0/P1 ou backup falhou 2x).
3. **CTO** (se P0 > 30min ou incidente de segurança).
4. **DPO** (se LGPD Art. 48 — breach notification obrigatória).
5. **Comunicação externa** (imprensa, ANPD) — apenas via CTO + DPO.

---

## 23. Post-mortem template

Ver `docs/postmortems/TEMPLATE.md` (a criar em W35). Estrutura:

```markdown
# Post-mortem: <título do incidente>

**Data:** YYYY-MM-DD
**Severidade:** P0/P1/P2
**Duração total:** Xh Ymin
**Detectado por:** <sentry|user report|monitoring>
**Resolvido por:** <engineer>

## Resumo executivo

<1-2 parágrafos: o que aconteceu, impacto, como resolvemos>

## Timeline (UTC)

- HH:MM — evento 1
- HH:MM — evento 2

## Root cause

<Análise 5-whys>

## Impact

- Usuários afetados: X
- Dados perdidos: Y
- Receita impactada: Z

## What went well

- ...

## What went wrong

- ...

## Action items

| Item | Owner | Deadline |
|------|-------|----------|
| Adicionar monitoring de X | @dev1 | 2026-XX-XX |
```

---

## 24. Validação trimestral (checklist)

Para cada quarter, validar:

- [ ] Backup diário executou ≥ 90% do tempo (target: 99%+).
- [ ] Verify integrity executou semanalmente.
- [ ] Drill executou (tabletop ou restore test).
- [ ] Custos de S3 dentro do orçamento.
- [ ] Lifecycle policy ainda ativa (não foi sobrescrita por acidente).
- [ ] KMS key rotacionada no prazo.
- [ ] Audit log de acessos a backup limpo (sem acessos suspeitos).
- [ ] Runbooks atualizados com lições aprendidas.
- [ ] Time treinado em procedimento (≥ 1 engineer novo onboarded).

---

## 25. Contatos e referências

### 25.1 Contatos internos

| Função | Contato |
|--------|---------|
| Tech lead | tech-lead@akashaportal.com.br |
| DevOps | devops@akashaportal.com.br |
| CTO | cto@akashaportal.com.br |
| DPO (LGPD) | dpo@akashaportal.com.br |

### 25.2 Contatos externos (suporte)

| Provider | Plano | Contato |
|----------|-------|---------|
| Supabase | Pro | support@supabase.com |
| Vercel | Pro | vercel.com/support |
| AWS | Pay-as-you-go | AWS Support (Basic free) |
| Sentry | Team | support@sentry.io |
| Stripe | Standard | support.stripe.com |
| OpenAI | Pay-as-you-go | help.openai.com |
| 1Password | Business | support@1password.com |

### 25.3 Documentos relacionados

| Doc | Wave | Conteúdo |
|-----|------|----------|
| `docs/ops/OPS-RUNBOOK.md` | W32-6 | Operação cotidiana |
| `docs/DEPLOY-RUNBOOK-W27.md` | W27 | Deploy procedure |
| `docs/SECRETS-CHECKLIST-W27.md` | W27 | Onboarding secrets |
| `docs/RESTORE-PROCEDURES.md` | W34 | Restore passo-a-passo |
| `docs/DR-DRILL-REPOST-TEMPLATE.md` | W34 | Template de relatório de drill |
| `docs/LGPD-EXPORT-W34.md` | W34 | Export dados pessoais (Art. 18) |

---

## 26. Apêndice A — Comandos úteis

### 26.1 Backup rápido (manual)

```bash
# Backup de DB para arquivo local
pg_dump $DATABASE_URL --format=custom --compress=9 \
  --file=akasha-db-$(date +%Y%m%d-%H%M).dump

# Upload para S3
aws s3 cp akasha-db-*.dump s3://akasha-backups/db/manual/
```

### 26.2 Restore rápido (manual)

```bash
# Para DB local
pg_restore --dbname=$DATABASE_LOCAL --clean --if-exists akasha-db-20260630.dump

# Para staging
pg_restore --dbname=$DATABASE_STAGING --clean --if-exists \
  --host=$STAGING_HOST --username=postgres akasha-db-20260630.dump
```

### 26.3 Verificar tamanho dos backups

```bash
# S3
aws s3 ls s3://akasha-backups/db/daily/ --recursive --human-readable --summarize

# Local
du -sh /tmp/akasha-backups/db/daily/
```

### 26.4 Listar últimos backups

```bash
# S3 (últimos 10)
aws s3 ls s3://akasha-backups/db/daily/ | tail -10

# Local
ls -lht /tmp/akasha-backups/db/daily/*.dump | head -10
```

---

## 27. Apêndice B — Custos estimados

| Componente | Custo mensal | Custo anual |
|------------|--------------|-------------|
| Supabase Pro (PITR 7d) | $25 | $300 |
| S3 Standard-IA (50GB backups) | $1.15 | $14 |
| S3 Glacier (90d archive, 150GB) | $0.45 | $5 |
| KMS key | $1 | $12 |
| Data transfer (S3 → restore) | ~$2 | $24 |
| 1Password Business (5 seats) | $24 | $288 |
| Status page (BetterStack) | $0 (free tier) | $0 |
| **TOTAL** | **~$54/mês** | **~$643/ano** |

Aceitável para tier beta. Escalar com volume:

- **10k MAU:** ~$80/mês (mais storage + transfer).
- **100k MAU:** ~$200/mês (multi-region ativa, S3 maior).

---

## 28. Apêndice C — Histórico de revisões

| Versão | Data | Wave | Autor | Mudança |
|--------|------|------|-------|---------|
| 1.0 | 2026-07-01 | W34 | Coder + Aki | Criação inicial |

---

**Fim do documento.** Para dúvidas ou sugestões, abrir issue em `github.com/Akasha-0/cabaladoscaminhos/issues` com label `ops/disaster-recovery`.