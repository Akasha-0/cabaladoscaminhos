/**
 * /api/akasha/caminhantes/:id/notas — Wave 3 / D-XXX
 *
 * GET:  List NotasConsulente for this consulente (optional categoria filter, default limit 50).
 * POST: Create new nota (observacao | prescricao | ritual | firmeza | intercorrencia).
 *
 * Caminhante context: withCaminhanteContext({ zeladorId, caminhadaId }) from auth.
 *
 * RLS-equivalent protection: extended prisma client auto-injects
 * WHERE zeladorId + caminhadaId on every operation against NotasConsulente.
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
  categoria: z
    .enum(['observacao', 'prescricao', 'ritual', 'firmeza', 'intercorrencia'])
    .optional(),
  limit: z.coerce.number().int().positive().max(200).default(50),
});

const createBodySchema = z.object({
  categoria: z.enum(['observacao', 'prescricao', 'ritual', 'firmeza', 'intercorrencia']),
  titulo: z.string().min(1).max(200),
  conteudo: z.string().min(1),
  tags: z.array(z.string()).optional(),
  contexto: z.record(z.unknown()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const { id: caminhanteId } = paramsSchema.parse(await params);
  const query = listQuerySchema.parse(
    Object.fromEntries(new URL(request.url).searchParams.entries()),
  );

  const where: { categoria?: typeof query.categoria } = {};
  if (query.categoria) where.categoria = query.categoria;

  const notas = await withCaminhanteContext(
    { zeladorId: auth.id, caminhadaId: caminhanteId },
    () =>
      prisma.notasConsulente.findMany({
        where,
        orderBy: { atualizadoEm: 'desc' },
        take: query.limit,
        select: {
          id: true,
          categoria: true,
          titulo: true,
          conteudo: true,
          tags: true,
          criadoEm: true,
          atualizadoEm: true,
        },
      }),
  );

  return NextResponse.json({ notas });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const { id: caminhanteId } = paramsSchema.parse(await params);
  const body = createBodySchema.parse(await request.json());

  const nota = await withCaminhanteContext(
    { zeladorId: auth.id, caminhadaId: caminhanteId },
    () =>
      prisma.notasConsulente.create({
        data: {
          categoria: body.categoria,
          titulo: body.titulo,
          conteudo: body.conteudo,
          tags: body.tags ?? [],
          contexto: body.contexto,
          zelador: { connect: { id: auth.id } },
          caminhada: { connect: { id: caminhanteId } },
        },
        select: {
          id: true,
          categoria: true,
          titulo: true,
          criadoEm: true,
        },
      }),
  );

  return NextResponse.json({ nota }, { status: 201 });
}
