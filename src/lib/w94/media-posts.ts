// ============================================================================
// W94-C — Media Posts Engine (Audio/Video/Carrossel de Ayan)
// ============================================================================
// Posts multimídia no feed da comunidade. Suporta:
//   - AudioPost  (até 5 min, com waveform + transcrição + metadados sagrados)
//   - VideoPost  (até 60s, com chapters + poster + transcrição)
//   - CarrosselAyanPost (3-5 segmentos audio/video formando narrativa)
//   - TextPost   (herdado do feed atual, sem multimídia)
//
// LGPD: redacao de PII em transcrições; consentimento OBRIGATÓRIO para storage
// de transcrição (Art. 7º I + Art. 11º I — dado sensível de origem espiritual).
//
// Sacred-cultural: orixás/axé/Iemanjá/Odu preservados verbatim em entities[].
// Termos banidos (orishas, ashé, iemanja sem til) rejeitados no validator.
// ============================================================================

// ============================================================================
// §1. CONSTANTES & LIMITES
// ============================================================================

/**
 * Limites duros do engine. Mudar aqui propaga para validator + UI badges.
 */
export const MEDIA_LIMITS = {
  /** Audio: max 5 minutos = 300s */
  AUDIO_MAX_DURATION_SEC: 300,
  /** Audio: max 10 MB (decodificado em memória) */
  AUDIO_MAX_FILE_BYTES: 10 * 1024 * 1024,
  /** Video: max 60 segundos */
  VIDEO_MAX_DURATION_SEC: 60,
  /** Video: max 25 MB */
  VIDEO_MAX_FILE_BYTES: 25 * 1024 * 1024,
  /** Carrossel: 3-5 segmentos */
  CARROSSEL_MIN_SEGMENTS: 3,
  CARROSSEL_MAX_SEGMENTS: 5,
  /** Waveform: número de peaks renderizados (UI) */
  WAVEFORM_PEAKS_DEFAULT: 200,
  /** Waveform: minimo se audio curto (evita array com 1 elemento) */
  WAVEFORM_PEAKS_MIN: 50,
  /** Title: max 140 chars (Twitter-like) */
  TITLE_MAX_CHARS: 140,
  /** Transcription: max 5000 chars (LGPD proporcionalidade) */
  TRANSCRIPTION_MAX_CHARS: 5000,
} as const satisfies Record<string, number>;

/**
 * Tradition literal union — defined inline to avoid circular reference
 * with `SACRED_TRADITIONS satisfies readonly Tradition[]`.
 */
export type Tradition =
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cabala'
  | 'astrologia'
  | 'tantra';

/**
 * Tradições aceitas no campo `SacredMetadata.tradition`. Mantém lista
 * alinhada com `TRADITION_OPTIONS` em CreatePost.tsx.
 */
export const SACRED_TRADITIONS: readonly Tradition[] = [
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
];

/**
 * Termos sagrados canônicos. Se entities[] contiver termo da BLACKLIST
 * (variantes anglicizadas/mal acentuadas), validator rejeita.
 *
 * White-list: orixás, entidades, orixás femininos etc — apenas valida que
 * a string é não-vazia e tamanho razoável. Não fazemos canonização
 * completa pois cabaladoscaminhos aceita termos regionais.
 */
export const SACRED_TERM_WHITELIST_HINT = [
  'Oxalá',
  'Iemanjá',
  'Oxum',
  'Iansã',
  'Xangô',
  'Ogum',
  'Obaluaiê',
  'Oxóssi',
  'Nanã',
  'Omulu',
  'Logun-Edé',
  'Exu',
  'Pombagira',
  'Caboclo',
  'Preto-Velho',
  'Baiano',
  'Cigano',
  'Boiadeiro',
  'Cabocla',
  'Menina',
  'Erê',
  'Saci',
  'Odu',
  'Ifá',
  'Bará',
  'Irokô',
] as const satisfies readonly string[];

