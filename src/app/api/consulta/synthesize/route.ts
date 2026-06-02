// ============================================================
// API — Síntese Final dos 4 Pilares
// ============================================================
// Recebe as interpretações das 36 casas e gera a síntese final
// dividida nos 4 pilares, pronta para virar PDF / relatório
// premium para o cliente.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  PILLAR_TITLES,
  SYNTHESIS_PILLARS,
  buildVereditoCarmicoPrompt,
  getPromptForPillar,
} from '@/lib/divination/final-synthesis';
import { getHousesByPillar } from '@/lib/divination/house-delegation';
import { createChatCompletion } from '@/lib/ai/openai';
import { getHouse } from '@/lib/divination/house-delegation';
import type {
  ConsultaInput,
  InterpretacaoCasa,
  PilarResumo,
  SinteseFinal,
  SynthesisPillar,
} from '@/lib/divination/house-types';

// ─── Zod Schema ───────────────────────────────────────────────────────────
const InterpretacaoSchema = z.object({
  casaId: z.number().int().min(1).max(36),
  cartaCigana: z.string(),
  oduPrincipal: z.string(),
  aspectosUsados: z.object({
    astrologia: z.array(z.string()),
    numerologia: z.array(z.string()),
  }),
  conteudo: z.object({
    significado: z.string(),
    cruzamentoCarta: z.string(),
    cruzamentoMapa: z.string(),
    direcaoPratica: z.string(),
    alerta: z.string(),
  }),
  tom: z.enum(['revelador', 'protetor', 'transformador', 'celebrativo']),
  geradoEm: z.string(),
});

const SynthesizeSchema = z.object({
  consulta: z.any(), // reusa o schema da rota de interpretação
  interpretacoes: z.array(InterpretacaoSchema),
});

// ─── Schema da resposta de cada pilar ─────────────────────────────────────
const PilarResponseSchema = z.object({
  titulo: z.string(),
  casasUsadas: z.array(z.number()),
  resumoExecutivo: z.string(),
  pontosChave: z.array(z.string()).min(3).max(7),
  orientacaoPratica: z.string(),
  periodoFavoravel: z.string().optional(),
});

// ─── Handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SynthesizeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { consulta, interpretacoes } = parsed.data;
    const interpretacoesCompletas = interpretacoes as InterpretacaoCasa[];

    // 1. Para cada um dos 4 pilares, gerar a síntese
    const pilares: Record<SynthesisPillar, PilarResumo | null> = {
      trabalho_dinheiro: null,
      lar_familia: null,
      amor_relacionamentos: null,
      conselho_espiritual: null,
    };

    for (const pilar of SYNTHESIS_PILLARS) {
      const prompt = getPromptForPillar(pilar, interpretacoesCompletas);
      const titulo = PILLAR_TITLES[pilar];
      const casasUsadas = getHousesByPillar(pilar);

      const aiResponse = await createChatCompletion({
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Sintetize o pilar: ${titulo}` },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      });

      try {
        const cleanJson = aiResponse.content
          .trim()
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();
        const parsedPilar = PilarResponseSchema.parse(JSON.parse(cleanJson));
        pilares[pilar] = parsedPilar;
      } catch (parseErr) {
        console.error(`Falha ao parsear pilar ${pilar}:`, aiResponse.content);
        pilares[pilar] = {
          titulo,
          casasUsadas,
          resumoExecutivo: 'Não foi possível gerar este pilar.',
          pontosChave: [],
          orientacaoPratica: '',
        };
      }
    }

    // 2. Gerar o veredito cármico (Casa 36)
    let vereditoCarmico = '';
    const interpretacaoCasa36 = interpretacoesCompletas.find((i) => i.casaId === 36);
    if (interpretacaoCasa36) {
      vereditoCarmico = interpretacaoCasa36.conteudo.significado;
    } else {
      // Tentar gerar um veredito
      try {
        const prompt = buildVereditoCarmicoPrompt(consulta as ConsultaInput);
        if (prompt) {
          const aiResponse = await createChatCompletion({
            messages: [
              { role: 'system', content: prompt },
              { role: 'user', content: 'Gere o veredito cármico final.' },
            ],
            temperature: 0.8,
            max_tokens: 500,
          });
          vereditoCarmico = aiResponse.content;
        }
      } catch (err) {
        vereditoCarmico = '';
      }
    }

    // 3. Montar síntese final
    const sintese: SinteseFinal = {
      pilares: {
        trabalhoDinheiro: pilares.trabalho_dinheiro!,
        larFamilia: pilares.lar_familia!,
        amorRelacionamentos: pilares.amor_relacionamentos!,
        conselhoEspiritual: pilares.conselho_espiritual!,
      },
      vereditoCarmico,
      geradoEm: new Date().toISOString(),
    };

    return NextResponse.json({
      ok: true,
      sintese,
    });
  } catch (error) {
    console.error('Erro ao sintetizar:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
