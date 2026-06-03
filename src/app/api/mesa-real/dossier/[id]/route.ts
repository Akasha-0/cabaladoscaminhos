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
  synthesis?: {
    chapters: Record<string, string>;
    vereditoFinal: string;
    generatedAt: string;
  };
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
        } catch (err) {
          send({ event: 'error', data: { message: `Casa ${casa}`, detail: err instanceof Error ? err.message : 'erro' } });
          errors++;
        }
      }
      // D5: Gerar Síntese (Doc 06 §3.2)
      const filledHousesForSynthesis = Object.keys(cumHouses).map((k) => parseInt(k, 10));
      if (filledHousesForSynthesis.length > 0) {
        const existingSynthesis = (reading.report?.content as CumContent | null)?.synthesis;
        if (!existingSynthesis) {
          const chapterHouses: Record<string, { casa: number; houseName: string; interpretation: string }[]> = {
            '1_trabalho_dinheiro': [],
            '2_lar_familia': [],
            '3_amor_relacionamentos': [],
            '4_conselho_espiritual': [],
          };
          const houseToChapter: Record<number, string> = {
            2: '1_trabalho_dinheiro',
            15: '1_trabalho_dinheiro',
            31: '1_trabalho_dinheiro',
            34: '1_trabalho_dinheiro',
            35: '1_trabalho_dinheiro',
            4: '2_lar_familia',
            5: '2_lar_familia',
            24: '3_amor_relacionamentos',
            25: '3_amor_relacionamentos',
            29: '3_amor_relacionamentos',
            30: '3_amor_relacionamentos',
            7: '3_amor_relacionamentos',
            16: '4_conselho_espiritual',
            36: '4_conselho_espiritual',
            26: '4_conselho_espiritual',
            9: '4_conselho_espiritual',
          };
          for (const casa of filledHousesForSynthesis) {
            const chapter = houseToChapter[casa] ?? '4_conselho_espiritual';
            chapterHouses[chapter].push({
              casa,
              houseName: 'Casa ' + casa,
              interpretation: cumHouses[String(casa)]?.interpretation ?? '',
            });
          }
          const chapterLines: string[] = [];
          const chapterOrder = ['1_trabalho_dinheiro', '2_lar_familia', '3_amor_relacionamentos', '4_conselho_espiritual'];
          const chapterLabels: Record<string, string> = {
            '1_trabalho_dinheiro': 'Capítulo 1 — Trabalho e Dinheiro',
            '2_lar_familia': 'Capítulo 2 — Lar e Família',
            '3_amor_relacionamentos': 'Capítulo 3 — Amor e Relacionamentos',
            '4_conselho_espiritual': 'Capítulo 4 — Conselho Espiritual',
          };
          let firstChapter = true;
          for (const ch of chapterOrder) {
            const houses = chapterHouses[ch];
            if (houses.length === 0) continue;
            if (!firstChapter) chapterLines.push('');
            chapterLines.push(chapterLabels[ch]);
            chapterLines.push('');
            for (const h of houses) {
              chapterLines.push('## ' + h.houseName);
              chapterLines.push('');
              chapterLines.push(h.interpretation);
              chapterLines.push('');
            }
            firstChapter = false;
          }
          const synthesisContext = chapterLines.join('\n');
          const synthesisPrompt = [
            'Você é o Oráculo da Cabala dos Caminhos. Analise a leitura completa abaixo e gere uma Síntese do Dossiê com:',
            '',
            '1. 4 capítulos temáticos (apenas os relevantes para as casas preenchidas):',
            '   * Capítulo 1 — Trabalho e Dinheiro',
            '   * Capítulo 2 — Lar e Família',
            '   * Capítulo 3 — Amor e Relacionamentos',
            '   * Capítulo 4 — Conselho Espiritual',
            '',
            '2. Veredito Final: um parágrafo que sintetiza a leitura como um todo.',
            '',
            'REGRAS:',
            '* Responda EM PORTUGUÊS.',
            '* Cada capítulo deve ter 2-3 parágrafos que sintetizam os insights das casas correspondentes.',
            '* O Veredito Final deve ser um único parágrafo que integra todos os capítulos.',
            '* Tom: místico-tecnológico e protetor, no espírito do Cigano Ramiro.',
            '* NUNCA invente informações fora das casas fornecidas.',
            '',
            'LEITURA:',
            synthesisContext,
            '',
            'SÍNTESE:',
          ].join('\n');
          try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (process.env.OPENAI_API_KEY ?? '') },
              body: JSON.stringify({
                model: llmModel,
                messages: [
                  { role: 'system', content: 'Você é o Oráculo da Cabala dos Caminhos.' },
                  { role: 'user', content: synthesisPrompt },
                ],
                temperature: 0.5,
              }),
            });
            if (res.ok) {
              const llmData = await res.json();
              const synthesisText = llmData.choices?.[0]?.message?.content ?? '';
              const generatedAt = new Date().toISOString();
              const newContent: CumContent = { houses: cumHouses, synthesis: { chapters: {}, vereditoFinal: synthesisText, generatedAt } };
              await prisma.report.upsert({
                where: { readingId },
                create: { readingId, content: newContent as object, llmModel },
                update: { content: newContent as object },
              });
              send({ event: 'synthesis', data: { synthesis: synthesisText, generatedAt } });
            }
          } catch (err) {
            send({ event: 'error', data: { message: 'síntese', detail: err instanceof Error ? err.message : 'erro' } });
          }
        } else {
          send({ event: 'synthesis', data: { synthesis: existingSynthesis.vereditoFinal, generatedAt: existingSynthesis.generatedAt, cached: true } });
        }
      }
      send({ event: 'done', data: { ok: errors === 0, total: 36, errors, elapsed: Date.now() - startMs } });
      close();

    },
  });

  return new NextResponse(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  });
}