/**
 * Termos banidos — variantes anglicizadas ou sem acentuação correta.
 * Matching é case-SENSITIVE para preservar a capitalização canônica
 * dos termos sagrados em pt-BR ("Iemanjá" capital é correto, "iemanja"
 * minúsculo sem acento é o erro).
 *
 * Se aparecer em entities[] ou title, validator retorna ValidationError.
 *
 * "orishas"/"orisha" → use "orixás"/"Orixá"
 * "ashé"/"ashe"/"ashè" → use "axé"
 * "iemanja"/"Iemanja"/"Yemanja" (sem til) → use "Iemanjá"
 * "odù"/"Odù" (com acento grave) → use "Odu" (sem acento, capital)
 */
export const SACRED_TERM_BLACKLIST = [
  'orishas',
  'orisha',
  'ashé',
  'ashe',
  'iemanja',
  'Iemanja',
  'Yemanja',
  'odù',
  'Odù',
  'ashè',
] as const satisfies readonly string[];

// ============================================================================
// §2. TIPOS — Discriminated Union
// ============================================================================

/**
 * Metadados sagrados de um media post. LGPD Art. 11 — dado sensível
 * (crença espiritual) — exige consentimento explícito para storage.
 */
export interface SacredMetadata {
  /** Tradição espiritual (de SACRED_TRADITIONS) */
  tradition: Tradition;
  /** Entidades/orixás/mestres invocados (free-form, max 80 chars cada) */
  entities?: string[];
  /** Referência a Odu (ex: "Odu 7 — Ogundá") — opcional */
  oduRef?: string;
}

/**
 * Capítulos extraídos de transcrição por timestamp. Usado em VideoPost
 * para navegação por capítulos ("00:00 Abertura", "0:30 Oração central").
 */
export interface Chapter {
  /** Tempo em segundos */
  startSec: number;
  /** Texto do capítulo (após o timestamp) */
  title: string;
  /** Indice original na transcrição (para reordenação) */
  index: number;
}

/**
 * Segment de CarrosselAyan — pode ser AudioPost OU VideoPost (recursivo
 * mas limitado a 1 nível de profundidade).
 */
export type MediaSegment = AudioPost | VideoPost;

/**
 * AudioPost — áudio narrado (cânticos, orações, pointações).
 * Validação: durationSec <= 300, audioUrl válido.
 */
export interface AudioPost {
  kind: 'audio';
  id: string;
  authorId: string;
  title: string;
  audioUrl: string;
  durationSec: number;
  /** Peaks pré-calculados (0..1) para waveform display */
  waveformData: number[];
  /** Transcrição STT (opcional, exige consent LGPD) */
  transcription?: string;
  /** Metadados sagrados (opcional) */
  sacredMetadata?: SacredMetadata;
  /** Quando a transcrição foi redigida (PII detectado) — UI mostra aviso */
  transcriptionRedacted?: boolean;
  /** ISO 8601 */
  createdAt: string;
}

/**
 * VideoPost — vídeo curto (sagrado, ritual, ponto de terreiro).
 * Validação: durationSec <= 60, videoUrl + posterUrl válidos.
 */
export interface VideoPost {
  kind: 'video';
  id: string;
  authorId: string;
  title: string;
  videoUrl: string;
  /** Poster frame (JPEG) */
  posterUrl: string;
  durationSec: number;
  transcription?: string;
  /** Capítulos extraídos da transcrição (auto-derivados) */
  chapters?: Chapter[];
  sacredMetadata?: SacredMetadata;
  transcriptionRedacted?: boolean;
  createdAt: string;
}

/**
 * CarrosselAyan — 3-5 segmentos curtos formando narrativa. Inspirado em
 * "carrossel" do Instagram mas com identidade própria (Ayan = "movimento"
 * em Iorubá). Cada segmento pode ser áudio OU vídeo.
 */
export interface CarrosselAyanPost {
  kind: 'carrossel';
  id: string;
  authorId: string;
  title: string;
  /** 3-5 segmentos (audio ou video) */
  segments: MediaSegment[];
  /** Se todos os segmentos compartilham tradição, opcional */
  commonTradition?: Tradition;
  createdAt: string;
}

