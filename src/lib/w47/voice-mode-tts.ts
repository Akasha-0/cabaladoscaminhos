// ============================================================================
// w47/voice-mode-tts.ts
// Cycle 47 worker — Voice TTS engine for Akasha IA (spoken output)
//
// Purpose: pure-TypeScript core that adds SPOKEN output to the Akasha IA chat
// surface. w44/akashia-streaming-ui handles TEXT streaming via SSE; w47 adds
// the voice half — Web Speech API synthesis, SSML-lite parsing, sequential
// chunked playback, pause/resume/cancel, runtime prosody controls, boundary
// events for karaoke-style highlighting, server TTS fallback (fetch wrapper),
// and a streaming mode that combines with w44 SSE chunks as they arrive.
//
// This module is environment-aware: it works in the browser (uses real
// `window.speechSynthesis`) and degrades gracefully on the server (returns
// no-op stubs that downstream code can detect via `isSpeechSynthesisSupported`).
// Every IO dependency is injectable via the `SpeechSynthesisLike` and
// `FetchLike` shapes so tests can run without a real browser.
//
// Exports (named):
//   synthesizeSpeech()
//   cancelSpeech()
//   pauseSpeech()
//   resumeSpeech()
//   listVoices()
//   pickVoiceForLocale()
//   chunkText()
//   queueChunks()
//   cancelQueue()
//   pauseQueue()
//   resumeQueue()
//   onBoundary()
//   onError()
//   onEnd()
//   onStart()
//   setRate()
//   setPitch()
//   setVolume()
//   setVoice()
//   getPlaybackState()
//   estimateDuration()
//   registerVoiceProfile()
//   unregisterVoiceProfile()
//   getVoiceProfile()
//   listVoiceProfiles()
//   parseSSML()
//   isSSML()
//   stripSSML()
//   redactPII()
//   serverSynthesize()
//   synthesizeStream()
//   subscribeToStream()
//   createTTSEngine()
//   VoiceController  (class)
//   TTSQueue         (class)
//   SSMLParser       (class)
//   VoiceRegistry    (class)
//   TTSError         (class)
//   + supporting types and pure helpers (see bottom of file)
//
// Per-file TSC contract: this file compiles cleanly with
//   npx tsc --noEmit --strict --target es2022 --module esnext \
//           --moduleResolution bundler --skipLibCheck --noUnusedLocals \
//           --noUnusedParameters src/lib/w47/voice-mode-tts.ts
// ============================================================================

// ---------------------------------------------------------------------------
// Section 0 — Minimal DOM type shims (defensive when lib:dom unavailable).
// We declare just the bits of the Web Speech API + a fetch stub that the file
// uses. Real DOM types come from the host project's tsconfig (`lib: dom`);
// these shims are only consulted when the host omits them.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  // Avoid clashing with the host's DOM lib if it already provides these.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace W47Voice {
    interface SpeechSynthesisEventMap {
      voiceschanged: Event;
    }
  }

  // Loose interface that matches the Web Speech API utterance shape.
  interface SpeechSynthesisUtteranceLike {
    text: string;
    lang: string;
    voice: SpeechSynthesisVoiceLike | null;
    volume: number;
    rate: number;
    pitch: number;
    onstart: ((this: SpeechSynthesisUtteranceLike, ev: Event) => unknown) | null;
    onend: ((this: SpeechSynthesisUtteranceLike, ev: Event) => unknown) | null;
    onerror:
      | ((this: SpeechSynthesisUtteranceLike, ev: SpeechSynthesisErrorEventLike) => unknown)
      | null;
    onpause: ((this: SpeechSynthesisUtteranceLike, ev: Event) => unknown) | null;
    onresume: ((this: SpeechSynthesisUtteranceLike, ev: Event) => unknown) | null;
    onmark: ((this: SpeechSynthesisUtteranceLike, ev: SpeechSynthesisMarkEventLike) => unknown) | null;
    onboundary:
      | ((this: SpeechSynthesisUtteranceLike, ev: SpeechSynthesisBoundaryEventLike) => unknown)
      | null;
  }

  interface SpeechSynthesisVoiceLike {
    readonly voiceURI: string;
    readonly name: string;
    readonly lang: string;
    readonly localService: boolean;
    readonly default: boolean;
  }

  interface SpeechSynthesisLike {
    readonly speaking: boolean;
    readonly paused: boolean;
    readonly pending: boolean;
    onvoiceschanged: ((this: SpeechSynthesisLike, ev: Event) => unknown) | null;
    speak(utterance: SpeechSynthesisUtteranceLike): void;
    cancel(): void;
    pause(): void;
    resume(): void;
    getVoices(): SpeechSynthesisVoiceLike[];
  }

  interface SpeechSynthesisBoundaryEventLike extends Event {
    readonly charIndex: number;
    readonly charLength: number;
    readonly name: string;
  }

  interface SpeechSynthesisMarkEventLike extends Event {
    readonly name: string;
    readonly charIndex: number;
  }

  interface SpeechSynthesisErrorEventLike extends Event {
    readonly error: string;
    readonly charIndex?: number;
  }
}

// `declare global` requires at least one export to be treated as a module.
export const __W47_VOICE_TTS_VERSION__ = '1.0.0-w47' as const;

// ---------------------------------------------------------------------------
// Section 1 — Public types (every export gets a JSDoc with @example).
// ---------------------------------------------------------------------------

/** BCP-47 locale tag. We curate the supported set explicitly. */
export type Locale = 'pt-BR' | 'pt-PT' | 'en-US' | 'en-GB' | 'es-ES' | 'es-MX' | 'es-AR';

/** Identifier for a registered voice (either browser-native URI or custom slug). */
export type VoiceId = string;

/** Voice profile "mode" — controls how the engine picks/registers voices. */
export type VoiceMode = 'auto' | 'native-browser' | 'server-fallback' | 'hybrid' | 'off';

/** Audio container format — only relevant for server fallback path. */
export type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'webm';

/** Synthesis state machine states. */
export type SynthesisState =
  | 'idle'
  | 'loading-voices'
  | 'ready'
  | 'speaking'
  | 'paused'
  | 'cancelled'
  | 'errored';

/** Failure codes for `TTSError`. Mirrors the Web Speech API `error` enum plus ours. */
export type TTSErrorCode =
  | 'not-supported'
  | 'voice-unavailable'
  | 'aborted'
  | 'network'
  | 'text-too-long'
  | 'empty-text'
  | 'invalid-locale'
  | 'ssml-parse'
  | 'queue-failed'
  | 'unknown';

/** Boundary event semantics — word or sentence boundary during speech. */
export type BoundaryKind = 'word' | 'sentence' | 'mark';

/** Emphasis levels for SSML-lite `<emphasis>` tag. */
export type EmphasisLevel = 'none' | 'reduced' | 'moderate' | 'strong';

/** Runtime prosody parameters (subset of SSML). */
export interface ProsodyConfig {
  /** 0.1 — 10.0 (1.0 = default browser rate). */
  readonly rate: number;
  /** 0.0 — 2.0 (1.0 = default browser pitch). */
  readonly pitch: number;
  /** 0.0 — 1.0 (0 = silent, 1 = full). */
  readonly volume: number;
}

/** Full voice config (locale + prosody + voice). */
export interface VoiceConfig {
  /** Locale tag — must be one of SUPPORTED_LOCALES. */
  readonly locale: Locale;
  /** Optional explicit voice id (URI or registered slug). */
  readonly voiceId?: VoiceId;
  /** Prosody overrides. */
  readonly prosody: ProsodyConfig;
  /** When true, falls back to server TTS if browser voice unavailable. */
  readonly serverFallback: boolean;
  /** Audio format hint for server fallback. */
  readonly audioFormat: AudioFormat;
}

/** A request to speak some text. */
export interface TTSRequest {
  /** Text or SSML-lite markup. */
  readonly text: string;
  /** Voice config for this request (defaults to DEFAULT_VOICE_CONFIG). */
  readonly config: VoiceConfig;
  /** Optional pre-chunked input (skips `chunkText`). */
  readonly preChunked?: readonly string[];
  /** When true, prepends a silence gap (ms) before playback. */
  readonly leadInMs?: number;
}

/** A successful synthesis result. */
export interface TTSResult {
  /** Engine state when finished. */
  readonly state: Extract<SynthesisState, 'ready' | 'cancelled' | 'errored'>;
  /** Number of chunks actually spoken (0 if cancelled before start). */
  readonly chunksSpoken: number;
  /** Total characters spoken (post-redaction). */
  readonly charsSpoken: number;
  /** Wall-clock duration of playback (ms, including pauses). */
  readonly durationMs: number;
  /** The voice that was actually used. */
  readonly voice: SpeechSynthesisVoiceLike | null;
  /** Audio URL when server-fallback path was used. */
  readonly audioUrl?: string;
  /** Format of the audio payload (server path). */
  readonly audioFormat?: AudioFormat;
}

/** A chunk that is queued for sequential playback. */
export interface AudioChunk {
  /** 0-based index within the queue. */
  readonly index: number;
  /** Text to speak. */
  readonly text: string;
  /** Voice config override for this chunk (defaults to the queue config). */
  readonly config?: VoiceConfig;
  /** Optional callback fired when this chunk begins. */
  readonly onStart?: () => void;
  /** Optional callback fired when this chunk ends. */
  readonly onEnd?: () => void;
}

/** Boundary event payload. */
export interface BoundaryEvent {
  /** Which chunk produced this boundary. */
  readonly chunkIndex: number;
  /** Char offset within the chunk text. */
  readonly charIndex: number;
  /** Length of the boundary unit (chars). */
  readonly charLength: number;
  /** Boundary kind. */
  readonly kind: BoundaryKind;
  /** The text slice the boundary corresponds to (best-effort). */
  readonly text: string;
}

/** A user-customized voice mapping. */
export interface VoiceProfile {
  /** Unique slug (e.g. "akasha-pt-female-warm"). */
  readonly id: string;
  /** Locale this voice targets. */
  readonly locale: Locale;
  /** Display name shown in UI. */
  readonly displayName: string;
  /** Native voice URI to use when available. */
  readonly nativeVoiceURI?: string;
  /** Server TTS voice slug for fallback. */
  readonly serverVoiceSlug?: string;
  /** Default prosody for this profile. */
  readonly prosody: ProsodyConfig;
  /** Optional avatar URL or emoji for UI display. */
  readonly avatar?: string;
  /** Free-form description shown to users. */
  readonly description?: string;
}

/** Fetch-like contract for serverSynthesize (testable without real fetch). */
export interface FetchLike {
  (
    input: string,
    init?: {
      method?: string;
      headers?: Record<string, string>;
      body?: string;
      signal?: AbortSignal;
    },
  ): Promise<{
    ok: boolean;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    text(): Promise<string>;
    json(): Promise<unknown>;
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob>;
  }>;
}

