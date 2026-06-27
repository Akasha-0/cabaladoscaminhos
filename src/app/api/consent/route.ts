// ============================================================================
// CONSENT API — /api/consent
// ============================================================================
// Recebe decisões do CookieConsent component. Persiste evento de auditoria
// para cumprimento de LGPD art. 8° (consentimento) + 9° (princípio da
// necessidade).
//
// POST { analytics: bool, marketing: bool }
//   → 200 (sempre — não retorna erro se nada foi gravado no banco)
//
// Não persiste estado no banco de produção ainda (Wave 12). Apenas loga
// audit. O estado real vive no cookie + localStorage do browser; quando o
// usuário autenticar, podemos sincronizar com User.consentState (futuro).
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { getViewer } from '@/lib/community/auth';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const ConsentSchema = z.object({
  analytics: z.boolean(),
  marketing: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return fail(400, ErrorCode.BAD_REQUEST, 'Corpo inválido (JSON esperado)');
    }

    const parsed = ConsentSchema.safeParse(body);
    if (!parsed.success) {
      return fromZodError(parsed.error);
    }

    const viewer = await getViewer();

    const granted: string[] = ['essential', ...(parsed.data.analytics ? ['analytics'] : []), ...(parsed.data.marketing ? ['marketing'] : [])];

    // Loga como grant (a UI só envia POST quando usuário confirma).
    // Para revogação, adicionamos query ?revoke=1 no futuro ou nova rota.
    await audit.consentGranted(viewer?.id ?? null, granted, {
      ip: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
      metadata: { source: 'cookie-banner' },
    });

    return ok({ recorded: true, categories: granted });
  } catch (err) {
    return handleError(err);
  }
}
