import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FORMAS_SAGRADAS, getFormaPorSefirot, getFormaPorChakra, getFrequenciaRecommendations } from '@/lib/geometria-sagrada/dados';

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const SacredGeometryQuerySchema = z.object({
  type: z.enum(['all', 'tipos']).optional(),
  sefirot: z.string().optional(),
  chakra: z.coerce.number().int().min(1).max(7).optional(),
  id: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const parseResult = SacredGeometryQuerySchema.safeParse({
      type: searchParams.get('type'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      id: searchParams.get('id'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { type, sefirot, chakra, id } = parseResult.data;

    // /api/sacred-geometry?type=all
    if (type === 'all') {
      const formas = FORMAS_SAGRADAS;
      return NextResponse.json({ formas, meta: { total: formas.length } });
    }

    // /api/sacred-geometry?id=flower-of-life
    if (id) {
      const forma = FORMAS_SAGRADAS.find(f => f.id === id);
      if (!forma) {
        return NextResponse.json({ error: 'Forma geométrica não encontrada' }, { status: 404 });
      }
      const frequencias = getFrequenciaRecommendations(forma);
      return NextResponse.json({ forma, frequencias });
    }

    // /api/sacred-geometry?sefirot=Kether
    if (sefirot) {
      const formas = getFormaPorSefirot(sefirot);
      return NextResponse.json({ formas, meta: { sefirot, total: formas.length } });
    }

    // /api/sacred-geometry?chakra=7
    if (chakra !== undefined) {
      const formas = getFormaPorChakra(chakra);
      return NextResponse.json({ formas, meta: { chakra, total: formas.length } });
    }

    // /api/sacred-geometry?type=tipos
    if (type === 'tipos') {
      const tipos = [...new Set(FORMAS_SAGRADAS.map(f => f.nome))];
      return NextResponse.json({ tipos, meta: { total: tipos.length } });
    }

    // Default: return overview
    const summary = FORMAS_SAGRADAS.map(f => ({
      id: f.id,
      nome: f.nome,
      cor: f.cor,
      sefirots: f.sefirots,
    }));

    return NextResponse.json({
      formas: summary,
      meta: {
        total: FORMAS_SAGRADAS.length,
        endpoints: ['type=all', 'type=tipos', 'id={id}', 'sefirot={sefirot}', 'chakra={1-7}'],
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}