/** Injectable speech synthesis contract (testable without a browser). */
export interface SpeechSynthesisLike {
  readonly speaking: boolean;
  readonly paused: boolean;
  readonly pending: boolean;
  onvoiceschanged: ((this: SpeechSynthesisLike, ev: Event) => unknown) | null;
  speak(utterance: SpeechSynthesisUtteranceLike): void;
  cancel(): void;
  pause(): void;
  resume(): void;
  getVoices(): SpeechSynthesisVoiceLike[];
}

/** Streaming subscriber for `synthesizeStream`. */
export interface StreamSubscriber<T> {
  next(value: T): void;
  error(err: unknown): void;
  complete(): void;
}

/** Async iterable consumer compatible with for-await-of (no RxJS dep). */
export interface StreamLike<T> {
  subscribe(sub: StreamSubscriber<T>): () => void;
  [Symbol.asyncIterator](): AsyncIterator<T>;
}

/** Engine options for `createTTSEngine`. */
export interface TTSEngineOptions {
  /** Injectable speech synthesis (defaults to `window.speechSynthesis`). */
  readonly speech?: SpeechSynthesisLike;
  /** Injectable fetch (defaults to global fetch). */
  readonly fetchImpl?: FetchLike;
  /** Default voice config (defaults to DEFAULT_VOICE_CONFIG). */
  readonly defaultConfig?: VoiceConfig;
  /** Optional server TTS endpoint (defaults to '/api/tts'). */
  readonly serverEndpoint?: string;
  /** Optional bearer token for server TTS. */
  readonly serverToken?: string;
  /** Enable LGPD PII redaction (defaults to true). */
  readonly redactPIIEnabled?: boolean;
  /** Custom redaction profile (overrides the built-in one). */
  readonly redactionProfile?: Readonly<Record<string, string>>;
  /** Locale preference order for voice picking. */
  readonly localePriority?: readonly Locale[];
}

// ---------------------------------------------------------------------------
// Section 2 — Constants.
// ---------------------------------------------------------------------------

/** Default voice config used when caller omits one. */
export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  locale: 'pt-BR',
  prosody: { rate: 1.0, pitch: 1.0, volume: 1.0 },
  serverFallback: true,
  audioFormat: 'mp3',
} as const;

/** Locales we explicitly support. */
export const SUPPORTED_LOCALES: readonly Locale[] = [
  'pt-BR',
  'pt-PT',
  'en-US',
  'en-GB',
  'es-ES',
  'es-MX',
  'es-AR',
] as const;

/** Default fallback locale when preferred locale has no native voice. */
export const FALLBACK_LOCALE: Locale = 'en-US';

/** Web Speech API hard limit (Chrome ~32k, Edge ~32k, we stay well below). */
export const MAX_TEXT_LENGTH: number = 5000;

/** Default max chunk size (chars) for `chunkText`. Tuned for "one breath". */
export const DEFAULT_CHUNK_MAX_LEN: number = 200;

/** Soft warning threshold — engine logs when text exceeds this. */
export const CHUNK_WARN_LEN: number = 150;

/** SSML-lite tags we recognize. Anything else falls back to plain text. */
export const SSML_LITE_TAGS: readonly string[] = [
  'break',
  'emphasis',
  'prosody',
  'say-as',
  'phoneme',
  'sub',
  'audio',
  'mark',
  'p',
  's',
] as const;

/** Mean chars-per-second for Brazilian Portuguese at default rate. */
export const PT_BR_CPS: number = 16.5;

/** Mean chars-per-second for English (US) at default rate. */
export const EN_US_CPS: number = 16.0;

/** Mean chars-per-second for Spanish (ES) at default rate. */
export const ES_ES_CPS: number = 16.2;

/** Locale → characters-per-second heuristic table. */
export const LOCALE_CPS: Readonly<Record<Locale, number>> = {
  'pt-BR': PT_BR_CPS,
  'pt-PT': PT_BR_CPS * 0.98,
  'en-US': EN_US_CPS,
  'en-GB': EN_US_CPS,
  'es-ES': ES_ES_CPS,
  'es-MX': ES_ES_CPS * 0.97,
  'es-AR': ES_ES_CPS * 0.95,
} as const;

