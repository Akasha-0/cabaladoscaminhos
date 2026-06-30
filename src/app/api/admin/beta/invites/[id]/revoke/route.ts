// ============================================================================
// POST /api/admin/beta/invites/[id]/revoke — Admin: revoga por ID interno
// ============================================================================// Complementa DELETE /api/beta/invite/[token]: este aqui recebe o id
// interno (cuid) que vem da listagem admin, sem precisar do token plaintext.
// Auth: requireAdmin
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/session';
import { revokeInvite } from '@/lib/beta/invites';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const bodySchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session.ok) {
    return NextResponse.json(
      { error: 'forbidden', reason: session.reason },
      { status: session.reason === 'config_error' ? 500 : 403 }
    );
  }

  let body: z.infer<typeof bodySchema> = {};
  try {
    const text = await req.text();
    if (text) body = bodySchema.parse(JSON.parse(text));
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_input', detail: err instanceof z.ZodError ? err.issues : 'parse_error' },
      { status: 400 }
    );
  }

  const result = await revokeInvite(params.id, session.userId, body.reason);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason },
      { status: result.reason === 'not_found' ? 404 : 409 }
    );
  }

  return NextResponse.json({ ok: true });
}