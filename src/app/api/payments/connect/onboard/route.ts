// ============================================================================
// POST /api/payments/connect/onboard — Criar Connect account + onboarding link
// ============================================================================
// Wave 30. Requer auth. Cria (ou recupera) Stripe Connect Express account
// para o reader e retorna URL de onboarding hosted pela Stripe.
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import { ConnectOnboardSchema } from '@/lib/validators/payments';
import { onboardReader } from '@/lib/payments/marketplace-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado');
    }
    if (!viewer.email) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Email não disponível no perfil');
    }

    const body = await request.json().catch(() => null);
    if (!body) return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');

    const parsed = ConnectOnboardSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const origin = request.nextUrl.origin;
    const result = await onboardReader({
      userId: viewer.id,
      email: viewer.email,
      country: parsed.data.country,
      fullName: parsed.data.fullName,
      returnUrl:
        parsed.data.returnUrl ?? `${origin}/dashboard/reader/onboarding/return`,
      refreshUrl:
        parsed.data.refreshUrl ?? `${origin}/dashboard/reader/onboarding/refresh`,
    });

    return ok(
      {
        stripeAccountId: result.stripeAccountId,
        onboardingUrl: result.onboardingUrl,
        expiresAt: result.expiresAt,
        chargesEnabled: result.chargesEnabled,
        payoutsEnabled: result.payoutsEnabled,
        detailsSubmitted: result.detailsSubmitted,
        requirements: result.requirements,
        alreadyOnboarded: !result.onboardingUrl,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleError(err);
  }
}