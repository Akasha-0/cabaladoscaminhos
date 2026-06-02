import { NextRequest, NextResponse } from 'next/server';
import { gerarMapaAlmaCompleto } from '@/lib/engines/spiritual-engine';
import { generateMapaInsights } from '@/lib/ai/mapa-insights/generator';
import type { InsightData } from '@/lib/ai/mapa-insights/types';
import { parseMapaBody, type MapaInput } from '@/lib/mapa/mapa-utils';

// ============================================================
// POST — generate AI insights from MapaAlmaCompleto
// ============================================================

// fallow-ignore-next-line complexity
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate body
    const parsed = await parseMapaBody(request);
    if (parsed.error) {
      return NextResponse.json(parsed.error.body, { status: parsed.error.status });
    }

    const { nomeCompleto, dataNascimento, hora, cidade, estado, pais } = parsed.data;

    // 2. Build BirthProfile from input
    const profile = {
      nomeCompleto,
      dataNascimento,
      hora: hora ?? undefined,
      cidade: cidade ?? '',
      estado: estado ?? '',
      pais: pais ?? '',
    };

    // 3. Generate MapaAlmaCompleto
    let mapa;
    try {
      mapa = await gerarMapaAlmaCompleto(profile);
    } catch (mapaErr) {
      console.error('[mapa/insights] Error generating mapa:', mapaErr);
      return NextResponse.json(
        { error: 'Erro ao gerar Mapa da Alma' },
        { status: 500 }
      );
    }

    // 4. Generate AI insights
    let result;
    try {
      result = await generateMapaInsights(mapa);
    } catch (aiErr) {
      console.error('[mapa/insights] AI generation error:', aiErr);

      // Fallback: try without cache
      try {
        result = await generateMapaInsights(mapa, { usarCache: false });
        return NextResponse.json(
          {
            insight: result.insight,
            fromCache: result.fromCache,
            dataGeracao: result.insight.dataGeracao,
            warning: 'Fallback gerado devido a erro na API de IA',
          } as const,
          { status: 200 }
        );
      } catch {
        // Give up
        return NextResponse.json(
          { error: 'Erro ao gerar insights de IA' },
          { status: 500 }
        );
      }
    }

    // 5. Return successful response
    return NextResponse.json(
      {
        insight: result.insight,
        fromCache: result.fromCache,
        dataGeracao: result.insight.dataGeracao,
      } as const,
      { status: 200 }
    );
  } catch (err) {
    console.error('[mapa/insights] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Erro interno ao processar requisição' },
      { status: 500 }
    );
  }
}
