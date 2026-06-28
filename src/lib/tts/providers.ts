// ============================================================================
// TTS providers (Wave 19 — 2026-06-28)
// ============================================================================
// Three pluggable adapters — `synthesize(text, opts)` returns mp3 bytes or
// throws `TtsProviderError`. The route layer picks the first one whose
// required env vars are present.
//
// Providers (cheapest → most natural):
//   1. google_free  — public Google Translate TTS endpoint. No API key.
//                      Mp3, limited to ~200 chars/request. Cheap. Good for dev.
//   2. google_cloud — official @google-cloud/text-to-speech. Needs
//                      GOOGLE_TTS_API_KEY (REST key) or service-account JSON.
//                      Neural voices, all locales, free tier 4M chars/mo.
//   3. elevenlabs   — eleven-multilingual-v2. Best quality for pt-BR.
//                      Needs ELEVENLABS_API_KEY. 10k chars/mo free.
//
// This module deliberately ships ZERO SDK dependencies — every provider is
// a thin fetch() wrapper. Keeps the cold-start fast and the install surface
// empty when no key is configured.
// ============================================================================

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export type TtsLocale = 'pt-BR' | 'en' | 'es';

export interface TtsSynthesizeOptions {
  /** BCP-47 tag. Defaults to pt-BR. */
  locale?: TtsLocale | string;
  /** Provider-specific voice id. Defaults to a sensible per-locale voice. */
  voiceId?: string;
  /** 0.5–2.0. Default 1.0. */
  rate?: number;
  /** AbortSignal to cancel long syntheses. */
  signal?: AbortSignal;
}

export interface TtsResult {
  audio: Buffer;
  provider: string;
  voiceId: string;
  locale: string;
  contentType: 'audio/mpeg';
}

export class TtsProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public status: number = 502,
  ) {
    super(message);
    this.name = 'TtsProviderError';
  }
}

// ----------------------------------------------------------------------------
// Voice defaults — Wave 19
// ----------------------------------------------------------------------------

export const DEFAULT_VOICES: Record<TtsLocale, { provider: string; voiceId: string }> = {
  'pt-BR': { provider: 'google_cloud', voiceId: 'pt-BR-Neural2-B' },
  en: { provider: 'google_cloud', voiceId: 'en-US-Neural2-D' },
  es: { provider: 'google_cloud', voiceId: 'es-ES-Neural2-B' },
};

export const MAX_TEXT_CHARS = 4500; // generous; Google Cloud hard limit is 5000

// ----------------------------------------------------------------------------
// Provider capability detection
// ----------------------------------------------------------------------------

export interface ProviderStatus {
  provider: string;
  available: boolean;
  reason?: string;
}

export function getProviderStatuses(): ProviderStatus[] {
  const out: ProviderStatus[] = [
    {
      provider: 'google_free',
      available: true, // no key needed
      reason: 'Public Google Translate TTS — no auth, ~200 char chunks.',
    },
  ];
  out.push({
    provider: 'google_cloud',
    available: Boolean(process.env.GOOGLE_TTS_API_KEY),
    reason: process.env.GOOGLE_TTS_API_KEY
      ? 'GOOGLE_TTS_API_KEY set'
      : 'Set GOOGLE_TTS_API_KEY to enable neural voices.',
  });
  out.push({
    provider: 'elevenlabs',
    available: Boolean(process.env.ELEVENLABS_API_KEY),
    reason: process.env.ELEVENLABS_API_KEY
      ? 'ELEVENLABS_API_KEY set'
      : 'Set ELEVENLABS_API_KEY for premium voices.',
  });
  return out;
}

// ----------------------------------------------------------------------------
// Provider 1 — google_free (Google Translate unofficial TTS)
// ----------------------------------------------------------------------------
//
// https://translate.google.com/translate_tts?ie=UTF-8&q=<text>&tl=pt-BR&client=tw-ob
//
// Returns mp3 directly. Used for dev / no-key fallback. Low quality but
// works. Limit ~200 chars per request — we chunk for longer inputs.

const GOOGLE_FREE_URL = 'https://translate.google.com/translate_tts';

export async function synthesizeGoogleFree(
  text: string,
  opts: TtsSynthesizeOptions = {},
): Promise<TtsResult> {
  const locale = (opts.locale ?? 'pt-BR') as TtsLocale;
  const maxChunk = 180;
  const chunks: string[] = [];
  // Greedy word-boundary chunking.
  let buf = '';
  for (const word of text.split(/\s+/)) {
    if ((buf + ' ' + word).trim().length > maxChunk) {
      if (buf) chunks.push(buf.trim());
      buf = word;
    } else {
      buf = (buf ? buf + ' ' : '') + word;
    }
  }
  if (buf) chunks.push(buf.trim());

  if (chunks.length === 0) {
    throw new TtsProviderError('empty text', 'google_free', 400);
  }

  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    const url = `${GOOGLE_FREE_URL}?ie=UTF-8&q=${encodeURIComponent(
      chunk,
    )}&tl=${encodeURIComponent(locale)}&client=tw-ob`;
    const res = await fetch(url, {
      signal: opts.signal,
      headers: {
        // Pretend to be a browser — Google Translate serves mp3 only to UA it likes.
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });
    if (!res.ok) {
      throw new TtsProviderError(
        `google_free HTTP ${res.status}`,
        'google_free',
        res.status === 429 ? 429 : 502,
      );
    }
    const ab = await res.arrayBuffer();
    buffers.push(Buffer.from(ab));
  }

  return {
    audio: Buffer.concat(buffers),
    provider: 'google_free',
    voiceId: `translate-${locale}`,
    locale,
    contentType: 'audio/mpeg',
  };
}

