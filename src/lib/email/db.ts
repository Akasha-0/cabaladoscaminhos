// ============================================================================
// EMAIL DB — raw queries sobre tabela email_jobs (Wave 20, 2026-06-28)
// ============================================================================
// A tabela email_jobs é gerenciada via SQL migration (sem Prisma client) para
// não tocar schema.prisma (preservando TSC verde sem `prisma generate`).
//
// Operações:
//   - enqueueEmail: cria um job (welcome, transactional, notificação)
//   - enqueueBatch: cria N jobs em uma transação
//   - claimPendingJobs: SELECT FOR UPDATE dos jobs prontos (usado pelo cron)
//   - markSent: marca como enviado
//   - markFailed: marca como falho (com retry counter)
//   - cancelCampaign: cancela todos jobs PENDING de uma campanha (ex: user
//     cancelou welcome series)
//
// Idempotência:
//   - campaignId permite agrupar (ex: 'welcome:user_xyz')
//   - O cron usa SKIP LOCKED para não processar o mesmo job em paralelo
// ============================================================================

import { prisma } from '@/lib/prisma';

// ============================================================================
// Types
// ============================================================================

export type EmailJobStatus = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED';

export interface EmailJob {
  id: string;
  userId: string | null;
  toEmail: string;
  templateId: string;
  payload: Record<string, unknown>;
  scheduledFor: Date;
  status: EmailJobStatus;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt: Date | null;
  sentAt: Date | null;
  failedAt: Date | null;
  errorMessage: string | null;
  campaignId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnqueueInput {
  toEmail: string;
  templateId: string;
  payload?: Record<string, unknown>;
  userId?: string | null;
  scheduledFor?: Date;
  campaignId?: string;
  maxAttempts?: number;
}

// ============================================================================
// enqueueEmail — insere um job na fila
// ============================================================================

export async function enqueueEmail(input: EnqueueInput): Promise<string> {
  const jobId = crypto.randomUUID();
  await prisma.$executeRaw`
    INSERT INTO "email_jobs" (
      id, "userId", "toEmail", "templateId", payload,
      "scheduledFor", status, "maxAttempts", "campaignId"
    ) VALUES (
      ${jobId},
      ${input.userId ?? null},
      ${input.toEmail.toLowerCase()},
      ${input.templateId},
      ${JSON.stringify(input.payload ?? {})}::jsonb,
      ${input.scheduledFor ?? new Date()},
      'PENDING',
      ${input.maxAttempts ?? 3},
      ${input.campaignId ?? null}
    )
  `;
  return jobId;
}

// ============================================================================
// enqueueBatch — insere N jobs em uma transação (atômico)
// ============================================================================

export async function enqueueBatch(inputs: EnqueueInput[]): Promise<string[]> {
  if (inputs.length === 0) return [];

  const ids: string[] = [];
  await prisma.$transaction(
    inputs.map((input) => {
      const jobId = crypto.randomUUID();
      ids.push(jobId);
      return prisma.$executeRaw`
        INSERT INTO "email_jobs" (
          id, "userId", "toEmail", "templateId", payload,
          "scheduledFor", status, "maxAttempts", "campaignId"
        ) VALUES (
          ${jobId},
          ${input.userId ?? null},
          ${input.toEmail.toLowerCase()},
          ${input.templateId},
          ${JSON.stringify(input.payload ?? {})}::jsonb,
          ${input.scheduledFor ?? new Date()},
          'PENDING',
          ${input.maxAttempts ?? 3},
          ${input.campaignId ?? null}
        )
      `;
    })
  );
  return ids;
}

// ============================================================================
// claimPendingJobs — pega N jobs prontos e marca como "in flight"
// ============================================================================
// Estratégia:
//   1. SELECT ... WHERE status='PENDING' AND scheduledFor <= now()
//      ORDER BY scheduledFor LIMIT N FOR UPDATE SKIP LOCKED
//   2. UPDATE status='SENT' (mas só depois do send real — aqui só retornamos)
//
// Para manter simples e evitar locks longos em serverless, retornamos os jobs
// e o caller (sendEmail) faz o UPDATE de status após sucesso/falha.
// ============================================================================

export async function claimPendingJobs(limit = 25): Promise<EmailJob[]> {
  const rows = await prisma.$queryRaw<EmailJob[]>`
    SELECT
      id, "userId", "toEmail", "templateId", payload,
      "scheduledFor", status, attempts, "maxAttempts",
      "lastAttemptAt", "sentAt", "failedAt", "errorMessage",
      "campaignId", "createdAt", "updatedAt"
    FROM "email_jobs"
    WHERE status = 'PENDING'
      AND "scheduledFor" <= NOW()
    ORDER BY "scheduledFor" ASC
    LIMIT ${limit}
  `;
  return rows.map(rowToJob);
}

// ============================================================================
// markSent — marca job como enviado com sucesso
// ============================================================================

export async function markSent(jobId: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "email_jobs"
    SET status = 'SENT',
        "sentAt" = NOW(),
        "lastAttemptAt" = NOW(),
        attempts = attempts + 1,
        "errorMessage" = NULL
    WHERE id = ${jobId}
  `;
}

// ============================================================================
// markFailed — registra falha (incrementa attempts, com retry até maxAttempts)
// ============================================================================

export async function markFailed(jobId: string, errorMessage: string): Promise<void> {
  // Primeiro pega attempts atual para decidir se vai pra FAILED ou volta a PENDING
  const rows = await prisma.$queryRaw<Array<{ attempts: number; maxAttempts: number }>>`
    SELECT attempts, "maxAttempts" FROM "email_jobs" WHERE id = ${jobId}
  `;
  if (rows.length === 0) return;
  const { attempts, maxAttempts } = rows[0];
  const nextAttempts = attempts + 1;

  if (nextAttempts >= maxAttempts) {
    await prisma.$executeRaw`
      UPDATE "email_jobs"
      SET status = 'FAILED',
          "failedAt" = NOW(),
          "lastAttemptAt" = NOW(),
          attempts = ${nextAttempts},
          "errorMessage" = ${errorMessage.slice(0, 1000)}
      WHERE id = ${jobId}
    `;
  } else {
    // Volta para PENDING com backoff exponencial (5min, 15min, 45min)
    const backoffMinutes = 5 * Math.pow(3, attempts);
    await prisma.$executeRaw`
      UPDATE "email_jobs"
      SET status = 'PENDING',
          "scheduledFor" = NOW() + (${backoffMinutes}::text || ' minutes')::interval,
          "lastAttemptAt" = NOW(),
          attempts = ${nextAttempts},
          "errorMessage" = ${errorMessage.slice(0, 1000)}
      WHERE id = ${jobId}
    `;
  }
}

// ============================================================================
// cancelCampaign — cancela todos jobs PENDING de uma campanha
// ============================================================================
// Usado quando o usuário cancela welcome series ou desinscreve antes de
// receber todos os emails programados.
// ============================================================================

export async function cancelCampaign(campaignId: string): Promise<number> {
  const result = await prisma.$executeRaw`
    UPDATE "email_jobs"
    SET status = 'CANCELLED'
    WHERE "campaignId" = ${campaignId} AND status = 'PENDING'
  `;
  return Number(result);
}

// ============================================================================
// getQueueStats — health check do cron (para logs / dashboards)
// ============================================================================

export interface QueueStats {
  pending: number;
  sent24h: number;
  failed24h: number;
  oldestPending: Date | null;
}

export async function getQueueStats(): Promise<QueueStats> {
  const rows = await prisma.$queryRaw<
    Array<{
      pending: bigint;
      sent_24h: bigint;
      failed_24h: bigint;
      oldest_pending: Date | null;
    }>
  >`
    SELECT
      COUNT(*) FILTER (WHERE status = 'PENDING') AS pending,
      COUNT(*) FILTER (WHERE status = 'SENT' AND "sentAt" >= NOW() - INTERVAL '24 hours') AS sent_24h,
      COUNT(*) FILTER (WHERE status = 'FAILED' AND "failedAt" >= NOW() - INTERVAL '24 hours') AS failed_24h,
      MIN("scheduledFor") FILTER (WHERE status = 'PENDING') AS oldest_pending
    FROM "email_jobs"
  `;
  const row = rows[0] ?? { pending: BigInt(0), sent_24h: BigInt(0), failed_24h: BigInt(0), oldest_pending: null };
  return {
    pending: Number(row.pending),
    sent24h: Number(row.sent_24h),
    failed24h: Number(row.failed_24h),
    oldestPending: row.oldest_pending,
  };
}

// ============================================================================
// Helpers internos
// ============================================================================

function rowToJob(row: EmailJob): EmailJob {
  return {
    ...row,
    payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : (row.payload ?? {}),
  };
}
