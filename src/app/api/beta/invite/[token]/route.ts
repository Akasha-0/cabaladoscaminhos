// ============================================================================
// GET /api/beta/invite/[token] — Verifica status do token
// DELETE /api/beta/invite/[token] — Admin: revoga convite (Wave 32)
// ============================================================================
// GET é público (não requer auth). Devolve shape discriminado para a landing
// /convite/[token] decidir o que mostrar.
//
// DELETE é admin-only. Revoga um convite a partir do plaintext token (caso
// operacional: admin recebeu o link por outro canal e quer matar).
//
// LGPD: nunca ecoamos email completo; rate limit por IP/actor.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyInvite, revokeInvite } from '@/lib/beta/invites';
import { checkVerifyRateLimit } from '@/lib/beta/ratelimit';
import { requireAdmin } from '@/lib/admin/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]?.trim() ?? 'unknown';
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***';
  const localMasked = local.length <= 2 ? '*'.repeat(local.length) : `${local[0]}***`;
  const [domBase, ...rest] = domain.split('.');
  const domMasked = domBase ? `${domBase[0]}***` : '***';
  return `${localMasked}@${domMasked}.${rest.join('.')}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const ip = getClientIp(req);
  const rate = checkVerifyRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited', retryAfterSec: rate.retryAfterSec },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
    );
  }

  const result = await verifyInvite(params.token);
  if (!result.ok) {
    const statusByReason: Record<typeof result.reason, number> = {
      not_found: 404,
      invalid_token: 400,
      expired: 410,
      revoked: 410,
      consumed: 410,
    };
    return NextResponse.json(
      { ok: false, reason: result.reason },
      { status: statusByReason[result.reason] ?? 400 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      invite: {
        wave: result.invite.wave,
        status: result.invite.status,
        expiresAt: result.invite.expiresAt,
        expiredSoon: result.expiredSoon,
        emailMasked: maskEmail(result.invite.email),
      },
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const session = await requireAdmin();
  if (!session.ok) {
    return NextResponse.json(
      { error: 'forbidden', reason: session.reason },
      { status: session.reason === 'config_error' ? 500 : 403 }
    );
  }

  const v = await verifyInvite(params.token);
  if (!v.ok) {
    if (v.reason === 'not_found' || v.reason === 'invalid_token') {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    if (v.reason === 'consumed') {
      return NextResponse.json({ error: 'already_consumed' }, { status: 409 });
    }
    // expired/revoked — idempotente, retorna ok
    return NextResponse.json({ ok: true, note: `already_${v.reason}` });
  }

  const url = new URL(req.url);
  const reason = url.searchParams.get('reason') ?? undefined;

  const result = await revokeInvite(v.invite.id, session.userId, reason);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason },
      { status: result.reason === 'not_found' ? 404 : 500 }
    );
  }

  return NextResponse.json({ ok: true });
}