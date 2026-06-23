/**
 * /api/akasha/caminhantes/:id/mapa — Wave 3 / D-XXX
 *
 * GET: Return cached MapaCalculo (7 Pilares) for this consulente.
 *
 * Caminhante context: withCaminhanteContext({ zeladorId, caminhadaId }) from auth.
 *
 * RLS-equivalent protection: extended prisma client auto-injects
 * WHERE zeladorId + caminhadaId on every MapaCalculo query.
 *
 * Wave 3.5 follow-up: a POST endpoint will trigger computation + cache write.
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const { id: caminhanteId } = paramsSchema.parse(await params);

  const mapa = await withCaminhanteContext(
    { zeladorId: auth.id, caminhadaId: caminhanteId },
    () =>
      prisma.mapaCalculo.findFirst({
        orderBy: { calculadoEm: 'desc' },
        select: {
          cabala: true,
          astrologia: true,
          tantra: true,
          odu: true,
          iching: true,
          pilar6: true,
          pilar7: true,
          setores: true,
          versaoCalculo: true,
          calculadoEm: true,
        },
      }),
  );

  if (!mapa) {
    return NextResponse.json({ error: 'mapa_not_computed' }, { status: 404 });
  }

  return NextResponse.json({ mapa });
}
