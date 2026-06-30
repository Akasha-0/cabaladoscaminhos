// ============================================================================
// POST /api/tts — Single-shot TTS endpoint (W72-D)
// ============================================================================
// Wave-Spawner Cycle 72 — Worker D.
//
// Accepts { text, tradition?, voice_id?, pitch?, speed? } and returns
// audio/mpeg bytes. Server-side text normalization (defense in depth —
// the client also normalizes). Hard cap 5000 chars per request.
//
// Health: GET /api/tts/health → 200 with { ok: true, version, mode }.
//
// Rate limit: 30 req / minute / IP (matches Akasha chat spirit). 429 on
// overflow. Per-UserAgent bypass for service workers (future).
//
// Streaming variant lives at /api/tts/stream (SSE).
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AKASHA_TRADITIONS, type Tradition } from '@/lib/tts/types';
import { getVoicePreset } from '@/lib/tts/voice-presets';
import { normalizeForTTS } from '@/lib/tts/text-normalizer';
import { auditAdapter, synthesizeSpeech } from '@/lib/tts/platform-tts-adapter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Rate limit (in-memory — good enough for dev / single-instance prod)
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30; // 30 req / min / IP
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true };
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count++;
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const TtsBodySchema = z.object({
  text: z.string().min(1).max(5000),
  tradition: z.enum(AKASHA_TRADITIONS).optional().nullable(),
  voice_id: z.string().min(1).max(64).optional(),
  pitch: z.number().int().min(-12).max(12).optional(),
  speed: z.number().min(0.5).max(2.0).optional(),
});

// ---------------------------------------------------------------------------
// GET /api/tts → health probe
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  if (url.pathname.endsWith('/health')) {
    return NextResponse.json({
      ok: true,
      version: 'w72-d.v1',
      mode: 'single-shot',
      adapter: auditAdapter(),
    });
  }
  return NextResponse.json(
    { ok: false, error: 'METHOD_NOT_ALLOWED', message: 'Use POST.' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

// ---------------------------------------------------------------------------
// POST /api/tts → audio bytes
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Rate limit.
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  const rl = rateLimit(ip);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: 'RATE_LIMITED',
        message: `Aguarde ${rl.retryAfter}s antes de pedir outro áudio.`,
      },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }

  // Parse + validate.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'TEXT_EMPTY', message: 'Body deve ser JSON válido.' },
      { status: 400 }
    );
  }
  const parsed = TtsBodySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    return NextResponse.json(
      {
        error: first?.path[0] === 'text' && first?.code === 'too_big' ? 'TEXT_TOO_LONG' : 'TEXT_EMPTY',
        message: first?.message ?? 'Payload inválido.',
      },
      { status: 400 }
    );
  }

  const { text, tradition, voice_id, pitch, speed } = parsed.data;
  const trad = (tradition ?? null) as Tradition | null;
  const preset = getVoicePreset(trad);
  const resolvedVoiceId = voice_id ?? preset.voice_id;

  // Normalize on the server (defense in depth).
  const normalized = normalizeForTTS(text, { maxChars: 5000 });
  if (!normalized) {
    return NextResponse.json(
      { error: 'TEXT_EMPTY', message: 'Texto vazio após normalização.' },
      { status: 400 }
    );
  }

  // Synthesize.
  try {
    const result = await synthesizeSpeech(normalized, {
      voice_id: resolvedVoiceId,
      pitch: pitch ?? preset.pitch,
      speed: speed ?? preset.speed,
      tradition: trad,
    });
    return new NextResponse(new Uint8Array(result.bytes), {
      status: 200,
      headers: {
        'content-type': 'audio/mpeg',
        'content-length': String(result.bytes.length),
        'cache-control': 'public, max-age=86400', // 1 day at CDN; client IndexedDB is the real cache
        'x-tts-voice': resolvedVoiceId,
        'x-tts-tradition': trad ?? 'cigano',
        'x-tts-source': result.source,
        'x-tts-elapsed-ms': String(result.elapsed_ms),
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: 'INTERNAL',
        message: err instanceof Error ? err.message : 'Falha ao sintetizar áudio.',
      },
      { status: 500 }
    );
  }
}
