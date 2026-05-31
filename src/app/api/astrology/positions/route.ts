import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calcularMapaNatal } from '@/lib/astrologia/planetas/posicoes';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const AstrologyPositionsQuerySchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  hora: z.string().regex(/^\d{2}:\d{2}$/, 'Formato: HH:MM').optional().default('12:00'),
  latitude: z.string().regex(/^-?\d+\.?\d*$/, 'Latitude inválida'),
  longitude: z.string().regex(/^-?\d+\.?\d*$/, 'Longitude inválida'),
});
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = AstrologyPositionsQuerySchema.safeParse({
      data: searchParams.get('data'),
      hora: searchParams.get('hora'),
      latitude: searchParams.get('latitude'),
      longitude: searchParams.get('longitude'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { data: dataNascimento, hora: horaNascimento, latitude, longitude } = parseResult.data;
    const birthData = new Date(dataNascimento);
    if (isNaN(birthData.getTime())) {
      return NextResponse.json({
        error: 'Data inválida'
      }, { status: 400 });
    }
    const mapaNatal = calcularMapaNatal(
      birthData,
      horaNascimento,
      parseFloat(latitude),
      parseFloat(longitude)
    );
    const posicoes = Object.values(mapaNatal.planeta);
    return NextResponse.json({
      posicoes,
      casas: mapaNatal.casas,
      ascendente: mapaNatal.ascendente,
      mediumCoeli: mapaNatal.mediumCoeli,
      nodes: mapaNatal.nodes,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
      },
    });
  } catch (_error) {
    console.error('Erro calculando posições:', _error);
    return NextResponse.json({
      error: 'Erro ao calcular posições'
    }, { status: 500 });
  }
}