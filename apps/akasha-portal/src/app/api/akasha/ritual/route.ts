import {
  calculateCodeOfDay,
  buildRitual,
  type RitualConfig,
  type RitualResponse,
} from '@akasha/core';
import { NextRequest, NextResponse } from 'next/server';
import { getRitualConfig } from '@/lib/application/akasha/ritual-storage';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';

function calcularRitualDoDia(config: RitualConfig): RitualResponse {
  const agora = new Date();
  const timezone = config.timezone || 'America/Sao_Paulo';
  const { code } = calculateCodeOfDay(agora, timezone);
  return buildRitual(config, code);
}

export async function GET(request: NextRequest) {
  // 1. Autenticar
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  // 2. Buscar config do usuário
  const config = getRitualConfig(userId);
  if (!config) {
    return NextResponse.json(
      { error: 'Ritual não configurado. Use POST /api/akasha/ritual/config para configurar.' },
      { status: 404 }
    );
  }

  // 3. Calcular e retornar ritual
  const ritual = calcularRitualDoDia(config);
  return NextResponse.json(ritual);
}
