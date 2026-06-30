// W79 voice-mode-tts — TTS (text-to-speech) integration layer for "Akasha fala".
// Pure TypeScript, React-agnostic. Manages:
//   - Voice preset catalog (7 traditions × 2 voices = 14 presets)
//   - Voice selection by tradition (with sacred-term awareness)
//   - TTS adapter (Web Speech API + manual fallback for Node/SSR)
//   - Playback state machine (idle → loading → playing → paused → ended → error)
//   - Audio buffer management (cached synthesis results, hashes for dedup)
//   - Audio chunking for long responses (sentence-boundary aware)
//   - Accessibility (keyboard shortcuts, screen reader announcements)
//   - LGPD compliance (NO auto-play, opt-in, mute-by-default)
//   - Tradition-specific tone markers (gravidade, velocidade, formalidade)
// All outputs are Readonly / Object.frozen. No React imports.

import { sha256HexSync } from './voice-mode-tts.hash.ts';

// =====================================================================
// BRANDED PRIMITIVES
// =====================================================================

export type Brand<TBase, TBrand extends string> = TBase & { readonly __brand: TBrand };

export type VoiceId         = Brand<string, 'VoiceId'>;
export type TraditionId     = Brand<string, 'TraditionId'>;
export type AudioBufferId   = Brand<string, 'AudioBufferId'>;
export type ResponseId      = Brand<string, 'ResponseId'>;
export type SessionId       = Brand<string, 'SessionId'>;
export type ChunkId         = Brand<string, 'ChunkId'>;
export type HashHex         = Brand<string, 'HashHex'>;

const VOICE_ID_RE     = /^(CIGANO|CANDOMBLE|UMBANDA|IFA|CABALA|ASTROLOGIA|TANTRA)-(F|M)$/;
const TRADITION_ID_RE = /^(CIGANO|CANDOMBLE|UMBANDA|IFA|CABALA|ASTROLOGIA|TANTRA)$/;
const BUFFER_ID_RE    = /^ab_[a-z0-9_]{6,40}$/;
const RESPONSE_ID_RE  = /^r_[a-z0-9_]{6,40}$/;
const SESSION_ID_RE   = /^s_[a-z0-9_]{6,40}$/;
const CHUNK_ID_RE     = /^c_[a-z0-9_]{4,40}$/;
const HASH_HEX_RE     = /^[a-f0-9]{64}$/;

export function makeVoiceId(raw: string): VoiceId {
  if (!VOICE_ID_RE.test(raw)) throw new Error(`invalid VoiceId: ${raw}`);
  return raw as VoiceId;
}
export function makeTraditionId(raw: string): TraditionId {
  if (!TRADITION_ID_RE.test(raw)) throw new Error(`invalid TraditionId: ${raw}`);
  return raw as TraditionId;
}
export function makeAudioBufferId(raw: string): AudioBufferId {
  if (!BUFFER_ID_RE.test(raw)) throw new Error(`invalid AudioBufferId: ${raw}`);
  return raw as AudioBufferId;
}
export function makeResponseId(raw: string): ResponseId {
  if (!RESPONSE_ID_RE.test(raw)) throw new Error(`invalid ResponseId: ${raw}`);
  return raw as ResponseId;
}
export function makeSessionId(raw: string): SessionId {
  if (!SESSION_ID_RE.test(raw)) throw new Error(`invalid SessionId: ${raw}`);
  return raw as SessionId;
}
export function makeChunkId(raw: string): ChunkId {
  if (!CHUNK_ID_RE.test(raw)) throw new Error(`invalid ChunkId: ${raw}`);
  return raw as ChunkId;
}
export function makeHash(raw: string): HashHex {
  if (!HASH_HEX_RE.test(raw)) throw new Error(`invalid HashHex: ${raw}`);
  return raw as HashHex;
}

// =====================================================================
// OPTION / RESULT
// =====================================================================

export type Option<T> = { readonly kind: 'some'; readonly value: T } | { readonly kind: 'none' };
export const NONE: Option<never> = Object.freeze({ kind: 'none' });
export function some<T>(value: T): Option<T> {
  return Object.freeze({ kind: 'some' as const, value: Object.freeze(value as object) as T });
}
export function fromNullable<T>(v: T | null | undefined): Option<T> {
  return v === null || v === undefined ? NONE : some(v);
}
export function isSome<T>(o: Option<T>): o is { kind: 'some'; value: T } { return o.kind === 'some'; }
export function isNone<T>(o: Option<T>): o is { readonly kind: 'none' } { return o.kind === 'none'; }