// ----------------------------------------------------------------------------
// Provider 2 — google_cloud (REST API)
// ----------------------------------------------------------------------------
//
// https://texttospeech.googleapis.com/v1/text:synthesize?key=<KEY>
//
// Returns { audioContent: base64(mp3) }. We strip the wrapper and decode.

const GOOGLE_CLOUD_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

interface GoogleCloudVoice {
  languageCode: string;
  name: string;
}

export async function synthesizeGoogleCloud(
  text: string,
  opts: TtsSynthesizeOptions = {},
): Promise<TtsResult> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    throw new TtsProviderError('GOOGLE_TTS_API_KEY not set', 'google_cloud', 503);
  }
  const locale = (opts.locale ?? 'pt-BR') as TtsLocale;
  const voiceName = opts.voiceId ?? DEFAULT_VOICES[locale]?.voiceId ?? 'pt-BR-Neural2-B';
  const rate = opts.rate ?? 1.0;

  const body = {
    input: { text },
    voice: {
      languageCode: locale,
      name: voiceName,
    } satisfies GoogleCloudVoice,
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: rate,
      effectsProfileId: ['large-home-entertainment'],
    },
  };

  const res = await fetch(`${GOOGLE_CLOUD_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: opts.signal,
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new TtsProviderError(
      `google_cloud HTTP ${res.status}: ${errText.slice(0, 200)}`,
      'google_cloud',
      res.status === 429 ? 429 : 502,
    );
  }
  const json = (await res.json()) as { audioContent?: string };
  if (!json.audioContent) {
    throw new TtsProviderError('google_cloud: empty audioContent', 'google_cloud', 502);
  }
  return {
    audio: Buffer.from(json.audioContent, 'base64'),
    provider: 'google_cloud',
    voiceId: voiceName,
    locale,
    contentType: 'audio/mpeg',
  };
}

// ----------------------------------------------------------------------------
// Provider 3 — elevenlabs (REST API)
// ----------------------------------------------------------------------------
//
// https://api.elevenlabs.io/v1/text-to-speech/<voice_id>
//
// Headers: xi-api-key: <ELEVENLABS_API_KEY>

const ELEVENLABS_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

const ELEVENLABS_VOICES: Record<TtsLocale, string> = {
  'pt-BR': 'pNInz6obpgDQGcFmaJgB', // Adam — multilingual v2
  en: '21m00Tcm4TlvDq8ikWAM', // Rachel
  es: 'AZnzlk1XvdvUeBnXmlld', // Domi
};

export async function synthesizeElevenLabs(
  text: string,
  opts: TtsSynthesizeOptions = {},
): Promise<TtsResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new TtsProviderError('ELEVENLABS_API_KEY not set', 'elevenlabs', 503);
  }
  const locale = (opts.locale ?? 'pt-BR') as TtsLocale;
  const voiceId = opts.voiceId ?? ELEVENLABS_VOICES[locale];

  const res = await fetch(`${ELEVENLABS_URL}/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'content-type': 'application/json',
      accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
    signal: opts.signal,
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new TtsProviderError(
      `elevenlabs HTTP ${res.status}: ${errText.slice(0, 200)}`,
      'elevenlabs',
      res.status === 429 ? 429 : 502,
    );
  }
  const ab = await res.arrayBuffer();
  return {
    audio: Buffer.from(ab),
    provider: 'elevenlabs',
    voiceId,
    locale,
    contentType: 'audio/mpeg',
  };
}

// ----------------------------------------------------------------------------
// Top-level orchestrator — tries providers in priority order
// ----------------------------------------------------------------------------

export type TtsProviderName = 'google_free' | 'google_cloud' | 'elevenlabs';

export async function synthesizeWithFallback(
  text: string,
  opts: TtsSynthesizeOptions = {},
  /** Provider preference list. Default: cheapest available first. */
  preference: TtsProviderName[] = ['google_cloud', 'google_free', 'elevenlabs'],
): Promise<TtsResult> {
  if (!text || !text.trim()) {
    throw new TtsProviderError('text is empty', 'none', 400);
  }
  if (text.length > MAX_TEXT_CHARS) {
    throw new TtsProviderError(
      `text too long (${text.length} > ${MAX_TEXT_CHARS})`,
      'none',
      413,
    );
  }

  const tried: string[] = [];
  for (const name of preference) {
    if (!isProviderConfigured(name)) {
      continue;
    }
    tried.push(name);
    try {
      const result = await dispatchProvider(name, text, opts);
      return result;
    } catch (err) {
      // 4xx (other than 429) is fatal — don't fall through.
      if (err instanceof TtsProviderError) {
        if (err.status >= 400 && err.status < 500 && err.status !== 429) {
          throw err;
        }
        // 429/5xx → try next provider.
        continue;
      }
      throw err;
    }
  }

  // No provider succeeded.
  throw new TtsProviderError(
    `no TTS provider available (tried: ${tried.join(', ') || 'none configured'})`,
    'none',
    503,
  );
}

function isProviderConfigured(name: TtsProviderName): boolean {
  switch (name) {
    case 'google_free':
      return true;
    case 'google_cloud':
      return Boolean(process.env.GOOGLE_TTS_API_KEY);
    case 'elevenlabs':
      return Boolean(process.env.ELEVENLABS_API_KEY);
  }
}

async function dispatchProvider(
  name: TtsProviderName,
  text: string,
  opts: TtsSynthesizeOptions,
): Promise<TtsResult> {
  switch (name) {
    case 'google_free':
      return synthesizeGoogleFree(text, opts);
    case 'google_cloud':
      return synthesizeGoogleCloud(text, opts);
    case 'elevenlabs':
      return synthesizeElevenLabs(text, opts);
  }
}
