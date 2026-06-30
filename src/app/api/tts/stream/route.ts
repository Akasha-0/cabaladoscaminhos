// ============================================================================
// POST /api/tts/stream — SSE TTS stream (W72-D)
// ============================================================================
// Wave-Spawner Cycle 72 — Worker D.
//
// Streams audio chunks as they're synthesized, sentence by sentence. The
// client (useTtsStream) appends chunks to a single <audio> blob via
// MediaSource — or, simpler: appends base64 chunks and plays them
// sequentially (each chunk is a complete mp3 frame in this stub).
//
// Wire format (SSE):
//
//   event: meta      data: { voice_id, tradition, sentence_count }
//   event: chunk     data: { index, audio: "<base64>", bytes, normalized_text, voice_id }
//   event: done      data: { total_chunks, total_bytes, elapsed_ms }
//   event: error     data: { code, message }
//
// Heartbeat every 5s while idle (no chunks yet) to keep proxies happy.
// ============================================================================

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { AKASHA_TRADITIONS, type Tradition } from '@/lib/tts/types';
import { getVoicePreset } from '@/lib/tts/voice-presets';
import { normalizeForTTS, splitSentences } from '@/lib/tts/text-normalizer';
import { synthesizeSpeechStream } from '@/lib/tts/platform-tts-adapter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const StreamBodySchema = z.object({
  text: z.string().min(1).max(5000),
  tradition: z.enum(AKASHA_TRADITIONS).optional().nullable(),
  voice_id: z.string().min(1).max(64).optional(),
  pitch: z.number().int().min(-12).max(12).optional(),
  speed: z.number().min(0.5).max(2.0).optional(),
  /** Optional pre-split sentences. When set, server skips its own split. */
  preSplitSentences: z.array(z.string().min(1).max(1000)).max(50).optional(),
});

// ---------------------------------------------------------------------------
// POST /api/tts/stream → text/event-stream
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'TEXT_EMPTY', message: 'Body deve ser JSON válido.' }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }
  const parsed = StreamBodySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return new Response(
      JSON.stringify({
        error: 'TEXT_EMPTY',
        message: first?.message ?? 'Payload inválido.',
      }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }

  const { text, tradition, voice_id, pitch, speed, preSplitSentences } = parsed.data;
  const trad = (tradition ?? null) as Tradition | null;
  const preset = getVoicePreset(trad);
  const resolvedVoiceId = voice_id ?? preset.voice_id;

  const normalized = normalizeForTTS(text, { maxChars: 5000 });
  if (!normalized) {
    return new Response(
      JSON.stringify({ error: 'TEXT_EMPTY', message: 'Texto vazio após normalização.' }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }

  const sentences =
    preSplitSentences && preSplitSentences.length > 0
      ? preSplitSentences
      : splitSentences(normalized);

  if (sentences.length === 0) {
    return new Response(
      JSON.stringify({ error: 'TEXT_EMPTY', message: 'Nenhuma frase detectada.' }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }

  const encoder = new TextEncoder();
  const start = Date.now();
  let totalBytes = 0;
  let totalChunks = 0;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          /* client disconnected */
        }
      };

      // Heartbeat to keep proxies alive.
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 5_000);

      try {
        send('meta', {
          voice_id: resolvedVoiceId,
          tradition: trad ?? 'cigano',
          sentence_count: sentences.length,
        });

        let index = 0;
        for await (const result of synthesizeSpeechStream(sentences, {
          voice_id: resolvedVoiceId,
          pitch: pitch ?? preset.pitch,
          speed: speed ?? preset.speed,
          tradition: trad,
        })) {
          // Base64-encode the bytes for safe SSE transport.
          const b64 = bytesToBase64(result.bytes);
          totalBytes += result.bytes.length;
          totalChunks++;
          send('chunk', {
            index,
            audio: b64,
            bytes: result.bytes.length,
            normalized_text: sentences[index] ?? '',
            voice_id: result.voice_id,
            source: result.source,
          });
          index++;
        }

        send('done', {
          total_chunks: totalChunks,
          total_bytes: totalBytes,
          elapsed_ms: Date.now() - start,
        });
      } catch (err) {
        send('error', {
          code: 'ADAPTER_UNAVAILABLE',
          message: err instanceof Error ? err.message : 'Falha no stream.',
        });
      } finally {
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    },
  });
}

// ---------------------------------------------------------------------------
// base64 encoder (Node + edge safe)
// ---------------------------------------------------------------------------

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  // btoa is available in edge runtimes.
  if (typeof btoa !== 'undefined') return btoa(bin);
  // Last-ditch: manual base64.
  return manualBase64(bin);
}

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function manualBase64(bin: string): string {
  let out = '';
  for (let i = 0; i < bin.length; i += 3) {
    const a = bin.charCodeAt(i);
    const b = i + 1 < bin.length ? bin.charCodeAt(i + 1) : 0;
    const c = i + 2 < bin.length ? bin.charCodeAt(i + 2) : 0;
    out += B64_CHARS[a >> 2];
    out += B64_CHARS[((a & 3) << 4) | (b >> 4)];
    out += i + 1 < bin.length ? B64_CHARS[((b & 15) << 2) | (c >> 6)] : '=';
    out += i + 2 < bin.length ? B64_CHARS[c & 63] : '=';
  }
  return out;
}
