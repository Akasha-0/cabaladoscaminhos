// ============================================================================
// LGPD EXPORT API — POST/GET /api/lgpd/export
// ============================================================================
// POST: cria uma DataExportRequest (assíncrono)
// GET:  lista requests do titular + checa status
//
// LGPD Art. 18, V — direito de acesso
// LGPD Art. 19   — portabilidade
//
// Auth: precisa estar autenticado (requireUser).
// Rate limit: 5 req/dia (export é caro).
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  ok,
  fail,
  fromZodError,
  handleError,
  ErrorCode,
} from '@/lib/community/api';
import { getViewer } from '@/lib/community/auth';
import {
  requestDataExport,
  listExportRequestsForUser,
  type ExportFormat,
} from '@/lib/lgpd';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PostSchema = z.object({
  format: z.enum(['JSON', 'CSV', 'PDF']).optional(),
  password: z.string().min(8).max(128).optional(),
});

// ============================================================================
// POST — cria nova request
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const viewer = await getViewer();
    if (!viewer.ok) {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Autenticação necessária');
    }

    const body = await request.json().catch(() => ({}));
    const parsed = PostSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const result = await requestDataExport({
      userId: viewer.userId!,
      format: (parsed.data.format ?? 'JSON') as ExportFormat,
      password: parsed.data.password,
    });

    if (!result.ok) {
      return fail(500, ErrorCode.INTERNAL_ERROR, result.error ?? 'Falha ao criar request');
    }

    return ok({
      requestId: result.requestId,
      status: result.status,
      estimatedSize: result.estimatedSize,
      message:
        'Export request criada. O processamento é assíncrono — você receberá um email quando estiver pronto (até 7 dias úteis).',
      checkStatusUrl: `/api/lgpd/export?requestId=${result.requestId}`,
    });
  } catch (err) {
    return handleError(err);
  }
}

// ============================================================================
// GET — lista requests ou checa status
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const viewer = await getViewer();
    if (!viewer.ok) {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Autenticação necessária');
    }

    const url = new URL(request.url);
    const requestId = url.searchParams.get('requestId');

    const requests = await listExportRequestsForUser(viewer.userId!, 20);

    if (requestId) {
      const req = requests.find((r) => r.id === requestId);
      if (!req) {
        return fail(404, ErrorCode.NOT_FOUND, 'Request não encontrada');
      }
      // Não expõe downloadUrl direto — força novo GET via cookie/session
      return ok({
        id: req.id,
        status: req.status,
        format: req.format,
        expiresAt: req.expiresAt,
        createdAt: req.createdAt,
        hasDownload: !!req.downloadUrl,
      });
    }

    return ok({
      requests: requests.map((r) => ({
        id: r.id,
        status: r.status,
        format: r.format,
        expiresAt: r.expiresAt,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    return handleError(err);
  }
}