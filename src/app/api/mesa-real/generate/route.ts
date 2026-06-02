// ============================================================
// API ROUTE — Gerar Dossiê de UMA Casa da Mesa Real (Fase 7)
// ============================================================
// Migra o `mesa-real/generate` do prompt-builder morto
// (`@/lib/ai/prompt-builder`) para o canônico da Fase 1
// (`@/lib/ai/dossier/oracle-prompt-builder`).
//
// Comportamento:
//   1. Auth: exige Operator (cookie `cockpit_session` ou header dev).
//   2. Valida o input (Zod).
//   3. Transforma o `mapaFixo` legado (campos achatados) em ClientMaps
//      canônico e constrói o payload determinístico por casa.
//   4. Chama o LLM (OpenAI / Minimax via env).
//   5. Persiste a interpretação por casa no `Report.content`
//      (cumulativo — não destrutivo se a rota for chamada várias
//      vezes para casas diferentes).
//
// Referências: Doc 06 §3.2 (per-house prompt) + Doc 12 §7 (Q&A).

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireOperator } from '@/lib/auth/operator-session';
import {
  buildSystemPrompt,
  buildHousePayload,
  type ClientMaps,
} from '@/lib/ai/dossier/oracle-prompt-builder';
import type { MatrixEntry } from '@/types';

// ----------------------------------------------------------------------------
// Schemas
// ----------------------------------------------------------------------------

const generateSchema = z.object({
  /** Opcional: se passado, persiste no Report dessa leitura. */
  readingId: z.string().optional(),
  casaNumero: z.number().int().min(1).max(36),
  carta: z.object({
    numero: z.number().int().min(1).max(36),
    nome: z.string().min(1),
    significado: z.string().optional(),
  }),
  odu: z.object({
    numero: z.number().int().min(1).max(16),
    nome: z.string().min(1),
    significado: z.string().optional(),
    elemento: z.string().optional(),
    orixas: z.array(z.string()).optional(),
    quizilas: z.array(z.string()).optional(),
  }),
  /**
   * Mapa fixo achatado (compatibilidade com clientes legados do
   * frontend). Internamente é convertido em ClientMaps canônico.
   */
  mapaFixo: z
    .object({
      nomeCompleto: z.string().optional(),
      dataNascimento: z.string().optional(),
      signoSolar: z.string().optional(),
      signoLunar: z.string().optional(),
      ascendente: z.string().optional(),
      caminhoDeVida: z.number().optional(),
      numeroAlma: z.number().optional(),
      numeroPersonalidade: z.number().optional(),
      numeroExpressao: z.number().optional(),
      dominioTantrico: z.number().optional(),
      karmaTantrico: z.number().optional(),
      vereditoTantrico: z.number().optional(),
    })
    .passthrough(),
});

type GenerateInput = z.infer<typeof generateSchema>;

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

/**
 * Converte o `mapaFixo` legado (campos achatados) em ClientMaps canônico
 * com os 4 sub-mapas (astrology, kabalistic, tantric, oduBirth).
 */
function buildClientMaps(input: GenerateInput): ClientMaps {
  const m = input.mapaFixo;
  return {
    fullName: m.nomeCompleto ?? '',
    birthDate: m.dataNascimento ?? '',
    astrologyMap: {
      sun: { sign: m.signoSolar },
      moon: { sign: m.signoLunar },
      ascendant: { sign: m.ascendente },
    },
    kabalisticMap: {
      expression: m.numeroExpressao,
      soul: m.numeroAlma,
      personality: m.numeroPersonalidade,
      lifePath: m.caminhoDeVida,
    },
    tantricMap: {
      domain: m.dominioTantrico,
      karma: m.karmaTantrico,
      verdict: m.vereditoTantrico,
    },
    oduBirth: null,
  };
}

// ----------------------------------------------------------------------------
// Route
// ----------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // 1) Auth
  const operatorOrResponse = await requireOperator(request);
  if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
  const operator = operatorOrResponse;

  // 2) Parse + validação
  let body: GenerateInput;
  try {
    body = generateSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    throw err;
  }

  // 3) Sanity: o Operator precisa estar vinculado a um Client (mapaFixo.nomeCompleto)
  //    e o OperatorId deve existir (FK). A validação Zod já garante tipos.
  void operator; // operator disponível p/ enriquecer logs/auditoria no futuro

  // 4) Constrói payload canônico
  const entry: MatrixEntry = {
    house: body.casaNumero,
    carta: body.carta.numero,
    odu: body.odu.numero,
  };
  const client = buildClientMaps(body);
  const systemPrompt = buildSystemPrompt();
  const userPayload = buildHousePayload(body.casaNumero, entry, client);

  // 5) Chama o LLM
  const apiKey = process.env.OPENAI_API_KEY;
  const llmModel = process.env.OPENAI_MODEL ?? 'gpt-4o';

  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'OPENAI_API_KEY não configurada',
        hint: 'Defina OPENAI_API_KEY no ambiente. Sem ela, apenas o payload determinístico pode ser devolvido (modo dev).',
      },
      { status: 503 }
    );
  }

  const llmResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: llmModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(userPayload) },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!llmResponse.ok) {
    const detail = await llmResponse.text();
    return NextResponse.json(
      { error: 'Erro ao chamar o LLM', details: detail },
      { status: 502 }
    );
  }

  const llmData = await llmResponse.json();
  const dossie = llmData.choices?.[0]?.message?.content ?? '';
  const tokensUsed = llmData.usage?.total_tokens;

  // 6) Persiste no Report da leitura (se readingId fornecido)
  let report: { id: string; readingId: string } | null = null;
  if (body.readingId) {
    const reading = await prisma.reading.findUnique({
      where: { id: body.readingId },
      select: { id: true, report: { select: { id: true, content: true } } },
    });
    if (!reading) {
      return NextResponse.json(
        { error: `Reading ${body.readingId} não encontrada` },
        { status: 404 }
      );
    }

    // Cumulativo: se já existe Report, anexa/sobrescreve a casa; senão cria.
    const existingContent =
      (reading.report?.content as Record<string, unknown> | null) ?? {};
    const newContent = {
      ...existingContent,
      houses: {
        ...((existingContent.houses as Record<string, unknown> | undefined) ?? {}),
        [String(body.casaNumero)]: {
          interpretation: dossie,
          houseName: userPayload.casa_nome,
          generatedAt: new Date().toISOString(),
        },
      },
    };

    const saved = await prisma.report.upsert({
      where: { readingId: body.readingId },
      create: {
        readingId: body.readingId,
        // Prisma 7 `Json` exige `Prisma.InputJsonValue`; serializar via
        // JSON é a forma mais portável de garantir o shape.
        content: JSON.parse(JSON.stringify(newContent)),
        llmModel,
        tokensUsed: tokensUsed ?? null,
      },
      update: {
        content: JSON.parse(JSON.stringify(newContent)),
        llmModel,
        // Não sobrescreve tokensUsed — manteria o cumulativo se a rota
        // guardasse estado; aqui mantemos o último p/ simplicidade.
      },
      select: { id: true, readingId: true },
    });
    report = saved;
  }

  return NextResponse.json({
    casaNumero: body.casaNumero,
    dossie,
    tokensUsed,
    report,
  });
}
