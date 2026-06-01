// ============================================================
// API — Interpretar uma Casa Específica
// ============================================================
// Recebe os dados da consulta + número da casa e devolve a
// interpretação estruturada daquela casa usando o Sistema de
// Delegação.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildSystemPromptForHouse, validateHouseReadiness } from '@/lib/divination/interpretive-agent';
import { getHouse } from '@/lib/divination/house-delegation';
import { createChatCompletion } from '@/lib/ai/openai';
import type { ConsultaInput, InterpretacaoCasa } from '@/lib/divination/house-types';

// ─── Zod Schema ───────────────────────────────────────────────────────────
const InterpretHouseSchema = z.object({
  consulta: z.object({
    consultaId: z.string(),
    cliente: z.object({
      nomeCompleto: z.string(),
      dataNascimento: z.string(),
      horaNascimento: z.string().optional(),
      localNascimento: z.string().optional(),
      ascendente: z.string().optional(),
      solSigno: z.string().optional(),
      luaSigno: z.string().optional(),
      venusSigno: z.string().optional(),
      marteSigno: z.string().optional(),
      mercurioSigno: z.string().optional(),
      jupiterSigno: z.string().optional(),
      saturnoSigno: z.string().optional(),
      uranoSigno: z.string().optional(),
      netunoSigno: z.string().optional(),
      plutaoSigno: z.string().optional(),
      lilithSigno: z.string().optional(),
      noduloNorteSigno: z.string().optional(),
      meioDoCeuSigno: z.string().optional(),
      caminhoDeVida: z.number().optional(),
      numeroAlma: z.number().optional(),
      numeroPersonalidade: z.number().optional(),
      numeroExpressao: z.number().optional(),
      numeroMotivacao: z.number().optional(),
      numeroDestino: z.number().optional(),
      numeroMissao: z.number().optional(),
      desafiosCarmicos: z.array(z.number()).optional(),
      donsDivinos: z.array(z.number()).optional(),
      dominioTantrico: z.string().optional(),
      numeroKarmaTantrico: z.number().optional(),
      vereditoTantrico: z.string().optional(),
      cruzamentosDestino: z.array(z.string()).optional(),
      ponto_vulnerabilidade: z.string().optional(),
      orixaRegente: z.string().optional(),
    }),
    cartasCiganas: z.array(
      z.object({
        casaId: z.number().int().min(1).max(36),
        nome: z.string().optional(),
        invertida: z.boolean().optional(),
        observacao: z.string().optional(),
      })
    ),
    odus: z.array(
      z.object({
        nome: z.string(),
        tipo: z.enum(['principal', 'complementar']),
        refrao: z.string().optional(),
        observacao: z.string().optional(),
      })
    ),
    spreadTipo: z.enum(['casa_unica', 'cruz_cigana', 'grande_consulta']),
    perguntaCliente: z.string().optional(),
    notasGabriel: z.string().optional(),
  }),
  casaId: z.number().int().min(1).max(36),
});

// ─── Schema da Resposta da IA ─────────────────────────────────────────────
const CasaInterpretSchema = z.object({
  significado: z.string(),
  cruzamentoCarta: z.string(),
  cruzamentoMapa: z.string(),
  direcaoPratica: z.string(),
  alerta: z.string(),
  tom: z.enum(['revelador', 'protetor', 'transformador', 'celebrativo']),
});

// ─── Handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = InterpretHouseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { consulta, casaId } = parsed.data;

    // 1. Validar que a casa existe
    const house = getHouse(casaId);
    if (!house) {
      return NextResponse.json(
        { error: 'CASA_NAO_ENCONTRADA', message: `Casa ${casaId} não existe` },
        { status: 404 }
      );
    }

    // 2. Validar que os inputs mínimos estão presentes
    const validation = validateHouseReadiness(house, consulta as ConsultaInput);
    if (!validation.ready) {
      return NextResponse.json(
        {
          error: 'DADOS_INSUFICIENTES',
          message: `Faltam dados para interpretar a casa ${casaId}`,
          missing: validation.missing,
          house: {
            number: house.number,
            cartaCigana: house.cartaCigana,
            tema: house.tema,
          },
        },
        { status: 422 }
      );
    }

    // 3. Montar o system prompt estruturado (com travas anti-mistura)
    const systemPrompt = buildSystemPromptForHouse(house, consulta as ConsultaInput);

    // 4. Chamar a IA
    const aiResponse = await createChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Interprete a Casa ${casaId} para o consulente.` },
      ],
      temperature: 0.75,
      max_tokens: 1500,
    });

    // 5. Parsear JSON da resposta
    let parsedResponse;
    try {
      const content = aiResponse.content.trim();
      // Remove markdown code blocks se existirem
      const cleanJson = content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsedResponse = CasaInterpretSchema.parse(JSON.parse(cleanJson));
    } catch (parseErr) {
      console.error('Falha ao parsear resposta da IA:', aiResponse.content);
      return NextResponse.json(
        {
          error: 'PARSE_ERROR',
          message: 'A IA não retornou JSON válido. Tente novamente.',
          raw: aiResponse.content,
        },
        { status: 502 }
      );
    }

    // 6. Montar resposta final
    const cartaCigana = consulta.cartasCiganas.find((c) => c.casaId === casaId);
    const oduPrincipal = consulta.odus.find((o) => o.tipo === 'principal');

    const interpretacao: InterpretacaoCasa = {
      casaId,
      cartaCigana: cartaCigana?.nome ?? house.cartaCigana,
      oduPrincipal: oduPrincipal?.nome ?? '',
      aspectosUsados: {
        astrologia: house.astrologia,
        numerologia: house.numerologia,
      },
      conteudo: parsedResponse,
      tom: parsedResponse.tom,
      geradoEm: new Date().toISOString(),
    };

    return NextResponse.json({
      ok: true,
      house: {
        number: house.number,
        cartaCigana: house.cartaCigana,
        tema: house.tema,
        bloco: house.bloco,
        corPrimaria: house.corPrimaria,
        corSecundaria: house.corSecundaria,
        icone: house.icone,
      },
      interpretacao,
      usage: aiResponse.usage,
    });
  } catch (error) {
    console.error('Erro ao interpretar casa:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
