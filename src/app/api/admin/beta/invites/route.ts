// ============================================================================
// GET /api/admin/beta/invites — Lista convites beta (admin)
// POST /api/admin/beta/invites/batch — Gera batch de convites (admin)
// ============================================================================
// Auth: requireAdmin
// Query params: wave, status, emailContains, cursor, limit
//
// LGPD: retorna email completo para o admin (necessário para gerenciar),
// mas token nunca aparece — só tokenDisplay (hash[0:4]…hash[-4:]).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/session';
import { listInvites, createInvite, type Wave } from '@/lib/beta/invites';
import { checkInviteRateLimit } from '@/lib/beta/ratelimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const querySchema = z.object({
  wave: z
    .union([z.literal('1'), z.literal('2'), z.literal('3')])
    .optional()
    .transform((v) => (v ? (parseInt(v, 10) as Wave) : undefined)),
  status: z
    .enum(['PENDING', 'SENT', 'OPENED', 'ACCEPTED', 'EXPIRED', 'REVOKED'])
    .optional(),
  emailContains: z.string().trim().min(1).max(254).optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session.ok) {
    return NextResponse.json(
      { error: 'forbidden', reason: session.reason },
      { status: session.reason === 'config_error' ? 500 : 403 }
    );
  }

  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());
  let parsed: z.infer<typeof querySchema>;
  try {
    parsed = querySchema.parse(params);
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_query', detail: err instanceof z.ZodError ? err.issues : 'parse_error' },
      { status: 400 }
    );
  }

  const result = await listInvites({
    wave: parsed.wave,
    status: parsed.status,
    emailContains: parsed.emailContains,
    cursor: parsed.cursor,
    limit: parsed.limit,
  });

  return NextResponse.json({
    ok: true,
    items: result.items,
    nextCursor: result.nextCursor,
    total: result.total,
  });
}

// ============================================================================
// Batch endpoint — gera N convites de uma vez (uso operacional)
// ============================================================================

const batchSchema = z.object({
  emails: z.array(z.string().trim().toLowerCase().email()).min(1).max(50),
  wave: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  dryRun: z.boolean().optional().default(false),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session.ok) {
    return NextResponse.json(
      { error: 'forbidden', reason: session.reason },
      { status: session.reason === 'config_error' ? 500 : 403 }
    );
  }

  // Batch rate limit: 30 convites/min (checamos uma vez por chamada)
  const rate = checkInviteRateLimit(`${session.userId}:batch`);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', retryAfterSec: rate.retryAfterSec },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
    );
  }

  let body: z.infer<typeof batchSchema>;
  try {
    body = batchSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_input', detail: err instanceof z.ZodError ? err.issues : 'parse_error' },
      { status: 400 }
    );
  }

  const results: Array<{
    email: string;
    ok: boolean;
    reason?: string;
    invite?: ReturnType<typeof Object>;
    plaintextToken?: string;
  }> = [];

  for (const email of body.emails) {
    const r = await createInvite({
      email,
      wave: body.wave,
      inviterId: session.userId,
      dryRun: body.dryRun,
      metadata: body.metadata,
    });
    results.push({
      email,
      ok: r.ok,
      reason: r.reason,
      invite: r.invite,
      plaintextToken: r.plaintextToken,
    });
  }

  const successCount = results.filter((r) => r.ok).length;
  return NextResponse.json(
    {
      ok: true,
      requested: body.emails.length,
      succeeded: successCount,
      failed: body.emails.length - successCount,
      results,
    },
    { status: successCount === body.emails.length ? 201 : 207 }
  );
}