/**
 * TextPost — post apenas texto (legado do feed atual).
 * Incluído no union para feed unificado.
 */
export interface TextPost {
  kind: 'text';
  id: string;
  authorId: string;
  body: string;
  /** Anexos opcionais (URLs) */
  attachments?: string[];
  sacredMetadata?: SacredMetadata;
  createdAt: string;
}

/**
 * Union discriminada — narrowing via `post.kind === 'audio' | 'video' | ...`.
 */
export type MediaPost = AudioPost | VideoPost | CarrosselAyanPost | TextPost;

/**
 * Tipo derivado: post com multimídia (exclui text puro).
 */
export type MultimediaPost = AudioPost | VideoPost | CarrosselAyanPost;

// ============================================================================
// §3. RESULT TYPE — Type-safe errors
// ============================================================================

/**
 * Result<T, E> — evita throws em código de domínio. Pattern de cycle 93
 * (EventsError discriminant). Aqui generalizamos para qualquer erro.
 */
export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * ValidationError — discriminado por `kind` para narrowing em UI/tests.
 */
export type ValidationError =
  | { kind: 'DURATION_EXCEEDED'; limitSec: number; actualSec: number; postKind: MediaPost['kind'] }
  | { kind: 'FILE_TOO_LARGE'; limitBytes: number; actualBytes: number; postKind: MediaPost['kind'] }
  | { kind: 'TITLE_TOO_LONG'; maxChars: number; actualChars: number }
  | { kind: 'TRANSCRIPTION_TOO_LONG'; maxChars: number; actualChars: number }
  | { kind: 'INVALID_URL'; field: string; value: string }
  | { kind: 'CARROSSEL_SEGMENT_COUNT'; min: number; max: number; actual: number }
  | { kind: 'BANNED_SACRED_TERM'; term: string; field: string }
  | { kind: 'INVALID_TRADITION'; tradition: string }
  | { kind: 'EMPTY_REQUIRED_FIELD'; field: string }
  | { kind: 'INVALID_ID'; id: string }
  | { kind: 'WAVEFORM_INVALID'; reason: string };

// ============================================================================
// §4. URL VALIDATION
// ============================================================================

/**
 * Verifica se string é URL válida (http/https) ou path absoluto (/audio/...).
 * Não aceita javascript:, data:, etc. (XSS via media URL).
 */
