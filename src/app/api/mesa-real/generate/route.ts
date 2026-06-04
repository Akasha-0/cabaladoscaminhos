// ============================================================
// API ROUTE — Gerar Dossiê Completo via SSE (AD-18.8)
// ============================================================
// Migra o `mesa-real/generate` do prompt-builder morto
// (`@/lib/ai/prompt-builder`) para o canônico da Fase 1
// (`@/lib/ai/dossier/oracle-prompt-builder`).
//
// Comportamento:
//   1. Auth: exige Operator (cookie `cockpit_session` ou header dev).
//   2. Valida o input (Zod).
//   3. Constrói o payload determinístico por casa.
//   4. Para cada casa preenchida: chama o LLM, emite `event: house` via SSE.
//   5. Ao final: emite `event: synthesis` + `event: done` via SSE.
//   6. Persiste a interpretação por casa no `Report.content`
//      (cumulativo — não destrutivo se a rota for chamada várias
//      vezes para casas diferentes).
//   7. Onda I.4: transiciona ReadingStatus PENDING → GENERATING → COMPLETED/ERROR.
//   8. AD-22.5: Verifica LLM_DAILY_TOKEN_BUDGET via Redis antes de processar.
//
// AD-22.5: Token budget check via Redis INCR on `llm:daily:tokens`.
//
// Referências: Doc 06 §3.2 (per-house prompt) + Doc 12 §7 (Q&A).
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildSystemPrompt,
  buildHousePayload,
  type ClientMaps,
} from '@/lib/ai/dossier/oracle-prompt-builder';
import { requireOperator } from '@/lib/auth/operator-session';
import { createLogger, generateRequestId, type AppLogger } from '@/lib/logging';
import { prisma } from '@/lib/prisma';
import { createSSEStream } from '@/lib/sse';
import { checkTokenBudget, incrementTokenUsage } from '@/lib/token-budget';

// ----------------------------------------------------------------------------
// Schemas
// ----------------------------------------------------------------------------

interface CasaData {
  carta: { numero: number; nome: string; significado: string } | null;
  odu: { numero: number; nome: string; significado: string } | null;
}

type MatrixData = Record<number, CasaData | null>;

const generateSchema = z.object({
  /**
   * Opcional: se passado, persiste no Report dessa leitura e usa o
   * Reading existente (criado via /api/mesa-real/save).
   * Se omitido, cria uma reading anônima em memória (sem persistência).
   */
  readingId: z.string().optional(),
  /**
   * Obrigatório: ID do cliente dono do mapa.
   * Usado para construir o ClientMaps canônico.
   */
  clientId: z.string().min(1, 'clientId é obrigatório'),
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
  /**
   * Matriz de 36 casas. Apenas casas com carta + odu são processadas.
   * Estrutura: { [houseNumber]: { carta: {...}, odu: {...} } | null }
   */
  matrixData: z.record(z.unknown()),
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
/**
 * Builds ClientMaps from DB-stored maps (AD-18.5/18.7).
 * Returns null when all DB maps are absent (legacy readings without stored maps).
 */
function buildClientMapsFromDb(dbMaps: {
  astrologyMap: unknown;
  kabalisticMap: unknown;
  tantricMap: unknown;
  oduBirth: unknown;
  fullName?: string;
  birthDate?: Date | string;
  birthCity?: string;
  birthCountry?: string;
}): ClientMaps | null {
  const hasMaps =
    dbMaps.astrologyMap != null ||
    dbMaps.kabalisticMap != null ||
    dbMaps.tantricMap != null ||
    dbMaps.oduBirth != null;
  if (!hasMaps) return null;
  return {
    fullName: dbMaps.fullName ?? '',
    birthDate:
      dbMaps.birthDate instanceof Date ? dbMaps.birthDate.toISOString() : (dbMaps.birthDate ?? ''),
    birthCity: dbMaps.birthCity,
    birthCountry: dbMaps.birthCountry,
    astrologyMap: (dbMaps.astrologyMap as Record<string, unknown>) ?? null,
    kabalisticMap: (dbMaps.kabalisticMap as Record<string, unknown>) ?? null,
    tantricMap: (dbMaps.tantricMap as Record<string, unknown>) ?? null,
    oduBirth: (dbMaps.oduBirth as Record<string, unknown>) ?? null,
  };
}

/**
 * Estrai casas preenchidas do matrixData (ordenadas por número da casa).
 */
function extractFilledHouses(matrixData: MatrixData): Array<{
  house: number;
  carta: { numero: number; nome: string };
  odu: { numero: number; nome: string };
}> {
  const filled: Array<{
    house: number;
    carta: { numero: number; nome: string };
    odu: { numero: number; nome: string };
  }> = [];

  for (const [key, value] of Object.entries(matrixData)) {
    const house = Number(key);
    if (!Number.isInteger(house) || house < 1 || house > 36 || !value?.carta || !value?.odu) {
      continue;
    }
    filled.push({
      house,
      carta: { numero: value.carta.numero, nome: value.carta.nome },
      odu: { numero: value.odu.numero, nome: value.odu.nome },
    });
  }

  return filled.sort((a, b) => a.house - b.house);
}

/**
 * Gera conteúdo de uma casa via LLM (OpenAI API, non-streaming).
 * Retorna o texto da interpretação e os tokens usados.
 */
async function generateHouseContent(
  house: number,
  carta: { numero: number; nome: string },
  odu: { numero: number; nome: string },
  client: ClientMaps,
  apiKey: string,
  llmModel: string,
  log: AppLogger,
): Promise<{ content: string; tokensUsed: number }> {
  const systemPrompt = buildSystemPrompt();
  const userPayload = buildHousePayload(
    house,
    { house, carta: carta.numero, odu: odu.numero },
    client
  );
  const temperature = 0.7;
  const maxTokens = 1500;
  const t0 = Date.now();
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
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
      temperature,
      max_tokens: maxTokens,
    }),
  });
  const durationMs = Date.now() - t0;
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`LLM error ${res.status}: ${detail}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  const tokensUsed = data.usage?.total_tokens ?? 0;
  log.info('llm.call', {
    house,
    model: llmModel,
    temperature,
    maxTokens,
    durationMs,
  });
  return { content, tokensUsed };
}

/**
 * Gera síntese final do dossiê via LLM (non-streaming).
 */
async function generateSynthesis(
  client: ClientMaps,
  houses: Array<{
    house: number;
    carta: { nome: string };
    odu: { nome: string };
    content: string;
  }>,
  apiKey: string,
  llmModel: string,
  log: AppLogger
): Promise<{ content: string; tokensUsed: number }> {
  const synthesisInstruction = `
