// ============================================================================
// LIVE STREAMING — Wave 35 (LIVESTREAM events)
// ============================================================================
// Suporte para eventos do tipo LIVESTREAM:
//   • HLS playback (URL m3u8) — provider-agnostic
//   • WebRTC simulive (low-latency) — opcional
//   • Live chat (mensagens + moderação)
//   • Reactions (PRESENCE gifts W20)
//   • Q&A queue (moderada)
//   • Recording auto-save (post-event)
//
// Integração com provedores externos:
//   • Mux / Cloudflare Stream / AWS IVS / self-hosted nginx-rtmp
//   • Todos retornam HLS URL — abstraímos em LiveStreamProvider interface
//
// LGPD: chat é dado público (opt-in). Reactions são agregadas, não PII.
// Recordings herdam settings do evento (privacidade/paywall).
// ============================================================================

// ============================================================
// Tipos
// ============================================================

export type LiveProvider = 'mux' | 'cloudflare' | 'aws-ivs' | 'self-hosted' | 'hls-only';

export interface LiveStreamConfig {
  eventId: string;
  provider: LiveProvider;
  // URL de playback (HLS .m3u8). Obrigatório para start.
  playbackUrl: string;
  // URL de ingest (RTMP/WebRTC). Apenas host usa.
  ingestUrl?: string;
  // Stream key (host only). Nunca expor ao viewer.
  streamKey?: string;
  // Low-latency mode (LL-HLS ou WebRTC).
  lowLatency: boolean;
  // DVR (seek ao vivo).
  dvrEnabled: boolean;
  // Chat habilitado?
  chatEnabled: boolean;
  // Reactions habilitadas?
  reactionsEnabled: boolean;
  // Q&A habilitado?
  qaEnabled: boolean;
  // Closed captions habilitadas? (WCAG AA)
  captionsEnabled: boolean;
  // Cap max de viewers (null = ilimitado)
  maxViewers: number | null;
  // Schedule start/end (se já conhecidos)
  scheduledStart: Date;
  scheduledEnd: Date;
}

export interface LiveMessage {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  timestamp: Date;
  // Moderação
  flagged: boolean;
  approved: boolean;
}

export interface LiveReaction {
  type: 'heart' | 'fire' | 'sparkles' | 'om' | 'lotus';
  userId: string;
  timestamp: Date;
}

export interface LiveQuestion {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  upvotes: number;
  answered: boolean;
  timestamp: Date;
}

// ============================================================
// Factory — Constrói config baseado em env
// ============================================================================

export function buildLiveConfig(
  eventId: string,
  provider: LiveProvider,
  scheduledStart: Date,
  scheduledEnd: Date,
): LiveStreamConfig {
  // Defaults alinhados com LGPD + WCAG AA:
  //   • Captions habilitadas por padrão (WCAG 1.2.2 + 1.2.4)
  //   • Chat habilitado (community-led)
  //   • Moderação ativa (flagged → review queue)
  const baseConfig: LiveStreamConfig = {
    eventId,
    provider,
    playbackUrl: '',
    lowLatency: false,
    dvrEnabled: true,
    chatEnabled: true,
    reactionsEnabled: true,
    qaEnabled: true,
    captionsEnabled: true,
    maxViewers: null,
    scheduledStart,
    scheduledEnd,
  };

  // Provider-specific defaults
  switch (provider) {
    case 'mux':
      return {
        ...baseConfig,
        lowLatency: true,
        dvrEnabled: true,
        captionsEnabled: true,
      };
    case 'cloudflare':
      return {
        ...baseConfig,
        lowLatency: true,
        dvrEnabled: false, // CF Stream não suporta DVR nativamente
      };
    case 'aws-ivs':
      return {
        ...baseConfig,
        lowLatency: true,
        dvrEnabled: true,
      };
    case 'self-hosted':
      return {
        ...baseConfig,
        lowLatency: false, // depende de config nginx-rtmp
        maxViewers: 500, // limit conservador para self-hosted
      };
    case 'hls-only':
    default:
      return baseConfig;
  }
}

// ============================================================
// validateStreamKey — Constant-time compare (segurança)
// ============================================================================

