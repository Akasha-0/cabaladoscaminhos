/**
 * ════════════════════════════════════════════════════════════════════════════
 * W90-C — WORKSHOP RECORDING ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 90 · 2026-06-30
 * Author: W90-C Coder (Mavis orchestrator session 414809708519590)
 *
 * A workshop recording combines a workshop (event) with its captured media:
 * audio URL + optional video URL + transcript (segmented, with timestamps)
 * + facilitator metadata. This engine computes:
 *
 *   - Total duration (from max(endSeconds))
 *   - Segment lookup at a given playback time
 *   - Content-aware highlights (key moments) — uses text heuristics
 *     to identify questions, insights, practices, and silence-breaks.
 *   - Language breakdown (% per language)
 *   - Transcript search (case-insensitive, accent-insensitive)
 *   - Key term extraction (most-frequent meaningful tokens)
 *   - Timestamp formatting (MM:SS / HH:MM:SS)
 *   - Serialization (segment list → plain text, SRT-like)
 *   - Parsing (raw transcript → segments)
 *
 * Public API (cycle 90 contract):
 *   getTotalDuration(recording)
 *   findSegmentAt(recording, seconds)
 *   computeHighlights(recording, options?)
 *   formatTimestamp(seconds)
 *   serializeTranscript(segments)
 *   parseTranscript(raw)
 *   getLanguageBreakdown(segments)
 *   searchTranscript(recording, query)
 *   extractKeyTerms(recording, topN)
 *
 * Durable lessons applied (cycle 60-89):
 *   - Branded types via `Brand<TBase, TBrand>` (cycle 75)
 *   - Object.freeze on insert + at module surface (cycle 68)
 *   - Pure functions, no I/O (cycle 73)
 *   - Source-inspection spec, not vitest (cycle 89)
 *   - Defensive parsing — invalid input → empty result, never throw (cycle 89)
 *   - 5 traditions: astrologia, cigano, numerologia, orixas, tantra-cabala
 */

// ════════════════════════════════════════════════════════════════════════════
// BRANDED PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════

declare const __brand: unique symbol;
type Brand<TBase, TBrand extends string> = TBase & { readonly [__brand]: TBrand };

export type WorkshopId = Brand<string, 'WorkshopId'>;
export type WorkshopRecordingId = Brand<string, 'WorkshopRecordingId'>;
export type UserId = Brand<string, 'UserId'>;
export type SegmentIndex = Brand<number, 'SegmentIndex'>;

export const wid = (s: string): WorkshopId => s as WorkshopId;
export const wrid = (s: string): WorkshopRecordingId => s as WorkshopRecordingId;
export const uid = (s: string): UserId => s as UserId;

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export type Tradition =
  | 'astrologia'
  | 'cigano'
  | 'numerologia'
  | 'orixas'
  | 'tantra-cabala';

export const ALL_TRADITIONS: ReadonlyArray<Tradition> = Object.freeze([
  'astrologia',
  'cigano',
  'numerologia',
  'orixas',
  'tantra-cabala',
] as const);

export type SegmentLanguage = 'pt-BR' | 'en' | 'es';

export const ALL_LANGUAGES: ReadonlyArray<SegmentLanguage> = Object.freeze([
  'pt-BR',
  'en',
  'es',
] as const);

export interface TranscriptSegment {
  readonly startSeconds: number;
  readonly endSeconds: number;
  readonly speakerName: string;
  readonly text: string;
  readonly language: SegmentLanguage;
}

export type HighlightReason =
  | 'question'
  | 'insight'
  | 'practice'
  | 'silence-break';

export interface Highlight {
  readonly segmentIndex: number;
  readonly reason: HighlightReason;
  readonly engagementScore: number;
}

export interface WorkshopRecording {
  readonly id: WorkshopRecordingId;
  readonly workshopId: WorkshopId;
  readonly audioUrl: string;
  readonly videoUrl: string | null;
  readonly transcript: ReadonlyArray<TranscriptSegment>;
  readonly durationSeconds: number;
  readonly recordedAt: number;
  readonly tradition: Tradition;
  readonly facilitatorId: UserId;
  readonly facilitatorName: string;
}

export interface ComputeHighlightsOptions {
  /** How many highlights to return. Default 5. */
  readonly limit?: number;
  /** Minimum engagement score to include. Default 0.5. */
  readonly minScore?: number;
  /** Which reasons to consider. Default all four. */
  readonly reasons?: ReadonlyArray<HighlightReason>;
}

