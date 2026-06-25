/**
 * DELETE /api/account/delete — Wave 19.2 (LGPD Art. 18 §V — self-service)
 *
 * Endpoint SELF-SERVICE para eliminação de conta. Diferencial vs Wave 8.3
 * (`/api/akasha/profile/[id]` DELETE, admin-only):
 *
 *   - Usuário deleta A SI PRÓPRIO (sem admin)
 *   - Confirmação por SENHA (header `X-Confirm-Password`, bcrypt compare)
 *   - SOFT DELETE: User.deletedAt + deleteGracePeriodEndsAt (30 dias)
 *   - Logout imediato: limpa cookies __Host-akasha_session + refresh
 *   - Cron de limpeza (Wave 19.2-followup) faz hard delete pós-grace
 *
 * LGPD:
 *   - Art. 18 §V — direito de eliminação
 *   - Art. 18 §3 — revogação: usuário pode cancelar durante grace (rota
 *     separada `/api/account/cancel-deletion` — fora do escopo Wave 19.2)
 *   - Art. 37 — auditoria completa (requested + scheduled + confirm_failed)
 *
 * Auth:
 *   - requireAkashaApi (cookie akasha_session)
 *   - Senha confirmada via bcrypt (header X-Confirm-Password)
 *   - Login social (sem passwordHash) → 400 pedindo confirmação alternativa
 *
 * Erros:
 *   - 401 sem auth
 *   - 400 sem header de confirmação / confirmação inválida
 *   - 403 senha não confere (após auditoria de tentativa)
 *   - 200 soft-delete agendado + grace period
 *
 * Runtime: nodejs (usa bcryptjs + Prisma)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { AKASHA_TOKEN_COOKIE, AKASHA_REFRESH_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { auditLog, hashIpForAudit, extractClientIp } from '@/lib/infrastructure/audit-log';
import {
  softDeleteAccount,
  verifyPasswordConfirmation,
} from '@/lib/application/lgpd/delete-account';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  // 1. Auth
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const ipHash = hashIpForAudit(extractClientIp(request.headers));
  const requestId = request.headers.get('x-request-id') ?? undefined;

  // 2. Lê header de confirmação
  const confirmHeader = request.headers.get('x-confirm-password');

  if (!confirmHeader) {
    return NextResponse.json(
      {
        error:
          'Confirmação obrigatória: envie header X-Confirm-Password com sua senha atual.',
        code: 'confirm_required',
      },
      { status: 400 },
    );
  }

  // 3. Verifica senha (LGPD Art. 18 — autenticação antes de ação destrutiva)
  const passwordCheck = await verifyPasswordConfirmation(auth.id, confirmHeader);

  if (!passwordCheck.ok) {
    auditLog({
      action: 'lgpd_password_confirm_failed',
      userId: auth.id,
      ipHash,
      requestId,
      metadata: {
        reason: passwordCheck.reason,
        endpoint: '/api/account/delete',
      },
    });

    // Sem senha setada (login social) tem mensagem específica
    if (passwordCheck.reason === 'no_password_set') {
      return NextResponse.json(
        {
          error:
            'Conta criada via login social (sem senha). Use o fluxo de "definir senha" antes de deletar.',
          code: 'no_password_set',
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: 'Senha incorreta. Verifique e tente novamente.',
        code: 'password_mismatch',
      },
      { status: 403 },
    );
  }

  // 4. Soft delete (delega para helper unificado)
  try {
    const result = await softDeleteAccount({ auth, ipHash, requestId });

    // 5. Clear cookies (logout imediato)
    const response = NextResponse.json(
      {
        scheduled: true,
        deletedAt: result.deletedAt.toISOString(),
        gracePeriodEndsAt: result.gracePeriodEndsAt.toISOString(),
        graceDays: result.graceDays,
        cascadePreview: result.cascadePreview,
        message:
          'Conta agendada para eliminação em 30 dias. Para cancelar, faça login e acesse /conta/privacidade antes do prazo.',
        revokeInfo:
          'Sua sessão foi encerrada. Você ainda pode entrar durante o grace period para CANCELAR a eliminação.',
      },
      { status: 200 },
    );

    response.cookies.set(AKASHA_TOKEN_COOKIE, '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true,
      maxAge: 0,
    });
    response.cookies.set(AKASHA_REFRESH_COOKIE, '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true,
      maxAge: 0,
    });

    return response;
  } catch (err) {
    auditLog({
      action: 'lgpd_deletion_requested',
      userId: auth.id,
      ipHash,
      requestId,
      metadata: {
        outcome: 'failed',
        reason: 'soft_delete_threw',
        error: err instanceof Error ? err.message : String(err),
      },
    });
    return NextResponse.json(
      {
        error: 'Falha ao agendar eliminação. Tente novamente ou contate suporte.',
        code: 'internal_error',
      },
      { status: 500 },
    );
  }
}
