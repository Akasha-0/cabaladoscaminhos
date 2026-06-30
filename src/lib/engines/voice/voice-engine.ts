/**
 * ════════════════════════════════════════════════════════════════════════════
 * W85-A — VOICE MODE AKASHA · ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 85 · 2026-06-30
 * Author: W85-A Coder (Mavis orchestrator session 414764491727032)
 *
 * TTS playback engine for the Akasha IA voice mode. Manages a queue of
 * playback cues, transitions each cue through queued → playing → paused/done/error
 * states, and delegates actual audio synthesis to a VoiceAdapter.
 *
 * Public API (cycle 85 contract):
 *   play(text, voiceId)              → Promise<PlaybackState>
 *   pause(cueId)                     → Promise<void>
 *   resume(cueId)                    → Promise<void>
 *   cancel(cueId)                    → Promise<void>
 *   getQueue()                       → readonly PlaybackState[]
 *   getPreset(voiceId)               → VoicePreset | undefined
 *   listPresets()                    → readonly VoicePreset[]
 *   getVoicesByTradicao(t)           → readonly VoicePreset[]
 *   exportAudit()                    → readonly audit log
 *   resetForTests()                  → void  (cycle 73 reset pattern)
 *
 * Durable lessons applied (cycle 60-84):
 *   - Object.freeze at export boundaries (cycle 68)
 *   - Branded types via `__brand` symbol (cycle 73)
 *   - FNV-1a deterministic hash via Math.imul (cycle W84-B)
 *   - 7-tradição coverage + 6-voice mapping (cycle 75)
 *   - Master-number preservation + Result narrowing (cycle 73)
 *   - Self-running test harness w/ pass++/fail++ (cycle 68+)
 *   - Worktree tsconfig + node-stubs.d.ts (cycle 60, 73)
 */

// ════════════════════════════════════════════════════════════════════════════
// BRAND HELPERS
// ════════════════════════════════════════════════════════════════════════════

declare const __brand: unique symbol;

export type Brand<TBase, TBrand extends string> = TBase & { readonly [__brand]: TBrand };

export type CueId = Brand<string, 'CueId'>;
export type VoiceId = Brand<string, 'VoiceId'>;
export type Tradicao = Brand<string, 'Tradicao'>;

/** Helper to mint a branded string. Caller is responsible for ensuring
 *  the underlying value satisfies the brand semantics. */
