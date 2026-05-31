import { NextResponse } from 'next/server';
import { z } from 'zod';
import { FORMAS_SAGRADAS, getFormaPorSefirot, getFormaPorChakra } from '@/lib/geometria-sagrada/dados';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SacredGeometryShapesQuerySchema = z.object({
  id: z.string().optional(),
  sefirot: z.string().optional(),
  chakra: z.coerce.number().int().min(1).max(7).optional(),
});
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = SacredGeometryShapesQuerySchema.safeParse({
      id: searchParams.get('id'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { id, sefirot, chakra } = parseResult.data;
    if (id) {
      const forma = FORMAS_SAGRADAS.find(f => f.id === id);
      if (!forma) {
        return NextResponse.json({ error: 'Forma não encontrada' }, { status: 404 });
      }
      return NextResponse.json(forma);
    }
    if (sefirot) {
      return NextResponse.json(getFormaPorSefirot(sefirot));
    }
    if (chakra !== undefined) {
      return NextResponse.json(getFormaPorChakra(chakra));
    }
    return NextResponse.json(FORMAS_SAGRADAS);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}