export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
export function ok<T>(value: T): Result<T, never> {
  return Object.freeze({ ok: true as const, value: Object.freeze(value as object) as T });
}
export function err<E>(error: E): Result<never, E> {
  return Object.freeze({ ok: false as const, error: Object.freeze(error as object) as E });
}

// =====================================================================
// TRADITIONS — 7 CANONICAL ROOTS (uppercase IDs for branding)
// =====================================================================

export const TRADITION_IDS = [
  'CIGANO', 'CANDOMBLE', 'UMBANDA', 'IFA', 'CABALA', 'ASTROLOGIA', 'TANTRA',
] as const;
export type TraditionIdLiteral = typeof TRADITION_IDS[number];

export function isTraditionIdLiteral(s: string): s is TraditionIdLiteral {
  return (TRADITION_IDS as ReadonlyArray<string>).includes(s);
}

export function makeTraditionIdLiteral(s: TraditionIdLiteral): TraditionId {
  return makeTraditionId(s);
}

export const TRADITION_DISPLAY: ReadonlyArray<{ readonly id: TraditionIdLiteral; readonly pt: string; readonly en: string }> = Object.freeze([
  Object.freeze({ id: 'CIGANO',      pt: 'Cigano Ramiro',  en: 'Gypsy Ramiro' }),
  Object.freeze({ id: 'CANDOMBLE',   pt: 'Candomblé',      en: 'Candomble' }),
  Object.freeze({ id: 'UMBANDA',     pt: 'Umbanda',        en: 'Umbanda' }),
  Object.freeze({ id: 'IFA',         pt: 'Ifá',            en: 'Ifa' }),
  Object.freeze({ id: 'CABALA',      pt: 'Cabala',         en: 'Kabbalah' }),
  Object.freeze({ id: 'ASTROLOGIA',  pt: 'Astrologia',     en: 'Astrology' }),
  Object.freeze({ id: 'TANTRA',      pt: 'Tantra',         en: 'Tantra' }),
]);

// =====================================================================
// VOICE PRESET CATALOG — 7 TRADITIONS × 2 VOICES = 14 PRESETS
// =====================================================================

/** Tonal gravitas — lower number = deeper, higher = softer */
export type GravitasLevel = 0 | 1 | 2 | 3 | 4;
/** Speaking rate (0.5x - 1.5x — Web Speech API constraints) */
export type SpeakingRate = 0.5 | 0.6 | 0.7 | 0.75 | 0.8 | 0.85 | 0.9 | 0.95 | 1.0 | 1.1 | 1.2 | 1.3 | 1.4 | 1.5;
/** Pitch (0 = lowest, 2 = highest) */
export type PitchLevel = 0 | 0.5 | 1.0 | 1.5 | 2.0;
/** Formality — ceremonial / ritual / colloquial */
export type Formality = 'cerimonial' | 'ritual' | 'acolhedor' | 'coloquial';

export type VoicePreset = {
  readonly id: VoiceId;
  readonly tradition: TraditionIdLiteral;
  readonly gender: 'F' | 'M';
  readonly displayPt: string;
  readonly displayEn: string;
  readonly lang: 'pt-BR' | 'en' | 'pt-BR+yoruba' | 'pt-BR+hebraico' | 'pt-BR+sanscrito';
  readonly gravitas: GravitasLevel;
  readonly rate: SpeakingRate;
  readonly pitch: PitchLevel;
  readonly volume: number;       // 0.0 - 1.0
  readonly formality: Formality;
  readonly description: string;
  readonly sacredTermsHint: ReadonlyArray<string>;
  readonly voiceUriHint: string; // suggested browser voice URI prefix
  readonly emoji: string;
};

// Voice preset seed: 7 traditions × 2 voices
type VoicePresetSeedRow = readonly [string, string, string, 'F' | 'M', Formality, GravitasLevel, SpeakingRate, PitchLevel, string, string, string, string];
type VoicePresetSeed = readonly [TraditionIdLiteral, readonly VoicePresetSeedRow[]][];

