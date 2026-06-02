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
import { type MatrixEntry } from '@/types';

type CumContent = {
  houses: Record<string, { interpretation: string; generatedAt: string; tokensUsed?: number | null }>;
};

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
    async start(controller) {
      const send = (chunk: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n`));
      };

      const close = () => {
        controller.enqueue(encoder.encode('data: [DONE]\n'));
        controller.close();
      };

      const startMs = Date.now();
      let errors = 0;

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30_000);

      const llmModel = 'gpt-4o-mini';
      const clientMaps: ClientMaps = {
        fullName: reading.client?.fullName ?? '',
        birthDate: reading.client?.birthDate ?? new Date(),
        birthCity: reading.client?.birthCity,
        birthCountry: reading.client?.birthCountry,
        astrologyMap: (reading.client?.astrologyMap as Record<string, unknown>) ?? null,
        kabalisticMap: (reading.client?.kabalisticMap as Record<string, unknown>) ?? null,
        tantricMap: (reading.client?.tantricMap as Record<string, unknown>) ?? null,
        oduBirth: (reading.client?.oduBirth as Record<string, unknown>) ?? null,
      };
      const systemPrompt = buildSystemPrompt();
      if (Object.keys(existingHouses).length === 0) {
        send({ event: 'start', data: { total: 36, model: llmModel, clientName: reading.client?.fullName } });
      }

      const cumHouses: Record<string, { interpretation: string; generatedAt: string; tokensUsed?: number | null }> = { ...existingHouses };

      for (let casa = 1; casa <= 36; casa++) {
        const entry = matrixData[String(casa)] ?? matrixData[casa];
        send({ event: 'progress', data: { casa, total: 36 } });

        if (!entry || !entry.carta || !entry.odu) continue;

        if (existingHouses[String(casa)]) {
          const cached = existingHouses[String(casa)];
          send({ event: 'house', data: { casa, houseName: `Casa ${casa}`, dossie: cached.interpretation, generatedAt: cached.generatedAt, cached: true } });
          continue;
        }

        try {
          const userPayload = buildHousePayload(casa, { house: casa, carta: entry.carta, odu: entry.odu }, clientMaps);
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}` },
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
            create: { readingId, content: newContent as object, llmModel, tokensUsed: tokensUsed ?? undefined },
            update: { content: newContent as object, llmModel },
          });

          send({ event: 'house', data: { casa, houseName: `Casa ${casa}`, dossie, generatedAt } });
        } catch (err) {
          errors++;
          send({ event: 'error', data: { casa, message: err instanceof Error ? err.message : 'erro' } });
        }
      }

      clearInterval(heartbeat);
      send({ event: 'done', data: { ok: errors === 0, total: 36, errors, elapsed: Date.now() - startMs } });
      close();
    },
  });

  return new NextResponse(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  });
}
