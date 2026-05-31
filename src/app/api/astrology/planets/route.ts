import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPlanetaryPositions } from '@/lib/astrologia/planetas/positions';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const PlanetaryPositionsQuerySchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/, 'Formato: YYYY-MM-DD ou YYYY-MM-DDTHH:MM:SS').optional(),
});
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = PlanetaryPositionsQuerySchema.safeParse({
      data: searchParams.get('data'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { data: dataStr } = parseResult.data;
    const data = dataStr ? new Date(dataStr) : new Date();
    if (isNaN(data.getTime())) {
      return NextResponse.json({
        error: 'Data inválida'
      }, { status: 400 });
    }
    const posicoes = getPlanetaryPositions(data);
    return NextResponse.json(
      { posicoes },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (_error) {
    console.error('Erro calculando posições planetárias:', _error);
    return NextResponse.json({
      error: 'Erro ao calcular posições planetárias'
    }, { status: 500 });
  }
}
