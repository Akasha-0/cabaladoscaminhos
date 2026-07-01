// ============================================================================
// GET /api/admin/bugs — listar bugs do bug-store
// ============================================================================
// Auth: requireAdmin. Query: status, severity, assignedTo.
// POST /api/admin/bugs — criar bug manualmente.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/session';
import { listBugs, createBug, bugSummary } from '@/lib/bugs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const querySchema = z.object({
  status: z.enum(['NEW', 'INVESTIGATING', 'IN_PROGRESS', 'FIXED', 'CLOSED']).optional(),
  severity: z.enum(['P0', 'P1', 'P2', 'P3']).optional(),
  assignedTo: z.string().trim().min(1).max(64).optional(),
});

const createSchema = z.object({
  title: z.string().trim().min(5).max(200),
  description: z.string().trim().min(10).max(4000),
  severity: z.enum(['P0', 'P1', 'P2', 'P3']),
  sentryFingerprint: z.string().trim().max(64).optional(),
  introducedIn: z.string().trim().max(8).optional(),
  affectedScreens: z.array(z.string().trim().max(200)).max(20).optional(),
  reproducibility: z.enum(['ALWAYS', 'INTERMITTENT', 'ONCE', 'UNKNOWN']).optional(),
});

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session.ok) {
    return NextResponse.json(
      { error: { code: 1005, message: 'admin only' } },
      { status: 403 },
    );
  }
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 2001, message: 'invalid query', details: parsed.error.flatten() } },
      { status: 400 },
    );
  }
  const bugs = listBugs(parsed.data);
  const summary = bugSummary();
  return NextResponse.json({ bugs, summary });
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session.ok) {
    return NextResponse.json(
      { error: { code: 1005, message: 'admin only' } },
      { status: 403 },
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
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 2001, message: 'invalid payload', details: parsed.error.flatten() } },
      { status: 400 },
    );
  }
  const bug = createBug({ ...parsed.data, reportedBy: session.userId });
  return NextResponse.json({ bug }, { status: 201 });
}