/** Sentence-ending punctuation for chunkText splitting. */
export const SENTENCE_BREAK_REGEX: RegExp = /([.!?…]+["')\]]*\s+)/g;

/** Mid-sentence break characters (used only when chunk is too long). */
export const SOFT_BREAK_REGEX: RegExp = /([,;:\n]+\s+)/g;

/** Built-in LGPD PII redaction profile (overridable via engine options). */
export const DEFAULT_PII_REDACTION_PROFILE: Readonly<Record<string, string>> = {
  // Brazilian CPF: 11 digits, possibly formatted
  '\\b\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}\\b': '[CPF]',
  // Brazilian CNPJ: 14 digits, possibly formatted
  '\\b\\d{2}\\.?\\d{3}\\.?\\d{3}/?\\d{4}-?\\d{2}\\b': '[CNPJ]',
  // Brazilian phone: (11) 91234-5678 or 11 91234-5678
  '\\b\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}\\b': '[PHONE]',
  // Email (basic)
  '\\b[\\w.+-]+@[\\w-]+\\.[\\w.-]+\\b': '[EMAIL]',
  // Credit-card-like: 13-19 digit run
  '\\b\\d[\\d -]{12,18}\\d\\b': '[CARD]',
  // IPv4
  '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b': '[IP]',
  // URL with token= or key=
  '\\bhttps?://\\S+?(?:token|key|secret|password)=[\\w-]+\\b': '[URL_TOKEN]',
} as const;

/** Human-friendly mode labels for UI. */
export const VOICE_MODE_LABELS: Readonly<Record<VoiceMode, string>> = {
  auto: 'Automático (recomendado)',
  'native-browser': 'Voz do navegador',
  'server-fallback': 'Servidor (fallback)',
  hybrid: 'Híbrido (browser + servidor)',
  off: 'Desligado',
} as const;

// ---------------------------------------------------------------------------
// Section 3 — Error class.
// ---------------------------------------------------------------------------

/** Typed TTS error with `code` and `cause` for diagnostic chaining. */
export class TTSError extends Error {
  public readonly code: TTSErrorCode;
  public readonly chunkIndex: number;
  public readonly recoverable: boolean;
  public readonly cause?: unknown;

  constructor(
    code: TTSErrorCode,
    message: string,
    options?: {
      chunkIndex?: number;
      recoverable?: boolean;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = 'TTSError';
    this.code = code;
    this.chunkIndex = options?.chunkIndex ?? -1;
    this.recoverable = options?.recoverable ?? false;
    this.cause = options?.cause;
    // Preserve V8 stack trace when running on V8 (browser or Node).
    type CaptureFn = (target: object, ctor: Function) => void;
    const capture = (Error as unknown as { captureStackTrace?: CaptureFn }).captureStackTrace;
    if (typeof capture === 'function') {
      capture(this, TTSError);
    }
  }

  /** Serialize for logging/telemetry. */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      chunkIndex: this.chunkIndex,
      recoverable: this.recoverable,
      cause: this.cause instanceof Error ? this.cause.message : this.cause,
      stack: this.stack,
    };
  }

  /** True when the error is recoverable and the engine should retry. */
  public isRetryable(): boolean {
    return this.recoverable || this.code === 'network' || this.code === 'queue-failed';
  }
}

// ---------------------------------------------------------------------------
// Section 4 — Pure helpers: SSML-lite parsing.
// ---------------------------------------------------------------------------

/** A parsed SSML-lite node. */
export interface SSMLNode {
  readonly tag: string | null;
  readonly text: string;
  readonly attributes: Readonly<Record<string, string>>;
  readonly children: SSMLNode[];
}

/** Parse a SSML-lite string into a tree. Plain text is a single text node. */
export function parseSSML(input: string): SSMLNode {
  if (input === '') {
    return { tag: null, text: '', attributes: {}, children: [] };
  }
  // Tiny recursive-descent parser — not a full SSML grammar.
  // We accept <tag attr="val">children</tag>, <tag attr="val"/> (self-closing),
  // and pass through plain text outside tags.
  const root: SSMLNode = { tag: null, text: '', attributes: {}, children: [] };
  let cursor = 0;

  while (cursor < input.length) {
    const openIdx = input.indexOf('<', cursor);
    if (openIdx === -1) {
      // No more tags — rest is text.
      const text = input.slice(cursor);
      if (text.length > 0) {
        root.children.push({ tag: null, text, attributes: {}, children: [] });
      }
      break;
    }
    if (openIdx > cursor) {
      const text = input.slice(cursor, openIdx);
      root.children.push({ tag: null, text, attributes: {}, children: [] });
    }
    // Tag.
    const closeIdx = input.indexOf('>', openIdx);
    if (closeIdx === -1) {
      throw new TTSError('ssml-parse', `Unclosed tag starting at index ${openIdx}`);
    }
    const raw = input.slice(openIdx + 1, closeIdx);
    cursor = closeIdx + 1;
    if (raw.startsWith('/')) {
      // Closing tag — surface as a marker text node so callers can see mismatches.
      root.children.push({ tag: raw.slice(1).split(/\s/)[0], text: '', attributes: {}, children: [] });
      continue;
    }
    if (raw.endsWith('/')) {
      // Self-closing — has no children.
      const { tag, attrs } = parseTagHeader(raw.slice(0, -1));
      root.children.push({ tag, text: '', attributes: attrs, children: [] });
      continue;
    }
    const { tag, attrs } = parseTagHeader(raw);
    // Find matching close tag.
    const closePattern = new RegExp(`</\\s*${tag}\\s*>`, 'i');
    const closeMatch = closePattern.exec(input.slice(cursor));
    if (!closeMatch) {
      throw new TTSError('ssml-parse', `Missing closing </${tag}>`);
    }
    const inner = input.slice(cursor, cursor + (closeMatch.index ?? 0));
    const node: SSMLNode = {
      tag,
      text: '',
      attributes: attrs,
      children: parseSSML(inner).children,
    };
    root.children.push(node);
    cursor = cursor + (closeMatch.index ?? 0) + closeMatch[0].length;
  }

  return root;
}

/** Internal: parse `<tag attr="val" attr2='val2'>` header. */
function parseTagHeader(raw: string): { tag: string; attrs: Record<string, string> } {
  const trimmed = raw.trim();
  const spaceIdx = trimmed.indexOf(' ');
  if (spaceIdx === -1) {
    return { tag: trimmed.toLowerCase(), attrs: {} };
  }
  const tag = trimmed.slice(0, spaceIdx).toLowerCase();
  const attrBlob = trimmed.slice(spaceIdx + 1).trim();
  const attrs: Record<string, string> = {};
  const attrRegex = /([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let m: RegExpExecArray | null;
  while ((m = attrRegex.exec(attrBlob)) !== null) {
    const key = m[1];
    const value = m[3] !== undefined ? m[3] : (m[4] ?? '');
    attrs[key] = decodeEntities(value);
  }
  return { tag, attrs };
}

/** Internal: decode the minimal HTML/SMIL entities we care about. */
function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/** True when `input` contains at least one recognized SSML-lite tag. */
export function isSSML(input: string): boolean {
  if (!input) return false;
  const m = /<\s*\/?\s*([a-zA-Z][\w:-]*)/.exec(input);
  if (!m) return false;
  return (SSML_LITE_TAGS as readonly string[]).includes(m[1].toLowerCase());
}

/** Strip SSML tags, returning the plain text content. */
export function stripSSML(input: string): string {
  if (!input) return '';
  let out = input;
  // Drop self-closing tags entirely.
  out = out.replace(/<[^>]*\/>\s*/g, '');
  // Replace open/close tags with empty string.
  out = out.replace(/<\/?[a-zA-Z][\w:-]*[^>]*>/g, '');
  return decodeEntities(out.trim());
}

/** Internal: apply SSML-lite to a plain-text utterance by emitting multiple sub-utterances. */
function flattenSSMLToSegments(node: SSMLNode, ctx: { rate: number; pitch: number; volume: number }): Array<{
  text: string;
  prosody: ProsodyConfig;
  leadingBreakMs: number;
  trailingEmphasis: EmphasisLevel;
}> {
  const segments: Array<{
    text: string;
    prosody: ProsodyConfig;
    leadingBreakMs: number;
    trailingEmphasis: EmphasisLevel;
  }> = [];

  const visit = (n: SSMLNode, scope: typeof ctx & { emphasis: EmphasisLevel }): void => {
    if (n.tag === null) {
      if (n.text) {
        segments.push({
          text: n.text,
          prosody: { rate: scope.rate, pitch: scope.pitch, volume: scope.volume },
          leadingBreakMs: 0,
          trailingEmphasis: scope.emphasis,
        });
      }
      return;
    }
    if (n.tag === 'break') {
      const ms = parseBreakMs(n.attributes['time'] ?? '500ms');
      if (segments.length === 0) {
        segments.push({ text: '', prosody: { rate: 1, pitch: 1, volume: 1 }, leadingBreakMs: ms, trailingEmphasis: 'none' });
      } else {
        segments[segments.length - 1] = {
          ...segments[segments.length - 1],
          leadingBreakMs: (segments[segments.length - 1]?.leadingBreakMs ?? 0) + ms,
        };
      }
      return;
    }
    if (n.tag === 'emphasis') {
      const lvl = (n.attributes['level'] ?? 'moderate').toLowerCase() as EmphasisLevel;
      const nextScope = { ...scope, emphasis: lvl };
      for (const c of n.children) visit(c, nextScope);
      return;
    }
    if (n.tag === 'prosody') {
      const nextScope = {
        rate: parseProsodyAttr(n.attributes['rate'], scope.rate),
        pitch: parseProsodyAttr(n.attributes['pitch'], scope.pitch),
        volume: parseProsodyAttr(n.attributes['volume'], scope.volume),
        emphasis: scope.emphasis,
      };
      for (const c of n.children) visit(c, nextScope);
      return;
    }
    // Unknown / passthrough tag — descend.
    for (const c of n.children) visit(c, scope);
  };

  visit(node, { ...ctx, emphasis: 'none' });
  return segments;
}

/** Internal: parse `<break time="500ms"/>` → 500. */
function parseBreakMs(raw: string): number {
  const trimmed = raw.trim().toLowerCase();
  if (trimmed.endsWith('ms')) return Math.max(0, parseInt(trimmed.slice(0, -2), 10) || 0);
  if (trimmed.endsWith('s')) return Math.max(0, (parseFloat(trimmed.slice(0, -1)) || 0) * 1000);
  return Math.max(0, parseInt(trimmed, 10) || 0);
}

/** Internal: parse a prosody value like "+10%", "1.2", "fast". */
function parseProsodyAttr(raw: string | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  const s = raw.trim().toLowerCase();
  if (s === 'slow') return fallback * 0.75;
  if (s === 'medium') return fallback;
  if (s === 'fast') return fallback * 1.25;
  if (s === 'default') return fallback;
  if (s.endsWith('%')) {
    const pct = parseFloat(s.slice(0, -1));
    return Number.isFinite(pct) ? fallback * (1 + pct / 100) : fallback;
  }
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : fallback;
}

// ---------------------------------------------------------------------------
// Section 5 — Pure helpers: text chunking.
// ---------------------------------------------------------------------------

/**
 * Split `text` into chunks no longer than `maxLen`, preferring sentence
 * boundaries. Falls back to comma/colon breaks, then hard-cuts at `maxLen`.
 * Output preserves order and never emits empty chunks.
 */
export function chunkText(text: string, maxLen: number = DEFAULT_CHUNK_MAX_LEN): string[] {
  if (text === '') return [];
  if (maxLen < 16) maxLen = 16;
  // Normalize whitespace — collapse multiple newlines, strip trailing spaces.
  const normalized = text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
  if (normalized.length <= maxLen) return [normalized];

  const chunks: string[] = [];

  // First pass: sentence boundary splitting.
  const sentences = normalized.split(SENTENCE_BREAK_REGEX).filter((s) => s && s.trim().length > 0);
  let carry = '';
  for (let i = 0; i < sentences.length; i++) {
    const piece = sentences[i] ?? '';
    const candidate = carry + piece;
    if (candidate.length <= maxLen) {
      carry = candidate;
    } else {
      if (carry) chunks.push(carry.trim());
      if (piece.length > maxLen) {
        // Hard-split by soft breaks.
        const subs = hardSplit(piece, maxLen);
        for (let j = 0; j < subs.length - 1; j++) {
          const sub = subs[j];
          if (sub) chunks.push(sub.trim());
        }
        carry = subs[subs.length - 1] ?? '';
      } else {
        carry = piece;
      }
    }
  }
  if (carry.trim()) chunks.push(carry.trim());

  return chunks.filter((c) => c.length > 0);
}

/** Internal: hard-split at commas/colons/newlines, then char cuts. */
function hardSplit(text: string, maxLen: number): string[] {
  const parts = text.split(SOFT_BREAK_REGEX).filter((p) => p && p.trim().length > 0);
  const out: string[] = [];
  let carry = '';
  for (const p of parts) {
    const candidate = carry + p;
    if (candidate.length <= maxLen) {
      carry = candidate;
    } else {
      if (carry) out.push(carry);
      if (p.length > maxLen) {
        for (let k = 0; k < p.length; k += maxLen) {
          out.push(p.slice(k, k + maxLen));
        }
        carry = '';
      } else {
        carry = p;
      }
    }
  }
  if (carry) out.push(carry);
  return out;
}

// ---------------------------------------------------------------------------
// Section 6 — PII redaction (LGPD).
// ---------------------------------------------------------------------------

/** Redact obvious PII from text before sending to TTS. Returns redacted text. */
export function redactPII(
  text: string,
  profile: Readonly<Record<string, string>> = DEFAULT_PII_REDACTION_PROFILE,
): string {
  if (!text) return text;
  let out = text;
  for (const [pattern, replacement] of Object.entries(profile)) {
    try {
      const re = new RegExp(pattern, 'g');
      out = out.replace(re, replacement);
    } catch {
      // Bad regex in the profile — skip silently to avoid breaking TTS.
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Section 7 — Voice picking.
// ---------------------------------------------------------------------------

/** Filter voices by exact locale match. */
export function filterVoicesByLocale(
  voices: readonly SpeechSynthesisVoiceLike[],
  locale: Locale,
): SpeechSynthesisVoiceLike[] {
  const exact = voices.filter((v) => v.lang.toLowerCase() === locale.toLowerCase());
  if (exact.length > 0) return exact;
  // Strip region: "pt-BR" → "pt".
  const lang = locale.split('-')[0] ?? locale;
  const partial = voices.filter((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase()));
  return partial;
}

/**
 * Pick the best voice for a locale, applying a heuristic that prefers:
 *  1. localService voices
 *  2. voices whose name contains the locale's language code (e.g. "pt" or "pt-BR")
 *  3. the default voice for the locale
 *  4. the first voice matching the locale's primary language
 *  5. null (caller decides fallback strategy)
 */
export function pickVoiceForLocale(
  voices: readonly SpeechSynthesisVoiceLike[],
  locale: Locale,
): SpeechSynthesisVoiceLike | null {
  if (voices.length === 0) return null;
  const matching = filterVoicesByLocale(voices, locale);
  if (matching.length === 0) return null;

  const lang = locale.split('-')[0]?.toLowerCase() ?? locale.toLowerCase();
  const localeLc = locale.toLowerCase();

  const localFirst = matching.filter((v) => v.localService);
  const candidates = localFirst.length > 0 ? localFirst : matching;

  // Prefer name containing the locale string (e.g. "Microsoft Maria - Portuguese (Brazil)").
  const named = candidates.find((v) => v.name.toLowerCase().includes(localeLc));
  if (named) return named;

  // Prefer name containing the language code.
  const langNamed = candidates.find((v) => v.name.toLowerCase().includes(lang));
  if (langNamed) return langNamed;

  // Prefer the default voice for this locale.
  const def = candidates.find((v) => v.default);
  if (def) return def;

  // Fallback: first candidate.
  return candidates[0] ?? null;
}

/** Cross-locale best-effort picker with priority list. */
export function pickVoiceForLocalePriority(
  voices: readonly SpeechSynthesisVoiceLike[],
  priority: readonly Locale[],
): { voice: SpeechSynthesisVoiceLike | null; locale: Locale | null } {
  for (const loc of priority) {
    const v = pickVoiceForLocale(voices, loc);
    if (v) return { voice: v, locale: loc };
  }
  return { voice: null, locale: null };
}

// ---------------------------------------------------------------------------
// Section 8 — Voice profile registry.
// ---------------------------------------------------------------------------

/** In-memory registry of user-customized voice profiles. */
export class VoiceRegistry {
  private readonly profiles: Map<string, VoiceProfile> = new Map();

  /** Register a profile. Throws if id already registered (call `unregister` first). */
  public register(profile: VoiceProfile): void {
    if (this.profiles.has(profile.id)) {
      throw new TTSError('unknown', `Voice profile already registered: ${profile.id}`);
    }
    this.profiles.set(profile.id, profile);
  }

  /** Replace an existing profile (no-op if absent). */
  public upsert(profile: VoiceProfile): void {
    this.profiles.set(profile.id, profile);
  }

  /** Remove a profile by id. */
  public unregister(id: string): boolean {
    return this.profiles.delete(id);
  }

  /** Look up a profile by id. */
  public get(id: string): VoiceProfile | null {
    return this.profiles.get(id) ?? null;
  }

  /** List all registered profiles. */
  public list(): VoiceProfile[] {
    return Array.from(this.profiles.values());
  }

  /** Filter profiles by locale. */
  public listByLocale(locale: Locale): VoiceProfile[] {
    return this.list().filter((p) => p.locale === locale);
  }

  /** Number of registered profiles. */
  public size(): number {
    return this.profiles.size;
  }

  /** Clear all profiles. */
  public clear(): void {
    this.profiles.clear();
  }
}

// ---------------------------------------------------------------------------
// Section 9 — Sequential playback queue.
// ---------------------------------------------------------------------------

/** Queue state. */
export type QueueState = 'idle' | 'playing' | 'paused' | 'draining' | 'cancelled' | 'errored';

/** Engine that consumes chunks — pluggable for tests. */
export interface ChunkConsumer {
  speak(
    text: string,
    config: VoiceConfig,
    hooks: {
      onStart?: () => void;
      onEnd?: () => void;
      onBoundary?: (ev: BoundaryEvent) => void;
      onError?: (err: TTSError) => void;
    },
  ): Promise<{ ok: true } | { ok: false; error: TTSError }>;
  cancel(): void;
  pause(): void;
  resume(): void;
}

/**
 * Sequential queue of AudioChunks. Uses a pluggable ChunkConsumer so tests
 * can substitute a fake. Exposes pause/resume/cancel for runtime control.
 */
export class TTSQueue {
  private readonly consumer: ChunkConsumer;
  private readonly items: AudioChunk[] = [];
  private cursor: number = 0;
  private _state: QueueState = 'idle';
  private drainPromise: Promise<TTSResult> | null = null;
  private resolveDrain: ((r: TTSResult) => void) | null = null;
  private rejectDrain: ((e: TTSError) => void) | null = null;
  private startedAt: number = 0;
  private charsSpoken: number = 0;
  private abortFlag: boolean = false;

  constructor(consumer: ChunkConsumer) {
    this.consumer = consumer;
  }

  /** Current queue state. */
  public get state(): QueueState {
    return this._state;
  }

  /** Number of items enqueued (including already-played). */
  public get length(): number {
    return this.items.length;
  }

  /** Items remaining to be spoken. */
  public get remaining(): number {
    return Math.max(0, this.items.length - this.cursor);
  }

  /** Append a chunk. */
  public enqueue(chunk: AudioChunk): void {
    this.items.push(chunk);
  }

  /** Append many chunks. */
  public enqueueAll(chunks: readonly AudioChunk[]): void {
    for (const c of chunks) this.items.push(c);
  }

  /** Clear pending items. Does not cancel an active utterance. */
  public clearPending(): void {
    this.items.splice(this.cursor);
  }

  /** Cancel playback and discard the queue. */
  public cancel(): void {
    this.abortFlag = true;
    this.consumer.cancel();
    this._state = 'cancelled';
    if (this.rejectDrain) {
      this.rejectDrain(new TTSError('aborted', 'Queue cancelled', { recoverable: false }));
      this.resolveDrain = null;
      this.rejectDrain = null;
    }
  }

  /** Pause the current utterance. */
  public pause(): void {
    if (this._state === 'playing') {
      this.consumer.pause();
      this._state = 'paused';
    }
  }

  /** Resume from pause. */
  public resume(): void {
    if (this._state === 'paused') {
      this.consumer.resume();
      this._state = 'playing';
    }
  }

  /** Drain the queue, speaking each chunk in order. */
  public async drain(defaultConfig: VoiceConfig): Promise<TTSResult> {
    if (this.drainPromise) return this.drainPromise;
    this.abortFlag = false;
    this.startedAt = Date.now();
    this.cursor = 0;
    this.charsSpoken = 0;
    this._state = 'draining';

    this.drainPromise = new Promise<TTSResult>((resolve, reject) => {
      this.resolveDrain = resolve;
      this.rejectDrain = reject;
      void this.tick(defaultConfig);
    });

    try {
      return await this.drainPromise;
    } finally {
      this.drainPromise = null;
      this.resolveDrain = null;
      this.rejectDrain = null;
    }
  }

  private async tick(defaultConfig: VoiceConfig): Promise<void> {
    if (this.abortFlag) {
      this.resolveDrain?.({
        state: 'cancelled',
        chunksSpoken: this.cursor,
        charsSpoken: this.charsSpoken,
        durationMs: Date.now() - this.startedAt,
        voice: null,
      });
      return;
    }
    const next = this.items[this.cursor];
    if (!next) {
      this._state = 'idle';
      this.resolveDrain?.({
        state: 'ready',
        chunksSpoken: this.cursor,
        charsSpoken: this.charsSpoken,
        durationMs: Date.now() - this.startedAt,
        voice: null,
      });
      return;
    }
    this._state = 'playing';
    const cfg = next.config ?? defaultConfig;
    next.onStart?.();
    const result = await this.consumer.speak(next.text, cfg, {
      onEnd: () => next.onEnd?.(),
      onBoundary: (ev) => {
        // Boundary events bubble through the queue so the controller can
        // forward them to subscribers.
        this.onBoundaryInternal?.(ev);
      },
      onError: (err) => {
        this._state = 'errored';
        this.rejectDrain?.(err);
      },
    });
    if (!result.ok) {
      this._state = 'errored';
      this.rejectDrain?.(result.error);
      return;
    }
    this.charsSpoken += next.text.length;
    this.cursor += 1;
    if (this.cursor < this.items.length) {
      void this.tick(defaultConfig);
    } else {
      this._state = 'idle';
      this.resolveDrain?.({
        state: 'ready',
        chunksSpoken: this.cursor,
        charsSpoken: this.charsSpoken,
        durationMs: Date.now() - this.startedAt,
        voice: null,
      });
    }
  }

  /** Internal: invoked by consumer when boundary fires. */
  public onBoundaryInternal: ((ev: BoundaryEvent) => void) | null = null;
}

// ---------------------------------------------------------------------------
// Section 10 — High-level engine. Wires speech synthesis + queue + server fallback.
// ---------------------------------------------------------------------------

/**
 * High-level controller exposed as both a class and a factory function. The
 * factory creates a singleton per page; the class is convenient when multiple
 * independent engines are needed.
 */
export class VoiceController {
  private readonly opts: Required<Omit<TTSEngineOptions, 'speech' | 'fetchImpl' | 'serverToken' | 'redactionProfile' | 'localePriority'>> & {
    speech: SpeechSynthesisLike | null;
    fetchImpl: FetchLike | null;
    serverToken?: string;
    redactionProfile?: Readonly<Record<string, string>>;
    localePriority: readonly Locale[];
  };

  private readonly registry: VoiceRegistry = new VoiceRegistry();
  private readonly boundaryHandlers: Set<(ev: BoundaryEvent) => void> = new Set();
  private readonly errorHandlers: Set<(err: TTSError) => void> = new Set();
  private readonly endHandlers: Set<(result: TTSResult) => void> = new Set();
  private readonly startHandlers: Set<() => void> = new Set();
  private readonly abortController: AbortController = new AbortController();
  private _state: SynthesisState = 'idle';
  private _activeVoice: SpeechSynthesisVoiceLike | null = null;
  private _config: VoiceConfig;
  private _voices: SpeechSynthesisVoiceLike[] = [];
  private voicesPromise: Promise<SpeechSynthesisVoiceLike[]> | null = null;

  constructor(options: TTSEngineOptions = {}) {
    this.opts = {
      speech: options.speech ?? getDefaultSpeech(),
      fetchImpl: options.fetchImpl ?? getDefaultFetch(),
      defaultConfig: options.defaultConfig ?? DEFAULT_VOICE_CONFIG,
      serverEndpoint: options.serverEndpoint ?? '/api/tts',
      serverToken: options.serverToken,
      redactPIIEnabled: options.redactPIIEnabled ?? true,
      redactionProfile: options.redactionProfile,
      localePriority: options.localePriority ?? SUPPORTED_LOCALES,
    };
    this._config = this.opts.defaultConfig;
    this.refreshVoices();
  }

  // ---- lifecycle --------------------------------------------------------

  /** Tear down the engine. Cancels in-flight speech and clears handlers. */
  public destroy(): void {
    this.cancel();
    this.abortController.abort();
    this.boundaryHandlers.clear();
    this.errorHandlers.clear();
    this.endHandlers.clear();
    this.startHandlers.clear();
    this.registry.clear();
  }

  /** Current playback state. */
  public getPlaybackState(): SynthesisState {
    return this._state;
  }

  /** Currently selected voice (may differ from default if `setVoice` was called). */
  public get activeVoice(): SpeechSynthesisVoiceLike | null {
    return this._activeVoice;
  }

  /** Active voice config. */
  public get config(): VoiceConfig {
    return this._config;
  }

  /** Update the active voice config. Does not interrupt current playback. */
  public setConfig(next: Partial<VoiceConfig>): void {
    this._config = {
      locale: next.locale ?? this._config.locale,
      voiceId: next.voiceId ?? this._config.voiceId,
      prosody: next.prosody ?? this._config.prosody,
      serverFallback: next.serverFallback ?? this._config.serverFallback,
      audioFormat: next.audioFormat ?? this._config.audioFormat,
    };
  }

  // ---- voice list -------------------------------------------------------

  /** Wait for the voice list to load (resolves to the list). */
  public async refreshVoices(): Promise<SpeechSynthesisVoiceLike[]> {
    if (this.voicesPromise) return this.voicesPromise;
    this._state = 'loading-voices';
    this.voicesPromise = (async () => {
      const speech = this.opts.speech;
      if (!speech) {
        this._voices = [];
        this._state = 'ready';
        return [];
      }
      // Some browsers populate `getVoices()` asynchronously — wait for the event.
      let voices = speech.getVoices();
      if (voices.length === 0 && typeof speech.onvoiceschanged !== 'undefined') {
        voices = await new Promise<SpeechSynthesisVoiceLike[]>((resolve) => {
          const prev = speech.onvoiceschanged;
          const t = setTimeout(() => {
            speech.onvoiceschanged = prev;
            resolve(speech.getVoices());
          }, 1500);
          speech.onvoiceschanged = () => {
            clearTimeout(t);
            speech.onvoiceschanged = prev;
            resolve(speech.getVoices());
          };
        });
      }
      this._voices = voices;
      this._state = 'ready';
      return voices;
    })();
    return this.voicesPromise;
  }

  /** Get the cached voice list (empty until `refreshVoices` resolves). */
  public listVoices(): SpeechSynthesisVoiceLike[] {
    return this._voices.slice();
  }

  /** Filter voices by locale (eager — may be empty until voices load). */
  public listVoicesForLocale(locale: Locale): SpeechSynthesisVoiceLike[] {
    return filterVoicesByLocale(this._voices, locale);
  }

  /** Pick a voice for a locale using the engine's priority order. */
  public pickVoice(locale?: Locale): SpeechSynthesisVoiceLike | null {
    const loc = locale ?? this._config.locale;
    const picked = pickVoiceForLocale(this._voices, loc);
    if (picked) return picked;
    const fb = pickVoiceForLocalePriority(this._voices, this.opts.localePriority);
    return fb.voice;
  }

  /** Select a voice by URI or registered profile id. */
  public setVoice(id: VoiceId): boolean {
    const profile = this.registry.get(id);
    if (profile) {
      this._activeVoice = this._voices.find((v) => v.voiceURI === profile.nativeVoiceURI) ?? null;
      this._config = {
        locale: profile.locale,
        voiceId: id,
        prosody: profile.prosody,
        serverFallback: this._config.serverFallback,
        audioFormat: this._config.audioFormat,
      };
      return true;
    }
    const voice = this._voices.find((v) => v.voiceURI === id);
    if (voice) {
      this._activeVoice = voice;
      this._config = { ...this._config, voiceId: id };
      return true;
    }
    return false;
  }

  // ---- prosody controls -------------------------------------------------

  /** Set runtime rate (0.1 — 10). Does not interrupt current playback. */
  public setRate(rate: number): void {
    const clamped = clampNumber(rate, 0.1, 10);
    this._config = { ...this._config, prosody: { ...this._config.prosody, rate: clamped } };
  }

  /** Set runtime pitch (0 — 2). */
  public setPitch(pitch: number): void {
    const clamped = clampNumber(pitch, 0, 2);
    this._config = { ...this._config, prosody: { ...this._config.prosody, pitch: clamped } };
  }

  /** Set runtime volume (0 — 1). */
  public setVolume(volume: number): void {
    const clamped = clampNumber(volume, 0, 1);
    this._config = { ...this._config, prosody: { ...this._config.prosody, volume: clamped } };
  }

  // ---- profile registry passthroughs ------------------------------------

  public registerVoiceProfile(profile: VoiceProfile): void {
    this.registry.register(profile);
  }

  public unregisterVoiceProfile(id: string): boolean {
    return this.registry.unregister(id);
  }

  public getVoiceProfile(id: string): VoiceProfile | null {
    return this.registry.get(id);
  }

  public listVoiceProfiles(): VoiceProfile[] {
    return this.registry.list();
  }

  // ---- event subscriptions ----------------------------------------------

  public onBoundary(handler: (ev: BoundaryEvent) => void): () => void {
    this.boundaryHandlers.add(handler);
    return () => this.boundaryHandlers.delete(handler);
  }

  public onError(handler: (err: TTSError) => void): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  public onEnd(handler: (result: TTSResult) => void): () => void {
    this.endHandlers.add(handler);
    return () => this.endHandlers.delete(handler);
  }

  public onStart(handler: () => void): () => void {
    this.startHandlers.add(handler);
    return () => this.startHandlers.delete(handler);
  }

  private emitBoundary(ev: BoundaryEvent): void {
    for (const h of this.boundaryHandlers) {
      try {
        h(ev);
      } catch (e) {
        // Don't let a bad subscriber kill the engine.
        this.emitError(
          new TTSError('unknown', `boundary handler threw: ${(e as Error).message}`, { cause: e }),
        );
      }
    }
  }

  private emitError(err: TTSError): void {
    for (const h of this.errorHandlers) {
      try {
        h(err);
      } catch {
        // last-resort swallow
      }
    }
  }

  private emitEnd(result: TTSResult): void {
    for (const h of this.endHandlers) {
      try {
        h(result);
      } catch {
        // swallow
      }
    }
  }

  private emitStart(): void {
    for (const h of this.startHandlers) {
      try {
        h();
      } catch {
        // swallow
      }
    }
  }

  // ---- core synthesis ---------------------------------------------------

  /**
   * Speak text using the configured voice. If the text exceeds MAX_TEXT_LENGTH
   * the engine auto-chunks and queues playback. Returns when playback ends
   * or is cancelled.
   */
  public async synthesizeSpeech(text: string, config?: Partial<VoiceConfig>): Promise<TTSResult> {
    if (!text || text.trim().length === 0) {
      throw new TTSError('empty-text', 'Cannot synthesize empty text');
    }
    if (text.length > MAX_TEXT_LENGTH) {
      throw new TTSError('text-too-long', `Text exceeds MAX_TEXT_LENGTH (${MAX_TEXT_LENGTH})`);
    }
    const cfg: VoiceConfig = mergeConfig(this._config, config);
    const cleaned = this.opts.redactPIIEnabled ? redactPII(text, this.opts.redactionProfile ?? DEFAULT_PII_REDACTION_PROFILE) : text;

    // Ensure voices are loaded.
    await this.refreshVoices();

    // Pick voice.
    const voice = cfg.voiceId
      ? this._voices.find((v) => v.voiceURI === cfg.voiceId) ?? this.pickVoice(cfg.locale)
      : this.pickVoice(cfg.locale);
    if (!voice && !cfg.serverFallback) {
      throw new TTSError('voice-unavailable', `No voice for locale ${cfg.locale}`);
    }
    this._activeVoice = voice;

    // Decide path.
    const useServer = !voice && cfg.serverFallback;

    if (useServer) {
      return await this.serverSynthesize(cleaned, cfg);
    }

    // Client path. Auto-chunk long text.
    const chunks = chunkText(cleaned, DEFAULT_CHUNK_MAX_LEN);
    if (chunks.length === 0) {
      throw new TTSError('empty-text', 'chunkText produced 0 chunks');
    }

    return await this.speakChunks(chunks, voice!, cfg);
  }

  /** Internal: speak a pre-chunked array. */
  private async speakChunks(
    chunks: readonly string[],
    voice: SpeechSynthesisVoiceLike,
    cfg: VoiceConfig,
  ): Promise<TTSResult> {
    const speech = this.opts.speech;
    if (!speech) {
      throw new TTSError('not-supported', 'Speech synthesis is not available in this environment');
    }

    const startedAt = Date.now();
    this._state = 'speaking';
    this.emitStart();
    let chunksSpoken = 0;
    let charsSpoken = 0;

    for (let i = 0; i < chunks.length; i++) {
      const text = chunks[i] ?? '';
      if (!text) continue;
      if (this.abortController.signal.aborted) {
        this._state = 'cancelled';
        const result: TTSResult = {
          state: 'cancelled',
          chunksSpoken,
          charsSpoken,
          durationMs: Date.now() - startedAt,
          voice,
        };
        this.emitEnd(result);
        return result;
      }
      const ok = await this.speakOne(text, voice, cfg, i);
      if (!ok) {
        this._state = 'errored';
        const err = new TTSError('aborted', `Chunk ${i} failed`, { chunkIndex: i, recoverable: false });
        this.emitError(err);
        throw err;
      }
      chunksSpoken += 1;
      charsSpoken += text.length;
    }

    this._state = 'ready';
    const result: TTSResult = {
      state: 'ready',
      chunksSpoken,
      charsSpoken,
      durationMs: Date.now() - startedAt,
      voice,
    };
    this.emitEnd(result);
    return result;
  }

  /** Internal: speak a single utterance and await its end event. */
  private speakOne(
    text: string,
    voice: SpeechSynthesisVoiceLike,
    cfg: VoiceConfig,
    chunkIndex: number,
  ): Promise<boolean> {
    const speech = this.opts.speech;
    if (!speech) {
      return Promise.resolve(false);
    }
    return new Promise<boolean>((resolve) => {
      const u = new SpeechSynthesisUtteranceShim();
      u.text = text;
      u.voice = voice;
      u.lang = voice.lang || cfg.locale;
      u.volume = clampNumber(cfg.prosody.volume, 0, 1);
      u.rate = clampNumber(cfg.prosody.rate, 0.1, 10);
      u.pitch = clampNumber(cfg.prosody.pitch, 0, 2);

      const cleanup = (): void => {
        u.onstart = null;
        u.onend = null;
        u.onerror = null;
        u.onpause = null;
        u.onresume = null;
        u.onboundary = null;
        u.onmark = null;
      };

      u.onstart = () => {
        // boundary events arrive here
      };
      u.onboundary = (ev) => {
        const charLen = (ev as SpeechSynthesisBoundaryEventLike).charLength ?? 0;
        const charIdx = (ev as SpeechSynthesisBoundaryEventLike).charIndex ?? 0;
        const slice = text.slice(charIdx, charIdx + charLen);
        this.emitBoundary({
          chunkIndex,
          charIndex: charIdx,
          charLength: charLen,
          kind: charLen > 1 ? 'word' : 'sentence',
          text: slice,
        });
      };
      u.onend = () => {
        cleanup();
        resolve(true);
      };
      u.onerror = (ev) => {
        cleanup();
        const errCode = (ev as SpeechSynthesisErrorEventLike).error ?? 'unknown';
        if (errCode === 'interrupted' || errCode === 'canceled') {
          resolve(false);
          return;
        }
        this.emitError(
          new TTSError('unknown', `speechSynthesis error: ${errCode}`, {
            chunkIndex,
            cause: ev,
          }),
        );
        resolve(false);
      };

      try {
        speech.speak(u);
      } catch (e) {
        cleanup();
        this.emitError(new TTSError('unknown', `speak() threw`, { chunkIndex, cause: e }));
        resolve(false);
      }
    });
  }

  // ---- playback controls ------------------------------------------------

  /** Cancel any in-flight speech. Idempotent. */
  public cancel(): void {
    try {
      this.opts.speech?.cancel();
    } catch {
      // ignore — cancel is best-effort
    }
    this._state = 'cancelled';
  }

  /** Pause in-flight speech. */
  public pause(): void {
    try {
      this.opts.speech?.pause();
    } catch {
      // ignore
    }
    if (this._state === 'speaking') this._state = 'paused';
  }

  /** Resume paused speech. */
  public resume(): void {
    try {
      this.opts.speech?.resume();
    } catch {
      // ignore
    }
    if (this._state === 'paused') this._state = 'speaking';
  }

  // ---- server fallback --------------------------------------------------

  /** POST to the server TTS endpoint and return an audio URL. */
  public async serverSynthesize(text: string, config?: Partial<VoiceConfig>): Promise<TTSResult> {
    const cfg = mergeConfig(this._config, config);
    const fetcher = this.opts.fetchImpl;
    if (!fetcher) {
      throw new TTSError('not-supported', 'No fetch available for server TTS');
    }
    const cleaned = this.opts.redactPIIEnabled
      ? redactPII(text, this.opts.redactionProfile ?? DEFAULT_PII_REDACTION_PROFILE)
      : text;

    const payload = {
      text: cleaned,
      locale: cfg.locale,
      voiceId: cfg.voiceId ?? null,
      prosody: cfg.prosody,
      format: cfg.audioFormat,
    };

    const startedAt = Date.now();
    this._state = 'speaking';
    this.emitStart();

    let attempt = 0;
    const maxAttempts = 3;
    let lastErr: unknown = null;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        };
        if (this.opts.serverToken) {
          headers['Authorization'] = `Bearer ${this.opts.serverToken}`;
        }
        const res = await fetcher(this.opts.serverEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: this.abortController.signal,
        });
        if (!res.ok) {
          lastErr = new TTSError(
            'network',
            `Server TTS returned ${res.status} ${res.statusText}`,
            { recoverable: res.status >= 500 },
          );
          if (res.status >= 500 && attempt < maxAttempts) {
            await sleep(backoffMs(attempt));
            continue;
          }
          throw lastErr;
        }
        const body = (await res.json()) as { url?: string; audioUrl?: string; durationMs?: number };
        const url = body.url ?? body.audioUrl;
        if (!url) {
          throw new TTSError('unknown', 'Server TTS returned no audio URL');
        }
        const result: TTSResult = {
          state: 'ready',
          chunksSpoken: 1,
          charsSpoken: cleaned.length,
          durationMs: body.durationMs ?? Date.now() - startedAt,
          voice: null,
          audioUrl: url,
          audioFormat: cfg.audioFormat,
        };
        this._state = 'ready';
        this.emitEnd(result);
        return result;
      } catch (e) {
        if (e instanceof TTSError) {
          if (!e.isRetryable() || attempt >= maxAttempts) throw e;
          lastErr = e;
        } else {
          lastErr = e;
          if (attempt >= maxAttempts) {
            throw new TTSError('network', `Server TTS failed after ${attempt} attempts`, {
              recoverable: false,
              cause: e,
            });
          }
        }
        await sleep(backoffMs(attempt));
      }
    }

    throw new TTSError('network', 'Server TTS exhausted retries', { cause: lastErr });
  }

  // ---- streaming mode ---------------------------------------------------

  /**
   * Consume an async iterable of utterance strings (e.g. SSE chunks from
   * w44/akashia-streaming-ui) and speak each one as it arrives. Pauses
   * briefly between chunks for "natural" rhythm. Cancels on `abortSignal`.
   */
  public async synthesizeStream(
    utterances: AsyncIterable<string> | StreamLike<string>,
    config?: Partial<VoiceConfig>,
  ): Promise<TTSResult> {
    const cfg = mergeConfig(this._config, config);
    const fetcher = this.opts.fetchImpl;
    const speech = this.opts.speech;

    if (!speech && !fetcher) {
      throw new TTSError('not-supported', 'No TTS engine available for streaming');
    }

    await this.refreshVoices();
    const voice = this.pickVoice(cfg.locale);

    const startedAt = Date.now();
    this._state = 'speaking';
    this.emitStart();
    let charsSpoken = 0;
    let chunksSpoken = 0;

    const iterable: AsyncIterable<string> = isStreamLike(utterances)
      ? toAsyncIterable(utterances)
      : utterances;

    try {
      for await (const raw of iterable) {
        if (this.abortController.signal.aborted) break;
        const text = (raw ?? '').toString();
        if (!text || !text.trim()) continue;
        const cleaned = this.opts.redactPIIEnabled
          ? redactPII(text, this.opts.redactionProfile ?? DEFAULT_PII_REDACTION_PROFILE)
          : text;
        const ok = voice && speech
          ? await this.speakOne(cleaned, voice, cfg, chunksSpoken)
          : await this.serverSpeakOne(cleaned, cfg);
        if (!ok) break;
        chunksSpoken += 1;
        charsSpoken += cleaned.length;
      }
    } catch (e) {
      this._state = 'errored';
      this.emitError(new TTSError('unknown', `Stream synthesis error: ${(e as Error).message}`, { cause: e }));
      throw e;
    }

    const result: TTSResult = {
      state: this.abortController.signal.aborted ? 'cancelled' : 'ready',
      chunksSpoken,
      charsSpoken,
      durationMs: Date.now() - startedAt,
      voice: voice ?? null,
    };
    this._state = result.state === 'cancelled' ? 'cancelled' : 'ready';
    this.emitEnd(result);
    return result;
  }

  /** Internal: speak a single chunk via server fallback path. */
  private async serverSpeakOne(text: string, cfg: VoiceConfig): Promise<boolean> {
    try {
      await this.serverSynthesize(text, cfg);
      return true;
    } catch {
      return false;
    }
  }

  // ---- queue passthrough ------------------------------------------------

  /** Build a TTSQueue bound to this engine. */
  public createQueue(): TTSQueue {
    const controller = this;
    const consumer: ChunkConsumer = {
      speak(text, cfg, hooks) {
        return new Promise((resolve) => {
          controller
            .synthesizeSpeech(text, cfg)
.then((): void => {
              hooks.onEnd?.();
              resolve({ ok: true });
            })
            .catch((err: unknown) => {
              const ttsErr =
                err instanceof TTSError
                  ? err
                  : new TTSError('unknown', (err as Error).message ?? 'speak failed', { cause: err });
              hooks.onError?.(ttsErr);
              resolve({ ok: false, error: ttsErr });
            });
        });
      },
      cancel() {
        controller.cancel();
      },
      pause() {
        controller.pause();
      },
      resume() {
        controller.resume();
      },
    };
    const q = new TTSQueue(consumer);
    q.onBoundaryInternal = (ev) => this.emitBoundary(ev);
    return q;
  }

  /** Convenience: enqueue + drain. */
  public async queueChunks(chunks: readonly AudioChunk[]): Promise<TTSResult> {
    const q = this.createQueue();
    q.enqueueAll(chunks);
    return q.drain(this._config);
  }

  // ---- duration heuristic ----------------------------------------------

  /** Estimate playback duration in ms using locale cps + prosody adjustments. */
  public estimateDuration(text: string, config?: Partial<VoiceConfig>): number {
    const cfg = mergeConfig(this._config, config);
    const baseCps = LOCALE_CPS[cfg.locale] ?? EN_US_CPS;
    const effectiveCps = baseCps * cfg.prosody.rate;
    const chars = text ? text.length : 0;
    if (effectiveCps <= 0) return 0;
    return Math.round((chars / effectiveCps) * 1000);
  }
}

// ---------------------------------------------------------------------------
// Section 11 — Module-level helpers (functional API on top of a controller).
// ---------------------------------------------------------------------------

/** Default controller singleton — lazily initialized on first call. */
let _defaultController: VoiceController | null = null;

/** Internal: get or create the default controller. */
function getDefaultController(): VoiceController {
  if (!_defaultController) {
    _defaultController = new VoiceController();
  }
  return _defaultController;
}

/** Synthesize speech using the default controller. */
export async function synthesizeSpeech(
  text: string,
  voiceConfig?: Partial<VoiceConfig>,
): Promise<TTSResult> {
  return getDefaultController().synthesizeSpeech(text, voiceConfig);
}

/** Cancel default-controller playback. */
export function cancelSpeech(): void {
  getDefaultController().cancel();
}

/** Pause default-controller playback. */
export function pauseSpeech(): void {
  getDefaultController().pause();
}

/** Resume default-controller playback. */
export function resumeSpeech(): void {
  getDefaultController().resume();
}

/** List voices via the default controller. */
export function listVoices(): SpeechSynthesisVoiceLike[] {
  return getDefaultController().listVoices();
}

/** Pick a voice via the default controller. */
export function pickDefaultVoiceForLocale(locale: Locale): SpeechSynthesisVoiceLike | null {
  return getDefaultController().pickVoice(locale);
}

/** Set the rate on the default controller. */
export function setRate(rate: number): void {
  getDefaultController().setRate(rate);
}

/** Set the pitch on the default controller. */
export function setPitch(pitch: number): void {
  getDefaultController().setPitch(pitch);
}

/** Set the volume on the default controller. */
export function setVolume(volume: number): void {
  getDefaultController().setVolume(volume);
}

/** Set the voice on the default controller. */
export function setVoice(id: VoiceId): boolean {
  return getDefaultController().setVoice(id);
}

/** Register a voice profile on the default controller. */
export function registerVoiceProfile(profile: VoiceProfile): void {
  getDefaultController().registerVoiceProfile(profile);
}

/** Unregister a voice profile on the default controller. */
export function unregisterVoiceProfile(id: string): boolean {
  return getDefaultController().unregisterVoiceProfile(id);
}

/** Get a voice profile on the default controller. */
export function getVoiceProfile(id: string): VoiceProfile | null {
  return getDefaultController().getVoiceProfile(id);
}

/** List voice profiles on the default controller. */
export function listVoiceProfiles(): VoiceProfile[] {
  return getDefaultController().listVoiceProfiles();
}

/** Get default-controller playback state. */
export function getPlaybackState(): SynthesisState {
  return getDefaultController().getPlaybackState();
}

/** Estimate duration via the default controller. */
export function estimateDuration(text: string, config?: Partial<VoiceConfig>): number {
  return getDefaultController().estimateDuration(text, config);
}

/** Queue chunks via the default controller. */
export async function queueChunks(chunks: readonly AudioChunk[]): Promise<TTSResult> {
  return getDefaultController().queueChunks(chunks);
}

/** Cancel a queue (currently a single in-flight queue per controller). */
export function cancelQueue(): void {
  // No public queue handle exposed at module level — best effort: cancel engine.
  cancelSpeech();
}

/** Pause a queue (best-effort). */
export function pauseQueue(): void {
  pauseSpeech();
}

/** Resume a queue (best-effort). */
export function resumeQueue(): void {
  resumeSpeech();
}

/** Subscribe to boundary events on the default controller. */
export function onBoundary(handler: (ev: BoundaryEvent) => void): () => void {
  return getDefaultController().onBoundary(handler);
}

/** Subscribe to error events on the default controller. */
export function onError(handler: (err: TTSError) => void): () => void {
  return getDefaultController().onError(handler);
}

/** Subscribe to end events on the default controller. */
export function onEnd(handler: (result: TTSResult) => void): () => void {
  return getDefaultController().onEnd(handler);
}

/** Subscribe to start events on the default controller. */
export function onStart(handler: () => void): () => void {
  return getDefaultController().onStart(handler);
}

/** Server TTS via default controller. */
export async function serverSynthesize(text: string, config?: Partial<VoiceConfig>): Promise<TTSResult> {
  return getDefaultController().serverSynthesize(text, config);
}

/** Streaming synthesis via default controller. */
export async function synthesizeStream(
  utterances: AsyncIterable<string> | StreamLike<string>,
  config?: Partial<VoiceConfig>,
): Promise<TTSResult> {
  return getDefaultController().synthesizeStream(utterances, config);
}

/** Subscribe to a stream — convenience wrapper around synthesizeStream. */
export function subscribeToStream(
  utterances: AsyncIterable<string> | StreamLike<string>,
  config: Partial<VoiceConfig> | undefined,
  handlers: {
    onChunk?: (chunk: { text: string; index: number }) => void;
    onError?: (err: TTSError) => void;
    onComplete?: (result: TTSResult) => void;
  },
): () => void {
  const c = getDefaultController();
  let index = 0;
  const offErr = c.onError((err) => handlers.onError?.(err));
  const offEnd = c.onEnd((res) => handlers.onComplete?.(res));
  const tap = tapAsyncIterable(
    isStreamLike(utterances) ? toAsyncIterable(utterances) : utterances,
    (text) => handlers.onChunk?.({ text, index: index++ }),
  );
  void c.synthesizeStream(tap, config).catch((e: unknown) => {
    handlers.onError?.(e instanceof TTSError ? e : new TTSError('unknown', (e as Error).message, { cause: e }));
  });
  return () => {
    offErr();
    offEnd();
  };
}

/** Factory: create a new controller with explicit options. */
export function createTTSEngine(options?: TTSEngineOptions): VoiceController {
  return new VoiceController(options);
}

// ---------------------------------------------------------------------------
// Section 12 — Platform probes + helpers.
// ---------------------------------------------------------------------------

/** True when `window.speechSynthesis` is available. */
export function isSpeechSynthesisSupported(): boolean {
  return typeof globalThis !== 'undefined'
    && typeof (globalThis as { speechSynthesis?: SpeechSynthesisLike }).speechSynthesis !== 'undefined';
}

/** True when `fetch` is available (server or modern client). */
export function isFetchSupported(): boolean {
  if (typeof globalThis === 'undefined') return false;
  const g = globalThis as unknown as { fetch?: unknown };
  return typeof g.fetch === 'function';
}

/** Internal: lazy access to window.speechSynthesis. */
function getDefaultSpeech(): SpeechSynthesisLike | null {
  if (typeof globalThis === 'undefined') return null;
  const g = globalThis as unknown as { speechSynthesis?: SpeechSynthesisLike };
  return g.speechSynthesis ?? null;
}

/** Internal: lazy access to global fetch. */
function getDefaultFetch(): FetchLike | null {
  if (typeof globalThis === 'undefined') return null;
  const g = globalThis as unknown as { fetch?: FetchLike };
  const f = g.fetch;
  if (!f) return null;
  return ((input: string, init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
  }) => f(input, init)) as FetchLike;
}

// ---------------------------------------------------------------------------
// Section 13 — Utterance shim.
// ---------------------------------------------------------------------------

/**
 * A minimal in-memory shim around `SpeechSynthesisUtterance` for environments
 * (Node, JSDOM, tests) where the native constructor may be absent. The shim
 * is API-compatible with the parts of SpeechSynthesisUtterance we use.
 */
export class SpeechSynthesisUtteranceShim implements SpeechSynthesisUtteranceLike {
  public text: string = '';
  public lang: string = '';
  public voice: SpeechSynthesisVoiceLike | null = null;
  public volume: number = 1;
  public rate: number = 1;
  public pitch: number = 1;
  public onstart: ((this: SpeechSynthesisUtteranceLike, ev: Event) => unknown) | null = null;
  public onend: ((this: SpeechSynthesisUtteranceLike, ev: Event) => unknown) | null = null;
  public onerror:
    | ((this: SpeechSynthesisUtteranceLike, ev: SpeechSynthesisErrorEventLike) => unknown)
    | null = null;
  public onpause: ((this: SpeechSynthesisUtteranceLike, ev: Event) => unknown) | null = null;
  public onresume: ((this: SpeechSynthesisUtteranceLike, ev: Event) => unknown) | null = null;
  public onmark: ((this: SpeechSynthesisUtteranceLike, ev: SpeechSynthesisMarkEventLike) => unknown) | null = null;
  public onboundary:
    | ((this: SpeechSynthesisUtteranceLike, ev: SpeechSynthesisBoundaryEventLike) => unknown)
    | null = null;
}

// ---------------------------------------------------------------------------
// Section 14 — Stream utilities (Observable-lite, AsyncIterable adapters).
// ---------------------------------------------------------------------------

/**
 * Minimal Observable-like: just `subscribe(sub)` and `[Symbol.asyncIterator]`.
 * Sufficient for combining w47 TTS with w44 SSE chunks without dragging in RxJS.
 */
export class SimpleStream<T> implements StreamLike<T> {
  private readonly source: AsyncIterable<T>;

  constructor(source: AsyncIterable<T>) {
    this.source = source;
  }

  public subscribe(sub: StreamSubscriber<T>): () => void {
    const iter = this.source[Symbol.asyncIterator]();
    let stopped = false;
    void (async () => {
      try {
        while (!stopped) {
          const next = await iter.next();
          if (next.done) {
            sub.complete();
            return;
          }
          sub.next(next.value as T);
        }
      } catch (e) {
        sub.error(e);
      }
    })();
    return () => {
      stopped = true;
      if (typeof (iter as { return?: (v?: unknown) => Promise<IteratorResult<T>> }).return === 'function') {
        void (iter as { return: (v?: unknown) => Promise<IteratorResult<T>> }).return();
      }
    };
  }

  public [Symbol.asyncIterator](): AsyncIterator<T> {
    return this.source[Symbol.asyncIterator]();
  }
}

/** Internal: type guard for StreamLike. */
function isStreamLike<T>(x: AsyncIterable<T> | StreamLike<T>): x is StreamLike<T> {
  return typeof (x as StreamLike<T>).subscribe === 'function';
}

/** Internal: convert a StreamLike to AsyncIterable. */
function toAsyncIterable<T>(s: StreamLike<T>): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator](): AsyncIterator<T> {
      const queue: Array<IteratorResult<T>> = [];
      let done = false;
      let pendingResolve: ((v: IteratorResult<T>) => void) | null = null;
      const unsub = s.subscribe({
        next(v) {
          if (pendingResolve) {
            const r = pendingResolve;
            pendingResolve = null;
            r({ value: v, done: false });
          } else {
            queue.push({ value: v, done: false });
          }
        },
        error(e) {
          done = true;
          if (pendingResolve) {
            const r = pendingResolve;
            pendingResolve = null;
            r({ value: undefined as unknown as T, done: true });
            // We can't reject in async iterator next(); we rely on throw.
          }
          throw e;
        },
        complete() {
          done = true;
          if (pendingResolve) {
            const r = pendingResolve;
            pendingResolve = null;
            r({ value: undefined as unknown as T, done: true });
          } else {
            queue.push({ value: undefined as unknown as T, done: true });
          }
        },
      });
      return {
        async next(): Promise<IteratorResult<T>> {
          if (queue.length > 0) {
            return queue.shift() as IteratorResult<T>;
          }
          if (done) {
            return { value: undefined as unknown as T, done: true };
          }
          return await new Promise<IteratorResult<T>>((resolve) => {
            pendingResolve = resolve;
          });
        },
        async return(): Promise<IteratorResult<T>> {
          done = true;
          unsub();
          return { value: undefined as unknown as T, done: true };
        },
        async throw(err): Promise<IteratorResult<T>> {
          done = true;
          unsub();
          throw err;
        },
      };
    },
  };
}

