# Backup Scripts — Integration Guide (Wave 34 — coord with W34-2)

> **Data:** 2026-07-01
> **Autor:** W34-1 (DISASTER RECOVERY)
> **Para:** W34-2 (CRON JOBS) e futuros waves que integram `/api/cron/backup-database` com `scripts/backup/`

---

## 1. Visão geral

`scripts/backup/` contém 4 scripts bash independentes que implementam:
- Backup diário (pg_dump → SHA-256 → S3 upload)
- Verificação de integridade (download + checksum + restore test)
- Rotação de backups (cleanup local + lifecycle S3)
- DR drill completo (restore em staging + smoke test)

A rota `/api/cron/backup-database` (Wave 34-2) é o **trigger + audit log** que dispara e registra o trabalho. Os scripts rodam em **infraestrutura separada** (ver § 2).

---

## 2. Arquitetura de execução

### 2.1 Por que bash (e não TypeScript puro)?

| Razão | Benefício |
|-------|-----------|
| **Portabilidade** | Roda em QUALQUER host com bash + AWS CLI + psql |
| **Independência de runtime** | Não depende de Node.js, Vercel, ou edge runtime |
| **Operabilidade direta** | Pode ser invocado manualmente em incidentes (`ssh backup-host && bash scripts/backup/...`) |
| **Auditoria transparente** | Logs estruturados em `/var/log/akasha/backup.log` sem abstração |

### 2.2 Onde os scripts rodam?

**Importante:** Vercel serverless **NÃO** consegue executar scripts bash ou `pg_dump`. A rota `/api/cron/backup-database` apenas:
- Verifica auth (`CRON_SECRET`)
- Acquires lock
- **Chama webhook externo** (em prod) OU retorna `BACKUP STUB MODE` (em dev/preview)
- Loga o resultado

O trabalho real roda em **backup host** separado:

```
┌─────────────────────────────────┐
│ Vercel cron (1× dia, 03:00 UTC) │
│ POST /api/cron/backup-database  │
└────────────┬────────────────────┘
             │ webhook POST
             ▼
┌─────────────────────────────────┐
│ Backup host (VPS / EC2 / GH-Action self-hosted) │
│ Recebe POST, executa:                       │
│   bash scripts/backup/daily-db-backup.sh    │
└────────────┬────────────────────┘
             │ pg_dump + sha256 + aws s3 cp
             ▼
┌─────────────────────────────────┐
│ S3 bucket (akasha-backups)      │
│ s3://.../db/daily/akasha-db-*.dump
└─────────────────────────────────┘
```

### 2.3 Alternativa: pg_dump dentro do Node.js (não recomendado)

Teoricamente, o route handler poderia chamar `pg_dump` via `child_process.execFile`. **Mas:**
- Vercel serverless **bloqueia** `child_process` (no Edge runtime) ou tem timeouts agressivos (Node.js runtime: max 5min, max 250MB mem).
- `pg_dump` precisa de shell + libpq, não disponíveis no Vercel.
- Supabase **não expõe** porta 5432 externamente por default.

**Conclusão:** delegar para host externo é a única opção viável.

---

## 3. Env vars — convenções

### 3.1 Naming compat (dual-support)

Os scripts aceitam **ambas** as convenções de naming (priority: route-style > legacy):

| Propósito | W34-2 route-style (priority) | Legacy (fallback) |
|-----------|------------------------------|-------------------|
| S3 bucket | `BACKUP_S3_BUCKET` | `S3_BACKUP_BUCKET` |
| S3 endpoint (custom S3-compatible) | `BACKUP_S3_ENDPOINT` | _(none)_ |
| AWS access key | `BACKUP_S3_ACCESS_KEY` | `AWS_ACCESS_KEY_ID` |
| AWS secret key | `BACKUP_S3_SECRET_KEY` | `AWS_SECRET_ACCESS_KEY` |
| KMS key (S3 encryption) | `BACKUP_S3_KMS_KEY_ID` | `KMS_KEY_ID` |
| Retention (dias) | `BACKUP_RETENTION_DAYS` | `LOCAL_RETENTION_DAYS` |