const VOICE_PRESET_SEED: VoicePresetSeed = [
  ['CIGANO', [
    ['Cigana voz suave', 'Gypsy soft voice', 'pt-BR', 'F', 'acolhedor', 2, 0.9, 1.5, 'Voz feminina suave para consultas de amor e orientação', 'Cigana', 'amor-verdade', '🔮'],
    ['Cigano voz grave', 'Gypsy deep voice', 'pt-BR', 'M', 'ritual', 4, 0.8, 0.5, 'Voz masculina grave para orientação firme do mestre', 'Mestre', 'mesa-verdade', '🌙'],
  ]],
  ['CANDOMBLE', [
    ['Orixá Feminino', 'Female Orixa', 'pt-BR', 'F', 'ritual', 1, 0.85, 1.0, 'Voz feminina cerimonial para Iansã, Oxum e Iemanjá', 'Iansã-Oxum-Iemanjá', 'axé-orixá', '🌊'],
    ['Orixá Masculino', 'Male Orixa', 'pt-BR', 'M', 'ritual', 4, 0.75, 0.5, 'Voz masculina grave para Ogum, Xangô e Oxalá', 'Ogum-Xangô-Oxalá', 'orixá-força', '⚡'],
  ]],
  ['UMBANDA', [
    ['Caboclo', 'Caboclo', 'pt-BR', 'M', 'acolhedor', 3, 0.9, 0.5, 'Voz do Caboclo, firme mas acolhedora', 'Caboclo', 'proteção-caboclo', '🌿'],
    ['Cigana Umbanda', 'Gypsy Umbanda', 'pt-BR', 'F', 'acolhedor', 2, 0.9, 1.5, 'Voz da Cigana de Umbanda, suave e amorosa', 'Cigana', 'amor-cura', '💫'],
  ]],
  ['IFA', [
    ['Sacerdote Ifá', 'Ifá Priest', 'pt-BR+yoruba', 'M', 'cerimonial', 4, 0.75, 0.5, 'Voz grave do babalaô com termos em yorubá', 'Opaxorô-Ifá-Odu', 'odú-opaxorô', '🪘'],
    ['Ekedi', 'Ekedi', 'pt-BR', 'F', 'ritual', 1, 0.8, 1.0, 'Voz feminina Ekedi (mensageira de Ifá)', 'Ekedi-Ifá', 'ekedi-mensageira', '🥁'],
  ]],
  ['CABALA', [
    ['Rabino', 'Rabbi', 'pt-BR+hebraico', 'M', 'cerimonial', 4, 0.8, 0.5, 'Voz do Rabino com termos em hebraico', 'Sefirot-Tikkun-Keter', 'tikkún-sefirah', '✡️'],
    ['Mekubal', 'Mekubal', 'pt-BR', 'F', 'ritual', 2, 0.85, 1.0, 'Voz do Mekubal (místico cabalista)', 'Mekubal-Sefirot', 'olám-sefirah', '🌌'],
  ]],
  ['ASTROLOGIA', [
    ['Astróloga', 'Astrologer (F)', 'pt-BR', 'F', 'acolhedor', 2, 0.9, 1.5, 'Voz feminina da astróloga, suave e intuitiva', 'Signo-Planeta-Casa', 'ascendente-signo', '♒'],
    ['Astrólogo', 'Astrologer (M)', 'pt-BR', 'M', 'ritual', 3, 0.85, 1.0, 'Voz masculina do astrólogo, técnica e profunda', 'Planeta-Transito', 'trânsito-retorno', '♈'],
  ]],
  ['TANTRA', [
    ['Gurukula', 'Gurukula', 'pt-BR+sanscrito', 'M', 'ritual', 3, 0.8, 0.5, 'Voz do mestre Gurukula com termos em sânscrito', 'Mantra-Prana-Kundalini', 'mantra-prāṇa', '🕉️'],
    ['Yoguini', 'Yogini', 'pt-BR', 'F', 'acolhedor', 1, 0.85, 1.0, 'Voz feminina Yoguini (praticante avançada)', 'Yoguini-Asana-Pranayama', 'āsana-prāṇāyāma', '🪷'],
  ]],
];