function isValidMediaUrl(value: string): boolean {
  if (value.startsWith('/')) {
    // Absolute path: deve começar com /audio, /video, /img, /uploads
    return /^[\/](audio|video|img|uploads|static)\/[\w\-./%?=]+$/i.test(value);
  }
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Wrapper que retorna o ValidationError específico para URL inválida.
 */
function validateUrlField(field: string, value: string): Result<string, ValidationError> {
  if (!value) {
    return err({ kind: 'EMPTY_REQUIRED_FIELD', field });
  }
  if (!isValidMediaUrl(value)) {
    return err({ kind: 'INVALID_URL', field, value });
  }
  return ok(value);
}

// ============================================================================
// §5. SACRED TERM VALIDATION
// ============================================================================

/**
 * Detecta termos banidos em uma string (case-SENSITIVE, word-boundary
 * Unicode-aware — lesson #10 do spawn brief).
 *
 * Case-sensitive para preservar a capitalização canônica dos termos
 * sagrados em pt-BR. "Iemanjá" (capital + acento) é aceito; "iemanja"
 * (minúsculo sem acento) é rejeitado.
 *
 * Word-boundary Unicode: usa `(?<![\p{L}\p{N}_])` e `(?![\p{L}\p{N}_])`
 * com flag /u para cobrir termos acentuados (ex: "orishas" no meio de
 * "the_orishas" não conta, mas "orishas." sim).
 */
export function containsBannedTerm(text: string): string | null {
  for (const banned of SACRED_TERM_BLACKLIST) {
    // Escape caracteres especiais de regex
    const escaped = banned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Word-boundary Unicode-aware (lesson #10 + #2 do spawn brief)
    const pattern = new RegExp(
      `(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`,
      'u'
    );
    if (pattern.test(text)) {
      return banned;
    }
  }
  return null;
}

/**
 * Valida uma string contra BLACKLIST + regras de tamanho.
 */
function validateSacredText(
  field: string,
  value: string,
  maxChars: number
): Result<string, ValidationError> {
  if (!value || !(value as string).trim()) {
    return err({ kind: 'EMPTY_REQUIRED_FIELD', field });
  }
  if (value.length > maxChars) {
    return err({ kind: 'TITLE_TOO_LONG', maxChars, actualChars: value.length });
  }
  const banned = containsBannedTerm(value);
  if (banned) {
    return err({ kind: 'BANNED_SACRED_TERM', term: banned, field });
  }
  return ok(value);
}

// ============================================================================
// §6. WAVEFORM PEAKS
// ============================================================================

/**
 * Extrai peaks (valores 0..1) de um AudioBuffer-like para renderização
 * no waveform canvas. Determinístico para mesma entrada.
 *
 * @param audioBuffer - Float32Array-like com samples de áudio (-1..1)
 * @param samples - número de peaks desejados (default 200)
 * @returns array de peaks normalizados (0..1)
 */
export function getWaveformPeaks(
  audioBuffer: Float32Array | number[] | readonly number[],
  samples: number = MEDIA_LIMITS.WAVEFORM_PEAKS_DEFAULT
): number[] {
  if (!audioBuffer || (audioBuffer as Float32Array).length === 0) {
    return new Array(samples).fill(0);
  }

  const buffer = Array.from(audioBuffer as ArrayLike<number>);
  const total = buffer.length;

  if (total < samples) {
    // Audio curto: cada sample = 1 peak, com fallback minimo
    const peaks: number[] = buffer.map((v) => Math.min(1, Math.abs(v)));
    while (peaks.length < samples) peaks.push(0);
    return peaks;
  }

  const peaks: number[] = new Array(samples);
  const blockSize = total / samples;

  for (let i = 0; i < samples; i++) {
    const start = Math.floor(i * blockSize);
    const end = Math.floor((i + 1) * blockSize);
    let max = 0;
    for (let j = start; j < end; j++) {
      const v = Math.abs(buffer[j] ?? 0);
      if (v > max) max = v;
    }
    peaks[i] = Math.min(1, max);
  }

  return peaks;
}

// ============================================================================
// §7. CHAPTER EXTRACTION
// ============================================================================

/**
 * Regex para detectar timestamps em transcrições. Aceita:
 *   - "00:00"  (MM:SS)
 *   - "0:30"   (M:SS)
 *   - "1:15:30" (H:MM:SS)
 *   - "[00:30]" (com brackets)
 *   - "(00:30)" (com parens)
 *
 * Flags: g (global) + m (multiline para TS — lesson #23 do spawn brief).
 */
const CHAPTER_REGEX =
  /[\[\(]?(\d{1,2}:\d{2}(?::\d{2})?)[\]\)]?\s+([^\n\r]{3,120})/gm;

/**
 * Extrai capítulos de uma transcrição a partir de timestamps.
 * Suporta formatos "00:00 Abertura", "[0:30] Oração", "(1:15:30) Ritual".
 */
export function extractChapterTimestamps(transcription: string): Chapter[] {
  if (!transcription || !(transcription as string).trim()) return [];

  const chapters: Chapter[] = [];
  const matches = Array.from(transcription.matchAll(CHAPTER_REGEX));
  let idx = 0;

  for (const m of matches) {
    const timestamp = m[1];
    const title = (m[2] ?? '').trim();
    if (!timestamp || !title) continue;

    const parts = timestamp.split(':').map((p) => parseInt(p, 10));
    let startSec = 0;
    if (parts.length === 2) {
      startSec = (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
    } else if (parts.length === 3) {
      startSec = (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
    }
    if (startSec < 0 || !Number.isFinite(startSec)) continue;

    chapters.push({ startSec, title, index: idx++ });
  }

  return chapters;
}

// ============================================================================
// §8. LGPD — PII REDACTION
// ============================================================================

/**
 * Patterns de PII — emails, telefones BR, CPF. Aplicados sequencialmente.
 * Cada pattern preserva prefixo/sufixo útil (ex: "jo***@gmail.com").
 */
const PII_PATTERNS: Array<{ name: string; pattern: RegExp; replace: (m: RegExpMatchArray) => string }> = [
  // Email
  {
    name: 'email',
    pattern: /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    replace: (m) => {
      const user = m[1] ?? '';
      const domain = m[2] ?? '';
      if (user.length <= 2) return `**@${domain}`;
      return `${user.slice(0, 2)}***@${domain}`;
    },
  },
  // Telefone BR: (11) 91234-5678, 11 91234-5678, +5511912345678
  {
    name: 'phone',
    pattern: /(\+?55?\s?\(?\d{2}\)?\s?)?9?\d{4}[-\s]?\d{4}/g,
    replace: (m) => {
      const digits = (m[0] ?? '').replace(/\D/g, '');
      if (digits.length < 8) return m[0] ?? '';
      return '(11) ****-****';
    },
  },
  // CPF: 123.456.789-09
  {
    name: 'cpf',
    pattern: /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g,
    replace: () => '***.***.***-**',
  },
];

/**
 * Redige PII de uma transcrição. Não loga original (LGPD Art. 18).
 * Retorna string redigida + flag `transcriptionRedacted` se houve mudança.
 */
export function redactTranscriptionPII(text: string): { redacted: string; wasRedacted: boolean } {
  if (!text) return { redacted: '', wasRedacted: false };

  let out = text;
  let wasRedacted = false;
  for (const { pattern, replace } of PII_PATTERNS) {
    out = out.replace(pattern, (match, ...args) => {
      wasRedacted = true;
      const m = [match, ...args] as RegExpMatchArray;
      return replace(m);
    });
  }
  return { redacted: out, wasRedacted };
}

// ============================================================================
// §9. CORE VALIDATOR
// ============================================================================

/**
 * Valida um MediaPost completo. Discrimina por `post.kind` para
 * aplicar regras específicas (audio vs video vs carrossel).
 */
export function validateMediaPost(post: MediaPost): Result<MediaPost, ValidationError> {
  // ID comum
  if (!post.id || !(post.id as string).trim()) {
    return err({ kind: 'INVALID_ID', id: String(post.id) });
  }
  if (!post.authorId || !(post.authorId as string).trim()) {
    return err({ kind: 'EMPTY_REQUIRED_FIELD', field: 'authorId' });
  }
  // createdAt ISO check (basic)
  if (post.createdAt && Number.isNaN(Date.parse(post.createdAt))) {
    return err({ kind: 'EMPTY_REQUIRED_FIELD', field: 'createdAt' });
  }

  switch (post.kind) {
    case 'audio':
      return validateAudioPost(post);
    case 'video':
      return validateVideoPost(post);
    case 'carrossel':
      return validateCarrosselPost(post);
    case 'text':
      return validateTextPost(post);
    default: {
      // Exhaustiveness check
      const _exhaustive: never = post;
      void _exhaustive;
      return err({ kind: 'EMPTY_REQUIRED_FIELD', field: 'kind' });
    }
  }
}

function validateAudioPost(post: AudioPost): Result<AudioPost, ValidationError> {
  // Title
  const titleR = validateSacredText('title', post.title, MEDIA_LIMITS.TITLE_MAX_CHARS);
  if (titleR.ok === false) return { ok: false, error: titleR.error };

  // audioUrl
  const urlR = validateUrlField('audioUrl', post.audioUrl);
  if (urlR.ok === false) return { ok: false, error: urlR.error };

  // Duration
  if (post.durationSec <= 0) {
    return err({ kind: 'EMPTY_REQUIRED_FIELD', field: 'durationSec' });
  }
  if (post.durationSec > MEDIA_LIMITS.AUDIO_MAX_DURATION_SEC) {
    return err({
      kind: 'DURATION_EXCEEDED',
      limitSec: MEDIA_LIMITS.AUDIO_MAX_DURATION_SEC,
      actualSec: post.durationSec,
      postKind: 'audio',
    });
  }

  // Waveform
  if (!Array.isArray(post.waveformData)) {
    return err({ kind: 'WAVEFORM_INVALID', reason: 'not an array' });
  }
  if (post.waveformData.length < MEDIA_LIMITS.WAVEFORM_PEAKS_MIN) {
    return err({
      kind: 'WAVEFORM_INVALID',
      reason: `minimo ${MEDIA_LIMITS.WAVEFORM_PEAKS_MIN} peaks`,
    });
  }
  const waveformOk = post.waveformData.every(
    (v) => typeof v === 'number' && v >= 0 && v <= 1
  );
  if (!waveformOk) {
    return err({ kind: 'WAVEFORM_INVALID', reason: 'peaks fora de [0,1]' });
  }

  // Transcription (opcional mas se presente, max chars)
  if (post.transcription !== undefined) {
    if (post.transcription.length > MEDIA_LIMITS.TRANSCRIPTION_MAX_CHARS) {
      return err({
        kind: 'TRANSCRIPTION_TOO_LONG',
        maxChars: MEDIA_LIMITS.TRANSCRIPTION_MAX_CHARS,
        actualChars: post.transcription.length,
      });
    }
  }

  // Sacred metadata
  if (post.sacredMetadata) {
    const smR = validateSacredMetadata(post.sacredMetadata);
    if (smR.ok === false) return { ok: false, error: smR.error };
  }

  return ok(post);
}

function validateVideoPost(post: VideoPost): Result<VideoPost, ValidationError> {
  // Title
  const titleR = validateSacredText('title', post.title, MEDIA_LIMITS.TITLE_MAX_CHARS);
  if (titleR.ok === false) return { ok: false, error: titleR.error };

  // videoUrl + posterUrl
  const videoR = validateUrlField('videoUrl', post.videoUrl);
  if (videoR.ok === false) return { ok: false, error: videoR.error };
  const posterR = validateUrlField('posterUrl', post.posterUrl);
  if (posterR.ok === false) return { ok: false, error: posterR.error };

  // Duration (max 60s)
  if (post.durationSec <= 0) {
    return err({ kind: 'EMPTY_REQUIRED_FIELD', field: 'durationSec' });
  }
  if (post.durationSec > MEDIA_LIMITS.VIDEO_MAX_DURATION_SEC) {
    return err({
      kind: 'DURATION_EXCEEDED',
      limitSec: MEDIA_LIMITS.VIDEO_MAX_DURATION_SEC,
      actualSec: post.durationSec,
      postKind: 'video',
    });
  }

  // Chapters
  if (post.chapters !== undefined) {
    const chaptersSorted = post.chapters.every(
      (c, i, arr) => i === 0 || c.startSec >= (arr[i - 1]?.startSec ?? 0)
    );
    if (!chaptersSorted) {
      return err({ kind: 'WAVEFORM_INVALID', reason: 'chapters fora de ordem' });
    }
  }

  if (post.transcription !== undefined) {
    if (post.transcription.length > MEDIA_LIMITS.TRANSCRIPTION_MAX_CHARS) {
      return err({
        kind: 'TRANSCRIPTION_TOO_LONG',
        maxChars: MEDIA_LIMITS.TRANSCRIPTION_MAX_CHARS,
        actualChars: post.transcription.length,
      });
    }
  }

  if (post.sacredMetadata) {
    const smR = validateSacredMetadata(post.sacredMetadata);
    if (smR.ok === false) return { ok: false, error: smR.error };
  }

  return ok(post);
}

function validateCarrosselPost(
  post: CarrosselAyanPost
): Result<CarrosselAyanPost, ValidationError> {
  // Title
  const titleR = validateSacredText('title', post.title, MEDIA_LIMITS.TITLE_MAX_CHARS);
  if (titleR.ok === false) return { ok: false, error: titleR.error };

  // Segments count
  const n = post.segments.length;
  if (n < MEDIA_LIMITS.CARROSSEL_MIN_SEGMENTS || n > MEDIA_LIMITS.CARROSSEL_MAX_SEGMENTS) {
    return err({
      kind: 'CARROSSEL_SEGMENT_COUNT',
      min: MEDIA_LIMITS.CARROSSEL_MIN_SEGMENTS,
      max: MEDIA_LIMITS.CARROSSEL_MAX_SEGMENTS,
      actual: n,
    });
  }

  // Cada segmento deve validar individualmente
  for (let i = 0; i < post.segments.length; i++) {
    const seg = post.segments[i];
    if (!seg) {
      return err({ kind: 'EMPTY_REQUIRED_FIELD', field: `segments[${i}]` });
    }
    const segR = validateMediaPost(seg);
    if (segR.ok === false) return { ok: false, error: segR.error };
  }

  return ok(post);
}

function validateTextPost(post: TextPost): Result<TextPost, ValidationError> {
  if (!post.body || !(post.body as string).trim()) {
    return err({ kind: 'EMPTY_REQUIRED_FIELD', field: 'body' });
  }
  if (post.body.length > 4000) {
    return err({ kind: 'TITLE_TOO_LONG', maxChars: 4000, actualChars: post.body.length });
  }
  const banned = containsBannedTerm(post.body);
  if (banned) {
    return err({ kind: 'BANNED_SACRED_TERM', term: banned, field: 'body' });
  }
  if (post.sacredMetadata) {
    const smR = validateSacredMetadata(post.sacredMetadata);
    if (smR.ok === false) return { ok: false, error: smR.error };
  }
  return ok(post);
}

function validateSacredMetadata(
  sm: SacredMetadata
): Result<SacredMetadata, ValidationError> {
  if (!SACRED_TRADITIONS.includes(sm.tradition)) {
    return err({ kind: 'INVALID_TRADITION', tradition: sm.tradition });
  }
  if (sm.entities) {
    for (const e of sm.entities) {
      if (!e || !(e as string).trim()) {
        return err({ kind: 'EMPTY_REQUIRED_FIELD', field: 'entities' });
      }
      if (e.length > 80) {
        return err({ kind: 'TITLE_TOO_LONG', maxChars: 80, actualChars: e.length });
      }
      const banned = containsBannedTerm(e);
      if (banned) {
        return err({ kind: 'BANNED_SACRED_TERM', term: banned, field: 'entities' });
      }
    }
  }
  if (sm.oduRef) {
    if (!sm.oduRef || !(sm.oduRef as string).trim()) {
      return err({ kind: 'EMPTY_REQUIRED_FIELD', field: 'oduRef' });
    }
    if (sm.oduRef.length > 80) {
      return err({ kind: 'TITLE_TOO_LONG', maxChars: 80, actualChars: sm.oduRef.length });
    }
  }
  return ok(sm);
}

// ============================================================================
// §10. HELPERS
// ============================================================================

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}
function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Type guard: é um post com multimídia?
 */
export function isMultimediaPost(post: MediaPost): post is MultimediaPost {
  return post.kind !== 'text';
}

/**
 * Duração total de um Carrossel (soma dos segments).
 */
export function getCarrosselTotalDuration(post: CarrosselAyanPost): number {
  return post.segments.reduce(
    (acc, seg) => acc + (seg.kind === 'audio' || seg.kind === 'video' ? seg.durationSec : 0),
    0
  );
}

/**
 * Helper de formatação de tempo: segundos → "MM:SS" ou "H:MM:SS".
 */
export function formatDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  }
  return `${m}:${String(r).padStart(2, '0')}`;
}
