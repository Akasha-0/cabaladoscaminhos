/**
 * audio-video-live-transcription.ts
 *
 * Cycle 35 — Real-Time Live Transcription for Audio/Video Broadcasts.
 *
 * Composes with:
 *   - src/lib/w33/audio-video-recording.ts   (recorder state + waveform)
 *   - src/lib/w32/livestream-recording.ts    (livestream state machine)
 *   - src/lib/w34/livestream-chat-moderation.ts (chat-driven moderation hooks)
 *
 * Pure TypeScript: no runtime imports from app code, no I/O, no DOM. All
 * timestamps are caller-supplied (`now`) so the module is deterministic
 * under test. Each public helper returns a fresh value or a fresh array.
 *
 * Responsibilities:
 *   1. Partial + final cues — the recognizer emits partials frequently
 *      and finals less often; the module converts that stream into a
 *      canonical cue list with stable IDs.
 *   2. WEBVTT export — final cues serialize to a `.vtt` blob for
 *      accessibility and search.
 *   3. Word-level confidence — cue-level average, plus per-word flags
 *      for low-confidence words (caller can render those as italic).
 *   4. Latency tracking — partial-to-final gap should stay < 3s for
 *      "real-time" feel; the module flags slow cues.
 *   5. Live caption buffer — the most-recent N final cues form the
 *      "rolling caption" shown under the player.
 *   6. Summary — totals, average latency, low-confidence word count.
 */

// ---------- TYPES ----------------------------------------------------------

export type CueKind = "partial" | "final";

export interface TranscriptWord {
  text: string;
  startMs: number;
  endMs: number;
  confidence: number; // 0..1
}

export interface TranscriptCue {
  id: string;
  kind: CueKind;
  startMs: number;
  endMs: number;
  text: string;
  words: TranscriptWord[];
  speakerId?: string;
  language: string; // BCP-47 (e.g., "pt-BR")
  receivedAt: number;
  finalizedAt?: number;
}

export interface LiveCaptionConfig {
  language: string;
  rollingWindowSize: number;   // default 6
  partialMaxAgeMs: number;     // default 8s — older partials are dropped
  lowConfidenceThreshold: number; // default 0.6
  maxLatencyMs: number;        // default 3000ms partial->final gap
  maxWordsPerCue: number;      // default 32
}

export interface TranscriptSummary {
  totalCues: number;
  finalCues: number;
  partialCues: number;
  averageLatencyMs: number | null;
  lowConfidenceWordCount: number;
  totalDurationMs: number;
  uniqueSpeakers: number;
}

export interface TranscriptExport {
  vtt: string;
  cueCount: number;
  language: string;
  generatedAt: number;
}

// ---------- CONSTANTS -----------------------------------------------------

export const DEFAULT_LIVE_CAPTION_CONFIG: LiveCaptionConfig = {
  language: "pt-BR",
  rollingWindowSize: 6,
  partialMaxAgeMs: 8000,
  lowConfidenceThreshold: 0.6,
  maxLatencyMs: 3000,
  maxWordsPerCue: 32,
};

export const MIN_CONFIDENCE = 0;
export const MAX_CONFIDENCE = 1;
export const MAX_WORD_LENGTH = 64;
export const MS_PER_SECOND = 1000;
export const MAX_CUE_DURATION_MS = 30_000; // 30s max per cue
export const MIN_CUE_DURATION_MS = 250;

// ---------- HELPERS -----------------------------------------------------

export function clampConfidence(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(MIN_CONFIDENCE, Math.min(MAX_CONFIDENCE, n));
}

export function sanitizeWord(w: string): string {
  return String(w ?? "").trim().slice(0, MAX_WORD_LENGTH);
}

export function isLowConfidence(
  word: TranscriptWord,
  config: LiveCaptionConfig
): boolean {
  return word.confidence < config.lowConfidenceThreshold;
}

export function cueDurationMs(cue: TranscriptCue): number {
  return Math.max(0, cue.endMs - cue.startMs);
}