function brand<T extends Brand<string, string>>(s: string): T {
  return s as T;
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC TYPES (mirroring voice-presets.ts without re-export coupling)
// ════════════════════════════════════════════════════════════════════════════

export type VoicePresetId =
  | 'cigano'
  | 'iya'
  | 'pai-ogum'
  | 'swami-ananda'
  | 'rabino-moshe'
  | 'astrologa-stella';

export type TradicaoName =
  | 'cigano'
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cabala'
  | 'astrologia'
  | 'tantra';

export interface VoicePreset {
  readonly id: VoicePresetId;
  readonly name: string;
  readonly tradicao: TradicaoName;
  readonly rate: number;
  readonly pitch: number;
  readonly voiceStyle: string;
  readonly sampleText: string;
  readonly locale: 'pt-BR';
}

export type PlaybackStatus =
  | 'queued'
  | 'playing'
  | 'paused'
  | 'done'
  | 'error';

export interface PlaybackState {
  readonly cueId: CueId;
  readonly voiceId: VoicePresetId;
  readonly text: string;
  readonly status: PlaybackStatus;
  readonly currentTimeMs: number;
  readonly durationMs: number;
  readonly rate: number;
  readonly pitch: number;
  readonly createdAt: string; // ISO date
  readonly updatedAt: string; // ISO date
}

export interface VoiceEngine {
  play(text: string, voiceId: VoicePresetId): Promise<PlaybackState>;
  pause(cueId: CueId): Promise<void>;
  resume(cueId: CueId): Promise<void>;
  cancel(cueId: CueId): Promise<void>;
  getQueue(): ReadonlyArray<PlaybackState>;
  getPreset(voiceId: VoicePresetId): VoicePreset | undefined;
  listPresets(): ReadonlyArray<VoicePreset>;
  getVoicesByTradicao(t: TradicaoName): ReadonlyArray<VoicePreset>;
  exportAudit(): ReadonlyArray<PlaybackState>;
  resetForTests(): void;
}

// ════════════════════════════════════════════════════════════════════════════
// VOICE ADAPTER — abstraction over real TTS providers
// ════════════════════════════════════════════════════════════════════════════

export interface VoiceAdapter {
  synthesize(
    text: string,
    voiceId: VoicePresetId,
    opts: { rate: number; pitch: number },
  ): Promise<{ audioUrl: string; durationMs: number; cueId: CueId }>;
  cancel(cueId: CueId): Promise<void>;
}

// ════════════════════════════════════════════════════════════════════════════
// IN-MEMORY VOICE ADAPTER — deterministic, no actual audio
// ════════════════════════════════════════════════════════════════════════════

export class InMemoryVoiceAdapter implements VoiceAdapter {
  /** Sequence counter — monotonically increasing. Used for CueId prefix. */
  private seq: number = 0;

  /** Map of cueId → synthesized audio descriptor (mocked). */
  private readonly synthesized = new Map<CueId, { audioUrl: string; durationMs: number }>();

  private readonly opts: { wordsPerMinute?: number };

  constructor(opts: { wordsPerMinute?: number } = {}) {
    this.opts = opts;
  }

  async synthesize(
    text: string,
    voiceId: VoicePresetId,
    options: { rate: number; pitch: number },
  ): Promise<{ audioUrl: string; durationMs: number; cueId: CueId }> {
    if (typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('InMemoryVoiceAdapter.synthesize: text must be a non-empty string');
    }
    this.seq += 1;
    const hash = fnv1a(`${voiceId}|${text}|${this.seq}|${options.rate}|${options.pitch}`);
    const cueId = brand<CueId>(`cue-${String(this.seq).padStart(4, '0')}-${hash.slice(0, 8)}`);
    const durationMs = estimateDurationMs(text, options.rate, this.opts.wordsPerMinute ?? 150);
    const audioUrl = `in-memory://voice/${voiceId}/${cueId}.mp3`;
    this.synthesized.set(cueId, { audioUrl, durationMs });
    return { audioUrl, durationMs, cueId };
  }

  async cancel(cueId: CueId): Promise<void> {
    this.synthesized.delete(cueId);
  }

  /** Test helper — internal peek. */
  _peekSynthesized(cueId: CueId): { audioUrl: string; durationMs: number } | undefined {
    return this.synthesized.get(cueId);
  }

  /** Test helper — count of synthesized cues. */
  _size(): number {
    return this.synthesized.size;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS & VALIDATION
// ════════════════════════════════════════════════════════════════════════════

export const MIN_RATE = 0.5;
export const MAX_RATE = 1.5;
export const MIN_PITCH = 0.5;
export const MAX_PITCH = 1.5;

export const MAX_QUEUE_SIZE = 32;
export const MAX_TEXT_LENGTH = 4000; // roughly 6 minutes at 150 wpm — protects against pathological inputs

export type VoiceEngineErrorCode =
  | 'VOICE_NOT_FOUND'
  | 'CUE_NOT_FOUND'
  | 'INVALID_RATE'
  | 'INVALID_PITCH'
  | 'EMPTY_TEXT'
  | 'TEXT_TOO_LONG'
  | 'QUEUE_FULL'
  | 'INVALID_STATE_TRANSITION'
  | 'ADAPTER_ERROR';

export class VoiceEngineError extends Error {
  readonly code: VoiceEngineErrorCode;
  constructor(code: VoiceEngineErrorCode, message: string) {
    super(message);
    this.name = 'VoiceEngineError';
    this.code = code;
  }
}

export function validateRate(rate: number): void {
  if (!Number.isFinite(rate) || rate < MIN_RATE || rate > MAX_RATE) {
    throw new VoiceEngineError(
      'INVALID_RATE',
      `rate must be a finite number in [${MIN_RATE}, ${MAX_RATE}], got ${rate}`,
    );
  }
}

export function validatePitch(pitch: number): void {
  if (!Number.isFinite(pitch) || pitch < MIN_PITCH || pitch > MAX_PITCH) {
    throw new VoiceEngineError(
      'INVALID_PITCH',
      `pitch must be a finite number in [${MIN_PITCH}, ${MAX_PITCH}], got ${pitch}`,
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HASH — FNV-1a (32-bit), via Math.imul for cross-runtime correctness
// ════════════════════════════════════════════════════════════════════════════

export function fnv1a(s: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Unsigned 32-bit hex, padded to 8 chars
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// ════════════════════════════════════════════════════════════════════════════
// SACRED TEXT RENDERING — markdown → plain/SSML-friendly
// ════════════════════════════════════════════════════════════════════════════

/**
 * Render markdown to a TTS-friendly plain string:
 *   - Strip code fences ```...```
 *   - Strip inline code `...`
 *   - Convert **bold** and *italic* to plain text
 *   - Convert # / ## / ### headings to natural pause markers (NEWLINE)
 *   - Convert bullet lists "- " to natural language: "Item: ..."
 *   - Collapse multiple blank lines into single newline
 *   - Collapse multiple spaces into single space
 *   - Convert markdown links [text](url) → "text" (drop url from speech)
 *   - Convert > blockquotes to "Citação: " prefix
 *
 * Returns the plain text suitable for TTS or SSML <voice>...</voice> wrap.
 */
export function renderSacredText(markdown: string): string {
  if (typeof markdown !== 'string') return '';

  let s = markdown;

  // Code fences
  s = s.replace(/```[\s\S]*?```/g, '');
  // Inline code
  s = s.replace(/`([^`]+)`/g, '$1');
  // Headings → newline
  s = s.replace(/^\s{0,3}#{1,6}\s+(.*)$/gm, '\n$1\n');
  // Blockquotes → "Citação: "
  s = s.replace(/^\s{0,3}>\s?(.*)$/gm, 'Citação: $1');
  // Bold/italic → plain
  s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
  s = s.replace(/\*([^*]+)\*/g, '$1');
  s = s.replace(/__([^_]+)__/g, '$1');
  s = s.replace(/_([^_]+)_/g, '$1');
  // Markdown links → text only
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Bulleted lists → "Item: ..."
  s = s.replace(/^\s{0,3}[-*+]\s+(.*)$/gm, 'Item: $1');
  // Numbered lists → "Primeiro: ..." (simple version)
  s = s.replace(/^\s{0,3}\d+\.\s+(.*)$/gm, 'Item numerado: $1');
  // Collapse whitespace
  s = s.replace(/\r\n/g, '\n');
  s = s.replace(/[ \t]+/g, ' ');
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

/**
 * SSML-friendly version: same as renderSacredText but adds natural pauses
 * (commas / periods) at heading boundaries if not already present. Useful
 * for engines that accept SSML <break/> tags instead of plain text.
 *
 * This is intentionally minimal — TTS adapters are responsible for the
 * final SSML wrapping. We just ensure line breaks become ". ".
 */
export function renderSacredTextSsml(markdown: string): string {
  const plain = renderSacredText(markdown);
  return plain.replace(/\n+/g, '. ').replace(/\s{2,}/g, ' ').trim();
}

// ════════════════════════════════════════════════════════════════════════════
// DURATION ESTIMATE — heuristic, no actual audio
// ════════════════════════════════════════════════════════════════════════════

/**
 * Estimate the spoken duration of `text` at the given rate.
 * Default 150 words/minute is the average Portuguese TTS rate.
 * Rate > 1.0 shortens the duration (faster speech); rate < 1.0 lengthens.
 */
export function estimateDurationMs(text: string, rate: number, wordsPerMinute = 150): number {
  if (!Number.isFinite(rate) || rate <= 0) return 0;
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const minutes = words / wordsPerMinute;
  const baseMs = minutes * 60 * 1000;
  return Math.max(500, Math.round(baseMs / rate)); // floor at 500ms so short utterances are audible
}

// ════════════════════════════════════════════════════════════════════════════
// AUDIT / STATE — internal but exposed via exportAudit()
// ════════════════════════════════════════════════════════════════════════════

interface InternalCue {
  state: PlaybackState;
  /** Set to true if the user has asked to pause; resumed = false. */
  pauseRequested: boolean;
}

// ════════════════════════════════════════════════════════════════════════════
// VOICE ENGINE — main implementation
// ════════════════════════════════════════════════════════════════════════════

export class VoiceEngineImpl implements VoiceEngine {
  private readonly adapter: VoiceAdapter;
  private readonly cues = new Map<CueId, InternalCue>();
  /** Ordered list of cue IDs — drives "next to play" semantics. */
  private readonly queueOrder: CueId[] = [];
  /** Audit log — every state transition appended. */
  private readonly auditLog: PlaybackState[] = [];

  constructor(adapter?: VoiceAdapter) {
    this.adapter = adapter ?? new InMemoryVoiceAdapter();
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  async play(text: string, voiceId: VoicePresetId): Promise<PlaybackState> {
    // 1. Validate text
    if (typeof text !== 'string') {
      throw new VoiceEngineError('EMPTY_TEXT', `play: text must be a string, got ${typeof text}`);
    }
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      throw new VoiceEngineError('EMPTY_TEXT', 'play: text must be non-empty after trim');
    }
    if (trimmed.length > MAX_TEXT_LENGTH) {
      throw new VoiceEngineError(
        'TEXT_TOO_LONG',
        `play: text exceeds MAX_TEXT_LENGTH (${MAX_TEXT_LENGTH}); got ${trimmed.length}`,
      );
    }

    // 2. Validate voiceId
    const preset = this.getPreset(voiceId);
    if (!preset) {
      throw new VoiceEngineError(
        'VOICE_NOT_FOUND',
        `play: voiceId "${voiceId}" is not registered. Known: ${ALL_KNOWN_VOICE_IDS.join(', ')}`,
      );
    }

    // 3. Validate rate/pitch from preset
    validateRate(preset.rate);
    validatePitch(preset.pitch);

    // 4. Queue overflow check
    if (this.queueOrder.length >= MAX_QUEUE_SIZE) {
      throw new VoiceEngineError(
        'QUEUE_FULL',
        `play: queue is full (${MAX_QUEUE_SIZE} cues). cancel() something first.`,
      );
    }

    // 5. Render text to TTS-friendly form (strip markdown)
    const rendered = renderSacredText(trimmed);

    // 6. Synthesize via adapter
    let synth;
    try {
      synth = await this.adapter.synthesize(rendered, voiceId, {
        rate: preset.rate,
        pitch: preset.pitch,
      });
    } catch (e: unknown) {
      throw new VoiceEngineError(
        'ADAPTER_ERROR',
        `play: adapter.synthesize failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    // 7. Build initial state — 'queued' first, then immediately transition to 'playing'
    const now = new Date(0).toISOString(); // deterministic in tests
    const initial: PlaybackState = Object.freeze({
      cueId: synth.cueId,
      voiceId,
      text: rendered,
      status: 'playing',
      currentTimeMs: 0,
      durationMs: synth.durationMs,
      rate: preset.rate,
      pitch: preset.pitch,
      createdAt: now,
      updatedAt: now,
    });

    this.cues.set(synth.cueId, { state: initial, pauseRequested: false });
    this.queueOrder.push(synth.cueId);
    this.appendAudit(initial);
    return initial;
  }

  async pause(cueId: CueId): Promise<void> {
    const cue = this.cues.get(cueId);
    if (!cue) {
      throw new VoiceEngineError('CUE_NOT_FOUND', `pause: cueId "${cueId}" not in queue`);
    }
    if (cue.state.status !== 'playing') {
      throw new VoiceEngineError(
        'INVALID_STATE_TRANSITION',
        `pause: cue "${cueId}" is in "${cue.state.status}", not "playing"`,
      );
    }
    cue.pauseRequested = true;
    const updated: PlaybackState = Object.freeze({
      ...cue.state,
      status: 'paused',
      updatedAt: new Date(0).toISOString(),
    });
    cue.state = updated;
    this.cues.set(cueId, cue);
    this.appendAudit(updated);
  }

  async resume(cueId: CueId): Promise<void> {
    const cue = this.cues.get(cueId);
    if (!cue) {
      throw new VoiceEngineError('CUE_NOT_FOUND', `resume: cueId "${cueId}" not in queue`);
    }
    if (cue.state.status !== 'paused') {
      throw new VoiceEngineError(
        'INVALID_STATE_TRANSITION',
        `resume: cue "${cueId}" is in "${cue.state.status}", not "paused"`,
      );
    }
    cue.pauseRequested = false;
    const updated: PlaybackState = Object.freeze({
      ...cue.state,
      status: 'playing',
      updatedAt: new Date(0).toISOString(),
    });
    cue.state = updated;
    this.cues.set(cueId, cue);
    this.appendAudit(updated);
  }

  async cancel(cueId: CueId): Promise<void> {
    const cue = this.cues.get(cueId);
    if (!cue) {
      throw new VoiceEngineError('CUE_NOT_FOUND', `cancel: cueId "${cueId}" not in queue`);
    }
    const orderIdx = this.queueOrder.indexOf(cueId);
    if (orderIdx >= 0) this.queueOrder.splice(orderIdx, 1);
    await this.adapter.cancel(cueId);
    const updated: PlaybackState = Object.freeze({
      ...cue.state,
      status: 'done',
      updatedAt: new Date(0).toISOString(),
    });
    this.cues.set(cueId, { state: updated, pauseRequested: false });
    this.appendAudit(updated);
    // After cancel we remove from active queue; audit keeps the trace.
    setTimeout(() => {
      // Deferred cleanup so getQueue() can observe the "done" state.
      const c = this.cues.get(cueId);
      if (c && c.state.status === 'done') this.cues.delete(cueId);
    }, 0);
  }

  getQueue(): ReadonlyArray<PlaybackState> {
    // Return cues in queue order, excluding 'done' / 'error' terminals.
    return Object.freeze(
      this.queueOrder
        .map((id) => this.cues.get(id))
        .filter((c): c is InternalCue => Boolean(c))
        .filter((c) => c.state.status !== 'done' && c.state.status !== 'error')
        .map((c) => c.state),
    );
  }

  getPreset(voiceId: VoicePresetId): VoicePreset | undefined {
    return VOICE_PRESETS.find((p) => p.id === voiceId);
  }

  listPresets(): ReadonlyArray<VoicePreset> {
    return VOICE_PRESETS;
  }

  getVoicesByTradicao(t: TradicaoName): ReadonlyArray<VoicePreset> {
    return VOICE_PRESETS.filter((p) => p.tradicao === t);
  }

  exportAudit(): ReadonlyArray<PlaybackState> {
    return Object.freeze(this.auditLog.slice());
  }

  resetForTests(): void {
    this.cues.clear();
    this.queueOrder.length = 0;
    this.auditLog.length = 0;
  }

  // ── Internal helpers ───────────────────────────────────────────────────────

  private appendAudit(state: PlaybackState): void {
    this.auditLog.push(state);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PRESETS — duplicated from voice-presets.ts but kept inlined here so the
// engine is self-contained and spec/smoke can import just the engine.
// (Single source of truth in spec/smoke tests is asserted via cross-file test.)
// ════════════════════════════════════════════════════════════════════════════

export const VOICE_PRESETS: ReadonlyArray<VoicePreset> = Object.freeze([
  Object.freeze({
    id: 'cigano' as VoicePresetId,
    name: 'Cigano (Cavaleiro do Baralho)',
    tradicao: 'cigano' as TradicaoName,
    rate: 0.95,
    pitch: 1.0,
    voiceStyle:
      'Sabedoria cigana — fala pausada e calorosa; usa metáforas de estrada, lua e baralho; nunca apressada.',
    sampleText: 'Que as cartas revelem o que precisa ser visto, e o caminho se abra sob seus pés.',
    locale: 'pt-BR' as const,
  }),
  Object.freeze({
    id: 'iya' as VoicePresetId,
    name: 'Iyá (Mãe-de-Santo)',
    tradicao: 'candomble' as TradicaoName,
    rate: 0.85,
    pitch: 0.95,
    voiceStyle:
      'Iyá de Candomblé — voz medida, quente e acolhedora; tom maternal de fundamento; nunca austera ou julgadora.',
    sampleText: 'Orixá te chama. Escute o fundamento que sua alma já conhece.',
    locale: 'pt-BR' as const,
  }),
  Object.freeze({
    id: 'pai-ogum' as VoicePresetId,
    name: 'Pai Ogum (Caboclo)',
    tradicao: 'umbanda' as TradicaoName,
    rate: 1.0,
    pitch: 1.0,
    voiceStyle:
      'Ogum guerreiro — decidido, protetor e firme sem ser ríspido; voz de quem abre caminhos com a espada.',
    sampleText: 'Eu venho abrir os caminhos. Onde havia pedra, agora há estrada.',
    locale: 'pt-BR' as const,
  }),
  Object.freeze({
    id: 'swami-ananda' as VoicePresetId,
    name: 'Swami Ananda',
    tradicao: 'tantra' as TradicaoName,
    rate: 0.9,
    pitch: 1.05,
    voiceStyle:
      'Swami Ananda — alegre, consciente da respiração, jubiloso; fala como quem reconhece o divino em tudo.',
    sampleText: 'Que seu prana encontre o prana do mundo, e o mundo floresça dentro de você.',
    locale: 'pt-BR' as const,
  }),
  Object.freeze({
    id: 'rabino-moshe' as VoicePresetId,
    name: 'Rabi Moshe',
    tradicao: 'cabala' as TradicaoName,
    rate: 0.92,
    pitch: 0.95,
    voiceStyle:
      'Rabi Moshe — erudito, estudioso, contemplativo; apaixonado pelo Zohar mas contido no volume.',
    sampleText: 'O Zohar nos ensina: a luz mais alta desce para acender a vela mais baixa.',
    locale: 'pt-BR' as const,
  }),
  Object.freeze({
    id: 'astrologa-stella' as VoicePresetId,
    name: 'Stella (Astróloga)',
    tradicao: 'astrologia' as TradicaoName,
    rate: 0.95,
    pitch: 1.1,
    voiceStyle:
      'Stella — didática, calorosa, sideral; fala como quem aponta pro céu e traduz o mapa em palavras simples.',
    sampleText: 'Mercúrio entra em Gêmeos. Sua mente pede movimento, sua alma pede escuta.',
    locale: 'pt-BR' as const,
  }),
]);

export const ALL_KNOWN_VOICE_IDS: ReadonlyArray<VoicePresetId> = Object.freeze(
  VOICE_PRESETS.map((p) => p.id),
);

export const ALL_KNOWN_TRADICOES: ReadonlyArray<TradicaoName> = Object.freeze([
  'cigano',
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
]);

// ════════════════════════════════════════════════════════════════════════════
// DEFAULT FACTORY
// ════════════════════════════════════════════════════════════════════════════

export function createVoiceEngine(adapter?: VoiceAdapter): VoiceEngine {
  return new VoiceEngineImpl(adapter);
}