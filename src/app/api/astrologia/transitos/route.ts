import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calcularTrânsitosAtivos } from '@/lib/astrologia/trânsitos/calculator';
import { calcularMapaNatal } from '@/lib/astrologia/planetas/posicoes';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const TransitosQuerySchema = z.object({
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  horaNascimento: z.string().regex(/^\d{2}:\d{2}$/, 'Formato: HH:MM').optional().default('12:00'),
  latitude: z.string().regex(/^-?\d+\.?\d*$/, 'Latitude inválida'),
  longitude: z.string().regex(/^-?\d+\.?\d*$/, 'Longitude inválida'),
  dataAtual: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional(),
});
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams();
    const parseResult = TransitosQuerySchema.safeParse({
      dataNascimento: searchParams.get('dataNascimento'),
      horaNascimento: searchParams.get('horaNascimento'),
      latitude: searchParams.get('latitude'),
      longitude: searchParams.get('longitude'),
      dataAtual: searchParams.get('dataAtual'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { dataNascimento, horaNascimento, latitude, longitude, dataAtual } = parseResult.data;
    const mapaNatal = calcularMapaNatal(
      new Date(dataNascimento),
      horaNascimento,
      parseFloat(latitude),
      parseFloat(longitude)
    );
    const transitos = calcularTrânsitosAtivos(
      mapaNatal,
      dataAtual ? new Date(dataAtual) : new Date()
    );
    return NextResponse.json(
      { transitos },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (_error) {
    console.error('Erro calculando trânsitos:', _error);
    return NextResponse.json({
      error: 'Erro ao calcular trânsitos'
    }, { status: 500 });
  }
}