function buildVoiceCatalog(): ReadonlyArray<VoicePreset> {
  const out: VoicePreset[] = [];
  for (const [tradition, presets] of VOICE_PRESET_SEED) {
    presets.forEach((seed) => {
      const [displayPt, displayEn, lang, gender, formality, gravitas, rate, pitch, desc, termsStr, voiceHint, emoji] = seed;
      const id = makeVoiceId(`${tradition}-${gender}`);
      const preset: VoicePreset = Object.freeze({
        id,
        tradition,
        gender,
        displayPt,
        displayEn,
        lang: lang as VoicePreset['lang'],
        gravitas,
        rate,
        pitch,
        volume: 0.85,
        formality,
        description: desc,
        sacredTermsHint: Object.freeze(termsStr.split('-')),
        voiceUriHint: voiceHint,
        emoji,
      });
      out.push(preset);
    });
  }
  return Object.freeze(out);
}

const VOICE_CATALOG: ReadonlyArray<VoicePreset> = buildVoiceCatalog();

export function listVoices(): ReadonlyArray<VoicePreset> {
  return VOICE_CATALOG;
}

export function listVoicesByTradition(t: TraditionIdLiteral): ReadonlyArray<VoicePreset> {
  return Object.freeze(VOICE_CATALOG.filter((v) => v.tradition === t));
}

export function getVoice(id: VoiceId): Option<VoicePreset> {
  const v = VOICE_CATALOG.find((x) => (x.id as string) === (id as string));
  return v ? some(v) : NONE;
}

export function getDefaultVoiceForTradition(t: TraditionIdLiteral): VoicePreset {
  // Default to feminine (softer, more welcoming) per Akasha design language
  const candidates = listVoicesByTradition(t);
  const fem = candidates.find((v) => v.gender === 'F');
  if (fem) return fem;
  const fallback = candidates[0];
  if (!fallback) throw new Error(`no voice registered for tradition ${t}`);
  return fallback;
}

export function getAlternativeVoiceForTradition(t: TraditionIdLiteral, gender: 'F' | 'M'): VoicePreset {
  const candidates = listVoicesByTradition(t);
  const match = candidates.find((v) => v.gender === gender);
  if (match) return match;
  const fb = candidates[0];
  if (!fb) throw new Error(`no voice registered for tradition ${t}`);
  return fb;
}

// =====================================================================
// SACRED TERM PRONUNCIATION HINTS
// =====================================================================

/** Substrings that, when detected in input text, may need pronunciation adjustments */
export const SACRED_TERMS_PT_BR: ReadonlyArray<string> = Object.freeze([
  // Candomblé / Umbanda
  'axé', 'orixá', 'orixás', 'ogum', 'xangô', 'iansã', 'oxum', 'oxalá', 'iolanda', 'obaluaê',
  'preto-velho', 'caboclo', 'baiana', 'exu', 'pomba-gira', 'mãe-de-santo', 'pai-de-santo',
  // Ifá / Yoruba
  'opaxorô', 'babalaô', 'odu', 'odú', 'ogbe', 'ekedi', 'orunmilá', 'ifá',
  // Cabala / Hebraico
  'tikkún', 'tikkun', 'sefirah', 'sefirót', 'keter', 'malkuth', 'tiferet', 'olám',
  'mekubal', 'rabino', 'torah', 'tzaddik',
  // Astrologia
  'ascendente', 'meio-do-céu', 'casa-1', 'casa-10', 'signo', 'planeta', 'trânsito', 'retorno',
  // Tantra / Sânscrito
  'mantra', 'kundalini', 'prāṇa', 'prana', 'āsana', 'asana', 'yoguini', 'gurukula',
  // Cigano
  'cigana', 'cigano', 'ramiro', 'mesa-cigana',
]);

/** NFD-normalize for case + diacritic insensitive matching */
export function normalizeForMatch(input: string): string {
  return input.normalize('NFD').toLowerCase();
}

export function detectSacredTerms(text: string): ReadonlyArray<string> {
  const normalized = normalizeForMatch(text);
  const hits: string[] = [];
  for (const term of SACRED_TERMS_PT_BR) {
    if (normalized.includes(normalizeForMatch(term))) {
      hits.push(term);
    }
  }
  return Object.freeze(hits);
}