## Instrução de Síntese

Com base nas interpretações das ${houses.length} casas preenchidas, gere uma síntese oracular com 4 capítulos e um veredicto final:

### 1. Arco Narrativo
Como a energia das cartas e Orixás se articulam nesta leitura?

### 2. Tensões e Oportunidades
Quais são os pontos de atrito e onde estão as forças?

### 3. Caminho Indicado
Qual é a direção espiritual sugerida?

### 4. Alerta Karmático
Quais padrões se repetem e merecem atenção?

### Veredicto Final
Uma sentença direta e protetora do Oráculo.

Responda em português, com linguagem mística e direta, segunda pessoa.
`;

  const housesSummary = houses
    .map((h) => `Casa ${h.house}: Carta ${h.carta.nome} | Orixá ${h.odu.nome}\n${h.content}`)
    .join('\n\n---\n\n');

  const temperature = 0.6;
  const maxTokens = 2000;
  const t0 = Date.now();
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: llmModel,
      messages: [
        {
          role: 'system',
          content: 'Você é o Oráculo Cigano Ramiro. Fale com clareza, proteção e sabedoria.',
        },
        {
          role: 'user',
          content: `${synthesisInstruction}\n\n## Casas Interpretadas\n\n${housesSummary}`,
        },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });
  const durationMs = Date.now() - t0;

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`LLM synthesis error ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  const tokensUsed = data.usage?.total_tokens ?? 0;

  log.info('llm.call', {
    house: 'synthesis',
    model: llmModel,
    temperature,
    maxTokens,
    durationMs,
  });

  return { content, tokensUsed };
}

// ----------------------------------------------------------------------------
// Route
// ----------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // 1) Auth
  const operatorOrResponse = await requireOperator(request);
  if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
  const operator = operatorOrResponse;

  // K.1: Structured logging
  const requestId = generateRequestId();
  const log = createLogger(requestId, '/api/mesa-real/generate');
  const startTime = Date.now();
  // 2) Parse + validação
  let body: GenerateInput;
  try {
    body = generateSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.errors[0];
      const fieldName = firstError?.path.join('.') ?? 'campo';
      const message = firstError?.message ?? 'inválido';
      return NextResponse.json(
        { error: `${fieldName}: ${message}`, details: err.flatten() },
        { status: 400 }
      );
    }
    throw err;
  }

  const matrixData = body.matrixData as MatrixData;
  const filledHouses = extractFilledHouses(matrixData);

  if (filledHouses.length === 0) {
    return NextResponse.json(
      { error: 'Nenhuma casa preenchida (carta + odu) no matrixData' },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const llmModel = process.env.OPENAI_MODEL ?? 'gpt-4o';

  // 3) AD-22.5: Verifica token budget antes de processar
  if (apiKey) {
    const budgetResult = await checkTokenBudget();
    if (!budgetResult.allowed) {
      log.warn('token.budget.exceeded', {
        operatorId: operator.id,
        budget: budgetResult.budget,
        used: budgetResult.used,
        limit: budgetResult.limit,
      });
      return NextResponse.json(
        {
          error: 'Token budget exceeded',
          code: 'BUDGET_EXCEEDED',
          details: {
            budget: budgetResult.budget,
            used: budgetResult.used,
            limit: budgetResult.limit,
          },
        },
        { status: 429 }
      );
    }
  }
  // AD-18.5/18.7: DB maps loaded when readingId is provided
  let dbClientMaps: ClientMaps | null = null;
  // 4) Cria Reading (PENDING) se readingId não fornecido
  let readingId = body.readingId;
  if (!readingId) {
    const client = await prisma.client.findUnique({
      where: { id: body.clientId },
      select: { id: true },
    });
    if (!client) {
      return NextResponse.json(
        { error: `Cliente ${body.clientId} não encontrado` },
        { status: 404 }
      );
    }

    const created = await prisma.reading.create({
      data: {
        clientId: body.clientId,
        operatorId: operator.id,
        matrixData: matrixData as object,
        status: 'PENDING',
      },
      select: { id: true },
    });
    readingId = created.id;
  } else {
    // Valida que a reading existe
    const existing = await prisma.reading.findUnique({
      where: { id: readingId },
      select: { id: true, status: true },
    });
    if (!existing) {
      return NextResponse.json({ error: `Reading ${readingId} não encontrada` }, { status: 404 });
    }
    // AD-18.9: Impede re-processamento de leituras já concluídas ou em curso
    if (existing.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Leitura já foi concluída', code: 'READING_ALREADY_COMPLETED' },
        { status: 409 }
      );
    }
    if (existing.status === 'GENERATING') {
      return NextResponse.json(
        { error: 'Leitura já está sendo gerada', code: 'READING_ALREADY_GENERATING' },
        { status: 409 }
      );
    }
    // AD-18.5/18.7: Fetch Client maps from DB when readingId is provided
    const readingWithClient = await prisma.reading.findUnique({
      where: { id: readingId },
      select: {
        client: {
          select: {
            fullName: true,
            birthDate: true,
            birthCity: true,
            birthCountry: true,
            astrologyMap: true,
            kabalisticMap: true,
            tantricMap: true,
            oduBirth: true,
          },
        },
      },
    });
    if (readingWithClient?.client) {
      dbClientMaps = buildClientMapsFromDb(
        readingWithClient.client as Parameters<typeof buildClientMapsFromDb>[0]
      );
    }
  }

  // 5) Transição PENDING → GENERATING
  await prisma.reading.update({
    where: { id: readingId },
    data: { status: 'GENERATING' },
  });

  // 6) SSE Stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const { send, close, abortController } = createSSEStream(controller, encoder, {
        timeoutMs: 300_000, // 5 min total ceiling — AD-22.7 (abort, never hang)
      });

      // AD-18.5/18.7: Use DB maps if available (readingId), fall back to mapaFixo body
      const client = dbClientMaps ?? buildClientMaps(body);

      let totalTokens = 0;
      const housesResults: Array<{
        house: number;
        carta: { nome: string };
        odu: { nome: string };
        content: string;
      }> = [];
      let finalStatus: 'COMPLETED' | 'ERROR' = 'COMPLETED';

      try {
        if (!apiKey) {
          // Modo dev: emite casas com placeholder, encerra
          for (const h of filledHouses) {
            send({
              event: 'house',
              data: {
                houseNumber: h.house,
                content: `[Dev] Interpretação da Casa ${h.house} (${h.carta.nome} / ${h.odu.nome}) — defina OPENAI_API_KEY para ativar o Oráculo.`,
              },
            });
            housesResults.push({
              house: h.house,
              carta: { nome: h.carta.nome },
              odu: { nome: h.odu.nome },
              content: `[Dev] Interpretação da Casa ${h.house}`,
            });
          }
          send({
            event: 'synthesis',
            data: { content: '[Dev] Síntese desativada — OPENAI_API_KEY não configurada.' },
          });
          send({
            event: 'done',
            data: { readingId, housesGenerated: filledHouses.length, totalTokens: 0 },
          });
          close();
          return;
        }

        // 6a) Gera cada casa e emite SSE por casa (flush imediato)
        for (const h of filledHouses) {
          try {
            const { content, tokensUsed } = await generateHouseContent(
              h.house,
              h.carta,
              h.odu,
              client,
              apiKey,
              llmModel,
              log,
            );

            // AD-22.5: Incrementa contador de tokens
            if (tokensUsed > 0) {
              await incrementTokenUsage(tokensUsed);
              totalTokens += tokensUsed;
            }

            // Emite SSE imediatamente (flush)
            send({
              event: 'house',
              data: {
                houseNumber: h.house,
                content,
              },
            });

            housesResults.push({
              house: h.house,
              carta: { nome: h.carta.nome },
              odu: { nome: h.odu.nome },
              content,
            });
          } catch (houseErr) {
            const msg = houseErr instanceof Error ? houseErr.message : String(houseErr);
            send({
              event: 'error',
              data: { houseNumber: h.house, message: `Erro na Casa ${h.house}: ${msg}` },
            });
            finalStatus = 'ERROR';
            break;
          }
        }

        // 6b) Gera síntese se todas as casas foram geradas
        if (finalStatus === 'COMPLETED' && housesResults.length > 0) {
          try {
            const { content: synthesisContent, tokensUsed: synthTokens } = await generateSynthesis(
              client,
              housesResults,
              apiKey,
              llmModel,
              log
            );

            if (synthTokens > 0) {
              await incrementTokenUsage(synthTokens);
              totalTokens += synthTokens;
            }

            send({ event: 'synthesis', data: { content: synthesisContent } });
          } catch (synthErr) {
            const msg = synthErr instanceof Error ? synthErr.message : String(synthErr);
            send({ event: 'error', data: { message: `Erro na síntese: ${msg}` } });
            finalStatus = 'ERROR';
          }
        }

        // 6c) Persiste no Report (se LLM gerou conteúdo)
        if (readingId && housesResults.length > 0) {
          try {
            const reading = await prisma.reading.findUnique({
              where: { id: readingId },
              select: { id: true, report: { select: { id: true, content: true } } },
            });

            const existingContent =
              (reading?.report?.content as Record<string, unknown> | null) ?? {};
            const newContent = {
              ...existingContent,
              houses: {
                ...((existingContent.houses as Record<string, unknown> | undefined) ?? {}),
                ...Object.fromEntries(
                  housesResults.map((hr) => [
                    String(hr.house),
                    {
                      interpretation: hr.content,
                      houseName: hr.carta.nome,
                      oduName: hr.odu.nome,
                      generatedAt: new Date().toISOString(),
                    },
                  ])
                ),
              },
            };

            await prisma.report.upsert({
              where: { readingId },
              create: {
                readingId,
                content: JSON.parse(JSON.stringify(newContent)),
                llmModel,
                tokensUsed: totalTokens,
              },
              update: {
                content: JSON.parse(JSON.stringify(newContent)),
                llmModel,
              },
            });
          } catch (persistErr) {
            // Best-effort: não falha o stream se persistência falhar
            console.error('[generate] Report persist error:', persistErr);
          }
        }

        // 6d) Done
        send({
          event: 'done',
          data: {
            readingId,
            housesGenerated: housesResults.length,
            totalTokens,
          },
        });
        close();
      } catch (err) {
        // Erro fatal no stream
        try {
          send({
            event: 'error',
            data: {
              message: err instanceof Error ? err.message : 'Erro interno no stream',
            },
          });
        } catch {
          /* stream may already be closed */
        }
        close();
      } finally {
        // 7) Transição GENERATING → COMPLETED/ERROR
        if (readingId) {
          await prisma.reading
            .update({
              where: { id: readingId },
              data: { status: finalStatus },
            })
            .catch(() => {
              /* best-effort */
            });
        }

        // K.2: Log business event (AD-22.4)
        const durationMs = Date.now() - startTime;
        log.info('dossier.generated', {
          operatorId: operator.id,
          readingId: readingId ?? null,
          tokens: totalTokens,
          llmModel,
          durationMs,
          housesAnalyzed: housesResults.length,
        });
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering for SSE
    },
  });
}
