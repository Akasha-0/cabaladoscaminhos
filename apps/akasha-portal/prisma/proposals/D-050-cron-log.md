# D-050 — CronLog model (Wave 23.1 Literature Ingestion Cron)

**Status:** `awaiting_human_apply`
**Date:** 2026-06-25
**Branch:** `wave-23.1-paper-cron`
**Worktree:** `/home/skynet/cabala-dos-caminhos-worktrees/wave-23.1`
**Author:** Hermes subagent (Wave 23.1)

---

## 1. Contexto

Wave 23.1 adiciona o cron semanal de ingestão de papers científicos
(PubMed/arXiv) no Akasha Portal. Para auditoria de cada execução
(papers inseridos, duplicatas puladas, erros não-fatais) precisamos
de uma tabela `cron_logs` que armazene o histórico de execuções.

Inspirado em `PrivacyConsent` (Wave 19.3) e `AuditLog` (Wave 14.1):
tabela append-only, sem FK para User, sem updatedAt. Cada execução
do cron gera 1 row.

## 2. Schema diff

```diff
+ enum CronLogStatus {
+   RUNNING
+   SUCCESS
+   PARTIAL_SUCCESS
+   FAILED
+ }

+ model CronLog {
+   id         String        @id @default(cuid())
+   jobName    String
+   startedAt  DateTime      @default(now())
+   finishedAt DateTime?
+   status     CronLogStatus @default(RUNNING)
+   inserted   Int           @default(0)
+   skipped    Int           @default(0)
+   errors     Json          @default("{\"items\":[]}")
+
+   @@index([jobName, startedAt])
+   @@index([status, startedAt])
+   @@map("cron_logs")
+ }
```

**Importante:** o schema também referencia o model `LiteraturePaper`
(Wave 21.1, branch `wave-21.1-literature-rag` ainda não merged em
main). Esse model NÃO é introduzido por este PROPOSAL — vive na
migration Wave 21.1. O cron usa `prisma.literaturePaper` apenas em
runtime, e a ausência da tabela em produção hoje significa que o
primeiro deploy deve garantir que Wave 21.1 já foi aplicada.

## 3. Migration SQL (gerada por `prisma migrate dev`)

```sql
-- CreateEnum
CREATE TYPE "CronLogStatus" AS ENUM ('RUNNING', 'SUCCESS', 'PARTIAL_SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "cron_logs" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" "CronLogStatus" NOT NULL DEFAULT 'RUNNING',
    "inserted" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB NOT NULL DEFAULT '{"items":[]}',

    CONSTRAINT "cron_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cron_logs_jobName_startedAt_idx" ON "cron_logs"("jobName", "startedAt");

-- CreateIndex
CREATE INDEX "cron_logs_status_startedAt_idx" ON "cron_logs"("status", "startedAt");
```

## 4. Justificativa

- **`CronLog` é genérico (`jobName` String)**: permite que crones
  futuros (cleanup, retry de webhooks, etc) reusem a mesma tabela
  sem criar uma nova por job.
- **`errors` é JSON**: shape `{ items: [{ pmid, stage, message }] }`
  é flexível (cada job pode evoluir o shape sem migration).
- **SEM FK para User**: segue o padrão de `AuditLog`/`PrivacyConsent`
  — a trilha precisa sobreviver ao delete do user (LGPD Art. 37).
- **SEM updatedAt**: tabela é append-only. "Status final" é derivado
  de `finishedAt IS NULL` (RUNNING) vs `IS NOT NULL` (terminal).

## 5. Riscos & Rollback

- **Risco baixo**: tabela nova, sem FKs quebrando dados existentes.
- **Rollback**: `DROP TABLE cron_logs; DROP TYPE "CronLogStatus";`.
- **Sem impacto** em queries existentes (aditiva pura).

## 6. Aplicação (humano)

Após merge deste PROPOSAL:

```bash
pnpm exec prisma migrate dev --name cron_log
```

A migration gerada deve ser commitada em
`apps/akasha-portal/prisma/migrations/<timestamp>_cron_log/`.

## 7. Pós-apply checklist

- [ ] `pnpm db:generate` regenera o client
- [ ] `pnpm --filter akasha-portal typecheck` passa (0 errors)
- [ ] `pnpm test:run` passa (cron route tests usam a tabela)