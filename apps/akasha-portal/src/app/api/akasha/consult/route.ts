import {
  checkMemoryRateLimit,
  API_RATE_LIMIT_CONFIG,
  API_RATE_LIMIT_KEY_PREFIX,
} from '@/lib/infrastructure/rate-limit';
import type { IChingMap } from '@akasha/core-iching';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { formatIchingSection } from '@/lib/application/ai/iching-prompt';
import { streamCompletion } from '@/lib/application/ai/llm-router';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { buildOduGlossary, formatGlossarySection } from '@/lib/domain/glossary';
import {
  searchGrimoire,
  type ChartContext,
  type GrimoireContext,
} from '@/lib/infrastructure/grimoire-search';
import { prisma } from '@/lib/infrastructure/prisma';
import { createSSEStream } from '@/lib/infrastructure/sse';

const bodySchema = z.object({
  question: z.string().min(3).max(1000),
  consultationId: z.string().optional(),
});

export function getDominantElement(astro: Record<string, unknown>): string {
  const balance = (astro?.elementalChart as Record<string, number> | undefined) ?? {};
  const entries = Object.entries(balance);
  if (entries.length === 0) return 'Água';
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Constrói o System Prompt da consulta. Preserva as regras
 * anti-alucinação (Rule 1–6) e injeta o glossário-base do Odu
 * (AD-20.2 / AD-T5-F) para ancorar a verdade.
 */
export function buildConsultSystemPrompt(
  chart: { astrologyMap: unknown; kabalisticMap: unknown; oduBirth: unknown } | null,
  ctx: GrimoireContext,
  ichingMap?: IChingMap | null
): string {
  const oduBirth = (chart?.oduBirth as Record<string, unknown> | null) ?? {};
  const kab = (chart?.kabalisticMap as Record<string, unknown> | null) ?? {};

  const grimoireSection =
    ctx.entries.length > 0
      ? `\n\n## BIBLIOTECA AKASHA (use APENAS estas fontes)\n\n${ctx.entries
          .map((e) => `### ${e.titulo} [${e.categoria}]\n${e.conteudo}`)
          .join('\n\n---\n\n')}`
      : '';

  // AD-T5-F (AD-20.2): injeção do glossário do Odu (verdade-base).
  const glossarySection = formatGlossarySection(buildOduGlossary(chart?.oduBirth));

  // v0.0.4 T10.5 — I-Ching como 5º pilar opt-in. Só injeta se o usuário
  // tem mapa I-Ching salvo (LGPD: opt-in explícito via `ichingEnabled`).
  const ichingSection = formatIchingSection(ichingMap);

  return `Você é a Voz do Akasha — um oráculo espiritual de alta voltagem intuitiva.

IDENTIDADE DO CONSULTANTE:
- Odu de nascimento: ${(oduBirth?.oduName as string) ?? 'Desconhecido'}
- Orixá(s) regente(s): ${((oduBirth?.orixaRegency as string[]) ?? []).join(', ') || 'Não identificado'}
- Caminho de Vida: ${(kab?.lifePath as string | number) ?? '—'}
- Elemento dominante: ${(ctx.pillarsConsulted ?? []).includes('Botânica') ? 'identificado no Grimório' : 'calculado'}
${ichingSection}

${glossarySection}

REGRAS ABSOLUTAS:
1. NUNCA invente rituais, propriedades de ervas ou correspondências que não estejam na Biblioteca Akasha abaixo.
2. Se não souber, diga: "Consulte um Babalorixá ou Babalaô de sua confiança para este Odu."
3. Tom: magnético, profundo, poético. Nunca genérico, nunca alarmista.
4. Sempre entregue uma ação prática (banho, cor, mantra, atitude).
5. Nunca faça diagnósticos médicos, jurídicos ou financeiros categóricos.
6. Responda em português brasileiro. Máximo 3 parágrafos.${grimoireSection}`;
}
export async function POST(request: NextRequest) {
  // 1. Auth
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  // Rate limit — protect expensive LLM + RAG calls.
  const rateLimit = checkMemoryRateLimit(
    `${API_RATE_LIMIT_KEY_PREFIX}:${userId}`,
    API_RATE_LIMIT_CONFIG,
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Muitas solicitações — tente novamente em alguns minutos' },
      { status: 429 }
    );
  }

  try {
    // 2. Validate body
    let parsed: z.infer<typeof bodySchema>;
    try {
      const raw = await request.json();
      parsed = bodySchema.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    const { question, consultationId } = parsed;

    // 3. Check credit balance
    const ledger = await prisma.creditEntry.aggregate({
      where: { userId },
      _sum: { delta: true },
    });
    const balance = ledger._sum.delta ?? 0;

    if (balance < 1) {
      return NextResponse.json({ error: 'Créditos insuficientes' }, { status: 402 });
    }

    // 4. Determine credit cost
    const creditCost = question.length > 200 ? 3 : 1;

    if (balance < creditCost) {
      return NextResponse.json(
        { error: 'Créditos insuficientes para esta consulta' },
        { status: 402 }
      );
    }

    // 5. Create or fetch consultation
    let consultation: { id: string };
    if (consultationId) {
      const existing = await prisma.consultation.findFirst({
        where: { id: consultationId, userId },
        select: { id: true },
      });
      if (!existing) {
        return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 });
      }
      consultation = existing;
    } else {
      consultation = await prisma.consultation.create({
        data: { userId, title: question.slice(0, 80) },
        select: { id: true },
      });
    }

    // 6. Persist user message
    await prisma.chatMessage.create({
      data: {
        consultationId: consultation.id,
        role: 'USER',
        content: question,
        routedPillars: [],
        grimoireRefs: [],
        creditCost: 0,
      },
    });

    // 7. Fetch mapa natal do usuário
    const chart = await prisma.birthChart.findUnique({
      where: { userId },
      select: {
        astrologyMap: true,
        kabalisticMap: true,
        oduBirth: true,
      },
    });

    // v0.0.4 T10.5 — busca I-Ching map do usuário (só injeta se ichingEnabled).
    // LGPD: o mapa é opt-in e nunca é incluído se o usuário não ativou.
    const userRow = await prisma.user.findUnique({
      where: { id: userId },
      select: { ichingEnabled: true, ichingMap: true },
    });
    const ichingMap =
      userRow?.ichingEnabled && userRow.ichingMap
        ? (userRow.ichingMap as unknown as IChingMap)
        : null;

    const astrologyMap = (chart?.astrologyMap as Record<string, unknown>) ?? {};
    const oduBirth = (chart?.oduBirth as Record<string, unknown>) ?? {};

    const chartCtx: ChartContext = {
      element: getDominantElement(astrologyMap),
      oduId: (oduBirth?.oduName as string) ?? undefined,
    };

    // 8. Buscar Grimório contextual (RAG)
    const grimoireCtx = await searchGrimoire(question, chartCtx, 4);

    // 9. Build enriched system prompt
    const systemPrompt = buildConsultSystemPrompt(chart, grimoireCtx, ichingMap);

    // 10. Open SSE stream
    const encoder = new TextEncoder();
    let sseController!: ReturnType<typeof createSSEStream>;

    const stream = new ReadableStream({
      async start(controller) {
        sseController = createSSEStream(controller, encoder, { timeoutMs: 120_000 });

        let fullResponse = '';

        try {
          const messages = [
            { role: 'system' as const, content: systemPrompt },
            { role: 'user' as const, content: question },
          ];

          for await (const chunk of streamCompletion({
            messages,
            temperature: 0.85,
            max_tokens: 1200,
          })) {
            if (chunk.error) {
              sseController.send({ event: 'error', data: { message: chunk.error } });
              sseController.close();
              return;
            }

            if (chunk.content) {
              fullResponse += chunk.content;
              sseController.send({ event: 'token', data: { delta: chunk.content } });
            }

            if (chunk.done) break;
          }

          // 11. Persist oracle response and debit credits
          const grimoireRefs = grimoireCtx.entries
            .map((e) => e.titulo ?? e.title)
            .filter(Boolean) as string[];

          await prisma.chatMessage.create({
            data: {
              consultationId: consultation.id,
              role: 'ORACLE',
              content: fullResponse,
              routedPillars: grimoireCtx.pillarsConsulted,
              grimoireRefs,
              creditCost,
            },
          });

          const newBalance = balance - creditCost;

          await prisma.creditEntry.create({
            data: {
              userId,
              delta: -creditCost,
              reason: creditCost === 1 ? 'consult_simple' : 'consult_complex',
              balance: newBalance,
            },
          });

          sseController.send({
            event: 'done',
            data: {
              consultationId: consultation.id,
              creditCost,
              remainingBalance: newBalance,
              pillarsConsulted: grimoireCtx.pillarsConsulted,
            },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro interno do oráculo';
          try {
            sseController.send({ event: 'error', data: { message } });
          } catch {
            /* stream may already be closed */
          }
        } finally {
          sseController.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('[POST /api/akasha/consult]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