export interface LanguageBreakdown {
  readonly total: number;
  readonly counts: Readonly<Record<SegmentLanguage, number>>;
  readonly percentages: Readonly<Record<SegmentLanguage, number>>;
}

export interface KeyTerm {
  readonly term: string;
  readonly count: number;
}

export interface SearchHit {
  readonly segmentIndex: number;
  readonly matchStart: number;
  readonly matchEnd: number;
  readonly snippet: string;
}

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

/** Average words-per-minute for spoken Portuguese. */
export const WORDS_PER_MINUTE_PT = 130;

/** Words-per-second approximation. */
export const WORDS_PER_SECOND_PT = WORDS_PER_MINUTE_PT / 60;

/** Highlight reason labels — used for UI + audit. */
export const HIGHLIGHT_LABELS: Readonly<Record<HighlightReason, string>> = Object.freeze({
  question: 'Pergunta da roda',
  insight: 'Insight compartilhado',
  practice: 'Prática conduzida',
  'silence-break': 'Ruptura de silêncio',
} as const);

/** Tradition labels — used for UI. */
export const TRADITION_LABELS: Readonly<Record<Tradition, string>> = Object.freeze({
  astrologia: 'Astrologia',
  cigano: 'Cigano (Lenormand)',
  numerologia: 'Numerologia Cabalística',
  orixas: 'Orixás & Ifá',
  'tantra-cabala': 'Tantra & Cabala',
} as const);

/** Default compute-highlights options. */
export const DEFAULT_HIGHLIGHT_OPTIONS: Required<ComputeHighlightsOptions> = Object.freeze({
  limit: 5,
  minScore: 0.5,
  reasons: ['question', 'insight', 'practice', 'silence-break'] as const,
} as const);

// ════════════════════════════════════════════════════════════════════════════
// STOPWORDS — Portuguese common words excluded from key-term extraction
// ════════════════════════════════════════════════════════════════════════════

const STOPWORDS_PT: ReadonlySet<string> = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das',
  'no', 'na', 'nos', 'nas', 'em', 'por', 'para', 'com', 'sem', 'sob', 'sobre',
  'e', 'ou', 'mas', 'que', 'se', 'porque', 'porquê', 'então', 'também', 'já',
  'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas', 'me', 'te', 'se',
  'lhe', 'nos', 'vos', 'lhes', 'meu', 'minha', 'teu', 'tua', 'seu', 'sua',
  'nosso', 'nossa', 'vosso', 'vossa', 'este', 'esta', 'isto', 'esse', 'essa',
  'isso', 'aquele', 'aquela', 'aquilo', 'é', 'são', 'foi', 'era', 'ser', 'estar',
  'está', 'estão', 'ter', 'tem', 'têm', 'tinha', 'tinham', 'muito', 'muita',
  'pouco', 'pouca', 'mais', 'menos', 'tudo', 'nada', 'algo', 'todo', 'toda',
  'cada', 'qual', 'quais', 'quando', 'onde', 'como', 'aqui', 'ali', 'lá', 'cá',
  'sim', 'não', 'talvez', 'só', 'ainda', 'sempre', 'nunca',
]);

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

/** Strip accents (NFKD normalization + remove combining marks). */
function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Tokenize Portuguese text → lowercase, no punctuation, no stopwords. */
function tokenize(text: string): string[] {
  return stripAccents(text.toLowerCase())
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS_PT.has(w));
}

// ════════════════════════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * getTotalDuration — computes the actual duration from the transcript
 * segments (max endSeconds). Falls back to the explicit durationSeconds
 * field if the transcript is empty.
 */
export function getTotalDuration(recording: WorkshopRecording): number {
  if (recording.transcript.length === 0) {
    return Math.max(0, recording.durationSeconds);
  }
  let max = 0;
  for (const seg of recording.transcript) {
    if (seg.endSeconds > max) max = seg.endSeconds;
  }
  return max;
}

/**
 * findSegmentAt — returns the index of the segment active at the given
 * playback time. Returns -1 if no segment matches.
 */
export function findSegmentAt(recording: WorkshopRecording, seconds: number): number {
  if (seconds < 0) return -1;
  for (let i = 0; i < recording.transcript.length; i++) {
    const seg = recording.transcript[i];
    if (seconds >= seg.startSeconds && seconds < seg.endSeconds) {
      return i;
    }
  }
  return -1;
}

