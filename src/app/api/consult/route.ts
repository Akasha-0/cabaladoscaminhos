// src/app/api/consult/route.ts
// SSE endpoint para Q&A ancorado em uma leitura (Doc 12 + Doc 05 §9).
// POST { readingId, consultationId?, question } → stream:
//   event: routing  → { themes, houses }
//   event: token    → { delta }
//   event: done     → { consultationId, routedThemes, routedHouses }
//   event: error    → { message }
// Persiste USER + ORACLE via addChatMessage.
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import {
  buildConsultContext,
  buildConsultSystemPrompt,
  buildConsultUserPayload,
} from '@/lib/ai/dossier/consult-context';
import { requireOperator } from '@/lib/auth/operator-session';
import {
  createConsultation,
  addChatMessage,
  getConsultContext,
} from '@/lib/db/consultation-actions';
import { prisma } from '@/lib/prisma';
import { createSSEStream } from '@/lib/sse';

export const dynamic = 'force-dynamic';

const consultSchema = z.object({
  readingId: z.string().min(1, 'readingId é obrigatório'),
  consultationId: z.string().optional(),
  question: z.string().min(1, 'A pergunta não pode ser vazia').max(2000),
});

type ConsultInput = z.infer<typeof consultSchema>;

// fallow-ignore-next-line complexity
export async function POST(request: NextRequest) {
  // 1) Auth (síncrono, antes do stream)
  const op = await requireOperator(request);
  if (op instanceof NextResponse) return op;
  const operator = op;

  // 2) Validação
  let body: ConsultInput;
  try {
    body = consultSchema.parse(await request.json());
  } catch (err) {
    const details = err instanceof z.ZodError ? err.flatten() : undefined;
    return NextResponse.json({ error: 'Validação falhou', details }, { status: 400 });
  }

  // 3) Carrega contexto do banco
  const consultContext = await getConsultContext(body.readingId);
  if (!consultContext) {
    return NextResponse.json(
      { error: `Reading ${body.readingId} não encontrada` },
      { status: 404 }
    );
  }

  // 4) Resolve/finds a Consultation
  let consultationId = body.consultationId;
  if (!consultationId) {
    const newConsultation = await createConsultation({
      readingId: body.readingId,
      operatorId: operator.id,
    });
    consultationId = newConsultation.id;
  } else {
    const existing = await prisma.consultation.findUnique({
      where: { id: consultationId },
      select: { id: true, readingId: true },
    });
    if (!existing || existing.readingId !== body.readingId) {
      return NextResponse.json({ error: 'consultationId inválido' }, { status: 400 });
    }
  }

  // 5) Persiste a pergunta do usuário
  await addChatMessage({ consultationId, role: 'USER', content: body.question });

  // 6) Monta contexto RAG-fechado
  const matrixAsString: Record<
    string,
    { carta: number; odu: number; cartaName?: string; oduName?: string }
  > = {};
  for (const [k, v] of Object.entries(consultContext.matrixData)) {
    matrixAsString[k] = v;
  }
  const reportHouses =
    (
      consultContext.report?.content as
        | { houses?: Record<string, { interpretation?: string; houseName?: string }> }
        | undefined
    )?.houses ?? undefined;

  const ragContext = buildConsultContext(
    body.question,
    {
      fullName: consultContext.client.fullName,
      birthDate: consultContext.client.birthDate,
      astrologyMap: consultContext.client.maps.astrology,
      kabalisticMap: consultContext.client.maps.kabala,
      tantricMap: consultContext.client.maps.tantric,
      oduBirth: consultContext.client.maps.oduBirth,
    },
    matrixAsString as Parameters<typeof buildConsultContext>[2],
    reportHouses
  );

  const systemPrompt = buildConsultSystemPrompt();
  const userPayload = buildConsultUserPayload(body.question, ragContext);
  const apiKey = process.env.OPENAI_API_KEY;
  const llmModel = process.env.OPENAI_MODEL ?? 'gpt-4o';

  // 7) Stream SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
// fallow-ignore-next-line complexity
    async start(controller) {
      const { send, close } = createSSEStream(controller, encoder);

      // 7a) Routing imediato
      send({
        event: 'routing',
        data: {
          themes: ragContext.routing.themes,
          houses: ragContext.routing.houses,
        },
      });

      if (!apiKey) {
        send({ event: 'error', data: { message: 'OPENAI_API_KEY não configurada' } });
        send({
          event: 'done',
          data: {
            consultationId,
            routedThemes: ragContext.routing.themes,
            routedHouses: ragContext.routing.houses,
            fullAnswer: '',
          },
        });
        close();
        return;
      }

      // 7b) LLM com stream=true
      let fullAnswer = '';
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: llmModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: JSON.stringify(userPayload) },
            ],
            temperature: 0.6,
            max_tokens: 1500,
            stream: true,
          }),
        });
        if (!res.ok || !res.body) {
          throw new Error(`LLM ${res.status}: ${await res.text()}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split('\n\n');
          buffer = chunks.pop() ?? '';
          for (const chunk of chunks) {
            const trimmed = chunk.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === '[DONE]') continue;
            try {
              const json = JSON.parse(payload);
              const delta: string | undefined = json.choices?.[0]?.delta?.content;
              if (delta) {
                fullAnswer += delta;
                send({ event: 'token', data: { delta } });
              }
            } catch {
              /* ignore malformed */
            }
          }
        }
      } catch (err) {
        send({
          event: 'error',
          data: { message: err instanceof Error ? err.message : 'Erro ao chamar o LLM' },
        });
      }

      // 7c) Persiste ORACLE
      if (fullAnswer) {
        try {
          await addChatMessage({
            consultationId,
            role: 'ORACLE',
            content: fullAnswer,
            routedThemes: ragContext.routing.themes,
            routedHouses: ragContext.routing.houses,
          });
        } catch {
          /* não falhar o stream se persistência falhar */
        }
      }

      // 7d) Done
      send({
        event: 'done',
        data: {
          consultationId,
          routedThemes: ragContext.routing.themes,
          routedHouses: ragContext.routing.houses,
          fullAnswer,
        },
      });
      close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
