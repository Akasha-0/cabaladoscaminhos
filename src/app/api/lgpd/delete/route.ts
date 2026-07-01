// ============================================================================
// LGPD DELETE API — POST /api/lgpd/delete
// ============================================================================
// POST: cria soft-delete (janela de recuperação de 30d)
//
// LGPD Art. 18, VI — direito de eliminação
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { getViewer } from '@/lib/community/auth';
import { requestDataDeletion } from '@/lib/lgpd';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PostSchema = z.object({
  reason: z.string().max(500).optional(),
  confirm: z.literal(true), // exige confirmação explícita
});

export async function POST(request: NextRequest) {
  try {
    const viewer = await getViewer();
    if (!viewer.ok) {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Autenticação necessária');
    }

    const body = await request.json().catch(() => ({}));
    const parsed = PostSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const result = await requestDataDeletion({
      userId: viewer.userId!,
      reason: parsed.data.reason,
      ip: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    if (!result.ok) {
      return fail(500, ErrorCode.INTERNAL_ERROR, result.error ?? 'Falha');
    }

    return ok({
      phase: result.phase,
      requestId: result.requestId,
      scheduledHardDeleteAt: result.scheduledHardDeleteAt,
      message:
        result.phase === 'SOFT'
          ? 'Sua conta foi colocada em modo de exclusão. Você tem 30 dias para cancelar a partir de /settings/privacy. Após esse período, a exclusão será permanente.'
          : 'Conta já estava em soft-delete.',
      cancelUrl: `/settings/privacy?action=cancel-deletion`,
    });
  } catch (err) {
    return handleError(err);
  }
}