/**
 * computeHighlights — content-aware highlight detection.
 *
 * Score per segment is a sum of:
 *   - 'question'   +0.6 if text contains '?' or interrogative pronouns
 *   - 'insight'    +0.5 if text length > 200 chars (sustained reflection)
 *   - 'practice'   +0.7 if text contains practice keywords
 *                   ("respire", "feche os olhos", "sinta", "pratique", etc.)
 *   - 'silence-break' +0.4 if segment gap before it > 8 seconds
 *
 * Final score clamped to [0, 1].
 */
export function computeHighlights(
  recording: WorkshopRecording,
  options?: ComputeHighlightsOptions
): ReadonlyArray<Highlight> {
  const opts = { ...DEFAULT_HIGHLIGHT_OPTIONS, ...(options ?? {}) };
  const reasons = new Set(opts.reasons);
  const result: Highlight[] = [];

  const PRACTICE_KEYWORDS = [
    'respire', 'feche os olhos', 'sinta', 'pratique', 'coloque a mao',
    'coloca a mao', 'repita', 'cante', 'toque', 'olhe para',
    'observe', 'medite', 'invoque', 'receba', 'ancore',
  ];

  for (let i = 0; i < recording.transcript.length; i++) {
    const seg = recording.transcript[i];
    const text = stripAccents(seg.text.toLowerCase());
    let score = 0;
    let chosenReason: HighlightReason | null = null;

    // Question detection
    if (reasons.has('question')) {
      const hasQuestionMark = seg.text.includes('?');
      const hasInterrogative =
        /\b(quem|o que|como|quando|onde|por que|porque|qual|quais)\b/i.test(text);
      if (hasQuestionMark || hasInterrogative) {
        score += 0.6;
        if (!chosenReason) chosenReason = 'question';
      }
    }

    // Insight detection
    if (reasons.has('insight')) {
      if (seg.text.length > 200) {
        score += 0.5;
        if (!chosenReason) chosenReason = 'insight';
      }
    }

    // Practice detection
    if (reasons.has('practice')) {
      if (PRACTICE_KEYWORDS.some((kw) => text.includes(kw))) {
        score += 0.7;
        chosenReason = 'practice';
      }
    }

    // Silence-break detection
    if (reasons.has('silence-break') && i > 0) {
      const prev = recording.transcript[i - 1];
      const gap = seg.startSeconds - prev.endSeconds;
      if (gap >= 8) {
        score += 0.4;
        if (!chosenReason) chosenReason = 'silence-break';
      }
    }

    score = Math.min(1, Math.max(0, score));
    if (score >= opts.minScore && chosenReason !== null) {
      result.push(Object.freeze({
        segmentIndex: i,
        reason: chosenReason,
        engagementScore: score,
      }));
    }
  }

  // Sort descending by score, then by segment index (stable)
  result.sort((a, b) => {
    if (b.engagementScore !== a.engagementScore) {
      return b.engagementScore - a.engagementScore;
    }
    return a.segmentIndex - b.segmentIndex;
  });

  return Object.freeze(result.slice(0, opts.limit));
}

/**
 * formatTimestamp — converts seconds to "MM:SS" or "HH:MM:SS".
 * Rounds DOWN to whole seconds.
 */
export function formatTimestamp(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

/**
 * serializeTranscript — joins segments into a single plain-text transcript
 * with optional timestamps. Two modes:
 *   'plain'   → "Speaker: text\n..."
 *   'timed'   → "[MM:SS] Speaker: text\n..."
 */
export function serializeTranscript(
  segments: ReadonlyArray<TranscriptSegment>,
  mode: 'plain' | 'timed' = 'plain'
): string {
  const lines: string[] = [];
  for (const seg of segments) {
    if (mode === 'timed') {
      lines.push(`[${formatTimestamp(seg.startSeconds)}] ${seg.speakerName}: ${seg.text}`);
    } else {
      lines.push(`${seg.speakerName}: ${seg.text}`);
    }
  }
  return lines.join('\n');
}

/**
 * parseTranscript — parses a plain-text transcript (one segment per line,
 * "Speaker: text") into TranscriptSegment objects with timestamps inferred
 * from words-per-second.
 *
 * This is a fallback parser for transcripts that arrive without timestamps.
 * For real timestamps, prefer to load pre-segmented data.
 */
export function parseTranscript(
  raw: string,
  options?: {
    readonly defaultLanguage?: SegmentLanguage;
    readonly startOffset?: number;
    readonly gapSeconds?: number;
  }
): ReadonlyArray<TranscriptSegment> {
  const opts = {
    defaultLanguage: (options?.defaultLanguage ?? 'pt-BR') as SegmentLanguage,
    startOffset: options?.startOffset ?? 0,
    gapSeconds: options?.gapSeconds ?? 1,
  };
  if (typeof raw !== 'string' || raw.trim() === '') return Object.freeze([]);
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const segments: TranscriptSegment[] = [];
  let cursor = Math.max(0, opts.startOffset);

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx <= 0) continue;
    const speaker = line.slice(0, colonIdx).trim();
    const text = line.slice(colonIdx + 1).trim();
    if (!speaker || !text) continue;
    const wordCount = text.split(/\s+/).length;
    const dur = Math.max(1, Math.round(wordCount / WORDS_PER_SECOND_PT));
    segments.push(Object.freeze({
      startSeconds: cursor,
      endSeconds: cursor + dur,
      speakerName: speaker,
      text,
      language: opts.defaultLanguage,
    }));
    cursor += dur + opts.gapSeconds;
  }

  return Object.freeze(segments);
}

