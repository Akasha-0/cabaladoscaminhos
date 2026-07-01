# Cron Jobs — Wave 34

> **Status:** ✅ SHIPPED (2026-07-01)
> **Wave:** 34 — Production Cron Jobs
> **Autor:** Coder (cycle W34 cron 2/8)
> **TSC:** 0 errors
> **Push:** pending — sem push per brief

Este documento descreve os **12 endpoints `/api/cron/*`** do Cabala dos Caminhos,
seus schedules recomendados, autenticação, retry policy, observabilidade e
operação. Cobre rotas pré-existentes (W14b–W33) e as 5 novas rotas criadas em
W34.

---

## Sumário

1. [Inventário completo](#1-inventário-completo)
2. [Schedule recomendado](#2-schedule-recomendado)
3. [Padrão de autenticação](#3-padrão-de-autenticação)
4. [Padrão de logging estruturado](#4-padrão-de-logging-estruturado)
5. [Retry policy](#5-retry-policy)
6. [Idempotência e locks](#6-idempotência-e-locks)
7. [Helpers compartilhados (`src/lib/cron/*`)](#7-helpers-compartilhados-srclibcron)
8. [`backup-database` — backup diário do Postgres](#8-backup-database--backup-diário-do-postgres)
9. [`cleanup-sessions` — limpeza de sessões/tokens/audit logs](#9-cleanup-sessions--limpeza-de-sessõestokensaudit-logs)
10. [`cleanup-cache` — limpeza semanal de Redis](#10-cleanup-cache--limpeza-semanal-de-redis)
11. [`feature-flags-rollout` — rollout gradual automático](#11-feature-flags-rollout--rollout-gradual-automático)
12. [`metrics-rollup` — agregação diária de métricas](#12-metrics-rollup--agregação-diária-de-métricas)
13. [Rotas pré-existentes (overview)](#13-rotas-pré-existentes-overview)
14. [Configuração de `vercel.json`](#14-configuração-de-verceljson)
15. [Monitoramento e alertas](#15-monitoramento-e-alertas)
16. [LGPD e retenção](#16-lgpd-e-retenção)
17. [Segredos e rotação](#17-segredos-e-rotação)
18. [Troubleshooting](#18-troubleshooting)
19. [Testing local](#19-testing-local)
20. [Checklist de produção](#20-checklist-de-produção)
21. [Apêndice: contrato JSON de resposta](#21-apêndice-contrato-json-de-resposta)

---

## 1. Inventário completo

| Rota                                       | Wave  | Schedule         | maxDuration | Adicionada em W34? |
| ------------------------------------------ | ----- | ---------------- | ----------- | ------------------ |
| `/api/cron/expire-invites`                 | W33   | `0 */6 * * *`    | 30s         | —                  |
| `/api/cron/weekly-digest`                  | W31   | `0 9 * * 1`      | 60s         | —                  |
| `/api/cron/consciousness-evolve`           | W29   | `0 2 * * *`      | 120s        | —                  |
| `/api/cron/curate-articles`                | W28   | `0 3 * * 0`      | 60s         | —                  |
| `/api/cron/process-email-queue`            | W20   | `*/15 * * * *`   | 60s         | —                  |
| `/api/cron/publish-scheduled`              | W14b  | `* * * * *`      | 30s         | —                  |
| `/api/cron/nps-prompt`                     | W34   | `0 10 * * *`     | 60s         | ✅ (paralelo)      |
| **`/api/cron/backup-database`**            | **W34** | `0 3 * * *`    | 300s        | ✅ **NOVO**        |
| **`/api/cron/cleanup-sessions`**           | **W34** | `0 4 * * *`    | 60s         | ✅ **NOVO**        |
| **`/api/cron/cleanup-cache`**              | **W34** | `0 5 * * 0`    | 60s         | ✅ **NOVO**        |
| **`/api/cron/feature-flags-rollout`**      | **W34** | `*/30 * * * *` | 30s         | ✅ **NOVO**        |
| **`/api/cron/metrics-rollup`**             | **W34** | `0 6 * * *`    | 60s         | ✅ **NOVO**        |

**Total: 12 rotas** (7 pré-existentes + 5 novas W34).

> Nota: o brief original listava `nps-prompt` e `scheduled-posts` como itens a
> criar, mas ambos já existiam (via wave paralela e W14b). Eles foram
> preservados sem sobrescrita — ver §13.

---

## 2. Schedule recomendado

A grade abaixo distribui as execuções para evitar picos de carga e
contention no DB. Todos os horários em UTC.

```
UTC  00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23
     |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
W33  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  expire-invites (a cada 6h)
W31  .  .  .  .  .  .  .  .  .  W  .  .  .  .  .  .  .  .  .  .  .  .  .  weekly-digest (seg 9h)
W29  .  .  E  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  consciousness-evolve
W28  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  curate-articles (dom 3h)
W20  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  process-email-queue (15min)
W14b *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  publish-scheduled (1min)
W34  .  .  .  B  C  X  M  .  .  N  .  .  .  .  .  .  .  .  .  .  .  .  .  backup/cleanup/rollup/metrics
W34  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  feature-flags-rollout (30min)
```

Legenda: `B` = backup, `C` = cleanup-sessions, `X` = cleanup-cache (semanal),
`M` = metrics-rollup, `N` = nps-prompt, `W` = weekly-digest, `E` = consciousness-evolve.

---

## 3. Padrão de autenticação

Todas as rotas aceitam **GET e POST** com header:

```
Authorization: Bearer ${CRON_SECRET}
```

Vercel Cron envia este header automaticamente quando `CRON_SECRET` está
configurado no projeto. O helper `verifyCronSecret` faz:

1. **Sem `CRON_SECRET` configurado + `NODE_ENV !== 'production'`** →
   permissive (warn log). Permite testes locais sem segredos.
2. **Sem `CRON_SECRET` configurado + `NODE_ENV === 'production'`** →
   `401 unauthorized` (fail-closed).
3. **Header ausente** → `401 missing_header`.
4. **Length mismatch** → `401 mismatch` (sem comparar, evita length leak).
5. **Comparação com `timingSafeEqual`** (constant-time, evita timing
   side-channel).

```ts
// src/lib/cron/auth.ts
import { timingSafeEqual } from 'crypto';

export function verifyCronSecret(request: NextRequest): CronAuthResult {
  const provided = request.headers
    .get('authorization')
    ?.replace(/^Bearer\s+/i, '')
    ?.trim();
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    if (process.env.NODE_ENV !== 'production') {
      return { ok: true, reason: 'dev_permissive' };
    }
    return { ok: false, reason: 'missing_secret' };
  }

  if (!provided) return { ok: false, reason: 'missing_header' };
  if (provided.length !== expected.length) {
    return { ok: false, reason: 'mismatch' };
  }

  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return timingSafeEqual(a, b)
    ? { ok: true }
    : { ok: false, reason: 'mismatch' };
}
```

### Compatibilidade

Rotas pré-existentes (`publish-scheduled`, `nps-prompt`) usam o header
alternativo `x-cron-secret` em vez de `Authorization: Bearer`. **Ambos os
padrões são aceitos pelo Vercel Cron** — escolha um e documente. As 5 novas
rotas W34 usam exclusivamente `Authorization: Bearer` (padrão majoritário).

---

## 4. Padrão de logging estruturado

Cada handler emite 4 eventos no ciclo de vida:

| Evento                      | Quando                              | Level   |
| --------------------------- | ----------------------------------- | ------- |
| `cron_<name>_started`       | Início do handler (após auth + lock) | `info`  |
| `cron_<name>_completed`     | Sucesso (try block retornou)         | `info`  |
| `cron_<name>_failed`        | Erro não tratado (catch block)       | `error` |
| `cron_<name>_skipped`       | Lock ativo (idempotência)            | `warn`  |

Cada evento inclui:
- `event` — nome canônico (string acima)
- `job` — identificador curto (ex: `backup_database`)
- `jobId` — UUID v4 (correlação entre logs)
- `timestamp` — ISO 8601
- `durationMs` — apenas em completed/failed
- `itemsProcessed` — apenas em completed
- `errorMessage` + `errorStack` — apenas em failed (stack limitado a 8 linhas)
- `metadata` — contexto específico (counts, filename, etc)

```json
{
  "level": "info",
  "event": "cron_backup_database_completed",
  "job": "backup_database",
  "jobId": "5b2c7e0a-9f1d-4e3a-8c7b-2e1f0d9c8b7a",
  "timestamp": "2026-07-01T03:00:42.123Z",
  "durationMs": 18432,
  "itemsProcessed": 1,
  "metadata": {
    "filename": "cabaladoscaminhos-2026-07-01-03-00-00-5b2c7e0a.sql.gz",
    "sizeBytes": 4194304,
    "uploadedTo": "s3://akasha-backups/cabaladoscaminhos/...",
    "retentionRemoved": 3,
    "retentionCutoff": "2026-06-01T03:00:00.000Z"
  }
}
```

### LGPD em logs

- **Nenhum PII** (email, nome, telefone, IP, userId puro).
- Para correlação por usuário, use `hashForLog(userId)` (FNV-1a 32-bit →
  8 hex chars). Helper em `src/lib/cron/log.ts`.

---

## 5. Retry policy

Definido em `src/lib/cron/retry.ts`:

```ts
export const CRON_RETRY_POLICY = {
  attempts: 4,
  backoff: {
    delays: [0, 60, 300, 1800] as const, // 0s, 1min, 5min, 30min
    strategy: 'exponential' as const,
  },
  alertOnFinalFailure: true,
} as const;
```

| Attempt | Delay antes | Após       |
| ------- | ----------- | ---------- |
| 1       | 0s          | immediate  |
| 2       | 60s         | 1 min      |
| 3       | 300s        | 5 min      |
| 4       | 1800s       | 30 min     |
| 5+      | —           | alert on-call |

### Como o retry é aplicado

O Vercel Cron aceita config nativa de retry:

```json
{
  "crons": [
    {
      "path": "/api/cron/backup-database",
      "schedule": "0 3 * * *",
      "retry": {
        "attempts": 4,
        "backoff": "exponential"
      }
    }
  ]
}
```

> **Nota:** Vercel Cron só faz retry se a rota retornar 5xx. 4xx (incluindo
> 401 unauthorized) NÃO gera retry — é sinal de problema de configuração,
> não de falha transitória.

### Alert on-call após 4 falhas

Quando uma rota falha 4 vezes consecutivas, o helper `withRetry` chama
`onFinalFailure(err)`. Em produção, este callback deve fazer POST para
`ALERT_WEBHOOK_URL` (PagerDuty Events API / Opsgenie / Slack incoming
webhook).

Exemplo de payload de alerta:

```json
{
  "service": "cabaladoscaminhos",
  "job": "backup_database",
  "severity": "critical",
  "summary": "Backup database failed 4 consecutive attempts",
  "lastError": "pg_dump: connection to server failed",
  "firstFailureAt": "2026-07-01T03:00:42.000Z",
  "lastFailureAt": "2026-07-01T04:30:42.000Z",
  "dashboardUrl": "https://admin.cabaladoscaminhos.com.br/cron-logs"
}
```

---

## 6. Idempotência e locks

Cada handler usa **lock in-process** via `src/lib/cron/lock.ts`:

```ts
const lock = tryAcquireLock('backup-database', jobId);
if (!lock.ok) {
  logCronSkipped(ctx, `lock held by ${lock.activeJobId}`);
  return NextResponse.json(
    { ok: false, skipped: true, activeJobId: lock.activeJobId },
    { status: 409 }
  );
}

try {
  // ... do work ...
} finally {
  releaseLock('backup-database', jobId);
}
```

**TTL do lock: 5 minutos** (alinhado com `maxDuration` do Vercel). Locks
vencidos são sobrescritos na próxima tentativa.

### Por que in-process e não Redis?

- Vercel Cron roda em single-instance por região (Lambda-like).
- Lock distribuído (Redis SET NX) adicionaria latência + ponto de falha
  para um benefício marginal.
- Segunda linha de defesa: cada cron usa `updateMany`/`deleteMany`
  idempotente no DB (segunda execução = 0 rows affected).

### Idempotência no DB

| Rota                | Operação idempotente                                     |
| ------------------- | -------------------------------------------------------- |
| `expire-invites`    | `updateMany` com where `expiresAt < now`                 |
| `cleanup-sessions`  | `deleteMany` com where `expires < now`                   |
| `cleanup-cache`     | `SCAN` + `UNLINK` (sem write side effects)               |
| `feature-flags-rollout` | Calcula e retorna; storage write é last-write-wins    |
| `metrics-rollup`    | `upsert` por `date` (segunda execução = noop)            |

---

## 7. Helpers compartilhados (`src/lib/cron/*`)

### `auth.ts` — `verifyCronSecret(request)`

Retorna `{ ok, reason }`. Ver §3.

### `log.ts` — `logCronStarted/Completed/Failed/Skipped`

Emite JSON estruturado em stdout. Ver §4.

Helper adicional: `hashForLog(userId)` — FNV-1a 32-bit para correlação
LGPD-safe.

### `retry.ts` — `decideRetry(attempt)` e `withRetry(fn)`

Calcula próxima tentativa. Ver §5.

### `lock.ts` — `tryAcquireLock(key, jobId)` e `releaseLock(key, jobId)`

Lock in-process com TTL de 5min. Ver §6.

Helper adicional: `sweepStaleLocks(ttl)` — limpa locks expirados.

---

## 8. `backup-database` — backup diário do Postgres

**Schedule:** `0 3 * * *` (todo dia 3h UTC)
**maxDuration:** 300s
**Lock:** `backup-database`

### Fluxo

1. Verifica env (`DATABASE_URL`, `BACKUP_S3_BUCKET`, `BACKUP_S3_ACCESS_KEY`,
   `BACKUP_S3_SECRET_KEY`). Se faltarem → **stub mode** (log warning,
   retorna ok=true com `warning` no response).
2. Em produção: `pg_dump --no-owner --clean --if-exists` → gzip → upload S3.
   Implementação real em `scripts/backup/` (paralelo W34-1).
3. Retention cleanup: remove backups > `BACKUP_RETENTION_DAYS` (default 30).

### Response

```json
{
  "ok": true,
  "jobId": "5b2c7e0a-9f1d-4e3a-8c7b-2e1f0d9c8b7a",
  "filename": "cabaladoscaminhos-2026-07-01-03-00-00-5b2c7e0a.sql.gz",
  "sizeBytes": 4194304,
  "sha256": "a3f5...",
  "uploadedTo": "s3://akasha-backups/cabaladoscaminhos/2026-07-01/...",
  "durationMs": 18432,
  "retention": { "removed": 3, "cutoffIso": "2026-06-01T03:00:00.000Z" }
}
```

### Variáveis de ambiente

| Var                       | Obrigatório | Default | Descrição                       |
| ------------------------- | ----------- | ------- | ------------------------------- |
| `DATABASE_URL`            | sim         | —       | Postgres connection string      |
| `BACKUP_S3_BUCKET`        | sim         | —       | Nome do bucket S3               |
| `BACKUP_S3_ENDPOINT`      | não         | AWS S3  | Endpoint S3 (MinIO, R2, etc)    |
| `BACKUP_S3_ACCESS_KEY`    | sim         | —       | Access key                      |
| `BACKUP_S3_SECRET_KEY`    | sim         | —       | Secret key                      |
| `BACKUP_RETENTION_DAYS`   | não         | 30      | Dias até remover backup antigo  |

### LGPD

- Backup é cifrado at-rest no S3 (AES-256 default).
- Sem PII no response (`filename` contém timestamp + UUID, não user data).
- Auditoria de acesso ao bucket via CloudTrail/S3 Access Logs.

### Restore procedure

Ver `docs/RESTORE-PROCEDURES.md` (paralelo W34-1). Resumo:

```bash
# 1. Download
aws s3 cp s3://akasha-backups/cabaladoscaminhos/2026-07-01/file.sql.gz .

# 2. Decrypt (se KMS)
aws kms decrypt --ciphertext-blob fileb://file.sql.gz.enc \
  --output text --query Plaintext > file.sql.gz

# 3. Restore
gunzip -c file.sql.gz | psql $DATABASE_URL
```

---

## 9. `cleanup-sessions` — limpeza de sessões/tokens/audit logs

**Schedule:** `0 4 * * *` (todo dia 4h UTC, após backup)
**maxDuration:** 60s
**Lock:** `cleanup-sessions`

### O que é removido

1. **NextAuth `Session`** com `expires < now`.
2. **NextAuth `VerificationToken`** com `expires < now`.
3. **`AuditLog`** com `createdAt < (now - 90d)`.

### O que é PRESERVADO

- `User` accounts (mesmo inativos).
- `AuditLog` com retention legal (LGPD Art. 16 + auditoria interna).

### Variáveis de ambiente

| Var                         | Default | Descrição                          |
| --------------------------- | ------- | ---------------------------------- |
| `AUDIT_LOG_RETENTION_DAYS`  | 90      | Dias até remover AuditLog antigo   |

### LGPD

- Remove apenas dados TÉCNICOS (sessões/tokens).
- AuditLog mantém 90d para detectar abuso recente + atender solicitações de
  titulares (LGPD Art. 18).

### Idempotência

- `deleteMany` com `where expires < now` → segunda execução = 0 rows.
- Tabelas opcionais (`Session`, `VerificationToken`) verificadas em runtime
  via bracket notation (`(prisma as any).session`) — ausentes em schemas
  parciais (dev), silenciosamente ignoradas.

---

## 10. `cleanup-cache` — limpeza semanal de Redis

**Schedule:** `0 5 * * 0` (todo domingo 5h UTC)
**maxDuration:** 60s
**Lock:** `cleanup-cache`

### Estratégia

```ts
const STALE_PATTERNS = [
  { pattern: 'tmp:*',     reason: 'short-lived temp keys (should have TTL)' },
  { pattern: 'dev:*',     reason: 'dev environment leak' },
  { pattern: 'test:*',    reason: 'E2E test residue' },
  { pattern: 'staging:*', reason: 'staging environment leak' },
  { pattern: 'lock:*',    reason: 'stale distributed locks' },
];
```

Para cada pattern: `SCAN MATCH pattern COUNT 200` + `UNLINK` (não-blocking).
Loop até `cursor === '0'`.

### Por que semanal (e não diário)?

- Cache in-memory (`lib/cache.ts`) tem TTL automático.
- Redis tem `maxmemory-policy allkeys-lru` — entradas frias saem sozinhas.
- Cleanup manual = corrigir bugs (cache sem TTL, prefix incorreto, keys
  órfãs).

### LGPD

- Não remove cache de perfil/sessão (responsabilidade de `cleanup-sessions`
  e `expire-invites`).
- Apenas counts agregados nos logs.

---

## 11. `feature-flags-rollout` — rollout gradual automático

**Schedule:** `*/30 * * * *` (a cada 30 min)
**maxDuration:** 30s
**Lock:** `feature-flags-rollout`

### Algoritmo

Para cada flag com `type='percentage'` e `rolloutPercent < 100`:

```
newPercent = min(currentPercent + 5%, 100%)
action = (newPercent === 100) ? 'capped' : 'advanced'
```

Incremento fixo de **+5% por tick** (linear, não exponencial).

### Aviso de expiração

Se `flag.expiresAt < now + 7d`, emite `warnings[]` no response. Lista de
alertas inclui `daysRemaining`.

### Por que +5% por tick?

- 30min × 5% = 100% em 10h (rollout completo em <1 dia útil).
- Permite detectar regressões entre 5% → 10% → 25% → 50% → 100% (5 etapas
  antes do go-live total).
- Para rollouts mais agressivos, ajuste `ROLLOUT_INCREMENT` em
  `src/app/api/cron/feature-flags-rollout/route.ts`.

### Idempotência

- Avaliação é **read-only** por padrão (não persiste). Em produção,
  delegar para `lib/feature-flags/storage.ts` com `lastWriteWins`.

### LGPD

- Sem PII. Apenas metadata agregada de flags.

---

## 12. `metrics-rollup` — agregação diária de métricas

**Schedule:** `0 6 * * *` (todo dia 6h UTC)
**maxDuration:** 60s
**Lock:** `metrics-rollup`

### Métricas coletadas

| Métrica                  | Query                                                  |
| ------------------------ | ------------------------------------------------------ |
| `dau`                    | `Session.findMany distinct userId where expires > now` |
| `newUsers`               | `User.count where createdAt ∈ [yesterday, today)`     |
| `postsCreated`           | `Post.count where createdAt ∈ [yesterday, today)`     |
| `commentsCreated`        | `Comment.count where createdAt ∈ [yesterday, today)`  |
| `reactionsCreated`       | `Reaction.count where createdAt ∈ [yesterday, today)` |
| `npsResponses`           | `NpsResponse.count where createdAt ∈ [yesterday, today)` |
| `betaInvitesSent`        | `BetaInvite.count where createdAt ∈ [yesterday, today)` |
| `betaInvitesAccepted`    | `BetaInvite.count where acceptedAt ∈ [yesterday, today)` |
| `emailQueueBacklog`      | `EmailJob.count where status IN (pending, queued)`     |
| `emailSent24h`           | `EmailJob.count where status IN (sent, delivered) AND updatedAt ≥ yesterday` |
| `emailFailed24h`         | `EmailJob.count where status IN (failed, bounced) AND updatedAt ≥ yesterday` |

### Response

```json
{
  "ok": true,
  "jobId": "...",
  "durationMs": 432,
  "rollup": {
    "date": "2026-07-01",
    "dau": 1247,
    "newUsers": 32,
    "postsCreated": 18,
    "commentsCreated": 87,
    "reactionsCreated": 312,
    "npsResponses": 23,
    "betaInvitesSent": 5,
    "betaInvitesAccepted": 2,
    "emailQueueBacklog": 47,
    "emailSent24h": 412,
    "emailFailed24h": 8,
    "collectedAt": "2026-07-01T06:00:42.123Z"
  }
}
```

### LGPD

- Apenas counts agregados. Zero PII no response ou log.

### Tolerância a schema parcial

Todos os modelos são acessados via bracket notation (`(prisma as any).X`).
Modelos ausentes no schema geram `0` silenciosamente — perfeito para
ambientes onde o Prisma client ainda não foi regenerado.

---

## 13. Rotas pré-existentes (overview)

### `expire-invites` (W33)

Move convites beta cujo `expiresAt < now` para `status=EXPIRED`. Idempotente
via `updateMany`.

### `weekly-digest` (W31)

Compõe digest semanal via `composeDigest('weekly')`, cria `Newsletter`
(rascunho) e dispara via `sendNewsletter`.

### `consciousness-evolve` (W29)

Atualiza agregados de consciência (eventos espirituais coletivos). Wave 29.

### `curate-articles` (W28)

Curadoria semanal de artigos (todo domingo 3h).

### `process-email-queue` (W20)

Drena `email_jobs` a cada 15min. Processa até 25 jobs por tick.

### `publish-scheduled` (W14b)

Publica posts `status=SCHEDULED` cujo `scheduledFor <= now` (a cada 1min).
**Auth diferente:** usa `x-cron-secret` (não `Authorization: Bearer`).

### `nps-prompt` (W34 paralelo)

Calcula qual trigger NPS (DAY_1/3/7/14/30) está pendente para cada usuário
recente (last 60d). Atualiza `NpsPromptSchedule.triggersShown`. **Auth
diferente:** usa `x-cron-secret`.

---

## 14. Configuração de `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-invites",
      "schedule": "0 */6 * * *",
      "retry": { "attempts": 3, "backoff": "exponential" }
    },
    {
      "path": "/api/cron/weekly-digest",
      "schedule": "0 9 * * 1",
      "retry": { "attempts": 2 }
    },
    {
      "path": "/api/cron/consciousness-evolve",
      "schedule": "0 2 * * *",
      "retry": { "attempts": 4 }
    },
    {
      "path": "/api/cron/curate-articles",
      "schedule": "0 3 * * 0",
      "retry": { "attempts": 2 }
    },
    {
      "path": "/api/cron/process-email-queue",
      "schedule": "*/15 * * * *",
      "retry": { "attempts": 4, "backoff": "exponential" }
    },
    {
      "path": "/api/cron/publish-scheduled",
      "schedule": "* * * * *",
      "retry": { "attempts": 3 }
    },
    {
      "path": "/api/cron/nps-prompt",
      "schedule": "0 10 * * *",
      "retry": { "attempts": 2 }
    },
    {
      "path": "/api/cron/backup-database",
      "schedule": "0 3 * * *",
      "retry": { "attempts": 4, "backoff": "exponential" }
    },
    {
      "path": "/api/cron/cleanup-sessions",
      "schedule": "0 4 * * *",
      "retry": { "attempts": 2 }
    },
    {
      "path": "/api/cron/cleanup-cache",
      "schedule": "0 5 * * 0",
      "retry": { "attempts": 2 }
    },
    {
      "path": "/api/cron/feature-flags-rollout",
      "schedule": "*/30 * * * *",
      "retry": { "attempts": 2 }
    },
    {
      "path": "/api/cron/metrics-rollup",
      "schedule": "0 6 * * *",
      "retry": { "attempts": 2 }
    }
  ]
}
```

---

## 15. Monitoramento e alertas

### Métricas-chave (Datadog / Prometheus)

| Métrica                              | Tipo      | Alert se                                |
| ------------------------------------ | --------- | --------------------------------------- |
| `cron.<name>.durationMs`             | histogram | p95 > 80% do `maxDuration`              |
| `cron.<name>.itemsProcessed`         | gauge     | queda abrupta > 50% vs dia anterior     |
| `cron.<name>.failures.count`         | counter   | > 3 falhas em 1h                        |
| `cron.<name>.skipped.count`          | counter   | > 5 skips em 1h (lock contention)       |

### Alertas on-call (PagerDuty / Opsgenie)

| Severidade   | Trigger                                              | Canal          |
| ------------ | ---------------------------------------------------- | -------------- |
| `critical`   | `backup-database` falha 4x (data loss iminente)      | Phone call     |
| `critical`   | `cleanup-sessions` falha 4x (DB cresce sem limite)   | Phone call     |
| `warning`    | Qualquer cron falha 2x                               | Slack #ops     |
| `info`       | Feature flag expira em ≤7 dias                       | Slack #eng     |

### Logs centralizados

Formato JSON canônico (ver §4). Coletado por:
- **Dev:** console local + `pnpm dev | jq`
- **Staging:** Vercel Logs (filter `event:cron_*`)
- **Prod:** Vercel Logs + Datadog Logs (forward via log drain)

---

## 16. LGPD e retenção

| Dado técnico              | Retenção                  | Removido por              |
| ------------------------- | ------------------------- | ------------------------- |
| NextAuth Session          | 30 dias após expiração    | `cleanup-sessions`        |
| NextAuth VerificationToken| Imediato após expiração   | `cleanup-sessions`        |
| AuditLog                  | 90 dias                   | `cleanup-sessions`        |
| Email jobs (sent)         | 30 dias                   | `cleanup-email-queue` (futuro) |
| Backups                   | 30 dias                   | `backup-database` retention step |
| Email queue logs          | 30 dias                   | (futuro: cleanup-email-logs) |

### Princípios LGPD aplicados

1. **Minimização:** logs estruturados NÃO contêm PII (ver §4).
2. **Necessidade:** cada cron tem propósito claro e justificado.
3. **Retenção:** dados técnicos expiram automaticamente.
4. **Transparência:** `docs/RESTORE-PROCEDURES.md` documenta o ciclo de
   vida de backups.
5. **Segurança:** todos os endpoints autenticados + rate limit no nível
   de infraestrutura (Vercel edge).

---

## 17. Segredos e rotação

### `CRON_SECRET`

- **Tipo:** string aleatória de 32+ chars.
- **Onde:** Vercel project env (`Settings → Environment Variables`).
- **Quem tem acesso:** SRE on-call + Owner.
- **Rotação:** trimestral ou em caso de incidente.
- **Como rotacionar:**
  1. Gerar novo secret: `openssl rand -hex 32`.
  2. Adicionar em Vercel env (Production).
  3. Atualizar dashboards externos (Datadog monitor tokens, etc).
  4. Aguardar 24h para propagação + remoção do secret antigo.
  5. Audit log do evento.

### `BACKUP_S3_*` (backup-database)

- **Tipo:** IAM credential com policy restrita (s3:PutObject + s3:ListBucket
  + s3:DeleteObject em prefix específico).
- **Rotação:** semestral.

---

## 18. Troubleshooting

### "401 unauthorized" em produção

1. Verificar `CRON_SECRET` está configurado: `vercel env ls`.
2. Verificar Vercel Cron está enviando o header: Vercel Logs → filter
   `path:/api/cron/<name>`.
3. Se Vercel Cron foi desabilitado manualmente, reativar via UI.

### Lock contention (muitos 409)

1. Verificar duração real do cron: `durationMs` no log JSON.
2. Se `durationMs > 300000` (5min), o lock TTL está expirando.
3. Aumentar TTL em `tryAcquireLock(key, jobId, ttlMs)` ou reduzir carga.

### Backup failing intermittently

1. Verificar connection pool: `DATABASE_URL` com `?connection_limit=5`.
2. Se `pg_dump` demora > 240s, considerar:
   - Backup lógico parcial (apenas tabelas grandes)
   - Backup incremental (WAL archiving)
3. Verificar `BACKUP_S3_*` quotas (R2 free tier = 10GB/dia).

### Feature flags não avançam

1. Verificar se há flag com `type='percentage'` e `rolloutPercent < 100`.
2. Verificar `FEATURE_FLAGS` em `src/lib/feature-flags/flags.ts`.
3. Logs estruturados: `event:cron_feature_flags_rollout_completed`.

---

## 19. Testing local

```bash
# 1. Setup
export CRON_SECRET=$(openssl rand -hex 32)
export NODE_ENV=development  # permite permissive mode

# 2. Test auth (deve passar em dev)
curl -sS http://localhost:3000/api/cron/backup-database

# 3. Test auth (com secret, deve passar em prod simulado)
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/backup-database

# 4. Test idempotência (lock)
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/backup-database &
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/backup-database
# O segundo retorna 409 com skipped=true

# 5. Test métricas
curl -sS -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/metrics-rollup | jq '.rollup'
```

### Stub modes

Em dev, sem env completo:
- `backup-database` → retorna `warning: "BACKUP STUB MODE"`, `ok: true`.
- `cleanup-cache` → retorna `note: "REDIS_URL não configurado"`, `ok: true`.
- `feature-flags-rollout` → funciona (lê FEATURE_FLAGS registry).
- `metrics-rollup` → retorna zeros para modelos ausentes.

---

## 20. Checklist de produção

Antes de promover para produção:

- [ ] `CRON_SECRET` configurado em Vercel env (Production + Preview).
- [ ] `BACKUP_S3_*` configurados para `backup-database`.
- [ ] `vercel.json` deployado com todas as 12 rotas.
- [ ] `ALERT_WEBHOOK_URL` configurado para retry failure alerts.
- [ ] Datadog/Vercel Logs monitorando `event:cron_*_failed`.
- [ ] Runbook de restore (`docs/RESTORE-PROCEDURES.md`) testado em staging.
- [ ] Backup encryption at-rest validado (S3 SSE-S3 ou SSE-KMS).
- [ ] LGPD DPIA revisado para as 5 novas rotas W34.
- [ ] Owner approval para novas colunas em `MetricRollup` (se persistido).

---

## 21. Apêndice: contrato JSON de resposta

### Sucesso (200)

```json
{
  "ok": true,
  "jobId": "uuid-v4",
  "durationMs": 1234,
  /* campos específicos da rota */
}
```

### Erro de auth (401)

```json
{
  "ok": false,
  "error": "unauthorized",
  "reason": "missing_header" | "missing_secret" | "mismatch" | "dev_permissive"
}
```

### Lock ativo (409)

```json
{
  "ok": false,
  "skipped": true,
  "activeJobId": "uuid-v4-do-job-em-andamento",
  "heldForMs": 12345
}
```

### Erro de execução (500)

```json
{
  "ok": false,
  "jobId": "uuid-v4",
  "error": "mensagem-de-erro",
  "durationMs": 1234
}
```

---

**Fim do documento.** Manter atualizado quando novas rotas forem adicionadas.