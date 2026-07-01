// ============================================================================
// LGPD CONSENT API — POST /api/lgpd/consent
// ============================================================================
// Recebe decisões granulares de consentimento (CookieConsent v2).
//
// LGPD Art. 8° — consentimento livre, informado, inequívoco.
// Nunca inferimos consentimento por inércia (sempre explicit POST).
//
// Aceita:
//   POST { consent: { necessary, analytics, marketing, personalization,
//                      thirdPartySharing }, version: "1.0.0" }
//
// Audit log: CONSENT_GRANTED ou CONSENT_REVOKED conforme `accepted`.
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { getViewer } from '@/lib/community/auth';
import { recordConsent, CURRENT_CONSENT_VERSION, type SpecificConsents } from '@/lib/lgpd';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ConsentSchema = z.object({
  consent: z.object({
    necessary: z.literal(true),
    analytics: z.boolean(),
    marketing: z.boolean(),
    personalization: z.boolean(),
    thirdPartySharing: z.boolean(),
  }),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).default(CURRENT_CONSENT_VERSION),
});

export async function POST(request: NextRequest) {
  try {
    const viewer = await getViewer();
    const userId = viewer.ok ? viewer.userId : null;

    // Se não autenticado, gera um ID anônimo (cookie consent antes do login)
    const effectiveUserId = userId ?? `anon-${request.headers.get('x-forwarded-for') ?? 'unknown'}`;

    const body = await request.json().catch(() => null);
    if (!body) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');
    }

    const parsed = ConsentSchema.safeParse(body);
    if (!parsed.success) return fromZodError(parsed.error);

    const consent = parsed.data.consent;
    // LGPD Art. 8° §2°: consentimento é inequívoco. "accepted" = pelo menos
    // uma finalidade marcada como true.
    const accepted = Object.entries(consent).some(
      ([k, v]) => k !== 'necessary' && v === true
    );

    const result = await recordConsent({
      userId: effectiveUserId,
      accepted,
      specificConsents: consent as SpecificConsents,
      ip: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
      version: parsed.data.version,
    });

    if (!result.ok) {
      return fail(500, ErrorCode.INTERNAL_ERROR, result.error ?? 'Falha ao gravar consentimento');
    }

    return ok({
      recordId: result.recordId,
      version: parsed.data.version,
      accepted,
      message: accepted
        ? 'Consentimento registrado. Obrigado!'
        : 'Recusa registrada. Apenas cookies necessários serão usados.',
    });
  } catch (err) {
    return handleError(err);
  }
}