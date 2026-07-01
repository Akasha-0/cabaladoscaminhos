// ============================================================================
// ADMIN DPO DASHBOARD API — GET /api/admin/lgpd/dashboard
// ============================================================================
// Snapshot JSON de todas as métricas do DPO Dashboard.
// Integra com BI/Sheets/etc — export programático.
//
// Auth: admin only.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireAdmin } from '@/lib/admin/session';
import { getCurrentConsentVersion, reconsentQueueSize } from '@/lib/lgpd/consent';
import { pendingDeletionRequestsCount } from '@/lib/lgpd/data-deletion';
import { auditStats, verifyAuditChain } from '@/lib/lgpd/audit-logger';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session.ok) {
      return fail(403, ErrorCode.FORBIDDEN, 'Acesso restrito a administradores');
    }

    const [
      currentVersion,
      queueSize,
      deletionPending,
      stats,
      chainVerify,
      pendingExports,
      last30dExports,
      last30dDeletions,
    ] = await Promise.all([
      getCurrentConsentVersion().catch(() => '1.0.0'),
      reconsentQueueSize().catch(() => 0),
      pendingDeletionRequestsCount().catch(() => 0),
      auditStats().catch(() => null),
      verifyAuditChain({ sinceDays: 90, limit: 5000 }).catch(() => null),
      prisma.dataExportRequest.count({
        where: { status: { in: ['PENDING', 'PROCESSING'] } },
      }).catch(() => 0),
      prisma.dataExportRequest.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }).catch(() => 0),
      prisma.user.count({
        where: {
          deletedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }).catch(() => 0),
    ]);

    return ok({
      generatedAt: new Date().toISOString(),
      adminEmail: session.email,
      consent: {
        currentVersion,
        reconsentQueue: queueSize,
      },
      exports: {
        pending: pendingExports,
        last30d: last30dExports,
      },
      deletions: {
        active: deletionPending,
        last30d: last30dDeletions,
      },
      auditLog: stats,
      hashChain: chainVerify,
      compliance: {
        articlesCovered: [
          'Art. 5 — Definições',
          'Art. 6 — Princípios',
          'Art. 7 — Bases legais',
          'Art. 8 — Consentimento',
          'Art. 9 — Princípio da necessidade',
          'Art. 12 — Minimização',
          'Art. 14 — Informação',
          'Art. 16 — Retenção',
          'Art. 18 — Direitos do titular',
          'Art. 19 — Portabilidade',
          'Art. 37 — Registro de operações',
          'Art. 41 — DPO',
          'Art. 46 — Segurança técnica',
        ],
      },
    });
  } catch (err) {
    return handleError(err);
  }
}