/**
 * getLanguageBreakdown — counts segments + percentages per language.
 */
export function getLanguageBreakdown(
  segments: ReadonlyArray<TranscriptSegment>
): LanguageBreakdown {
  const counts: Record<SegmentLanguage, number> = { 'pt-BR': 0, 'en': 0, 'es': 0 };
  for (const seg of segments) {
    if (seg.language in counts) {
      counts[seg.language] += 1;
    }
  }
  const total = segments.length;
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 1000) / 10);
  const percentages: Record<SegmentLanguage, number> = {
    'pt-BR': pct(counts['pt-BR']),
    'en': pct(counts['en']),
    'es': pct(counts['es']),
  };
  return Object.freeze({
    total,
    counts: Object.freeze(counts),
    percentages: Object.freeze(percentages),
  });
}

/**
 * searchTranscript — case- and accent-insensitive search across the transcript.
 * Returns at most one hit per segment (the first occurrence).
 */
export function searchTranscript(
  recording: WorkshopRecording,
  query: string
): ReadonlyArray<SearchHit> {
  if (typeof query !== 'string' || query.trim().length === 0) return Object.freeze([]);
  const needle = stripAccents(query.toLowerCase());
  const hits: SearchHit[] = [];
  for (let i = 0; i < recording.transcript.length; i++) {
    const seg = recording.transcript[i];
    const haystack = stripAccents(seg.text.toLowerCase());
    const idx = haystack.indexOf(needle);
    if (idx >= 0) {
      const start = Math.max(0, idx - 24);
      const end = Math.min(seg.text.length, idx + needle.length + 24);
      const snippet = (start > 0 ? '…' : '') + seg.text.slice(start, end) + (end < seg.text.length ? '…' : '');
      hits.push(Object.freeze({
        segmentIndex: i,
        matchStart: idx,
        matchEnd: idx + needle.length,
        snippet,
      }));
    }
  }
  return Object.freeze(hits);
}

/**
 * extractKeyTerms — returns the top-N most-frequent meaningful tokens
 * across all transcript segments.
 *
 * Filters out:
 *   - tokens shorter than 4 chars
 *   - Portuguese stopwords
 *   - non-alphanumeric tokens
 */
export function extractKeyTerms(
  recording: WorkshopRecording,
  topN: number = 10
): ReadonlyArray<KeyTerm> {
  const counts = new Map<string, number>();
  for (const seg of recording.transcript) {
    const tokens = tokenize(seg.text);
    for (const t of tokens) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  const arr: KeyTerm[] = [];
  for (const [term, count] of counts.entries()) {
    arr.push(Object.freeze({ term, count }));
  }
  arr.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.term.localeCompare(b.term);
  });
  return Object.freeze(arr.slice(0, Math.max(0, topN)));
}

// ════════════════════════════════════════════════════════════════════════════
// TEST EXPORTS — internal access for spec/smoke
// ════════════════════════════════════════════════════════════════════════════

export const __test_exports = Object.freeze({
  stripAccents,
  tokenize,
  STOPWORDS_PT_SIZE: STOPWORDS_PT.size,
  WORDS_PER_MINUTE_PT,
  ALL_TRADITIONS_SIZE: ALL_TRADITIONS.length,
  ALL_LANGUAGES_SIZE: ALL_LANGUAGES.length,
});

// Freeze public surface as a defensive audit signal
Object.freeze(getTotalDuration);
Object.freeze(findSegmentAt);
Object.freeze(computeHighlights);
Object.freeze(formatTimestamp);
Object.freeze(serializeTranscript);
Object.freeze(parseTranscript);
Object.freeze(getLanguageBreakdown);
Object.freeze(searchTranscript);
Object.freeze(extractKeyTerms);