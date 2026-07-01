// ============================================================================
// POST /api/cron/consciousness-evolve — Dispara ciclo diário de evolução
// ============================================================================
// Agendado por Vercel Cron (vercel.json) ou serviço externo para rodar
// uma vez por dia (sugerido: 03:00 UTC, fora do pico de uso).
//
// Auth: header Authorization: Bearer ${CRON_SECRET}
//
// Fluxo:
//   1. runConsciousnessCycle() — agrega eventos + gera insights via LLM
//   2. evolveAkashicPrompt() — gera bloco de evolução para o system prompt
//   3. (Wave 30+) Aplica o bloco ao prompt ativo
//
// Por enquanto (Wave 29): apenas roda o ciclo e retorna relatório.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { runConsciousnessCycle, evolveAkashicPrompt } from '@/lib/consciousness/feedback-loop';

export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest): boolean {
  const provided = request.headers
    .get('authorization')
    ?.replace(/^Bearer\s+/i, '');
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[api/cron/consciousness-evolve] CRON_SECRET não definido; modo dev permissive'
      );
      return true;
    }
    return false;
  }
  return provided === expected;
}

async function runCycle() {
  const cycleResult = await runConsciousnessCycle();

  // Só gera prompt evolution se houve dados
  let promptEvolution: string | null = null;
  if (cycleResult.eventsAnalyzed > 0) {
    try {
      promptEvolution = await evolveAkashicPrompt();
    } catch (err) {
      console.warn(
        '[cron/consciousness-evolve] evolveAkashicPrompt falhou:',
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  return {
    ok: true,
    cycle: {
      ranAt: cycleResult.ranAt,
      periodStart: cycleResult.periodStart,
      periodEnd: cycleResult.periodEnd,
      eventsAnalyzed: cycleResult.eventsAnalyzed,
      insightsGenerated: cycleResult.insightsGenerated,
      insightsPersisted: cycleResult.insightsPersisted,
      degraded: cycleResult.degraded,
      reasons: cycleResult.reasons,
    },
    promptEvolutionLength: promptEvolution?.length ?? 0,
    promptEvolutionPreview: promptEvolution?.slice(0, 400) ?? null,
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
  }
  try {
    return NextResponse.json(await runCycle());
  } catch (err) {
    console.error('[api/cron/consciousness-evolve][GET] error', err);
    return NextResponse.json(
      { error: 'Erro ao processar ciclo de consciência' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}