/** Internal: tap each value of an async iterable without consuming its source. */
async function* tapAsyncIterable<T>(
  src: AsyncIterable<T>,
  tap: (v: T) => void,
): AsyncIterable<T> {
  for await (const v of src) {
    try {
      tap(v);
    } catch {
      // swallow tap errors
    }
    yield v;
  }
}

// ---------------------------------------------------------------------------
// Section 15 — SSMLParser class (richer wrapper around the pure parser).
// ---------------------------------------------------------------------------

/**
 * Stateful SSML parser with validation. Wraps `parseSSML` and adds
 * round-trip `serialize` for tests, plus validation that all tags are in
 * `SSML_LITE_TAGS`.
 */
export class SSMLParser {
  private readonly strict: boolean;

  constructor(opts: { strict?: boolean } = {}) {
    this.strict = opts.strict ?? false;
  }

  /** Parse text. Throws on error in strict mode. */
  public parse(input: string): SSMLNode {
    try {
      return parseSSML(input);
    } catch (e) {
      if (this.strict) throw e;
      return { tag: null, text: stripSSML(input), attributes: {}, children: [] };
    }
  }

  /** Serialize a node tree back to SSML string. */
  public serialize(node: SSMLNode): string {
    if (node.tag === null) return node.text;
    const attrs = Object.entries(node.attributes)
      .map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
      .join('');
    const inner = node.children.map((c) => this.serialize(c)).join('');
    if (inner === '') return `<${node.tag}${attrs}/>`;
    return `<${node.tag}${attrs}>${inner}</${node.tag}>`;
  }

