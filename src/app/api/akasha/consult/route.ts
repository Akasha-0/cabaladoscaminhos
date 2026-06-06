import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAkashaApi } from '@/lib/auth/akasha-guard';
import { prisma } from '@/lib/prisma';
import { streamCompletion } from '@/lib/ai/llm-router';
import { createSSEStream } from '@/lib/sse';

const bodySchema = z.object({
  question: z.string().min(3).max(1000),
  consultationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // 1. Auth
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

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
  const ledger = await prisma.akashaCreditEntry.aggregate({
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
    return NextResponse.json({ error: 'Créditos insuficientes para esta consulta' }, { status: 402 });
  }

  // 5. Create or fetch consultation
  let consultation: { id: string };
  if (consultationId) {
    const existing = await prisma.akashaConsultation.findUnique({
      where: { id: consultationId, userId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Consulta não encontrada' }, { status: 404 });
    }
    consultation = existing;
  } else {
    consultation = await prisma.akashaConsultation.create({
      data: { userId, title: question.slice(0, 80) },
      select: { id: true },
    });
  }

  // 6. Persist user message
  await prisma.akashaChatMessage.create({
    data: {
      consultationId: consultation.id,
      role: 'USER',
      content: question,
      routedPillars: [],
      grimoireRefs: [],
      creditCost: 0,
    },
  });

  // 7. Fetch grimoire context
  const grimoireEntries = await prisma.grimoireEntry.findMany({
    where: { biblioteca: 'akasha' },
    take: 3,
    select: { slug: true, categoria: true, conteudo: true },
  });

  const grimoireContext = grimoireEntries.length > 0
    ? grimoireEntries.map((e) => `[${e.categoria}] ${e.conteudo.slice(0, 300)}`).join('\n---\n')
    : 'Nenhum fragmento do Grimório disponível.';

  // 8. Build user context from birth chart
  const user = await prisma.akashaUser.findUnique({
    where: { id: userId },
    select: {
      fullName: true,
      birthDate: true,
      birthCity: true,
      birthChart: {
        select: {
          astrologyMap: true,
          kabalisticMap: true,
        },
      },
    },
  });

  let birthChartInfo = 'Mapa natal não calculado.';
  if (user?.birthChart) {
    const astro = user.birthChart.astrologyMap as Record<string, unknown> | null;
    const kab = user.birthChart.kabalisticMap as Record<string, unknown> | null;
    const parts: string[] = [];
    if (astro && typeof astro === 'object') {
      if (astro.sunSign) parts.push(`Sol: ${astro.sunSign}`);
      if (astro.moonSign) parts.push(`Lua: ${astro.moonSign}`);
      if (astro.ascendant) parts.push(`Asc: ${astro.ascendant}`);
    }
    if (kab && typeof kab === 'object') {
      if (kab.lifePathNumber) parts.push(`Caminho de Vida: ${kab.lifePathNumber}`);
      if (kab.destinyNumber) parts.push(`Destino: ${kab.destinyNumber}`);
    }
    if (parts.length > 0) birthChartInfo = parts.join(', ');
  }

  const userContext = `Nome: ${user?.fullName ?? 'Peregrino'} | Cidade natal: ${user?.birthCity ?? 'desconhecida'} | ${birthChartInfo}`;

  const systemPrompt = `Você é o Akasha, oráculo vivo de tecnologia espiritual.
Você integra Astrologia, Numerologia Cabalística, Numerologia Tântrica e Odus de Nascimento.
Nunca invente rituais ou correspondências — use apenas o que foi fornecido no contexto do Grimório.
Responda em português brasileiro, com voz magnética, profunda e poética.
Seja direto e prático — entregue sempre uma ação (banho, cor, mantra, alerta).
Máximo 3 parágrafos.
[DADOS DO USUÁRIO]:
${userContext}
[GRIMÓRIO]:
${grimoireContext}`;

  // 9. Open SSE stream
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

        for await (const chunk of streamCompletion({ messages, temperature: 0.85, max_tokens: 1200 })) {
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

        // 10. Persist oracle response and debit credits
        const grimoireRefs = grimoireEntries.map((e) => e.slug);

        await prisma.akashaChatMessage.create({
          data: {
            consultationId: consultation.id,
            role: 'ORACLE',
            content: fullResponse,
            routedPillars: [],
            grimoireRefs,
            creditCost,
          },
        });

        const newBalance = balance - creditCost;

        await prisma.akashaCreditEntry.create({
          data: {
            userId,
            delta: -creditCost,
            reason: creditCost === 1 ? 'consult_simple' : 'consult_complex',
            balance: newBalance,
          },
        });

        sseController.send({
          event: 'done',
          data: { consultationId: consultation.id, creditCost, remainingBalance: newBalance },
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
}