### 3.2 Como o host externo recebe env vars?

**Opção A:** systemd environment file (recomendado para VPS/EC2):

```bash
# /etc/akasha/backup.env
BACKUP_S3_BUCKET=akasha-backups
BACKUP_S3_ENDPOINT=
BACKUP_S3_ACCESS_KEY=AKIA...
BACKUP_S3_SECRET_KEY=...
BACKUP_S3_KMS_KEY_ID=alias/akasha-backup
BACKUP_RETENTION_DAYS=30
DATABASE_URL=postgres://...
POSTHOG_API_KEY=phc_...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
PAGERDUTY_ROUTING_KEY=...
```

Carregado por systemd unit:

```ini
# /etc/systemd/system/akasha-backup.service
[Service]
EnvironmentFile=/etc/akasha/backup.env
ExecStart=/workspace/cabaladoscaminhos/scripts/backup/daily-db-backup.sh
```

**Opção B:** GitHub Actions self-hosted runner com `env:` block no workflow.

**Opção C:** Docker container com env vars injetadas pelo orquestrador.

### 3.3 O que o route handler NÃO precisa

O route handler em Vercel **NÃO precisa** das `BACKUP_S3_*` env vars — apenas do `CRON_SECRET` (auth) + `DATABASE_URL` (para AuditLog). O webhook externo já carrega suas próprias credenciais.

Se o route handler tiver `BACKUP_S3_*` configurado mas estiver em stub mode (sem webhook configurado), ele apenas loga warning e não faz upload. Isso é o modo "deploy sem credenciais para teste".

---

## 4. Como W34-2 deve chamar os scripts

### 4.1 Webhook receiver (no backup host)

Criar endpoint HTTP mínimo que executa o script:

```typescript
// backup-host/src/handlers/run-backup.ts
import { exec } from "child_process";
import { promisify } from "util";
import { createHmac } from "crypto";
import type { Request, Response } from "express";

const execAsync = promisify(exec);

const SCRIPT_PATH = "/workspace/cabaladoscaminhos/scripts/backup/daily-db-backup.sh";
const WEBHOOK_SECRET = process.env.BACKUP_WEBHOOK_SECRET!;

export async function runBackup(req: Request, res: Response) {
  // 1. Verify HMAC signature
  const sig = req.headers["x-akasha-signature"];
  const expected = createHmac("sha256", WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (sig !== expected) {
    return res.status(401).json({ error: "invalid signature" });
  }

  // 2. Execute script
  try {
    const { stdout, stderr } = await execAsync(`bash ${SCRIPT_PATH}`, {
      timeout: 300_000, // 5min
      env: { ...process.env },
    });
    return res.json({ ok: true, stdout, stderr });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
```

### 4.2 Route handler (Vercel) chamando webhook

```typescript
// src/app/api/cron/backup-database/route.ts (substituir runBackup stub)

async function runBackup(jobId: string): Promise<BackupResult> {
  const startedAt = Date.now();
  const dateStamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `cabaladoscaminhos-${dateStamp}-${jobId.slice(0, 8)}.dump`;

  const webhookUrl = process.env.BACKUP_WEBHOOK_URL;
  const webhookSecret = process.env.BACKUP_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    // Stub mode (dev/preview) — ver W34-2 implementação atual
    return {
      ok: true,
      jobId,
      filename,
      sizeBytes: 0,
      sha256: 'stub-mode',
      uploadedTo: 'stub://local',
      durationMs: Date.now() - startedAt,
      warning: 'BACKUP_WEBHOOK_URL not configured — stub mode',
    };
  }

  // Real mode — chama backup host
  const body = { jobId, filename, timestamp: new Date().toISOString() };
  const sig = createHmac("sha256", webhookSecret).update(JSON.stringify(body)).digest("hex");

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Akasha-Signature": sig,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(300_000),
  });

  if (!res.ok) {
    return {
      ok: false,
      jobId,
      filename,
      sizeBytes: 0,
      sha256: 'failed',
      uploadedTo: 'unknown',
      durationMs: Date.now() - startedAt,
      warning: `Backup host returned ${res.status}`,
    };
  }

  const result = await res.json();
  return {
    ok: true,
    jobId,
    filename,
    sizeBytes: result.sizeBytes ?? 0,
    sha256: result.sha256 ?? 'unknown',
    uploadedTo: result.uploadedTo ?? 'unknown',
    durationMs: Date.now() - startedAt,
  };
}
```

