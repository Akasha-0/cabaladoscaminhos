// ============================================================================
// POST /api/akashic/tts — server-side TTS for Akashic chat (Wave 19)
// ============================================================================
// Synthesizes mp3 audio for an Akashic response. Pluggable providers:
//   - google_cloud  (preferred when GOOGLE_TTS_API_KEY is set)
//   - google_free   (no-auth fallback; works in dev)
//   - elevenlabs    (premium voices when ELEVENLABS_API_KEY is set)
//
// Response: audio/mpeg stream. Cache header reflects cache-hit vs miss.
//
//   200 OK              — audio/mpeg bytes (cache hit or freshly synthesized)
//   400 Bad Request     — zod validation failed or empty text
//   413 Payload Too Large — text exceeds MAX_TEXT_CHARS
//   429 Too Many Requests — rate limit or upstream 429
//   500 Server Error   — unexpected
//   502 Bad Gateway    — upstream provider failed
//   503 Service Unavailable — no provider configured
//
// GET /api/akashic/tts — diagnostic (provider statuses + cache size).
//   Use ?purge=1 to lazy-clean entries older than 7 days.
//
// Defensive by design — every external call has a try/catch + timeout,
// and the client-side Web Speech API fallback in VoiceButton always works.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cache } from '@/lib/cache';
import {
  synthesizeWithFallback,
  getProviderStatuses,
  MAX_TEXT_CHARS,
  TtsProviderError,
} from '@/lib/tts/providers';
import { readTtsCache, writeTtsCache, purgeStaleTtsCache } from '@/lib/tts/cache';
import { checkRateLimit } from '@/lib/rate-limit';

// ----------------------------------------------------------------------------
// Next.js route config
// ----------------------------------------------------------------------------

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ----------------------------------------------------------------------------
// Zod schema
// ----------------------------------------------------------------------------

const TtsRequestSchema = z.object({
  text: z.string().min(1).max(MAX_TEXT_CHARS),
  voiceId: z.string().min(1).max(200).optional(),
  locale: z.enum(['pt-BR', 'en', 'es']).default('pt-BR'),
  rate: z.number().min(0.5).max(2.0).optional(),
  /** Force re-synthesize even if cache hit. Default false. */
  bypassCache: z.boolean().optional().default(false),
});

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

/** Per-IP rate limit: 30 requests / minute. Generous; one chat session is <5. */
function rateLimitOk(ip: string): { ok: boolean; remaining: number } {
  const r = checkRateLimit(ip, { windowMs: 60_000, maxRequests: 30 });
  return { ok: r.allowed, remaining: r.remaining };
}

// ----------------------------------------------------------------------------
// POST handler
// ----------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anon';
  const rl = rateLimitOk(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Too many TTS requests — slow down.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  // Body parse — defensive against malformed JSON.
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'bad_json', message: 'Body must be valid JSON.' },
      { status: 400 },
    );
  }

  const parsed = TtsRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'validation_failed',
        message: 'Invalid TTS request.',
        issues: parsed.error.issues.slice(0, 5),
      },
      { status: 400 },
    );
  }

  const { text, voiceId, locale, rate, bypassCache } = parsed.data;
  const effectiveVoiceId = voiceId ?? 'auto';

  // ─── Cache lookup (L1 memory + L2 disk) ───────────────────────────────
  if (!bypassCache) {
    const l1Key = `tts:${locale}:${effectiveVoiceId}:${text.length}:${text
      .slice(0, 64)
      .toLowerCase()}`;
    const l1 = cache.get<{ audioB64: string; entry: unknown }>(l1Key);
    if (l1) {
      return mp3Response(Buffer.from(l1.audioB64, 'base64'), {
        cache: 'HIT-L1',
        provider: 'cached',
      });
    }

    const l2 = await readTtsCache({ text, voiceId: effectiveVoiceId, locale });
    if (l2) {
      cache.set(l1Key, { audioB64: l2.audio.toString('base64'), entry: l2.entry }, 60_000);
      return mp3Response(l2.audio, {
        cache: 'HIT-L2',
        provider: l2.entry.provider,
      });
    }
  }

  // ─── Synthesize ───────────────────────────────────────────────────────
  try {
    const result = await synthesizeWithFallback(text, { locale, voiceId, rate });
    // Persist (best-effort) and respond.
    const entry = await writeTtsCache(
      { text, voiceId: effectiveVoiceId, locale },
      result.provider,
      result.audio,
    );
    return mp3Response(result.audio, {
      cache: 'MISS',
      provider: result.provider,
      voice: result.voiceId,
      bytes: entry.bytes,
    });
  } catch (err) {
    if (err instanceof TtsProviderError) {
      // Provide a clean 503 so the client falls back to Web Speech API.
      const status = err.status === 503 ? 503 : err.status === 400 ? 400 : 502;
      return NextResponse.json(
        {
          error: 'tts_unavailable',
          message: err.message,
          provider: err.provider,
          fallback: 'client',
        },
        { status },
      );
    }
    console.error('[tts] unexpected error:', err);
    return NextResponse.json(
      {
        error: 'internal',
        message: 'TTS failed unexpectedly — please retry.',
      },
      { status: 500 },
    );
  }
}

// ----------------------------------------------------------------------------
// GET handler — diagnostics
// ----------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  if (url.searchParams.get('purge') === '1') {
    const removed = await purgeStaleTtsCache();
    return NextResponse.json({ ok: true, removed });
  }
  return NextResponse.json({
    ok: true,
    mode: 'diagnostic',
    providers: getProviderStatuses(),
    maxTextChars: MAX_TEXT_CHARS,
    cacheTtlDays: 7,
  });
}

// ----------------------------------------------------------------------------
// Response builder
// ----------------------------------------------------------------------------

function mp3Response(
  audio: Buffer,
  meta: { cache: 'HIT-L1' | 'HIT-L2' | 'MISS'; provider: string; voice?: string; bytes?: number },
): NextResponse {
  return new NextResponse(audio, {
    status: 200,
    headers: {
      'content-type': 'audio/mpeg',
      'content-length': audio.length.toString(),
      // 7 days — same as disk TTL. Browser caches audio bytes.
      'cache-control': 'public, max-age=604800, immutable',
      'x-tts-cache': meta.cache,
      'x-tts-provider': meta.provider,
      ...(meta.voice ? { 'x-tts-voice': meta.voice } : {}),
      ...(meta.bytes ? { 'x-tts-bytes': meta.bytes.toString() } : {}),
    },
  });
}
