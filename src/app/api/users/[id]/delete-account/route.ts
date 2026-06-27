// ============================================================================
// DELETE ACCOUNT — /api/users/[id]/delete-account
// ============================================================================
// LGPD Art. 18, VI — Direito ao esquecimento.
//
// Segurança (Wave 11):
//   - Requer autenticação
//   - Requer que `id` no path == userId autenticado (não-admin não pode
//     deletar a conta de outros)
//   - Requer confirmação textual no body: { confirm: "EXCLUIR MINHA CONTA" }
//   - Loga o evento em audit_logs ANTES e DEPOIS da exclusão
//   - Não retorna dados sensíveis — só summary de cascata
//
// Não-deleta User (anonimiza apenas) para preservar integridade
// referencial de audit_logs. Detalhes em src/lib/privacy/data-deletion.ts.
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { deleteUserData } from '@/lib/privacy/data-deletion';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const DeleteAccountSchema = z.object({
  confirm: z.literal('EXCLUIR MINHA CONTA', {
    errorMap: () => ({ message: 'Você precisa digitar EXCLUIR MINHA CONTA para confirmar' }),
  }),
  reason: z.string().max(500).optional(),
});

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: targetId } = await context.params;

    let viewer;
    try {
      viewer = await requireViewer();
    } catch (err) {
      const e = err as { statusCode?: number };
      return fail(
        e.statusCode ?? 401,
        ErrorCode.UNAUTHORIZED,
        'Você precisa estar logado'
      );
    }

    // Auto-delete only (admin pode ser expandido depois)
    if (viewer.id !== targetId) {
      return fail(
        403,
        ErrorCode.FORBIDDEN,
        'Você só pode excluir sua própria conta'
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');
    }

    const parsed = DeleteAccountSchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    // Log de intenção ANTES da execução (LGPD — rastro de solicitação)
    await audit.accountDeleteRequest(viewer.id, {
      metadata: { reason: parsed.data.reason ?? null },
      ip: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });

    const result = await deleteUserData(viewer.id);

    // Se houve erros parciais, retorna 207 (Multi-Status) ou 500 se tudo falhou
    const status = result.errors.length === 0 ? 200 : 207;

    return ok(result, { status });
  } catch (err) {
    return handleError(err);
  }
}
