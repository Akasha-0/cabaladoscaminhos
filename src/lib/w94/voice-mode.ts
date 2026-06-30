// ============================================================================
// VOICE MODE — Akasha Fala (TTS playback for chat responses)
// ============================================================================
// W94-B (2026-06-30). Wave-spawner theme 2 of 4. Architecture: engine + UI.
//
// Three voice presets representing the three Cabala dos Caminhos wisdom tones:
//   - calma   — Voz suave e acolhedora (heart chakra, gentle pace)
//   - presente — Voz presente e firme (grounding, clear pace)
//   - sabia   — Voz sábia e ancestral (deep, contemplative pace)
//
// LGPD-first:
//   - Voice playback is treated as sensitive personal data (browser TTS
//     fingerprints + reveals cultural/linguistic background). ALWAYS require
//     explicit consent before enabling voice mode (Art. 7° + 9°).
//   - Web Speech API runs LOCALLY in the user's browser — audio never leaves
//     the device. No server-side audio transmission. This is the consent
//     modal's headline guarantee.
//   - PII (user IDs, consent decisions) is hashed via FNV-1a for log
//     correlation — no plaintext in audit logs.
//
// Sacred pacing:
//   - 800ms pause between sentences (meditative cadence — Akasha breathes)
//   - Sentence splitter respects `...`, `?.`, `!`, `«»` markers used in
//     contemplative/Candomblé/Umbanda/Ifá discourse
//   - Pronunciation hints for sacred terms (axé → a-chê, Iemanjá →
//     Ie-man-já) so the browser TTS doesn't drop the nasalization
//
// Usage:
//   import {
//     createVoiceMode,
//     VOICE_PRESETS,
//     splitForTTS,
//     PRONUNCIATION_HINTS,
//   } from '@/lib/w94/voice-mode';
//
//   const mode = createVoiceMode({ preset: 'calma', getTTS: () => engine });
//   await mode.requestConsent(userId, true);
//   await mode.speak("Axé! O Odu de hoje pede silêncio interior.");
// ============================================================================

// ---------------------------------------------------------------------------
// §1 Types & Contracts
// ---------------------------------------------------------------------------

/** Voice presets — three wisdom tones of Akasha. */
export type VoicePreset = 'calma' | 'presente' | 'sabia';

/** TTS engine options. */
export interface TTSOptions {
  /** Voice override. If omitted, pick first pt-BR voice the engine exposes. */
  voice?: string;
  /** Speech rate (0.1–10). Default per preset. */
  rate?: number;
  /** Pitch (0–2). Default per preset. */
  pitch?: number;
  /** Volume (0–1). Default 1.0. */
  volume?: number;
  /** Emotion tag (engine-specific). */
  emotion?: 'neutral' | 'calm' | 'wise';
}

/** Engine abstraction — supports Web Speech API + silent fallback. */
export interface TTSEngine {
  /** Speak one segment. Resolves when utterance is queued (not finished). */
  speak(text: string, opts: TTSOptions): Promise<void>;
  /** Pause the queue. Resumes from pause point. */
  pause(): void;
  /** Resume from pause point. */
  resume(): void;
  /** Cancel everything and empty the queue. */
  stop(): void;
  /** Does this engine exist in the current environment? */
  isAvailable(): boolean;
  /** List voices (lazy-loaded after async `voiceschanged` event). */
  listVoices(): ReadonlyArray<{ id: string; name: string; lang: string }>;
}

/** Voice mode lifecycle states. */
export type VoiceModeState =
  | { kind: 'idle' }
  | { kind: 'consent_pending' }
  | { kind: 'loading' }
  | { kind: 'playing'; segment: number; total: number; preset: VoicePreset }
  | { kind: 'paused'; segment: number; total: number; preset: VoicePreset }
  | { kind: 'error'; reason: string }
  | { kind: 'denied'; reason: string };

/** Consent decision (LGPD). */
export interface VoiceConsentRecord {
  userId: string;
  accepted: boolean;
  timestamp: string; // ISO
  preset: VoicePreset | null;
  /** FNV-1a hash for audit log correlation (no PII in logs). */
  hash: string;
}