---

## 5. Cron schedule (atualizado)

```cron
# /etc/cron.d/akasha-backups (no BACKUP HOST, NÃO no Vercel)

# 03:00 UTC daily — backup
0 3 * * * root /workspace/cabaladoscaminhos/scripts/backup/daily-db-backup.sh >> /var/log/akasha/backup.log 2>&1

# 04:00 UTC Sunday — verify
0 4 * * 0 root /workspace/cabaladoscaminhos/scripts/backup/verify-backup-integrity.sh >> /var/log/akasha/backup.log 2>&1

# 05:00 UTC daily — cleanup
0 5 * * * root /workspace/cabaladoscaminhos/scripts/backup/cleanup-old-backups.sh >> /var/log/akasha/backup.log 2>&1
```

O Vercel cron `0 3 * * *` chama `/api/cron/backup-database` que chama o webhook no backup host, que dispara `daily-db-backup.sh`. Latência total: ~30s para registrar + trigger.

---

## 6. Validação ponta-a-ponta

### 6.1 Test em staging

```bash
# 1. Backup manual (verifica que script funciona isolado)
ssh backup-host "DATABASE_URL=postgres://staging DATABASE_URL=... bash /workspace/cabaladoscaminhos/scripts/backup/daily-db-backup.sh"

# 2. Verifica que upload foi para S3
aws s3 ls s3://akasha-backups-staging/db/daily/

# 3. Dispara via webhook (simula cron Vercel)
curl -X POST https://backup-host.example.com/run-backup \
  -H "Content-Type: application/json" \
  -H "X-Akasha-Signature: $(echo -n '{"jobId":"test"}' | openssl dgst -sha256 -hmac "$BACKUP_WEBHOOK_SECRET" -hex | cut -d' ' -f2)" \
  -d '{"jobId":"test","filename":"test.dump","timestamp":"2026-07-01T03:00:00Z"}'

# 4. Dispara via route Vercel (em staging deploy)
curl -X POST https://staging.cabaladoscaminhos.com.br/api/cron/backup-database \
  -H "Authorization: Bearer $CRON_SECRET"

# Esperado: HTTP 200, { ok: true, filename: ..., sizeBytes: ..., sha256: ..., uploadedTo: ... }
```

### 6.2 Validação contínua

- **PostHog:** evento `backup_db_completed` com `status=success|fail` (enviado pelo script)
- **Sentry:** exception `Daily DB backup failed` em caso de erro
- **Sentry/PostHog:** evento `backup_verify_completed` (enviado pelo script verify)
- **Slack #ops-alerts:** notificação em caso de falha
- **Logs:** `/var/log/akasha/backup.log` no backup host

---

## 7. Próximos passos (W35+)

- **W35:** Provisionar backup host (VPS ou EC2) + webhook receiver + systemd unit
- **W35:** Configurar BACKUP_WEBHOOK_URL + BACKUP_WEBHOOK_SECRET no Vercel
- **W35:** Primeiro backup real end-to-end em staging
- **W36:** DR drill Q3 2026 (executar `disaster-recovery-drill.sh` em staging)
- **W37:** Status page + on-call rotation

---

**Mantido por:** DevOps (Aki)
**Coord:** W34-2 cron jobs (415026221830305)
**Refs:** `docs/DISASTER-RECOVERY-W34.md` § 4, § 5, § 14