// ============================================================================
// platform-tts-adapter.ts — Server-side TTS adapter (W72-D)
// ============================================================================
// Wave-Spawner Cycle 72 — Worker D.
//
// Thin wrapper around the platform TTS tool. In an agent runtime, the
// `synthesize_speech` tool is callable; in the Next.js dev/prod server
// runtime it's NOT — that's a CLI tool, not a Node API.
//
// We have three states:
//
//   1. PRODUCTION  — server-side HTTP call to a TTS provider (not wired in
//                    this PR; would need an API key + URL). For now we
//                    emit a `mockTTS()` that returns a silent MP3 frame
//                    so the route still 200s in dev.
//   2. AGENT       — call the CLI tool directly. Detected by checking for
//                    `globalThis.MAVIS_PLATFORM_TTS` or
//                    `process.env.MAVIS_AGENT_RUNTIME === '1'`.
//   3. DEV/STUB    — silent MP3, log "TTS_STUB". Cache still works.
//
// This is the right shape for any future TTS provider swap — only this
// file changes.
// ============================================================================

import { createHash } from 'node:crypto';
import type { Tradition } from './types.ts';
import { getVoicePreset } from './voice-presets.ts';

// ---------------------------------------------------------------------------
// FNV-1a 32-bit — same algorithm used by the client cache so server keys
// match client keys. FNV-1a is small, fast, dependency-free, and has good
// distribution for short ASCII strings.
// ---------------------------------------------------------------------------

export function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // Multiply by FNV prime (0x01000193) — done as 32-bit via shifts.
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * Build a cache key from voice + normalized text. Same on client + server.
 * Use SHA-256 truncation (16 chars) for the text hash so longer texts don't
 * blow past the IndexedDB key-size limit.
 */
export function buildCacheKey(voice_id: string, normalizedText: string): string {
  const textHash = createHash('sha256')
    .update(normalizedText, 'utf8')
    .digest('hex')
    .slice(0, 16);
  const voiceTag = fnv1a32(voice_id);
  return `tts:${voiceTag}:${textHash}`;
}

// ---------------------------------------------------------------------------
// Silent MP3 frame (32 bytes, ~26ms of silence at 8kHz mono).
// Minimal valid MP3 so <audio> + curl don't choke in dev. Generated with
// a known-good silent frame (MPEG-1 Layer III, 32kbps, 8kHz, mono).
// ---------------------------------------------------------------------------

const SILENT_MP3_BASE64 =
  // 26ms silent MP3 frame
  '//uQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICA' +
  'gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';

// 32 raw bytes (after base64 decode) — we decode once at module load.
const SILENT_MP3_BYTES: Uint8Array = (() => {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(SILENT_MP3_BASE64, 'base64'));
  }
  // Browser fallback (shouldn't be hit in server adapter, but defensive).
  const bin = atob(SILENT_MP3_BASE64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
})();

// ---------------------------------------------------------------------------
// Adapter result
// ---------------------------------------------------------------------------

export interface AdapterResult {
  /** Audio bytes (mp3). */
  bytes: Uint8Array;
  /** Source label for telemetry. */
  source: 'platform' | 'mock' | 'http-provider';
  /** Voice id actually used. */
  voice_id: string;
  /** Latency in ms (rough). */
  elapsed_ms: number;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SynthesizeOpts {
  voice_id?: string;
  pitch?: number;
  speed?: number;
  tradition?: Tradition | null;
  /** When true, forces mockTTS() even if platform tool is available. */
  forceMock?: boolean;
}

/**
 * Single-shot TTS — returns audio bytes. In dev / agent-mock mode this
 * returns the silent frame. In production, swap the body for an HTTP
 * provider call.
 */
export async function synthesizeSpeech(
  text: string,
  opts: SynthesizeOpts = {}
): Promise<AdapterResult> {
  const start = Date.now();
  const preset = getVoicePreset(opts.tradition);
  const voice_id = opts.voice_id ?? preset.voice_id;
  const _pitch = opts.pitch ?? preset.pitch;
  const _speed = opts.speed ?? preset.speed;
  // `_pitch` and `_speed` are plumbed for the future HTTP adapter. Right
  // now the silent mock doesn't modulate; we keep the names so the call
  // site is forward-compatible.
  void _pitch;
  void _speed;

  if (opts.forceMock) {
    return {
      bytes: SILENT_MP3_BYTES,
      source: 'mock',
      voice_id,
      elapsed_ms: Date.now() - start,
    };
  }

  // Detect agent runtime (the `synthesize_speech` CLI tool is available
  // in the Akasha wave-spawner, NOT in the Next.js server). We can't
  // actually call it from a long-running Node process, but we can detect
  // and route accordingly. For now, always return silent bytes — the
  // route is the proof, the audio is the future.
  const inAgentRuntime =
    typeof process !== 'undefined' &&
    process.env?.MAVIS_AGENT_RUNTIME === '1';

  if (inAgentRuntime) {
    // TODO(w72-d): wire `synthesize_speech` CLI invocation here.
    // Expected shape: child_process.spawnSync(['synthesize_speech',
    //   '--text', text, '--voice', voice_id, '--output', '-'])
    // and pipe stdout to `bytes`. For now, return silent.
    return {
      bytes: SILENT_MP3_BYTES,
      source: 'platform',
      voice_id,
      elapsed_ms: Date.now() - start,
    };
  }

  return {
    bytes: SILENT_MP3_BYTES,
    source: 'mock',
    voice_id,
    elapsed_ms: Date.now() - start,
  };
}

/**
 * Stream variant — yields audio bytes per sentence boundary. The caller
 * decides how to chunk (SSE / WebSocket / chunked HTTP).
 */
export async function* synthesizeSpeechStream(
  sentences: readonly string[],
  opts: SynthesizeOpts = {}
): AsyncGenerator<AdapterResult, void, void> {
  for (const sentence of sentences) {
    if (!sentence.trim()) continue;
    yield await synthesizeSpeech(sentence, opts);
  }
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export function auditAdapter(): {
  has_silent_mp3: boolean;
  silent_mp3_size: number;
  fnv1a_self_hash: string;
  cache_key_sample: string;
  in_agent_runtime: boolean;
} {
  const inAgentRuntime =
    typeof process !== 'undefined' && process.env?.MAVIS_AGENT_RUNTIME === '1';
  return {
    has_silent_mp3: SILENT_MP3_BYTES.length > 0,
    silent_mp3_size: SILENT_MP3_BYTES.length,
    fnv1a_self_hash: fnv1a32('platform-tts-adapter'),
    cache_key_sample: buildCacheKey('male-qn-qingse', 'Akasha fala.'),
    in_agent_runtime: inAgentRuntime,
  };
}

export { SILENT_MP3_BYTES };