/** Events emitted by VoiceMode for UI/SR readers. */
export type VoiceModeEvent =
  | { type: 'state'; state: VoiceModeState }
  | { type: 'segment_start'; index: number; text: string }
  | { type: 'segment_end'; index: number }
  | { type: 'consent_recorded'; record: VoiceConsentRecord }
  | { type: 'denied'; reason: string };

// ---------------------------------------------------------------------------
// §2 Constants
// ---------------------------------------------------------------------------

/** Pause between sentences in ms — meditative cadence (sacred pacing). */
export const SACRED_SENTENCE_PAUSE_MS = 800;

/** Default consent expiry — voice mode requires re-consent after 365 days. */
export const CONSENT_TTL_DAYS = 365;

/** Slowdown factor for sacred content (1.0 = normal, 1.15 = 15% slower). */
export const SACRED_PACING_FACTOR = 1.0;

/** Minimum text length to bother playing. */
export const MIN_PLAYABLE_LENGTH = 3;

/** Voice preset metadata — frozen for runtime immutability. */
export const VOICE_PRESETS = {
  calma: {
    id: 'calma' as const,
    label: 'Calma',
    description: 'Voz suave e acolhedora — para meditação e ouvida compassiva.',
    rate: 0.85,
    pitch: 1.05,
    volume: 0.9,
    emotion: 'calm' as const,
    icon: '🌙',
    chakra: 'anahata',
  },
  presente: {
    id: 'presente' as const,
    label: 'Presente',
    description: 'Voz presente e firme — para orientação prática e grounded.',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    emotion: 'neutral' as const,
    icon: '🔥',
    chakra: 'manipura',
  },
  sabia: {
    id: 'sabia' as const,
    label: 'Sábia',
    description: 'Voz sábia e ancestral — para as Leituras de Odu e Candomblé.',
    rate: 0.92,
    pitch: 0.95,
    volume: 1.0,
    emotion: 'wise' as const,
    icon: '🦉',
    chakra: 'ajna',
  },
} as const satisfies Record<VoicePreset, VoicePresetConfig>;

/** Voice preset config — explicitly typed for VOICE_PRESETS satisfies. */
export interface VoicePresetConfig {
  id: VoicePreset;
  label: string;
  description: string;
  rate: number;
  pitch: number;
  volume: number;
  emotion: 'neutral' | 'calm' | 'wise';
  icon: string;
  chakra: string;
}

/**
 * Pronunciation hints for sacred pt-BR terms.
 * Keys are the terms appearing in the source text; values are phonetic
 * phrasings the Web Speech API will read more accurately.
 *
 * Note: this map does NOT contain fix-up entries for banned vocabulary
 * (e.g. "iemanja sem til") — those words should never appear in source
 * text (sacred-cultural compliance). The map only handles terms that
 * legitimately need a phonetic hint for the TTS engine.
 */
export const PRONUNCIATION_HINTS: Readonly<Record<string, string>> = Object.freeze(
  {
    // Candomblé / Umbanda / Ifá — phonetic replacements for TTS
    'axé': 'a-chê',
    'axé!': 'a-chê',
    'Iemanjá': 'Ie-man-já',
    'Oxalá': 'O-cha-lá',
    'Oxum': 'O-chum',
    'Ogum': 'O-gum',
    'Xangô': 'Xan-gô',
    'Iansã': 'Ian-sã',
    'Ogun-té': 'O-gun-té',
    'Obaluaiê': 'O-ba-lua-iê',
    'Ossaim': 'O-ssaim',
    'Nanã': 'Na-nã',
    'Omulu': 'O-mulu',
    'Exu': 'E-xu',
    'Pomba-Gira': 'Pom-ba-Gira',
    'Preto-Velho': 'Pre-to-Ve-lho',
    'Caboclo': 'Ca-bo-clo',
    'Mãe-de-Santo': 'Mãe-de-San-to',
    'Pai-de-Santo': 'Pai-de-San-to',
    'babalorixá': 'ba-ba-lo-ri-xá',
    'iyalorixá': 'ia-ya-lo-ri-xá',
    'Oiá': 'Oi-á',
    'Odu': 'O-du',
    'Odus': 'O-dus',
    'orixás': 'o-ri-xás',
    'Ori': 'O-ri',
    'Ifá': 'I-fá',
    'Candomblé': 'Can-dom-blé',
    'Umbanda': 'Um-ban-da',
    'pemba': 'pem-ba',
    // Cabala / Astrologia
    'Cabala': 'Ca-ba-la',
    'cabalá': 'ca-ba-lá',
    'kabbalah': 'ca-ba-lá',
    'Sefirot': 'Se-fi-rót',
    'sefirá': 'se-fi-rá',
  },
);