export function cueWordCount(cue: TranscriptCue): number {
  return cue.words.length;
}

export function cueAverageConfidence(cue: TranscriptCue): number {
  if (cue.words.length === 0) return 0;
  let total = 0;
  for (const w of cue.words) total += w.confidence;
  return clampConfidence(total / cue.words.length);
}

export function cueLatencyMs(cue: TranscriptCue): number | null {
  if (cue.kind !== "final" || typeof cue.finalizedAt !== "number") return null;
  return Math.max(0, cue.finalizedAt - cue.receivedAt);
}

// ---------- BUILDERS -----------------------------------------------------

export function buildPartialCue(input: {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
  words: TranscriptWord[];
  language?: string;
  speakerId?: string;
  receivedAt: number;
  config: LiveCaptionConfig;
}): TranscriptCue {
  return {
    id: input.id,
    kind: "partial",
    startMs: Math.max(0, input.startMs),
    endMs: Math.max(input.startMs + MIN_CUE_DURATION_MS, input.endMs),
    text: input.text,
    words: input.words.slice(0, input.config.maxWordsPerCue),
    speakerId: input.speakerId,
    language: input.language ?? input.config.language,
    receivedAt: input.receivedAt,
  };
}

export function buildFinalCue(input: {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
  words: TranscriptWord[];
  language?: string;
  speakerId?: string;
  receivedAt: number;
  finalizedAt: number;
  config: LiveCaptionConfig;
}): TranscriptCue {
  const base = buildPartialCue({
    ...input,
    config: input.config,
  });
  return {
    ...base,
    kind: "final",
    finalizedAt: input.finalizedAt,
  };
}

// ---------- STREAM -----------------------------------------------------

export interface IngestResult {
  cues: TranscriptCue[];
  dropped: number;       // partials older than partialMaxAgeMs
  promotedToFinal: number;
}

export function ingestPartial(
  cues: TranscriptCue[],
  partial: TranscriptCue,
  now: number,
  config: LiveCaptionConfig = DEFAULT_LIVE_CAPTION_CONFIG
): IngestResult {
  if (partial.kind !== "partial") {
    return { cues, dropped: 0, promotedToFinal: 0 };
  }
  const age = now - partial.receivedAt;
  if (age > config.partialMaxAgeMs) {
    return { cues, dropped: 1, promotedToFinal: 0 };
  }
  // replace existing partial with same id, or append
  const idx = cues.findIndex((c) => c.id === partial.id);
  const next = idx >= 0 ? [...cues] : [...cues, partial];
  if (idx >= 0) next[idx] = partial;
  return { cues: next, dropped: 0, promotedToFinal: 0 };
}

export function ingestFinal(
  cues: TranscriptCue[],
  finalCue: TranscriptCue,
  now: number,
  config: LiveCaptionConfig = DEFAULT_LIVE_CAPTION_CONFIG
): IngestResult {
  if (finalCue.kind !== "final") {
    return { cues, dropped: 0, promotedToFinal: 0 };
  }
  // Drop any partial with same id, append final
  const filtered = cues.filter((c) => c.id !== finalCue.id);
  // Also drop partials older than partialMaxAgeMs
  const cutoff = now - config.partialMaxAgeMs;
  const fresh = filtered.filter(
    (c) => c.kind === "final" || c.receivedAt >= cutoff
  );
  const dropped = filtered.length - fresh.length;
  fresh.push(finalCue);
  fresh.sort((a, b) => a.startMs - b.startMs);
  return { cues: fresh, dropped, promotedToFinal: 1 };
}

// ---------- ROLLING CAPTION BUFFER -------------------------------------

export function rollingCaption(
  cues: TranscriptCue[],
  config: LiveCaptionConfig = DEFAULT_LIVE_CAPTION_CONFIG
): TranscriptCue[] {
  return cues
    .filter((c) => c.kind === "final")
    .slice(-config.rollingWindowSize);
}

