// src/app/api/mesa-real/dossier/[id]/route.ts
// SSE endpoint para geração streaming do dossiê completo (Doc 05 §5 + Doc 16 AD-12 §5).
// Loop 36 casas, reusa createHousePayload + LLM, persiste cumulativamente em Report.content.houses.
// Idempotente: reload retoma das casas já geradas. SSE: createSSEStream (heartbeat 30s).
import { NextRequest, NextResponse } from 'next/server';
import {
  buildHousePayload,
  buildSystemPrompt,
  type ClientMaps,
} from '@/lib/ai/dossier/oracle-prompt-builder';
import { requireOperator } from '@/lib/auth/operator-session';
import { prisma } from '@/lib/prisma';
import { createSSEStream } from '@/lib/sse';

type MatrixEntry = {
  carta: number;
  cartaName?: string;
  odu: number;
  oduName?: string;
};

type CumContent = {
  houses: Record<
    string,
    { interpretation: string; generatedAt: string; tokensUsed?: number | null }
  >;
};

// fallow-ignore-next-line complexity
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const op = await requireOperator(request);
  if (op instanceof NextResponse) return op;

  const { id: readingId } = await params;

  const reading = await prisma.reading.findUnique({
    where: { id: readingId },
    include: { client: true, report: true },
  });
  if (!reading) return new Response('Not found', { status: 404 });
  if (reading.operatorId !== op.id) return new Response('Forbidden', { status: 403 });

  const matrixData = (reading.matrixData ?? {}) as Record<string, MatrixEntry | null | undefined>;
  const existingContent = (reading.report?.content as CumContent | null) ?? null;
  const existingHouses = existingContent?.houses ?? {};

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
// fallow-ignore-next-line complexity
    async start(controller) {
      const { send, close } = createSSEStream(controller, encoder);
      const startMs = Date.now();
      let errors = 0;

      const clientMaps: ClientMaps = {
        fullName: reading.client.fullName,
        birthDate: reading.client.birthDate,
        birthCity: reading.client.birthCity ?? undefined,
        birthCountry: reading.client.birthCountry ?? undefined,
        astrologyMap: (reading.client.astrologyMap as Record<string, unknown> | null) ?? null,
        kabalisticMap: (reading.client.kabalisticMap as Record<string, unknown> | null) ?? null,
        tantricMap: (reading.client.tantricMap as Record<string, unknown> | null) ?? null,
        oduBirth: (reading.client.oduBirth as Record<string, unknown> | null) ?? null,
      };

      const systemPrompt = buildSystemPrompt();
      const apiKey = process.env.OPENAI_API_KEY;
      const llmModel = process.env.OPENAI_MODEL ?? 'gpt-4o';

      if (!apiKey) {
        send({ event: 'error', data: { casa: 0, message: 'OPENAI_API_KEY não configurada' } });
        send({
          event: 'done',
          data: { ok: false, total: 36, errors: 1, elapsed: Date.now() - startMs },
        });
        close();
        return;
      }

      const cumHouses: Record<
        string,
        { interpretation: string; generatedAt: string; tokensUsed?: number | null }
      > = {
        ...existingHouses,
      };

      for (let casa = 1; casa <= 36; casa++) {
        const entry = matrixData[String(casa)] ?? matrixData[casa];
        send({ event: 'progress', data: { casa, total: 36 } });

        if (!entry || !entry.carta || !entry.odu) {
          continue;
        }

        // Idempotência: casa já gerada → emite como cache
        if (existingHouses[String(casa)]) {
          const cached = existingHouses[String(casa)];
          send({
            event: 'house',
            data: {
              casa,
              houseName: `Casa ${casa}`,
              dossie: cached.interpretation,
              generatedAt: cached.generatedAt,
              cached: true,
            },
          });
          continue;
        }

        try {
          const userPayload = buildHousePayload(casa, entry, clientMaps);
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: llmModel,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(userPayload) },
              ],
              temperature: 0.7,
            }),
          });
          if (!res.ok) throw new Error(`LLM ${res.status}: ${await res.text()}`);
          const llmData = await res.json();
          const dossie: string = llmData.choices?.[0]?.message?.content ?? '';
          const tokensUsed: number | null = llmData.usage?.total_tokens ?? null;
          const generatedAt = new Date().toISOString();

          cumHouses[String(casa)] = { interpretation: dossie, generatedAt, tokensUsed };

          const newContent: CumContent = { houses: cumHouses };
          await prisma.report.upsert({
            where: { readingId },
            create: {
              readingId,
              content: newContent as object,
              llmModel,
              tokensUsed: tokensUsed ?? undefined,
            },
            update: { content: newContent as object, llmModel },
          });

          send({
            event: 'house',
            data: { casa, houseName: `Casa ${casa}`, dossie, generatedAt },
          });
        } catch (err) {
          errors++;
          send({
            event: 'error',
            data: { casa, message: err instanceof Error ? err.message : 'erro' },
          });
        }
      }

      send({
        event: 'done',
        data: { ok: true, total: 36, errors, elapsed: Date.now() - startMs },
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
