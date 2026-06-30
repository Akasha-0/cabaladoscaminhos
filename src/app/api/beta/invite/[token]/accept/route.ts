// ============================================================================
// POST /api/beta/invite/[token]/accept — Aceita convite (Wave 32)
// ============================================================================// Body: { userId } (criado pelo fluxo de signup — Supabase + DB)
// Auth: requer userId válido no body. Em produção, idealmente combinado
// com sessão Supabase; aqui aceitamos o userId pois o signup já acabou.
//
// Side-effects:
//   - Marca invite.status = ACCEPTED, acceptedAt = now, userId = ...
//   - Audit log LGPD (CONSENT_GRANTED equivalente)
//
// Idempotente: reuso do mesmo token após aceite retorna 'already_accepted'.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { acceptInvite } from '@/lib/beta/invites';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const acceptSchema = z.object({
  userId: z.string().min(1).max(64),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  let body: z.infer<typeof acceptSchema>;
  try {
    body = acceptSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_input', detail: err instanceof z.ZodError ? err.issues : 'parse_error' },
      { status: 400 }
    );
  }

  const result = await acceptInvite({
    plaintextToken: params.token,
    userId: body.userId,
  });

  if (!result.ok) {
    const statusByReason: Record<typeof result.reason, number> = {
      invalid_token: 400,
      expired: 410,
      revoked: 410,
      already_accepted: 409,
      user_not_found: 404,
    };
    return NextResponse.json(
      { ok: false, reason: result.reason },
      { status: statusByReason[result.reason] ?? 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    invite: {
      id: result.invite.id,
      wave: result.invite.wave,
      status: result.invite.status,
      acceptedAt: result.invite.acceptedAt,
    },
    userId: result.userId,
  });
}