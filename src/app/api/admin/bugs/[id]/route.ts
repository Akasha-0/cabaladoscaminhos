// ============================================================================
// PATCH /api/admin/bugs/[id] — atualizar status/severidade/assignment
// ============================================================================
// Auth: requireAdmin. Body: { status?, severity?, assignedTo?, fixedIn?,
//        fixVersion?, patchId?, reproducibility? }.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/session';
import { getBug, updateBug, recordAffectedUser } from '@/lib/bugs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const patchSchema = z.object({
  status: z.enum(['NEW', 'INVESTIGATING', 'IN_PROGRESS', 'FIXED', 'CLOSED']).optional(),
  severity: z.enum(['P0', 'P1', 'P2', 'P3']).optional(),
  assignedTo: z.string().trim().min(1).max(64).nullable().optional(),
  fixedIn: z.string().trim().max(8).nullable().optional(),
  fixVersion: z.string().trim().max(32).nullable().optional(),
  patchId: z.string().trim().max(64).nullable().optional(),
  reproducibility: z.enum(['ALWAYS', 'INTERMITTENT', 'ONCE', 'UNKNOWN']).optional(),
  affectedUserId: z.string().trim().min(1).max(64).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await requireAdmin();
  if (!session.ok) {
    return NextResponse.json(
      { error: { code: 1005, message: 'admin only' } },
      { status: 403 },
    );
  }
  const id = params.id;
  const existing = getBug(id);
  if (!existing) {
    return NextResponse.json(
      { error: { code: 3001, message: 'bug not found' } },
      { status: 404 },
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 2003, message: 'invalid JSON body' } },
      { status: 400 },
    );
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 2001, message: 'invalid payload', details: parsed.error.flatten() } },
      { status: 400 },
    );
  }
  const { affectedUserId, ...rest } = parsed.data;
  const updated = updateBug(id, rest);
  if (affectedUserId) recordAffectedUser(id, affectedUserId);
  return NextResponse.json({ bug: updated ?? getBug(id) });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await requireAdmin();
  if (!session.ok) {
    return NextResponse.json(
      { error: { code: 1005, message: 'admin only' } },
      { status: 403 },
    );
  }
  const bug = getBug(params.id);
  if (!bug) {
    return NextResponse.json(
      { error: { code: 3001, message: 'bug not found' } },
      { status: 404 },
    );
  }
  return NextResponse.json({ bug });
}