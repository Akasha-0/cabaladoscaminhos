import { NextResponse } from 'next/server';

// ============================================================================
// Mock SSE endpoint (W94-A demo)
// ============================================================================
// Cycle 94 · 2026-06-30
// Streams 50 tokens over ~3s for the streaming-demo page. Format:
//
//   data: {"delta":"..."} \n
//   \n
//   data: {"delta":"..."} \n
//   \n
//   data: [DONE]\n
//   \n
//
// Sacred terms (orixás, Iemanjá, Cigano Ramiro, axé, Odus, Akasha) flow
// through the stream unchanged. No PII appears in mock content — the
// engine's LGPD layer is exercised with metadata in `parseJSONChunk`.
//
// CRITICAL: Node's runtime must keep the response readable — we return a
// NextResponse with a ReadableStream body. Next 14+ supports this for
// route handlers via the underlying Web Fetch runtime.
// ============================================================================

const SACRED_TOKENS: readonly string[] = [
  'A Akasha ',
  'consulta os ',
  'orixás. ',
  'Cada Odu ',
  'traz um ',
  'ensinamento. ',
  'Iemanjá ',
  'preside os ',
  'mares — ',
  'nada se ',
  'move sem ',
  'seu axé. ',
  'Cigano Ramiro ',
  'guia esta ',
  'leitura ',
  'pelos ',
  '36 caminhos ',
  'da Mesa Real. ',
  'Oxum beija ',
  'as ondas ',
  'doces. ',
  'Ogum abre ',
  'os caminhos. ',
  'Xangô ',
  'governa o ',
  'fogo da ',
  'justiça. ',
  'Oxalá ',
  'sopra ',
  'a palavra ',
  'criadora. ',
  'Nanã ',
  'guarda ',
  'as águas ',
  'antigas. ',
  'Exu abre ',
  'as encruzilhadas. ',
  'Os Odus se ',
  'manifestam ',
  'neste ',
  'momento. ',
  'Pomba Gira ',
  'ilumina o ',
  'cruzamento. ',
  'Feitiço não é ',
  'magia — ',
  'é medicina ',
  'da palavra. ',
  'Cabala, ',
  'Astrologia ',
  'e Candomblé ',
  'caminham juntos. ',
];

const STREAM_INTERVAL_MS = 60;
const TOTAL_MS = 3000;

export async function GET(request: Request): Promise<Response> {
  // Next 14+ route handlers run on the edge-compatible runtime. For a
  // streaming response we use a Web ReadableStream — Next/Fetch both
  // support this natively.
  const encoder = new TextEncoder();
  const url = new URL(request.url);
  const requestedCount = Number(url.searchParams.get('count') ?? '0');
  const tokenCount = Number.isInteger(requestedCount) && requestedCount > 0 && requestedCount <= 200
    ? requestedCount
    : SACRED_TOKENS.length;

  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const startAt = Date.now();
      let i = 0;
      while (!cancelled && i < tokenCount) {
        const elapsed = Date.now() - startAt;
        if (elapsed > TOTAL_MS && i > 0) break;
        const next = SACRED_TOKENS[i % SACRED_TOKENS.length];
        if (next === undefined) break;
        const payload = `data: ${JSON.stringify({ delta: next })}\n\n`;
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          cancelled = true;
          break;
        }
        i += 1;
        await new Promise((r) => setTimeout(r, STREAM_INTERVAL_MS));
      }
      try {
        controller.enqueue(encoder.encode('data: {"metadata":{"tradition":"Candomblé"}}\n\n'));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch {
        // controller already closed — nothing to do
      }
    },
    cancel() {
      cancelled = true;
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Surface the helper as the default export so Next.js picks the GET route
// and any other tools see it.
export default { GET };
