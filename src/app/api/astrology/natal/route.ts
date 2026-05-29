import { NextRequest, NextResponse } from 'next/server';
import { calcularMapaNatal } from '@/lib/astrologia/planetas/posicoes';
import { calcularAspectos } from '@/lib/astrologia/planetas/aspectos';
import type { MapaNatal, Aspecto } from '@/lib/astrologia/tipos';

interface NatalRequest {
  dataNascimento: string;
  horaNascimento?: string;
  latitude: number;
  longitude: number;
  usuarioId?: string;
}

interface NatalResponse {
  mapaNatal: MapaNatal;
  aspectos: Aspecto[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dataNascimento = searchParams.get('dataNascimento');
    const horaNascimento = searchParams.get('horaNascimento') || '12:00';
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');

    if (!dataNascimento || !latitude || !longitude) {
      return NextResponse.json({
        error: 'Parâmetros obrigatórios: dataNascimento, latitude, longitude'
      }, { status: 400 });
    }

    const mapaNatal = calcularMapaNatal(
      new Date(dataNascimento),
      horaNascimento,
      parseFloat(latitude),
      parseFloat(longitude)
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
    const body: NatalRequest = await request.json();
    const { dataNascimento, horaNascimento = '12:00', latitude, longitude, usuarioId } = body;

    if (!dataNascimento || latitude === undefined || longitude === undefined) {
      return NextResponse.json({
        error: 'Campos obrigatórios: dataNascimento, latitude, longitude'
      }, { status: 400 });
    }

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