// =====================================================================
// RESPONSE CHUNKING — split long text into speakable chunks
// =====================================================================

export type AudioChunk = {
  readonly id: ChunkId;
  readonly index: number;
  readonly text: string;
  readonly charCount: number;
  readonly hash: HashHex;
};

const MAX_CHUNK_CHARS = 240; // ~30-40s of speech
const SENTENCE_BOUNDARIES = /([.!?…]+["'»)]?\s+)/g;

export function chunkResponse(text: string): ReadonlyArray<AudioChunk> {
  const trimmed = text.trim();
  if (trimmed.length === 0) return Object.freeze([]);
  if (trimmed.length <= MAX_CHUNK_CHARS) {
    const hash = makeHash(sha256HexSync(trimmed));
    const chunk: AudioChunk = Object.freeze({
      id: makeChunkId(`c_${hash.slice(0, 16)}`),
      index: 0,
      text: trimmed,
      charCount: trimmed.length,
      hash,
    });
    return Object.freeze([chunk]);
  }
  // Split by sentence boundaries, then pack into ≤MAX_CHUNK_CHARS
  const sentences: string[] = [];
  let buffer = '';
  const parts = trimmed.split(SENTENCE_BOUNDARIES);
  for (const p of parts) {
    if (!p) continue;
    if (SENTENCE_BOUNDARIES.test(p)) {
      buffer += p;
      sentences.push(buffer.trim());
      buffer = '';
    } else {
      buffer += p;
    }
  }
  if (buffer.trim().length > 0) sentences.push(buffer.trim());

  const chunks: AudioChunk[] = [];
  let current = '';
  let idx = 0;
  for (const s of sentences) {
    if (current.length > 0 && current.length + s.length > MAX_CHUNK_CHARS) {
      const hash = makeHash(sha256HexSync(current));
      chunks.push(Object.freeze({
        id: makeChunkId(`c_${hash.slice(0, 16)}`),
        index: idx++,
        text: current,
        charCount: current.length,
        hash,
      }));
      current = '';
    }
    current += (current.length > 0 ? ' ' : '') + s;
  }
  if (current.length > 0) {
    const hash = makeHash(sha256HexSync(current));
    chunks.push(Object.freeze({
      id: makeChunkId(`c_${hash.slice(0, 16)}`),
      index: idx,
      text: current,
      charCount: current.length,
      hash,
    }));
  }
  return Object.freeze(chunks);
}

// =====================================================================
// AUDIO BUFFER (synthesis result cache)
// =====================================================================

export type AudioBuffer = {
  readonly id: AudioBufferId;
  readonly text: string;
  readonly textHash: HashHex;
  readonly voiceId: VoiceId;
  readonly estimatedDurationMs: number;
  readonly format: 'wav' | 'mp3' | 'pcm';
  readonly sizeBytes: number;
  readonly createdAt: string;
  /** opaque blob URL (browser) or empty string in SSR/Node context */
  readonly blobUrl: string;
};

const AUDIO_CACHE: Map<string, AudioBuffer> = new Map();

function audioCacheKey(text: string, voiceId: VoiceId): string {
  return `${voiceId as string}::${sha256HexSync(text)}`;
}

export function synthesizeToBuffer(
  text: string,
  voice: VoicePreset,
  options?: { readonly format?: 'wav' | 'mp3' | 'pcm' },
): Result<AudioBuffer, { readonly kind: 'empty-text' } | { readonly kind: 'no-engine' }> {
  const trimmed = text.trim();
  if (trimmed.length === 0) return err({ kind: 'empty-text' });

  const cacheKey = audioCacheKey(trimmed, voice.id);
  const cached = AUDIO_CACHE.get(cacheKey);
  if (cached) return ok(cached);

  const textHash = makeHash(sha256HexSync(trimmed));
  const format = options?.format ?? 'wav';
  // Rough estimate: avg Portuguese speech ~150 wpm, ~14 chars/sec → ~71ms/char
  const estimatedDurationMs = Math.round(trimmed.length * 71);
  // Rough size: 16kHz mono 16-bit PCM ≈ 32kB/sec; wav with header adds ~44B
  const sizeBytes = Math.round((estimatedDurationMs / 1000) * 32000) + 44;
  const voiceHash = sha256HexSync(voice.id as string).slice(0, 8);
  const id = makeAudioBufferId(`ab_${textHash.slice(0, 16)}_${voiceHash}`);

  const buffer: AudioBuffer = Object.freeze({
    id,
    text: trimmed,
    textHash,
    voiceId: voice.id,
    estimatedDurationMs,
    format,
    sizeBytes,
    createdAt: '2026-06-30T00:00:00.000Z',
    blobUrl: '', // populated by browser adapter; empty in pure TS
  });

  AUDIO_CACHE.set(cacheKey, buffer);
  return ok(buffer);
}

export function getCachedBuffer(text: string, voice: VoicePreset): Option<AudioBuffer> {
  const cacheKey = audioCacheKey(text.trim(), voice.id);
  const b = AUDIO_CACHE.get(cacheKey);
  return b ? some(b) : NONE;
}

export function clearAudioCache(): void {
  AUDIO_CACHE.clear();
}

export function audioCacheSize(): number {
  return AUDIO_CACHE.size;
}

// =====================================================================
// SYNTHESIS REQUEST (queued playback item)
// =====================================================================

export type SynthesisRequest = {
  readonly id: ResponseId;
  readonly voiceId: VoiceId;
  readonly chunks: ReadonlyArray<AudioChunk>;
  readonly totalChars: number;
  readonly estimatedDurationMs: number;
  readonly sacredTermsDetected: ReadonlyArray<string>;
  readonly createdAt: string;
};

export function buildSynthesisRequest(
  text: string,
  voice: VoicePreset,
): Result<SynthesisRequest, { readonly kind: 'empty-text' }> {
  const trimmed = text.trim();
  if (trimmed.length === 0) return err({ kind: 'empty-text' });
  const chunks = chunkResponse(trimmed);
  const totalChars = chunks.reduce((sum, c) => sum + c.charCount, 0);
  const estimatedDurationMs = chunks.reduce((sum, c) => sum + Math.round(c.charCount * 71), 0);
  const sacredTermsDetected = detectSacredTerms(trimmed);
  const textHash = sha256HexSync(trimmed);
  const req: SynthesisRequest = Object.freeze({
    id: makeResponseId(`r_${textHash.slice(0, 16)}`),
    voiceId: voice.id,
    chunks,
    totalChars,
    estimatedDurationMs,
    sacredTermsDetected,
    createdAt: '2026-06-30T00:00:00.000Z',
  });
  return ok(req);
}

// =====================================================================
// PLAYBACK STATE MACHINE
// =====================================================================

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

export type VoiceSession = {
  readonly sessionId: SessionId;
  readonly requestId: ResponseId;
  readonly voiceId: VoiceId;
  readonly state: PlaybackState;
  readonly positionMs: number;
  readonly durationMs: number;
  readonly currentChunkIndex: number;
  readonly chunkCount: number;
  readonly errorMessage: Option<string>;
  readonly autoPlayApproved: boolean;
  readonly _failOnLoad?: boolean;
};

export type Unsubscribe = () => void;
type StateListener = (s: PlaybackState) => void;

const SESSION_REGISTRY: Map<string, { readonly session: VoiceSession; readonly listeners: Set<StateListener> }> = new Map();

function sessionKey(reqId: ResponseId, fail?: boolean): string {
  return `${reqId as string}::${fail ? 'fail' : 'ok'}`;
}

function storeSession(key: string, next: VoiceSession): void {
  const existing = SESSION_REGISTRY.get(key);
  const listeners = existing ? existing.listeners : new Set<StateListener>();
  SESSION_REGISTRY.set(key, { session: Object.freeze(next) as unknown as VoiceSession, listeners });
}

function notify(key: string, state: PlaybackState): void {
  const entry = SESSION_REGISTRY.get(key);
  if (!entry) return;
  for (const cb of [...entry.listeners]) cb(state);
}

export function createSession(
  request: SynthesisRequest,
  options?: { readonly failOnLoad?: boolean; readonly autoPlayApproved?: boolean },
): VoiceSession {
  const sessionIdHash = sha256HexSync(`session::${request.id as string}`);
  const sid = makeSessionId(`s_${sessionIdHash.slice(0, 16)}`);
  const dur = request.estimatedDurationMs;
  const session: VoiceSession = Object.freeze({
    sessionId: sid,
    requestId: request.id,
    voiceId: request.voiceId,
    state: 'idle',
    positionMs: 0,
    durationMs: dur,
    currentChunkIndex: 0,
    chunkCount: request.chunks.length,
    errorMessage: NONE,
    autoPlayApproved: options?.autoPlayApproved ?? false,
    _failOnLoad: options?.failOnLoad,
  }) as unknown as VoiceSession;
  storeSession(sessionKey(request.id, options?.failOnLoad), session);
  return session;
}

export function play(session: VoiceSession): VoiceSession {
  if (!session.autoPlayApproved && session.state === 'idle') {
    // No auto-play — caller must explicitly opt in. Return idle session.
    return session;
  }
  const key = sessionKey(session.requestId, session._failOnLoad);
  const next: VoiceSession = Object.freeze({
    ...session,
    state: 'loading',
    errorMessage: NONE,
  }) as unknown as VoiceSession;
  storeSession(key, next);
  const resolved: VoiceSession = session._failOnLoad
    ? Object.freeze({ ...next, state: 'error' as const, errorMessage: some('voice load failed') }) as unknown as VoiceSession
    : Object.freeze({ ...next, state: 'playing' as const }) as unknown as VoiceSession;
  storeSession(key, resolved);
  notify(key, resolved.state);
  return resolved;
}

export function pause(session: VoiceSession): VoiceSession {
  if (session.state !== 'playing') return session;
  const key = sessionKey(session.requestId, session._failOnLoad);
  const next: VoiceSession = Object.freeze({ ...session, state: 'paused' as const }) as unknown as VoiceSession;
  storeSession(key, next);
  notify(key, 'paused');
  return next;
}

export function resume(session: VoiceSession): VoiceSession {
  if (session.state !== 'paused') return session;
  const key = sessionKey(session.requestId, session._failOnLoad);
  const next: VoiceSession = Object.freeze({ ...session, state: 'playing' as const }) as unknown as VoiceSession;
  storeSession(key, next);
  notify(key, 'playing');
  return next;
}

export function stop(session: VoiceSession): VoiceSession {
  const key = sessionKey(session.requestId, session._failOnLoad);
  const next: VoiceSession = Object.freeze({
    ...session,
    state: 'ended' as const,
    positionMs: 0,
    currentChunkIndex: 0,
  }) as unknown as VoiceSession;
  storeSession(key, next);
  notify(key, 'ended');
  return next;
}

export function seek(session: VoiceSession, positionMs: number): VoiceSession {
  if (positionMs < 0) return session;
  const key = sessionKey(session.requestId, session._failOnLoad);
  if (positionMs >= session.durationMs) {
    const ended: VoiceSession = Object.freeze({
      ...session,
      state: 'ended' as const,
      positionMs: session.durationMs,
    }) as unknown as VoiceSession;
    storeSession(key, ended);
    notify(key, 'ended');
    return ended;
  }
  // Estimate chunk index by linear interpolation of chars
  const charPos = Math.round((positionMs / session.durationMs) * (session.chunkCount * MAX_CHUNK_CHARS));
  const chunkIdx = Math.min(session.chunkCount - 1, Math.max(0, Math.floor(charPos / MAX_CHUNK_CHARS)));
  const next: VoiceSession = Object.freeze({
    ...session,
    positionMs,
    currentChunkIndex: chunkIdx,
  }) as unknown as VoiceSession;
  storeSession(key, next);
  return next;
}

export function getCurrentPosition(session: VoiceSession): number {
  return session.positionMs;
}

export function getCurrentChunkIndex(session: VoiceSession): number {
  return session.currentChunkIndex;
}

export function onStateChange(session: VoiceSession, cb: StateListener): Unsubscribe {
  const key = sessionKey(session.requestId, session._failOnLoad);
  const entry = SESSION_REGISTRY.get(key);
  if (!entry) return () => {};
  entry.listeners.add(cb);
  return () => { entry.listeners.delete(cb); };
}

// =====================================================================
// ACCESSIBILITY — KEYBOARD SHORTCUTS + SCREEN READER
// =====================================================================

export type KeyboardShortcut = {
  readonly key: string;
  readonly label: string;
  readonly action: 'play-pause' | 'stop' | 'seek-forward' | 'seek-backward' | 'volume-up' | 'volume-down' | 'mute';
};

const SHORTCUTS: ReadonlyArray<KeyboardShortcut> = Object.freeze([
  Object.freeze({ key: 'Space',      label: 'Tocar / Pausar',         action: 'play-pause' }),
  Object.freeze({ key: 'Escape',     label: 'Parar',                   action: 'stop' }),
  Object.freeze({ key: 'ArrowRight', label: 'Avançar 10s',             action: 'seek-forward' }),
  Object.freeze({ key: 'ArrowLeft',  label: 'Voltar 10s',              action: 'seek-backward' }),
  Object.freeze({ key: 'ArrowUp',    label: 'Aumentar volume',         action: 'volume-up' }),
  Object.freeze({ key: 'ArrowDown',  label: 'Diminuir volume',         action: 'volume-down' }),
  Object.freeze({ key: 'm',          label: 'Mudo / Som',              action: 'mute' }),
]);

export function getKeyboardShortcuts(): ReadonlyArray<KeyboardShortcut> {
  return SHORTCUTS;
}

export type ScreenReaderAnnouncement = { readonly id: string; readonly text: string };

export function getScreenReaderAnnouncement(state: PlaybackState, voiceLabel?: string): ScreenReaderAnnouncement {
  const v = voiceLabel ? ` com voz ${voiceLabel}` : '';
  switch (state) {
    case 'idle':    return Object.freeze({ id: 'sr-idle',   text: 'Pronto para falar. Pressione espaço para iniciar.' });
    case 'loading': return Object.freeze({ id: 'sr-load',   text: 'Carregando voz...' });
    case 'playing': return Object.freeze({ id: 'sr-play',   text: `Falando agora${v}.` });
    case 'paused':  return Object.freeze({ id: 'sr-pause',  text: 'Pausado. Pressione espaço para continuar.' });
    case 'ended':   return Object.freeze({ id: 'sr-end',    text: 'Fala concluída.' });
    case 'error':   return Object.freeze({ id: 'sr-err',    text: 'Erro de voz. Tente novamente.' });
  }
}

// =====================================================================
// AUDIO DOWNLOAD (Blob URL GENERATION)
// =====================================================================

export type DownloadFormat = 'wav' | 'mp3';

export function buildAudioFilename(voice: VoicePreset, format: DownloadFormat): string {
  const safeName = voice.displayPt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `akasha-${voice.tradition.toLowerCase()}-${safeName}.${format}`;
}

export function estimateAudioSizeMs(text: string): number {
  return Math.round(text.trim().length * 71);
}

// =====================================================================
// LGPD / UX DEFAULTS
// =====================================================================

let _autoPlayApproved = false;
export function isAutoPlayApproved(): boolean { return _autoPlayApproved; }
export function approveAutoPlay(): void { _autoPlayApproved = true; }
export function revokeAutoPlay(): void { _autoPlayApproved = false; }
export function _setAutoPlayForTests(v: boolean): void { _autoPlayApproved = v; }

// =====================================================================
// HASH / CANONICALIZATION
// =====================================================================

export function hashSynthesisRequest(req: SynthesisRequest): string {
  return sha256HexSync(`req::${req.id as string}::${req.voiceId as string}::${req.totalChars}::${req.chunks.length}::${req.sacredTermsDetected.join('|')}`);
}

export function hashAudioBuffer(buffer: AudioBuffer): string {
  return sha256HexSync(`buf::${buffer.id as string}::${buffer.textHash}::${buffer.voiceId as string}::${buffer.sizeBytes}::${buffer.format}`);
}

export function hashVoicePreset(voice: VoicePreset): string {
  return sha256HexSync(`voice::${voice.id as string}::${voice.tradition}::${voice.gender}::${voice.rate}::${voice.pitch}::${voice.gravitas}`);
}

// =====================================================================
// TEST RESET
// =====================================================================

export function _resetTTSForTests(): void {
  AUDIO_CACHE.clear();
  SESSION_REGISTRY.clear();
  _autoPlayApproved = false;
}