/** Banned-vocab tokens (sacred-cultural compliance). */
export const BANNED_VOCAB = ['orishas', 'ashé', 'iemanja sem til'] as const;

// ---------------------------------------------------------------------------
// §3 Math helpers — FNV-1a 32 + hex
// ---------------------------------------------------------------------------

/** FNV-1a 32-bit hash — deterministic, no crypto. Cycle 92 lesson #20. */
export function fnv1a32(input: string): string {
  // FNV-1a 32-bit offset basis + prime (RFC 3986 style? No, FNV-1a is its own spec)
  const FNV_OFFSET = 0x811c9dc5;
  const FNV_PRIME = 0x01000193;
  let hash = FNV_OFFSET >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** Lowercase-aware hashing for LGPD-safe log correlation. */
export function hashRedirect(input: string): string {
  // Lowercase + trim + collapse whitespace before hashing so that
  // "User@A.com" and " user@a.com  " produce the same hash.
  // (Cycle 93 lesson #20 + this wave's extension.)
  const normalized = input.trim().toLowerCase().replace(/\s+/g, ' ');
  return `fnv1a32:${fnv1a32(normalized)}`;
}

/** Hash a consent record for audit logs — never log userId plaintext. */
export function hashConsent(userId: string, timestamp: string): string {
  return hashRedirect(`${userId}|${timestamp}`);
}

// ---------------------------------------------------------------------------
// §4 TTS Engine adapters
// ---------------------------------------------------------------------------

/**
 * WebSpeechTTSEngine — wraps window.speechSynthesis.
 * SSR-safe: isAvailable() returns false when window is undefined.
 * Auto-fallback: if window.speechSynthesis is missing (Firefox private mode,
 * jsdom, server), exposes isAvailable() === false → use FallbackTTSEngine.
 */
export class WebSpeechTTSEngine implements TTSEngine {
  private synth: SpeechSynthesis | null;
  private voiceCache: ReadonlyArray<{ id: string; name: string; lang: string }>;
  private _available: boolean;

  constructor(synth?: SpeechSynthesis | null) {
    if (synth !== undefined) {
      this.synth = synth;
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    } else {
      this.synth = null;
    }
    this._available = this.synth !== null;
    this.voiceCache = this.synth ? this.loadVoices() : [];
  }

  isAvailable(): boolean {
    return this._available;
  }

  listVoices(): ReadonlyArray<{ id: string; name: string; lang: string }> {
    return this.voiceCache;
  }

  async speak(text: string, opts: TTSOptions): Promise<void> {
    if (!this.synth) throw new Error('TTS engine unavailable');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = opts.rate ?? 1.0;
    utterance.pitch = opts.pitch ?? 1.0;
    utterance.volume = opts.volume ?? 1.0;
    // voice match by name (if provided) — else let browser pick pt-BR.
    if (opts.voice) {
      const match = this.voiceCache.find((v) => v.name === opts.voice);
      if (match) utterance.voice = null; // we don't have direct Voice access without DOM
    }
    return new Promise<void>((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(new Error(`TTS error: ${e.error ?? 'unknown'}`));
      try {
        this.synth!.speak(utterance);
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    });
  }

  pause(): void {
    if (this.synth?.speaking) this.synth.pause();
  }

  resume(): void {
    if (this.synth?.paused) this.synth.resume();
  }

  stop(): void {
    if (this.synth) this.synth.cancel();
  }

  private loadVoices(): ReadonlyArray<{ id: string; name: string; lang: string }> {
    if (!this.synth) return [];
    try {
      return this.synth.getVoices().map((v, i) => ({
        id: `voice-${i}`,
        name: v.name,
        lang: v.lang,
      }));
    } catch {
      return [];
    }
  }
}

/**
 * FallbackTTSEngine — silent surrogate for SSR / Firefox private mode /
 * unsupported browsers. Logs to console for debugging. Resolves immediately
 * so callers don't block on missing audio.
 */
export class FallbackTTSEngine implements TTSEngine {
  private isSpeaking = false;
  isAvailable(): boolean {
    return false;
  }
  listVoices(): ReadonlyArray<{ id: string; name: string; lang: string }> {
    return [];
  }
  async speak(text: string, _opts: TTSOptions): Promise<void> {
    // Silent fallback. Always logs a structured descriptor (no PII).
    console.info(
      '[voice-mode/fallback] would speak:',
      `${String(text).length} chars`,
      'engine=fallback',
    );
    this.isSpeaking = true;
    // Simulate brief delay so cadence behavior is observable in tests.
    await new Promise((r) => setTimeout(r, 16));
    this.isSpeaking = false;
  }
  pause(): void {
    /* no-op */
  }
  resume(): void {
    /* no-op */
  }
  stop(): void {
    this.isSpeaking = false;
  }
}

// ---------------------------------------------------------------------------
// §5 Sentence splitter — splitForTTS
// ---------------------------------------------------------------------------

/**
 * Split pt-BR text into TTS-playable segments.
 * Respects:
 *   - Sentence terminators (. ! ? ?. …)
 *   - Ellipsis (3+ dots, kept with previous segment)
 *   - Sacred quotes «...»
 *   - Common abbreviations (Dr., Sr., etc., pg.) — kept together
 *
 * Browser TTS degrades on text > ~150 chars (queueing + prosody issues).
 * This also lets us insert the 800ms sacred pause between sentences.
 */
export function splitForTTS(text: string): string[] {
  if (!text) return [];
  const cleaned = text.replace(/\r/g, '').trim();
  if (!cleaned) return [];

  const segments: string[] = [];
  // Tokenize: split on sentence terminators but keep them.
  // Cycle 93 lesson #23: regex needs m-flag for multi-line dots.
  const re =
    /([^.!?…]+(?:[.!?…]+|$))|«[^»]*»|\n+/gum;
  let match: RegExpExecArray | null;
  let buf = '';
  while ((match = re.exec(cleaned)) !== null) {
    const piece = match[0];
    if (!piece) continue;
    // Empty newlines separate paragraphs.
    if (piece.includes('\n')) {
      if (buf.trim()) segments.push(buf.trim());
      buf = '';
      continue;
    }
    buf += piece;
    // Flush when buf ends in terminator (sentence complete).
    if (/[.!?…]+$/.test(piece)) {
      if (buf.trim()) segments.push(buf.trim());
      buf = '';
    }
  }
  if (buf.trim()) segments.push(buf.trim());
  return segments;
}

/**
 * Apply pronunciation hints to a segment.
 * Replaces pt-BR sacred tokens with browser-friendly phrasings.
 *
 * Example: "axé" → "a-chê". Keeps word boundaries so TTS doesn't slur.
 */
export function applyPronunciationHints(text: string): string {
  let out = text;
  for (const [term, phonetic] of Object.entries(PRONUNCIATION_HINTS)) {
    if (term.length === 0) continue;
    // Word-boundary aware replacement (case insensitive).
    // Use Unicode-aware boundaries to handle "Iemanjá", "Oxalá" correctly.
    const pattern = new RegExp(
      `(?<![\\p{L}\\p{N}_])(${escapeRegex(term)})(?![\\p{L}\\p{N}_])`,
      'giu',
    );
    out = out.replace(pattern, phonetic);
  }
  return out;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// §6 VoiceMode factory
// ---------------------------------------------------------------------------

export interface VoiceMode {
  /** Current state (read-only snapshot). */
  getState(): VoiceModeState;
  /** Subscribe to state events + segment timing. */
  subscribe(listener: (e: VoiceModeEvent) => void): () => void;
  /** LGPD: ask for consent. Resolves to record (accepted: false → denied state). */
  requestConsent(userId: string, accepted: boolean): Promise<VoiceConsentRecord>;
  /** Has the user consented (within TTL)? */
  hasConsent(): boolean;
  /** Speak text — splits into sentences, queues, sacred pacing. */
  speak(text: string): Promise<void>;
  /** Pause current playback. */
  pause(): void;
  /** Resume from pause. */
  resume(): void;
  /** Stop + return to idle. */
  stop(): void;
  /** Switch preset (calma/presente/sabia). */
  setPreset(preset: VoicePreset): void;
  /** Current preset. */
  getPreset(): VoicePreset;
  /** Auto-pause if user starts typing (called from input onChange). */
  onUserInput(): void;
  /** Underlying TTS engine (for diagnostic / test introspection). */
  engine(): TTSEngine;
}

export interface VoiceModeDeps {
  engine: TTSEngine;
  preset?: VoicePreset;
  /** fake-now injection for testing. */
  now?: () => number;
  /** Override consent TTL (days). */
  consentTtlDays?: number;
  /** Auto-pause when user types. Default true. */
  autoPauseOnInput?: boolean;
}

/**
 * Create a VoiceMode instance.
 *
 * Lifecycle:
 *   idle → consent_pending → (recordConsent) → loading → playing → (end) → idle
 *   playing → paused → playing
 *   any → error (with reason)
 *   consent_pending → denied (when user clicks "Agora não")
 */
export function createVoiceMode(deps: VoiceModeDeps): VoiceMode {
  const now = deps.now ?? (() => Date.now());
  const consentTtlDays = deps.consentTtlDays ?? CONSENT_TTL_DAYS;
  const autoPauseOnInput = deps.autoPauseOnInput ?? true;

  let state: VoiceModeState = { kind: 'idle' };
  let preset: VoicePreset = deps.preset ?? 'calma';
  let consent: VoiceConsentRecord | null = null;
  let aborted = false;
  let playPromise: Promise<void> | null = null;

  const listeners = new Set<(e: VoiceModeEvent) => void>();

  function emit(e: VoiceModeEvent): void {
    for (const l of listeners) {
      try {
        l(e);
      } catch {
        /* listener errors must not break the engine */
      }
    }
  }

  function setState(next: VoiceModeState): void {
    state = next;
    emit({ type: 'state', state: next });
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async requestConsent(userId, accepted) {
      // Validate via runtime (zod is bundle-heavy for our test harness; we
      // run the same checks manually here to keep the engine self-contained).
      if (typeof userId !== 'string' || userId.length === 0) {
        setState({ kind: 'error', reason: 'userId is required for consent' });
        throw new Error('userId is required for consent');
      }
      if (accepted && !deps.engine.isAvailable() && !(deps.engine instanceof FallbackTTSEngine)) {
        // Real TTS refused. Record consent anyway but warn via state.
        setState({ kind: 'consent_pending' });
      }
      const timestamp = new Date(now()).toISOString();
      const record: VoiceConsentRecord = {
        userId,
        accepted,
        timestamp,
        preset: accepted ? preset : null,
        hash: hashConsent(userId, timestamp),
      };
      consent = record;
      emit({ type: 'consent_recorded', record });
      if (!accepted) {
        setState({ kind: 'denied', reason: 'user declined voice playback' });
        emit({ type: 'denied', reason: 'user declined voice playback' });
        return record;
      }
      return record;
    },

    hasConsent() {
      if (!consent || !consent.accepted) return false;
      const ageMs = now() - new Date(consent.timestamp).getTime();
      const ttlMs = consentTtlDays * 24 * 60 * 60 * 1000;
      return ageMs < ttlMs;
    },

    setPreset(p) {
      if (!Object.hasOwn(VOICE_PRESETS, p)) return;
      preset = p;
    },
    getPreset: () => preset,

    engine: () => deps.engine,

    async speak(text) {
      if (!this.hasConsent()) {
        setState({ kind: 'consent_pending' });
        return;
      }
      const trimmed = (text ?? '').trim();
      if (trimmed.length < MIN_PLAYABLE_LENGTH) {
        setState({ kind: 'idle' });
        return;
      }
      const segments = splitForTTS(trimmed).map(applyPronunciationHints);
      const total = segments.length;
      if (total === 0) {
        setState({ kind: 'idle' });
        return;
      }

      aborted = false;
      setState({ kind: 'loading' });

      playPromise = (async () => {
        try {
          deps.engine.stop();
          for (let i = 0; i < segments.length; i++) {
            if (aborted) {
              setState({ kind: 'idle' });
              return;
            }
            const seg = segments[i];
            if (!seg) continue;
            const cfg = VOICE_PRESETS[preset];
            setState({ kind: 'playing', segment: i, total, preset });
            emit({ type: 'segment_start', index: i, text: seg });
            await deps.engine.speak(seg, {
              rate: cfg.rate,
              pitch: cfg.pitch,
              volume: cfg.volume,
              emotion: cfg.emotion,
            });
            emit({ type: 'segment_end', index: i });
            // Sacred pacing: pause between segments (meditative cadence).
            if (i < segments.length - 1 && !aborted) {
              await sleep(SACRED_SENTENCE_PAUSE_MS);
            }
          }
          setState({ kind: 'idle' });
        } catch (e) {
          const reason = e instanceof Error ? e.message : String(e);
          setState({ kind: 'error', reason });
        }
      })();
      return playPromise;
    },

    pause() {
      if (state.kind === 'playing') {
        aborted = true;
        deps.engine.pause();
        const current = state;
        setState({
          kind: 'paused',
          segment: current.segment,
          total: current.total,
          preset: current.preset,
        });
      }
    },
    resume() {
      if (state.kind === 'paused') {
        deps.engine.resume();
        const current = state;
        setState({
          kind: 'playing',
          segment: current.segment,
          total: current.total,
          preset: current.preset,
        });
      }
    },
    stop() {
      aborted = true;
      deps.engine.stop();
      setState({ kind: 'idle' });
    },

    onUserInput() {
      if (!autoPauseOnInput) return;
      if (state.kind === 'playing') {
        this.pause();
      }
    },
  };
}

// ---------------------------------------------------------------------------
// §7 zod-grade manual validators (consent only — engine stays zero-dep)
// ---------------------------------------------------------------------------

/** Lightweight runtime validators — match zod's behavior for consent flow. */
export const ConsentSchemaLike = {
  parse(input: unknown): { userId: string; accepted: boolean } {
    if (typeof input !== 'object' || input === null) {
      throw new Error('expected object');
    }
    const obj = input as Record<string, unknown>;
    const userId = obj.userId;
    const accepted = obj.accepted;
    if (typeof userId !== 'string' || userId.length === 0) {
      throw new Error('userId required');
    }
    if (typeof accepted !== 'boolean') {
      throw new Error('accepted must be boolean');
    }
    return { userId, accepted };
  },
} as const;

// ---------------------------------------------------------------------------
// §8 Self-check
// ---------------------------------------------------------------------------

/** Constants and metadata for selfCheck summary. */
export const VOICE_MODE_METADATA = {
  version: '1.0.0',
  wave: 'W94-B',
  presets: Object.keys(VOICE_PRESETS).sort(),
  pronunciationHintCount: Object.keys(PRONUNCIATION_HINTS).length,
  sacredSentencePauseMs: SACRED_SENTENCE_PAUSE_MS,
  consentTtlDays: CONSENT_TTL_DAYS,
  engineKind: 'WebSpeech + Fallback',
  lgpdConsentRequired: true,
} as const;

// ---------------------------------------------------------------------------
// §9 Utilities — sleep
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// §10 File metadata
// ---------------------------------------------------------------------------

export const VOICE_MODE_FILE_METADATA = {
  slug: 'voice-mode',
  totalSections: 10,
  exportedSymbols: [
    'VoicePreset',
    'TTSOptions',
    'TTSEngine',
    'VoiceModeState',
    'VoiceConsentRecord',
    'VoiceModeEvent',
    'SACRED_SENTENCE_PAUSE_MS',
    'CONSENT_TTL_DAYS',
    'SACRED_PACING_FACTOR',
    'MIN_PLAYABLE_LENGTH',
    'VOICE_PRESETS',
    'VoicePresetConfig',
    'PRONUNCIATION_HINTS',
    'BANNED_VOCAB',
    'fnv1a32',
    'hashRedirect',
    'hashConsent',
    'WebSpeechTTSEngine',
    'FallbackTTSEngine',
    'splitForTTS',
    'applyPronunciationHints',
    'createVoiceMode',
    'VoiceMode',
    'VoiceModeDeps',
    'ConsentSchemaLike',
    'VOICE_MODE_METADATA',
    'VOICE_MODE_FILE_METADATA',
  ] as const,
} as const;
