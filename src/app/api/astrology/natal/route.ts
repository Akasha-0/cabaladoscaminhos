import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calcularMapaNatal } from '@/lib/astrologia/planetas/posicoes';
import { calcularAspectos } from '@/lib/astrologia/planetas/aspectos';
import type { MapaNatal, Aspecto } from '@/lib/astrologia/tipos';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const NatalQuerySchema = z.object({
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  horaNascimento: z.string().regex(/^\d{2}:\d{2}$/, 'Formato: HH:MM').optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});
const NatalBodySchema = z.object({
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  horaNascimento: z.string().regex(/^\d{2}:\d{2}$/, 'Formato: HH:MM').optional().default('12:00'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  usuarioId: z.string().optional(),
});
interface NatalResponse {
  mapaNatal: MapaNatal;
  aspectos: Aspecto[];
}
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = NatalQuerySchema.safeParse({
      dataNascimento: searchParams.get('dataNascimento'),
      horaNascimento: searchParams.get('horaNascimento'),
      latitude: searchParams.get('latitude'),
      longitude: searchParams.get('longitude'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { dataNascimento, horaNascimento = '12:00', latitude, longitude } = parseResult.data;
    const mapaNatal = calcularMapaNatal(
      new Date(dataNascimento),
      horaNascimento,
      latitude,
      longitude
    );
    const posicoes = Object.values(mapaNatal.planeta);
    const aspectos = calcularAspectos(posicoes);
    return NextResponse.json({
      mapaNatal,
      aspectos,
    } as NatalResponse, {
      headers: {
        'Cache-Control': 'public, max-age=259200, stale-while-revalidate=604800',
      },
    });
  } catch (_error) {
    console.error('Erro calculando mapa natal:', _error);
    return NextResponse.json({
      error: 'Erro ao calcular mapa natal'
    }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = NatalBodySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { dataNascimento, horaNascimento = '12:00', latitude, longitude, usuarioId } = parseResult.data;
    const mapaNatal = calcularMapaNatal(
      new Date(dataNascimento),
      horaNascimento,
      latitude,
      longitude
    );
    if (usuarioId) {
      mapaNatal.usuarioId = usuarioId;
    }
    const posicoes = Object.values(mapaNatal.planeta);
    const aspectos = calcularAspectos(posicoes);
    return NextResponse.json({
      mapaNatal,
      aspectos,
    } as NatalResponse, {
      status: 201,
      headers: {
        'Cache-Control': 'public, max-age=259200, stale-while-revalidate=604800',
      },
    });
  } catch (_error) {
    console.error('Erro calculando mapa natal:', _error);
    return NextResponse.json({
      error: 'Erro ao calcular mapa natal'
    }, { status: 500 });
  }
}
    );

    if (usuarioId) {
      mapaNatal.usuarioId = usuarioId;
    }

    const posicoes = Object.values(mapaNatal.planeta);
    const aspectos = calcularAspectos(posicoes);

    return NextResponse.json({
      mapaNatal,
      aspectos,
    } as NatalResponse, {
      status: 201,
      headers: {
        'Cache-Control': 'public, max-age=259200, stale-while-revalidate=604800',
      },
    });
  } catch (_error) {
    console.error('Erro calculando mapa natal:', _error);
    return NextResponse.json({
      error: 'Erro ao calcular mapa natal'
    }, { status: 500 });
  }
}