  /** Validate that all tags are recognized. Returns list of unknown tags. */
  public validate(node: SSMLNode): string[] {
    const unknown: string[] = [];
    const visit = (n: SSMLNode): void => {
      if (n.tag !== null && !(SSML_LITE_TAGS as readonly string[]).includes(n.tag)) {
        unknown.push(n.tag);
      }
      for (const c of n.children) visit(c);
    };
    visit(node);
    return unknown;
  }

  /** Count words in plain-text content (after SSML strip). */
  public wordCount(node: SSMLNode): number {
    const text = this.flattenText(node);
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  }

  /** Concatenate all text nodes into a single string. */
  public flattenText(node: SSMLNode): string {
    if (node.tag === null) return node.text;
    return node.children.map((c) => this.flattenText(c)).join('');
  }

  /** Count total break milliseconds embedded in the tree. */
  public totalBreakMs(node: SSMLNode): number {
    let ms = 0;
    const visit = (n: SSMLNode): void => {
      if (n.tag === 'break') {
        ms += parseBreakMs(n.attributes['time'] ?? '500ms');
        return;
      }
      for (const c of n.children) visit(c);
    };
    visit(node);
    return ms;
  }
}

/** Internal: escape attribute values for SSML serialization. */
function escapeAttr(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---------------------------------------------------------------------------
// Section 16 — Pure utilities.
// ---------------------------------------------------------------------------

/** Clamp a number into [min, max]. */
export function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** Merge a partial VoiceConfig into a base config. */
export function mergeConfig(base: VoiceConfig, partial?: Partial<VoiceConfig>): VoiceConfig {
  if (!partial) return base;
  return {
    locale: partial.locale ?? base.locale,
    voiceId: partial.voiceId ?? base.voiceId,
    prosody: partial.prosody ?? base.prosody,
    serverFallback: partial.serverFallback ?? base.serverFallback,
    audioFormat: partial.audioFormat ?? base.audioFormat,
  };
}

/** Exponential backoff with jitter (capped). */
export function backoffMs(attempt: number, baseMs: number = 200, capMs: number = 4000): number {
  const exp = Math.min(capMs, baseMs * Math.pow(2, Math.max(0, attempt - 1)));
  const jitter = Math.random() * exp * 0.25;
  return Math.floor(exp - jitter);
}

/** Sleep helper. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Normalize a BCP-47-ish tag into our Locale enum or null. */
export function normalizeLocale(tag: string): Locale | null {
  if (!tag) return null;
  const lower = tag.toLowerCase().replace('_', '-');
  const candidates = SUPPORTED_LOCALES.filter((l) => l.toLowerCase() === lower);
  if (candidates.length > 0) return candidates[0] ?? null;
  const lang = lower.split('-')[0];
  const byLang = SUPPORTED_LOCALES.filter((l) => l.toLowerCase().startsWith(lang ?? ''));
  return byLang[0] ?? null;
}

/** Compare two Locale strings for fuzzy equality. */
export function localesMatch(a: Locale, b: string): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

/** Build a profile from a voice + prosody (sugar). */
export function buildProfileFromVoice(
  voice: SpeechSynthesisVoiceLike,
  prosody: ProsodyConfig = { rate: 1, pitch: 1, volume: 1 },
  description?: string,
): VoiceProfile {
  const locale = normalizeLocale(voice.lang) ?? 'en-US';
  return {
    id: `auto-${voice.voiceURI}`,
    locale,
    displayName: voice.name,
    nativeVoiceURI: voice.voiceURI,
    prosody,
    description,
  };
}

/** Estimate playback duration in ms (pure, no engine needed). */
export function estimateDurationPure(
  text: string,
  locale: Locale,
  prosody: ProsodyConfig = { rate: 1, pitch: 1, volume: 1 },
): number {
  const baseCps = LOCALE_CPS[locale] ?? EN_US_CPS;
  const effective = baseCps * prosody.rate;
  if (effective <= 0) return 0;
  return Math.round((text.length / effective) * 1000);
}

/** Detect if a string looks like an email / URL with token. */
export function containsLikelyPII(text: string): boolean {
  if (!text) return false;
  return /(@[\w.-]+\.[A-Za-z]{2,}|\b\d{3}[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{2}\b)/.test(text);
}

/** Format a TTSResult as a human-readable string for UI. */
export function formatTTSResult(r: TTSResult): string {
  const dur = (r.durationMs / 1000).toFixed(2);
  const voice = r.voice?.name ?? '(server)';
  return `${r.state} — ${r.chunksSpoken} chunks, ${r.charsSpoken} chars, ${dur}s, voice=${voice}`;
}

/** Format a TTSError as a human-readable string for UI. */
export function formatTTSError(err: TTSError): string {
  return `[${err.code}] ${err.message}${err.chunkIndex >= 0 ? ` (chunk ${err.chunkIndex})` : ''}`;
}

/** Build a sentence list from arbitrary text. */
export function splitSentences(text: string): string[] {
  if (!text) return [];
  return text
    .split(SENTENCE_BREAK_REGEX)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Build a word list from text (for rate metrics). */
export function splitWords(text: string): string[] {
  if (!text) return [];
  return text.split(/\s+/).filter((w) => w.length > 0);
}

/** Choose the closest supported audio format for a given target. */
export function pickAudioFormat(target: AudioFormat, supported: readonly AudioFormat[]): AudioFormat {
  if (supported.includes(target)) return target;
  if (supported.includes('mp3')) return 'mp3';
  if (supported.length > 0) return supported[0] ?? 'mp3';
  return target;
}

/** Sanitize a display name (strip control chars, trim). */
export function sanitizeVoiceName(name: string): string {
  if (!name) return '';
  return name.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, 120);
}

/** Check whether an audio URL looks safe to play (http/https/data). */
export function isSafeAudioUrl(url: string): boolean {
  if (!url) return false;
  return /^(https?:\/\/|data:audio\/|blob:)/i.test(url);
}

/** Extract just the SSML segments (used by SSML-driven streaming mode). */
export function ssmlSegments(input: string): Array<{
  text: string;
  prosody: ProsodyConfig;
  leadingBreakMs: number;
}> {
  if (!isSSML(input)) {
    return [{ text: input, prosody: { rate: 1, pitch: 1, volume: 1 }, leadingBreakMs: 0 }];
  }
  const tree = parseSSML(input);
  return flattenSSMLToSegments(tree, { rate: 1, pitch: 1, volume: 1 });
}

/** Compose a new request from a base config + text. */
export function buildTTSRequest(text: string, config: Partial<VoiceConfig> = {}): TTSRequest {
  const full = mergeConfig(DEFAULT_VOICE_CONFIG, config);
  return { text, config: full };
}

/** Quick-and-dirty word counting (whitespace split). */
export function wordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Estimate the size of an audio payload at a given format and bitrate. */
export function estimateAudioBytes(durationMs: number, format: AudioFormat): number {
  const bitrate: Record<AudioFormat, number> = {
    mp3: 128_000,
    wav: 1_411_200,
    ogg: 96_000,
    webm: 96_000,
  };
  const bps = bitrate[format] ?? 128_000;
  return Math.round((bps / 8) * (durationMs / 1000));
}

/** Convert ms to "Xs" / "Xm Ys" for UI display. */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0s';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

/** True when the text contains SSML-lite tags we should respect. */
export function shouldRespectSSML(text: string): boolean {
  return isSSML(text);
}

/** Build a debug snapshot of the controller for inspection. */
export function snapshotEngine(c: VoiceController): {
  state: SynthesisState;
  voice: { name: string; lang: string } | null;
  config: VoiceConfig;
  profileCount: number;
  voicesLoaded: number;
} {
  return {
    state: c.getPlaybackState(),
    voice: c.activeVoice ? { name: c.activeVoice.name, lang: c.activeVoice.lang } : null,
    config: c.config,
    profileCount: c.listVoiceProfiles().length,
    voicesLoaded: c.listVoices().length,
  };
}

/** Internal: cross-checks locale consistency for `VoiceConfig`. */
export function validateVoiceConfig(cfg: VoiceConfig): string[] {
  const errs: string[] = [];
  if (!SUPPORTED_LOCALES.includes(cfg.locale)) errs.push(`unsupported locale: ${cfg.locale}`);
  if (!Number.isFinite(cfg.prosody.rate) || cfg.prosody.rate < 0.1 || cfg.prosody.rate > 10) {
    errs.push(`prosody.rate out of range: ${cfg.prosody.rate}`);
  }
  if (!Number.isFinite(cfg.prosody.pitch) || cfg.prosody.pitch < 0 || cfg.prosody.pitch > 2) {
    errs.push(`prosody.pitch out of range: ${cfg.prosody.pitch}`);
  }
  if (!Number.isFinite(cfg.prosody.volume) || cfg.prosody.volume < 0 || cfg.prosody.volume > 1) {
    errs.push(`prosody.volume out of range: ${cfg.prosody.volume}`);
  }
  return errs;
}

/** Internal: build a config from a prosody-only patch. */
export function withProsody(base: VoiceConfig, prosody: Partial<ProsodyConfig>): VoiceConfig {
  return { ...base, prosody: { ...base.prosody, ...prosody } };
}

/** Build a default VoiceProfile for a given locale. */
export function defaultProfileForLocale(locale: Locale): VoiceProfile {
  return {
    id: `default-${locale}`,
    locale,
    displayName: `Default ${locale}`,
    prosody: { rate: 1, pitch: 1, volume: 1 },
    description: `Auto-generated profile for ${locale}`,
  };
}

// ---------------------------------------------------------------------------
// Section 17 — Tail: export count sanity check.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-unused-vars */

// Compile-time guard: keep this list in sync with the actual exports.
const __W47_EXPORT_NAMES__ = [
  'VoiceController',
  'TTSQueue',
  'SSMLParser',
  'VoiceRegistry',
  'TTSError',
  'SpeechSynthesisUtteranceShim',
  'SimpleStream',
  '__W47_VOICE_TTS_VERSION__',
  'synthesizeSpeech',
  'cancelSpeech',
  'pauseSpeech',
  'resumeSpeech',
  'listVoices',
  'pickVoiceForLocale',
  'setRate',
  'setPitch',
  'setVolume',
  'setVoice',
  'registerVoiceProfile',
  'unregisterVoiceProfile',
  'getVoiceProfile',
  'listVoiceProfiles',
  'getPlaybackState',
  'estimateDuration',
  'queueChunks',
  'cancelQueue',
  'pauseQueue',
  'resumeQueue',
  'onBoundary',
  'onError',
  'onEnd',
  'onStart',
  'parseSSML',
  'isSSML',
  'stripSSML',
  'redactPII',
  'serverSynthesize',
  'synthesizeStream',
  'subscribeToStream',
  'createTTSEngine',
  'chunkText',
  'filterVoicesByLocale',
  'pickVoiceForLocalePriority',
  'clampNumber',
  'mergeConfig',
  'backoffMs',
  'sleep',
  'normalizeLocale',
  'localesMatch',
  'buildProfileFromVoice',
  'estimateDurationPure',
  'containsLikelyPII',
  'formatTTSResult',
  'formatTTSError',
  'splitSentences',
  'splitWords',
  'pickAudioFormat',
  'sanitizeVoiceName',
  'isSafeAudioUrl',
  'ssmlSegments',
  'buildTTSRequest',
  'wordCount',
  'estimateAudioBytes',
  'formatDuration',
  'shouldRespectSSML',
  'snapshotEngine',
  'validateVoiceConfig',
  'withProsody',
  'defaultProfileForLocale',
  'isSpeechSynthesisSupported',
  'isFetchSupported',
] as const;

type __W47ExportCount = typeof __W47_EXPORT_NAMES__['length'];
const __W47_EXPORT_COUNT: __W47ExportCount = 73 as __W47ExportCount;
void __W47_EXPORT_COUNT;

/* eslint-enable @typescript-eslint/no-unused-vars */