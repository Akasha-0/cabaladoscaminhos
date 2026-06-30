// ============================================================================
// POST /api/beta/invite — Admin: criar convite beta (Wave 32)
// ============================================================================
// Body: { email, wave, dryRun?, metadata? }
// Auth: requireAdmin (env ADMIN_EMAILS OU user.planoAssinatura === 'ADMIN')
// Rate limit: 30 convites / min por admin (em memória, ver lib/beta/ratelimit)
//
// LGPD:
//   - email é PII; nunca ecoamos em logs
//   - token plaintext só volta na resposta para o caller (admin) — ele é
//     responsável por usar imediatamente no dispatch de email
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/session';
import { createInvite } from '@/lib/beta/invites';
import { checkInviteRateLimit } from '@/lib/beta/ratelimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const inviteInputSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email inválido').max(254),
  wave: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  dryRun: z.boolean().optional().default(false),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  // 1. Auth admin
  const session = await requireAdmin();
  if (!session.ok) {
    return NextResponse.json(
      { error: 'forbidden', reason: session.reason },
      { status: session.reason === 'config_error' ? 500 : 403 }
    );
  }

  // 2. Rate limit
  const rate = checkInviteRateLimit(session.userId);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfterSec: rate.retryAfterSec },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
    );
  }

  // 3. Parse + validate
  let body: z.infer<typeof inviteInputSchema>;
  try {
    body = inviteInputSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_input', detail: err instanceof z.ZodError ? err.issues : 'parse_error' },
      { status: 400 }
    );
  }

  // 4. Create
  const result = await createInvite({
    email: body.email,
    wave: body.wave,
    inviterId: session.userId,
    dryRun: body.dryRun,
    metadata: body.metadata,
  });

  if (!result.ok) {
    const status =
      result.reason === 'duplicate_pending'
        ? 409
        : result.reason === 'db_error'
          ? 500
          : 400;
    return NextResponse.json({ error: result.reason }, { status });
  }

  return NextResponse.json(
    {
      ok: true,
      invite: result.invite,
      // plaintextToken SÓ nesta resposta; caller deve passar imediatamente
      // para o dispatcher de email e nunca persistir
      plaintextToken: result.plaintextToken,
    },
    { status: 201 }
  );
}