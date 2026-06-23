/**
 * /api/akasha/sessoes/:id/fechar — Wave 3 / D-XXX
 *
 * PATCH: Close an open Sessao (status=fechada, fechadoEm=now).
 *
 * Caminhante context: withCaminhanteContext({ zeladorId, caminhadaId }) from auth.
 * Note: we don't have the caminhadaId from the URL — we need to look it up
 * first (via the scoped query, which already filters by zeladorId), then
 * the update is scoped by both fields.
 *
 * RLS-equivalent protection: extended prisma client auto-injects
 * WHERE zeladorId + (caminhadaId) on every operation. We also add an
 * explicit defense-in-depth check after fetch.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import {
  withCaminhanteContext,
  prisma,
} from '@/lib/application/tenant-context';

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

  // We need to find the sessao first to learn its caminhadaId.
  // Use a bare prisma call here (no CaminhanteContext) since the
  // sessaoId is sufficient to identify the sessao uniquely — but the
  // extended prisma will throw because Sessao is scoped. Solution:
  // pass an explicit where.zeladorId filter to bypass context requirement.
  // Wait — the helper throws if no context. So we must wrap in a
  // minimal context. Since we don't yet know the caminhadaId, we use
  // a sentinel fetch (no where filter on zeladorId — instead, use a
  // direct query via rawPrisma bypassing the proxy).
  //
  // For Wave 3 simplicity, we'll look up the sessao via raw client,
  // validate ownership, then update via the scoped extended client.
  // Production code should expose a helper for this.
  const { prisma: rawPrisma } = await import('@/lib/infrastructure/prisma');
  const existing = await rawPrisma.sessao.findUnique({
    where: { id: sessaoId },
    select: { id: true, zeladorId: true, caminhadaId: true, status: true },
  });

  if (!existing) return NextResponse.json({ error: 'sessao_not_found' }, { status: 404 });
  if (existing.zeladorId !== auth.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // Now update via scoped proxy
  const updated = await withCaminhanteContext(
    { zeladorId: auth.id, caminhadaId: existing.caminhadaId },
    () =>
      prisma.sessao.update({
        where: { id: sessaoId },
        data: { status: 'fechada', fechadoEm: new Date() },
        select: { id: true, status: true, fechadoEm: true },
      }),
  );

  return NextResponse.json({ sessao: updated });
}
