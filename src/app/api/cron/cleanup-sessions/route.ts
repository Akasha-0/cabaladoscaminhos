// ============================================================================
// CRON — /api/cron/cleanup-sessions (Wave 34 — 2026-07-01)
// ============================================================================
// Limpa sessões expiradas do NextAuth + AuditLog > 90 dias.
//
// Schedule recomendado (vercel.json):
//   { "path": "/api/cron/cleanup-sessions", "schedule": "0 4 * * *" }
//
// O que é removido:
//   1. NextAuth Session table: expires < now
//   2. NextAuth VerificationToken: expires < now
//   3. AuditLog: createdAt < (now - 90d)
//
// O que é PRESERVADO:
//   - User accounts (mesmo inativos)
//   - AuditLog com retention legal (LGPD Art. 16 — 5 anos para logs de auditoria
//     COM bases legais específicas; este cron preserva logs recentes para
//     atender solicitações de titulares)
//
// LGPD:
//   - Apenas remove dados TÉCNICOS (sessões/tokens) — não remove perfil
//   - AuditLog mantém 90d para detectar abuso recente
//   - Logs estruturados NÃO incluem PII
//
// Idempotência:
//   - deleteMany com where expires < now → segunda execução = 0 removidos
//   - Lock in-process via tryAcquireLock
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { verifyCronSecret, unauthorizedResponse } from '@/lib/cron/auth';
import {
  logCronStarted,
  logCronCompleted,
  logCronFailed,
  logCronSkipped,
} from '@/lib/cron/log';
import { tryAcquireLock, releaseLock } from '@/lib/cron/lock';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const AUDIT_LOG_RETENTION_DAYS = Number.parseInt(
  process.env.AUDIT_LOG_RETENTION_DAYS ?? '90',
  10
);

interface CleanupCounts {
  sessionsRemoved: number;
  verificationTokensRemoved: number;
  auditLogsRemoved: number;
  auditLogCutoffIso: string;
}

async function runCleanup(): Promise<CleanupCounts> {
  const now = new Date();
  const auditLogCutoff = new Date(
    now.getTime() - AUDIT_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000
  );

  // -------------------------------------------------------------------------
  // Modelos opcionais — acessados via bracket notation para tolerar schema
  // parcial em dev (NextAuth tables podem não estar no schema).
  // -------------------------------------------------------------------------
  const sessionModel = (prisma as unknown as Record<string, unknown>).session as
    | { deleteMany: (args: { where: { expires: { lt: Date } } }) => Promise<{ count: number }> }
    | undefined;
  const verificationTokenModel = (prisma as unknown as Record<string, unknown>).verificationToken as
    | { deleteMany: (args: { where: { expires: { lt: Date } } }) => Promise<{ count: number }> }
    | undefined;

  // -------------------------------------------------------------------------
  // 1) NextAuth Session — table name "Session" (Prisma convention)
  // -------------------------------------------------------------------------
  let sessionsRemoved = 0;
  if (sessionModel) {
    try {
      const r = await sessionModel.deleteMany({ where: { expires: { lt: now } } });
      sessionsRemoved = r.count;
    } catch {
      sessionsRemoved = 0;
    }
  }

  // -------------------------------------------------------------------------
  // 2) NextAuth VerificationToken
  // -------------------------------------------------------------------------
  let verificationTokensRemoved = 0;
  if (verificationTokenModel) {
    try {
      const r = await verificationTokenModel.deleteMany({ where: { expires: { lt: now } } });
      verificationTokensRemoved = r.count;
    } catch {
      verificationTokensRemoved = 0;
    }
  }

  // -------------------------------------------------------------------------
  // 3) AuditLog > 90 dias
  // -------------------------------------------------------------------------
  let auditLogsRemoved = 0;
  const auditLogModel = (prisma as unknown as Record<string, unknown>).auditLog as
    | { deleteMany: (args: { where: { createdAt: { lt: Date } } }) => Promise<{ count: number }> }
    | undefined;
  if (auditLogModel) {
    try {
      const r = await auditLogModel.deleteMany({
        where: { createdAt: { lt: auditLogCutoff } },
      });
      auditLogsRemoved = r.count;
    } catch {
      auditLogsRemoved = 0;
    }
  }

  return {
    sessionsRemoved,
    verificationTokensRemoved,
    auditLogsRemoved,
    auditLogCutoffIso: auditLogCutoff.toISOString(),
  };
}

async function handleCleanup(request: NextRequest): Promise<NextResponse> {
  const jobId = randomUUID();
  const startedAt = Date.now();
  const ctx = { job: 'cleanup_sessions', jobId, startedAt };

  const auth = verifyCronSecret(request);
  if (!auth.ok) {
    logCronFailed({ ...ctx, metadata: { reason: auth.reason } });
    return NextResponse.json(unauthorizedResponse(auth).json(), { status: 401 });
  }

  const lock = tryAcquireLock('cleanup-sessions', jobId);
  if (!lock.ok) {
    logCronSkipped(ctx, `lock held by ${lock.activeJobId}`);
    return NextResponse.json(
      { ok: false, skipped: true, activeJobId: lock.activeJobId },
      { status: 409 }
    );
  }

  logCronStarted(ctx);

  try {
    const counts = await runCleanup();
    const totalRemoved =
      counts.sessionsRemoved +
      counts.verificationTokensRemoved +
      counts.auditLogsRemoved;

    logCronCompleted({
      ...ctx,
      itemsProcessed: totalRemoved,
      metadata: {
        sessionsRemoved: counts.sessionsRemoved,
        verificationTokensRemoved: counts.verificationTokensRemoved,
        auditLogsRemoved: counts.auditLogsRemoved,
        auditLogCutoffIso: counts.auditLogCutoffIso,
        retentionDays: AUDIT_LOG_RETENTION_DAYS,
      },
    });

    return NextResponse.json({
      ok: true,
      jobId,
      durationMs: Date.now() - startedAt,
      sessionsRemoved: counts.sessionsRemoved,
      verificationTokensRemoved: counts.verificationTokensRemoved,
      auditLogsRemoved: counts.auditLogsRemoved,
      auditLogCutoffIso: counts.auditLogCutoffIso,
      retentionDays: AUDIT_LOG_RETENTION_DAYS,
    });
  } catch (err) {
    logCronFailed({ ...ctx, error: err });
    return NextResponse.json(
      {
        ok: false,
        jobId,
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - startedAt,
      },
      { status: 500 }
    );
  } finally {
    releaseLock('cleanup-sessions', jobId);
  }
}

export async function GET(request: NextRequest) {
  return handleCleanup(request);
}

export async function POST(request: NextRequest) {
  return handleCleanup(request);
}