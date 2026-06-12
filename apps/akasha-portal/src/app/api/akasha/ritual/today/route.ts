import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { calculateCodeOfDay, buildRitual, type RitualConfig, type RitualResponse } from '@akasha/core';
import { getRitualConfig } from '@/lib/application/akasha/ritual-storage';

function getDefaultConfig(): RitualConfig {
  return {
    horario: '07:00',
    timezone: 'America/Sao_Paulo',
    componentes: {
      codigoDoDia: true,
      praticaPrincipal: true,
      quizilas: true,
      afirmacao: true,
    },
    ativo: true,
  };
}

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

  // 2. Buscar config ou usar default (não requer config prévia)
  const userId = authResult.id;
  const config = getRitualConfig(userId) ?? getDefaultConfig();

  // 3. Calcular ritual simplificado do dia
  const ritual = calcularRitualDoDia(config);

  return NextResponse.json(ritual);
}
