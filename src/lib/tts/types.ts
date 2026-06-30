// ============================================================================
// types.ts — Shared types for the Akasha voice-mode TTS layer (W72-D)
// ============================================================================
// Wave-Spawner Cycle 72 — Worker D.
//
// Three layers:
//   1. Server adapter (`/api/tts`) — single-shot, returns audio/mpeg.
//   2. SSE stream (`/api/tts/stream`) — sentence-bounded chunks.
//   3. Client cache + Web Speech API fallback — browser-native.
//
// All layers share the same `VoicePreset` + `Tradition` vocabulary so a
// cache key built on the client matches the server's response key.
// ============================================================================

// ---------------------------------------------------------------------------
// Traditions — the 7 Akasha voice buckets. Locked in VISION.md.
// ---------------------------------------------------------------------------

export const AKASHA_TRADITIONS = [
  'cigano',
  'orixas',
  'astrologia',
  'cabala',
  'numerologia',
  'tantra',
  'tarot',
] as const;

export type Tradition = (typeof AKASHA_TRADITIONS)[number];

export const DEFAULT_TRADITION: Tradition = 'cigano';

// ---------------------------------------------------------------------------
// VoicePreset — one per tradition. Tied to platform voice_ids from
// `get_voice_list`. Pitch and speed are playback modifiers, voice_id is
// passed to the platform TTS adapter.
// ---------------------------------------------------------------------------

export interface VoicePreset {
  /** Platform voice id (e.g. 'male-qn-qingse'). */
  voice_id: string;
  /** Semitone offset (-12..12). Default 0. */
  pitch: number;
  /** Playback rate (0.5..2.0). Default 1.0. */
  speed: number;
  /** Human-readable label (pt-BR). */
  label: string;
  /** 1-line description of the vocal character. */
  description: string;
}

// ---------------------------------------------------------------------------
// TTSRequest / TTSResponse — wire format for /api/tts and /api/tts/stream.
// ---------------------------------------------------------------------------

export interface TTSRequest {
  /** Text to speak. 1..5000 chars (server-enforced). */
  text: string;
  /** Tradition key. Default 'cigano'. */
  tradition?: Tradition;
  /** Override voice_id (bypasses preset lookup). */
  voice_id?: string;
  /** Override pitch. */
  pitch?: number;
  /** Override speed. */
  speed?: number;
}

export interface TTSResponseMeta {
  /** Cached audio bytes (base64) or stream chunk. */
  audio?: string;
  /** Normalized text actually spoken (post-normalize). */
  normalized_text?: string;
  /** Resolved voice_id used. */
  voice_id: string;
  /** Tradition key. */
  tradition: Tradition;
  /** True if served from client IndexedDB cache (no audio in body). */
  cached?: boolean;
  /** When streaming: chunk index / is-last. */
  chunk_index?: number;
  is_last?: boolean;
  /** Bytes of audio in this chunk (or total when single-shot). */
  bytes?: number;
  /** Error code, if any. */
  error?: TTSErrorCode;
  message?: string;
}

export type TTSErrorCode =
  | 'TEXT_TOO_LONG'
  | 'TEXT_EMPTY'
  | 'TRADITION_INVALID'
  | 'ADAPTER_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'INTERNAL';

// ---------------------------------------------------------------------------
// Cache key — FNV-1a over `voice_id + '\u0000' + normalizedText`.
// Same algorithm runs in client (audio-cache) and server (route).
// ---------------------------------------------------------------------------

export interface CacheKeyParts {
  voice_id: string;
  normalizedText: string;
}

// ---------------------------------------------------------------------------
// Client-side playback state machine. Drives the audio-player UI.
// ---------------------------------------------------------------------------

export type PlaybackState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'error';

export interface PlaybackSnapshot {
  state: PlaybackState;
  currentTime: number;
  duration: number;
  /** Last error message (state === 'error'). */
  error?: string;
  /** Source: 'server' | 'cache' | 'web-speech'. */
  source?: 'server' | 'cache' | 'web-speech';
}

// ---------------------------------------------------------------------------
// Self-test sentinel — for the smoke harness to discover exported bindings.
// ---------------------------------------------------------------------------

export const TTS_TYPES_VERSION = 'w72-d.v1' as const;
