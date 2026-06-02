import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { gerarMapaAlmaCompleto } from '@/lib/engines/spiritual-engine';
import { generateMapaInsights } from '@/lib/ai/mapa-insights/generator';
import type { InsightData } from '@/lib/ai/mapa-insights/types';

// Reuse mapa schema from parent route
const mapaSchema = z.object({
  nomeCompleto: z.string().min(2).max(200),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  pais: z.string().optional(),
});

type MapaInput = z.infer<typeof mapaSchema>;

// ============================================================
// POST — generate AI insights from MapaAlmaCompleto
// ============================================================

// fallow-ignore-next-line complexity
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate body
    const body = await request.json() as unknown;
    const parsed = mapaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { nomeCompleto, dataNascimento, hora, cidade, estado, pais } = parsed.data as MapaInput;

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