export function formatRollingText(
  cues: TranscriptCue[],
  config: LiveCaptionConfig = DEFAULT_LIVE_CAPTION_CONFIG
): string {
  return rollingCaption(cues, config)
    .map((c) => (c.speakerId ? `[${c.speakerId}] ${c.text}` : c.text))
    .join(" ");
}

// ---------- VTT EXPORT -------------------------------------------------

export function formatVttTimestamp(ms: number): string {
  const total = Math.max(0, Math.floor(ms));
  const h = Math.floor(total / 3_600_000);
  const m = Math.floor((total % 3_600_000) / 60_000);
  const s = Math.floor((total % 60_000) / 1000);
  const milli = total % 1000;
  const pad = (n: number, w: number) => String(n).padStart(w, "0");
  return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(milli, 3)}`;
}

export function exportVtt(
  cues: TranscriptCue[],
  generatedAt: number = Date.now()
): TranscriptExport {
  const finals = cues.filter((c) => c.kind === "final");
  const lang = finals[0]?.language ?? DEFAULT_LIVE_CAPTION_CONFIG.language;
  const lines: string[] = ["WEBVTT", `Language: ${lang}`, ""];
  for (const c of finals) {
    lines.push(String(c.id));
    lines.push(
      `${formatVttTimestamp(c.startMs)} --> ${formatVttTimestamp(c.endMs)}`
    );
    if (c.speakerId) lines.push(`<v ${c.speakerId}>${c.text}</v>`);
    else lines.push(c.text);
    lines.push("");
  }
  return {
    vtt: lines.join("\n"),
    cueCount: finals.length,
    language: lang,
    generatedAt,
  };
}

// ---------- LATENCY + LOW-CONFIDENCE -----------------------------------

export function slowCues(
  cues: TranscriptCue[],
  config: LiveCaptionConfig = DEFAULT_LIVE_CAPTION_CONFIG
): TranscriptCue[] {
  return cues.filter((c) => {
    const lat = cueLatencyMs(c);
    return c.kind === "final" && lat !== null && lat > config.maxLatencyMs;
  });
}

export function countLowConfidenceWords(
  cues: TranscriptCue[],
  config: LiveCaptionConfig = DEFAULT_LIVE_CAPTION_CONFIG
): number {
  let count = 0;
  for (const c of cues) {
    for (const w of c.words) {
      if (isLowConfidence(w, config)) count += 1;
    }
  }
  return count;
}

// ---------- SUMMARY -----------------------------------------------------

export function summarizeTranscript(
  cues: TranscriptCue[],
  config: LiveCaptionConfig = DEFAULT_LIVE_CAPTION_CONFIG
): TranscriptSummary {
  let finalCues = 0;
  let partialCues = 0;
  let totalLatency = 0;
  let latencySamples = 0;
  let totalDuration = 0;
  let lowConf = 0;
  const speakers = new Set<string>();
  for (const c of cues) {
    if (c.kind === "final") {
      finalCues += 1;
      const lat = cueLatencyMs(c);
      if (lat !== null) {
        totalLatency += lat;
        latencySamples += 1;
      }
    } else {
      partialCues += 1;
    }
    totalDuration += cueDurationMs(c);
    for (const w of c.words) {
      if (isLowConfidence(w, config)) lowConf += 1;
    }
    if (c.speakerId) speakers.add(c.speakerId);
  }
  return {
    totalCues: cues.length,
    finalCues,
    partialCues,
    averageLatencyMs: latencySamples > 0 ? Math.round(totalLatency / latencySamples) : null,
    lowConfidenceWordCount: lowConf,
    totalDurationMs: totalDuration,
    uniqueSpeakers: speakers.size,
  };
}

// ---------- INTERNAL ---------------------------------------------------

export function isValidCueWindow(startMs: number, endMs: number): boolean {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return false;
  if (endMs <= startMs) return false;
  return endMs - startMs <= MAX_CUE_DURATION_MS;
}
