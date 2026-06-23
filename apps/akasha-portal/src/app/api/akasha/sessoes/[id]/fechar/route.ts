/**
 * /api/akasha/sessoes/:id/fechar — Wave 3 / D-XXX
 *
 * PATCH: Close an open Sessao (status=fechada, fechadoEm=now).
 *
 * Caminhante context: withCaminhanteContext({ zeladorId, caminhadaId }) from auth.
 * Note: we don't have the caminhadaId from the URL — we need to look it up
 * first (via rawPrisma bypassing the proxy), then the update is scoped
 * by both fields.
 *
 * RLS-equivalent protection: extended prisma client auto-injects
 * WHERE zeladorId + (caminhadaId) on every operation. We also add an
 * explicit defense-in-depth check + atomic updateMany with status guard
 * to prevent TOCTOU race conditions.
 *
 * Fix applied: changed from findUnique+update to a single updateMany with
 * status='aberta' guard. This makes the close atomic at the DB level.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import {
  withCaminhanteContext,
  prisma,
} from '@/lib/application/tenant-context';
import { prisma as rawPrisma } from '@/lib/infrastructure/prisma';

const paramsSchema = z.object({
  id: z.string().min(1),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const { id: sessaoId } = paramsSchema.parse(await params);

  // Look up the sessao via raw prisma to learn its caminhadaId.
  // The raw client doesn't auto-inject scope, so we explicitly check
  // ownership before proceeding.
  const existing = await rawPrisma.sessao.findUnique({
    where: { id: sessaoId },
    select: { id: true, zeladorId: true, caminhadaId: true, status: true },
  });

  if (!existing) {
    return NextResponse.json({ error: 'sessao_not_found' }, { status: 404 });
  }
  if (existing.zeladorId !== auth.id) {
    // Defense in depth: do NOT distinguish "not found" from "wrong owner"
    // to avoid leaking the existence of other Zeladors' sessoes.
    return NextResponse.json({ error: 'sessao_not_found' }, { status: 404 });
  }

  // Atomic update via the scoped extended client.
  // The proxy auto-injects WHERE zeladorId + caminhadaId, and we add
  // the status='aberta' guard to prevent double-close (TOCTOU race).
  const result = await withCaminhanteContext(
    { zeladorId: auth.id, caminhadaId: existing.caminhadaId },
    () =>
      prisma.sessao.updateMany({
        where: {
          id: sessaoId,
          status: 'aberta', // TOCTOU guard
        },
        data: { status: 'fechada', fechadoEm: new Date() },
      }),
  );

  if (result.count === 0) {
    // Already closed (race with another request) — return 409 conflict
    return NextResponse.json(
      { error: 'sessao_already_closed' },
      { status: 409 },
    );
  }

  return NextResponse.json({
    sessao: { id: sessaoId, status: 'fechada', fechadoEm: new Date() },
  });
}
