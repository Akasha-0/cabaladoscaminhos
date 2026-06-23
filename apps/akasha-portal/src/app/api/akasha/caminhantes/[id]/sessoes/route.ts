/**
 * /api/akasha/caminhantes/:id/sessoes — Wave 3 / D-XXX
 *
 * GET:  List sessoes for this consulente (ordered by abertoEm DESC, limit 20).
 * POST: Create new Sessao (Apresentacao | Leitura | Ritual | Aconselhamento | Integracao).
 *
 * Caminhante context: withCaminhanteContext({ zeladorId, caminhadaId }) from auth.
 *
 * RLS-equivalent protection: the extended prisma client (tenant-context.ts)
 * auto-injects WHERE zeladorId = ctx.zeladorId AND caminhadaId = ctx.caminhadaId
 * on every operation against scoped models. Cross-tenant reads/writes are
 * blocked at the application layer (1 audit point).
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

const listQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const createBodySchema = z.object({
  tipo: z.enum(['Apresentacao', 'Leitura', 'Ritual', 'Aconselhamento', 'Integracao']),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const { id: caminhanteId } = paramsSchema.parse(await params);
  const { limit } = listQuerySchema.parse(
    Object.fromEntries(new URL(request.url).searchParams.entries()),
  );

  const sessoes = await withCaminhanteContext(
    { zeladorId: auth.id, caminhadaId: caminhanteId },
    () =>
      prisma.sessao.findMany({
        orderBy: { abertoEm: 'desc' },
        take: limit,
        select: {
          id: true,
          tipo: true,
          status: true,
          abertoEm: true,
          fechadoEm: true,
        },
      }),
  );

  return NextResponse.json({ sessoes });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const { id: caminhanteId } = paramsSchema.parse(await params);
  const body = createBodySchema.parse(await request.json());

  const sessao = await withCaminhanteContext(
    { zeladorId: auth.id, caminhadaId: caminhanteId },
    () =>
      prisma.sessao.create({
        data: {
          tipo: body.tipo,
          zelador: { connect: { id: auth.id } },
          caminhada: { connect: { id: caminhanteId } },
        },
        select: { id: true, tipo: true, abertoEm: true },
      }),
  );

  return NextResponse.json({ sessao }, { status: 201 });
}