export function validateStreamKey(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  if (provided.length !== expected.length) return false;

  // Constant-time compare (proteção contra timing attacks)
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

// ============================================================
// buildEmbedUrl — Constrói URL de embed seguro
// ============================================================================

export function buildEmbedUrl(
  playbackUrl: string,
  opts: { autoplay?: boolean; muted?: boolean; poster?: string } = {},
): string {
  if (!playbackUrl) return '';

  // Se já é .m3u8, retorna direto (player client-side resolve)
  // Se for outro formato, idealmente normalizamos para HLS
  const params = new URLSearchParams();
  if (opts.autoplay) params.set('autoplay', '1');
  if (opts.muted) params.set('muted', '1');
  if (opts.poster) params.set('poster', opts.poster);

  const sep = playbackUrl.includes('?') ? '&' : '?';
  return `${playbackUrl}${params.toString() ? sep + params.toString() : ''}`;
}

// ============================================================
// Chat moderation — Heurística simples
// ============================================================================

const BANNED_PATTERNS = [
  /\b(spam|viagra|casino|xxx)\b/i,
  /(https?:\/\/[^\s]+\.(ru|tk|xyz|top))/i, // TLDs comumente abusivos
];

export interface ModerationVerdict {
  ok: boolean;
  reason?: 'spam' | 'link-bad-tld' | 'too-long' | 'empty';
}

export function moderateMessage(text: string, maxLen = 500): ModerationVerdict {
  const trimmed = text.trim();

  if (!trimmed) {
    return { ok: false, reason: 'empty' };
  }

  if (trimmed.length > maxLen) {
    return { ok: false, reason: 'too-long' };
  }

  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { ok: false, reason: 'spam' };
    }
  }

  return { ok: true };
}

// ============================================================
// Reactions — PRESENCE gifts integration (W20)
// ============================================================================

export const REACTION_TYPES: ReadonlyArray<LiveReaction['type']> = [
  'heart',
  'fire',
  'sparkles',
  'om',
  'lotus',
];

// Custo de PRESENCE coin por reaction (W20)
export const REACTION_COST: Record<LiveReaction['type'], number> = {
  heart: 1,
  fire: 5,
  sparkles: 10,
  om: 3,
  lotus: 25,
};

export function canAffordReaction(
  balance: number,
  type: LiveReaction['type'],
): boolean {
  return balance >= REACTION_COST[type];
}

// ============================================================
// Recording auto-save — Post-event hook
// ============================================================================

export interface RecordingResult {
  ok: boolean;
  recordingUrl?: string;
  duration?: number;
  error?: string;
}

export async function finalizeRecording(
  config: LiveStreamConfig,
  providerApi: { fetchRecording: (eventId: string) => Promise<{ url: string; duration: number } | null> },
): Promise<RecordingResult> {
  try {
    const recording = await providerApi.fetchRecording(config.eventId);

    if (!recording) {
      return { ok: false, error: 'no_recording_available' };
    }

    return {
      ok: true,
      recordingUrl: recording.url,
      duration: recording.duration,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'unknown_error',
    };
  }
}

// ============================================================
// Q&A — Queue + upvote
// ============================================================================

export function sortQuestionsByUpvotes(questions: LiveQuestion[]): LiveQuestion[] {
  return [...questions].sort((a, b) => {
    if (a.answered !== b.answered) return a.answered ? 1 : -1; // un-answered primeiro
    if (a.upvotes !== b.upvotes) return b.upvotes - a.upvotes; // mais upvotes primeiro
    return a.timestamp.getTime() - b.timestamp.getTime(); // tie-break: timestamp
  });
}

// ============================================================
// Accessibility — WCAG AA captions helper
// ============================================================================

export interface CaptionTrack {
  src: string; // URL .vtt
  lang: string; // BCP 47 (pt-BR, en-US)
  label: string; // "Português"
  default?: boolean;
}

export function buildCaptionTracks(
  tracks: Array<{ lang: string; label: string; src: string; default?: boolean }>,
): CaptionTrack[] {
  return tracks.map((t) => ({
    src: t.src,
    lang: t.lang,
    label: t.label,
    default: t.default ?? false,
  }));
}