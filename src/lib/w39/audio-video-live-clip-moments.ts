// src/lib/w39/audio-video-live-clip-moments.ts
// Cycle 39 worker — Audio/Video Live Clip Moments.
// Auto-detect "clippable" moments in live recordings (laughter, applause,
// peak attention, emotional peaks, key insights, calls-to-action, vocal
// peaks) for short-clip shortlisting. Type-only deps on w33/w35/w38.
// Defensive: every helper returns a safe default on null / malformed input.

export type MomentType =
  | "laughter" | "applause" | "peak-attention" | "emotional-peak"
  | "key-insight" | "call-to-action" | "vocal-peak";

export const ALL_MOMENT_TYPES: readonly MomentType[] = [
  "laughter", "applause", "peak-attention", "emotional-peak",
  "key-insight", "call-to-action", "vocal-peak",
] as const;

export interface AudioSignal {
  readonly timestampMs: number;
  readonly levelDb: number;
  readonly peakDb: number;
  readonly isSpeech: boolean;
  readonly isLaughter: boolean;
  readonly isApplause: boolean;
}

export interface AttentionSignal {
  readonly timestampMs: number;
  readonly attentionScore: number;   // 0..1
  readonly viewerCount: number;
  readonly dropOffRate: number;     // viewers/sec — may be negative
}

export interface TranscriptCue {
  readonly startMs: number;
  readonly endMs: number;
  readonly text: string;
  readonly isEmotional: boolean;
  readonly hasInsight: boolean;
  readonly hasCallToAction: boolean;
}

export interface MomentDetector {
  readonly type: MomentType;
  readonly weight: number;
  readonly threshold: number;
  readonly minDurationMs: number;
  readonly maxDurationMs: number;
}

export interface DetectedMoment {
  readonly type: MomentType;
  readonly startMs: number;
  readonly endMs: number;
  readonly confidence: number;
  readonly audioLevelDb: number;
  readonly transcriptSnippet: string;
  readonly score: number;
}

export interface ClipCandidate {
  readonly moments: DetectedMoment[];
  readonly combinedScore: number;
  readonly startMs: number;
  readonly endMs: number;
  readonly suggestedTitle: string;
  readonly tags: MomentType[];
}

// ---------- CONSTANTS -------------------------------------------------
export const DEFAULT_MOMENT_DETECTORS: Readonly<Record<MomentType, MomentDetector>> = {
  "laughter":       { type: "laughter",       weight: 0.8,  threshold: 0.55, minDurationMs: 800,   maxDurationMs: 8000  },
  "applause":       { type: "applause",       weight: 0.7,  threshold: 0.5,  minDurationMs: 1500,  maxDurationMs: 12000 },
  "peak-attention": { type: "peak-attention", weight: 1.0,  threshold: 0.7,  minDurationMs: 5000,  maxDurationMs: 60000 },
  "emotional-peak": { type: "emotional-peak", weight: 0.9,  threshold: 0.5,  minDurationMs: 2000,  maxDurationMs: 30000 },
  "key-insight":    { type: "key-insight",    weight: 1.0,  threshold: 0.6,  minDurationMs: 3000,  maxDurationMs: 45000 },
  "call-to-action": { type: "call-to-action", weight: 0.95, threshold: 0.65, minDurationMs: 2000,  maxDurationMs: 30000 },
  "vocal-peak":     { type: "vocal-peak",     weight: 0.6,  threshold: 0.6,  minDurationMs: 500,   maxDurationMs: 6000  },
};

export const MIN_DB = -120, MAX_DB = 0;
export const SPEECH_DB_FLOOR = -50, APPLAUSE_DB_FLOOR = -25, LAUGHTER_DB_FLOOR = -35;
export const DEFAULT_MERGE_WINDOW_MS = 8000, DEFAULT_TARGET_CLIP_MS = 30000;
export const DEFAULT_MIN_CLIP_MS = 5000, DEFAULT_MAX_CLIP_MS = 90000;
export const DEFAULT_MAX_SNIPPET_CHARS = 140;

export const EMOTIONAL_TERMS: readonly string[] = [
  "love","amazing","incredible","beautiful","heart","soul","feel","feeling",
  "tears","wow","vulnerable","dream","hope","fear","passion","grateful",
  "amo","lindo","incrível","coração","alma","sonho","paixão",
];
export const INSIGHT_TERMS: readonly string[] = [
  "key insight","the truth","remember this","important","the lesson",
  "realize","the secret","takeaway","principle","pattern",
  "o segredo","a verdade","lição","aprendizado","princípio",
];
export const CTA_TERMS: readonly string[] = [
  "subscribe","sign up","join","click","register","download","follow",
  "share","comment","visit","buy","get started",
  "inscreva-se","cadastre-se","participe","comente","compartilhe","compre",
];

export const MOMENT_TITLES: Readonly<Record<MomentType, string>> = {
  "laughter": "Risos", "applause": "Aplausos", "peak-attention": "Pico de atenção",
  "emotional-peak": "Momento emocional", "key-insight": "Insight-chave",
  "call-to-action": "Chamada para ação", "vocal-peak": "Pico vocal",
};

const VIRAL_TAGS: readonly MomentType[] = [
  "emotional-peak", "key-insight", "peak-attention", "laughter",
];
const VIRAL_REQUIRE_TAGS: readonly MomentType[] = ["emotional-peak", "key-insight"];

// ---------- HELPERS ---------------------------------------------------
export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export function clampDb(n: number): number {
  if (!Number.isFinite(n)) return MIN_DB;
  if (n < MIN_DB) return MIN_DB;
  if (n > MAX_DB) return MAX_DB;
  return n;
}
export function truncate(s: string, maxChars: number): string {
  if (maxChars <= 0 || s.length <= maxChars) return maxChars <= 0 ? "" : s;
  return s.slice(0, Math.max(0, maxChars - 1)).trimEnd() + "…";
}
export function termsMatchText(text: string, terms: readonly string[]): boolean {
  const haystack = String(text ?? "").toLowerCase();
  if (haystack.length === 0) return false;
  for (const term of terms) {
    const t = String(term).toLowerCase();
    if (t.length > 0 && haystack.includes(t)) return true;
  }
  return false;
}

export function cuesForRange(cues: ReadonlyArray<TranscriptCue>, startMs: number, endMs: number): TranscriptCue[] {
  return cues.filter((c) => c.endMs > startMs && c.startMs < endMs);
}
export function buildCueSnippet(cues: ReadonlyArray<TranscriptCue>, startMs: number, endMs: number, maxChars: number = DEFAULT_MAX_SNIPPET_CHARS): string {
  const joined = cuesForRange(cues, startMs, endMs).map((c) => c.text.trim()).filter((t) => t.length > 0).join(" ");
  return truncate(joined, maxChars);
}

// Collect contiguous runs where predicate(ts, item) holds.
function collectRuns<T>(
  items: ReadonlyArray<T>,
  getStartMs: (t: T) => number,
  getEndMs: (t: T) => number,
  predicate: (t: T) => boolean,
  trackPeak: ((t: T) => number) | null,
): { startMs: number; endMs: number; peak: number; count: number }[] {
  const runs: { startMs: number; endMs: number; peak: number; count: number }[] = [];
  let start: number | null = null;
  let end = 0;
  let peak = 0;
  let count = 0;
  for (const it of items) {
    if (predicate(it)) {
      if (start === null) start = getStartMs(it);
      end = getEndMs(it);
      if (trackPeak) {
        const v = trackPeak(it);
        if (v > peak) peak = v;
      }
      count += 1;
    } else if (start !== null) {
      runs.push({ startMs: start, endMs: end, peak, count });
      start = null; end = 0; peak = 0; count = 0;
    }
  }
  if (start !== null) runs.push({ startMs: start, endMs: end, peak, count });
  return runs;
}

// ---------- AUDIO SIGNAL DETECTION -----------------------------------
export interface AudioDetectionConfig {
  readonly speechDbFloor: number;
  readonly laughterDbFloor: number;
  readonly applauseDbFloor: number;
}

export const DEFAULT_AUDIO_DETECTION_CONFIG: AudioDetectionConfig = {
  speechDbFloor: SPEECH_DB_FLOOR,
  laughterDbFloor: LAUGHTER_DB_FLOOR,
  applauseDbFloor: APPLAUSE_DB_FLOOR,
};

export function audioSignalFromFrame(
  timestampMs: number,
  levelDb: number,
  peakDb: number,
  config: AudioDetectionConfig = DEFAULT_AUDIO_DETECTION_CONFIG,
): AudioSignal {
  const safeTs = Number.isFinite(timestampMs) && timestampMs >= 0 ? timestampMs : 0;
  const lvl = clampDb(levelDb);
  const peak = clampDb(peakDb);
  return {
    timestampMs: safeTs,
    levelDb: lvl,
    peakDb: peak,
    isSpeech: lvl >= config.speechDbFloor && peak < config.applauseDbFloor,
    isLaughter: lvl >= config.laughterDbFloor && peak - lvl >= 4 && peak < config.applauseDbFloor,
    isApplause: lvl >= config.applauseDbFloor && peak - lvl < 6,
  };
}

function audioFlagMoments(
  signals: ReadonlyArray<AudioSignal>,
  flag: "isLaughter" | "isApplause",
  detector: MomentDetector,
  densityDivisor: number,
): DetectedMoment[] {
  if (signals.length === 0) return [];
  const runs = collectRuns(signals, (s) => s.timestampMs, (s) => s.timestampMs, (s) => s[flag], (s) => s.peakDb);
  const out: DetectedMoment[] = [];
  for (const r of runs) {
    const dur = r.endMs - r.startMs;
    if (dur < detector.minDurationMs || dur > detector.maxDurationMs) continue;
    const confidence = clamp01(r.count / Math.max(1, dur / densityDivisor));
    if (confidence < detector.threshold) continue;
    out.push({
      type: detector.type, startMs: r.startMs, endMs: r.endMs,
      confidence, audioLevelDb: r.peak, transcriptSnippet: "",
      score: clamp01(confidence * detector.weight),
    });
  }
  return out;
}

export function detectLaughterRuns(
  signals: ReadonlyArray<AudioSignal>,
  detector: MomentDetector = DEFAULT_MOMENT_DETECTORS["laughter"],
): DetectedMoment[] {
  return audioFlagMoments(signals, "isLaughter", detector, 200);
}

export function detectApplauseRuns(
  signals: ReadonlyArray<AudioSignal>,
  detector: MomentDetector = DEFAULT_MOMENT_DETECTORS["applause"],
): DetectedMoment[] {
  return audioFlagMoments(signals, "isApplause", detector, 250);
}

export function detectVocalPeaks(
  signals: ReadonlyArray<AudioSignal>,
  detector: MomentDetector = DEFAULT_MOMENT_DETECTORS["vocal-peak"],
): DetectedMoment[] {
  if (signals.length < 3) return [];
  const out: DetectedMoment[] = [];
  for (let i = 0; i < signals.length; i++) {
    const sig = signals[i];
    const lo = Math.max(0, i - 3);
    const hi = Math.min(signals.length, i + 4);
    let avg = 0;
    let n = 0;
    for (let j = lo; j < hi; j++) {
      if (j === i) continue;
      avg += signals[j].levelDb;
      n += 1;
    }
    const avgLvl = n > 0 ? avg / n : MIN_DB;
    const boost = sig.peakDb - avgLvl;
    if (boost < 10) continue;
    const confidence = clamp01(boost / 20);
    if (confidence < detector.threshold) continue;
    const startMs = sig.timestampMs - 250;
    const endMs = sig.timestampMs + 750;
    const dur = endMs - startMs;
    if (dur < detector.minDurationMs || dur > detector.maxDurationMs) continue;
    out.push({
      type: "vocal-peak", startMs, endMs, confidence,
      audioLevelDb: sig.peakDb, transcriptSnippet: "",
      score: clamp01(confidence * detector.weight),
    });
  }
  return mergeOverlappingMoments(out, "vocal-peak");
}

// ---------- ATTENTION SIGNAL DETECTION --------------------------------
export function attentionSpikeScore(sig: AttentionSignal, baseline: number): number {
  if (!Number.isFinite(sig.attentionScore) || !Number.isFinite(baseline)) return 0;
  const base = Math.max(0.05, baseline);
  const ratio = sig.attentionScore / base;
  const dropPenalty = clamp01(1 - Math.abs(sig.dropOffRate) / 5);
  return clamp01(ratio * dropPenalty);
}

export function detectAttentionPeaks(
  signals: ReadonlyArray<AttentionSignal>,
  detector: MomentDetector = DEFAULT_MOMENT_DETECTORS["peak-attention"],
): DetectedMoment[] {
  if (signals.length === 0) return [];
  const sortedScores = [...signals].map((s) => s.attentionScore).sort((a, b) => a - b);
  const baseline = sortedScores[Math.floor(sortedScores.length / 2)] ?? 0;
  // For attention, we need per-run viewer sums as well as the score.
  const runs: { startMs: number; endMs: number; peak: number; viewers: number }[] = [];
  let start: number | null = null;
  let end = 0;
  let peak = 0;
  let viewers = 0;
  for (const sig of signals) {
    const score = attentionSpikeScore(sig, baseline);
    if (score >= detector.threshold) {
      if (start === null) start = sig.timestampMs;
      end = sig.timestampMs;
      if (score > peak) peak = score;
      viewers += Number.isFinite(sig.viewerCount) && sig.viewerCount > 0 ? sig.viewerCount : 0;
    } else if (start !== null) {
      runs.push({ startMs: start, endMs: end, peak, viewers });
      start = null; end = 0; peak = 0; viewers = 0;
    }
  }
  if (start !== null) runs.push({ startMs: start, endMs: end, peak, viewers });
  const out: DetectedMoment[] = [];
  for (const r of runs) {
    const dur = r.endMs - r.startMs;
    if (dur < detector.minDurationMs || dur > detector.maxDurationMs) continue;
    const confidence = clamp01(r.peak);
    out.push({
      type: "peak-attention", startMs: r.startMs, endMs: r.endMs,
      confidence, audioLevelDb: MIN_DB, transcriptSnippet: "",
      score: clamp01(confidence * detector.weight + Math.log10(r.viewers + 1) / 10),
    });
  }
  return out;
}

// ---------- TRANSCRIPT DETECTION --------------------------------------
export function tagCues(cues: ReadonlyArray<TranscriptCue>): TranscriptCue[] {
  return cues.map((c) => ({
    ...c,
    isEmotional: c.isEmotional || termsMatchText(c.text, EMOTIONAL_TERMS),
    hasInsight: c.hasInsight || termsMatchText(c.text, INSIGHT_TERMS),
    hasCallToAction: c.hasCallToAction || termsMatchText(c.text, CTA_TERMS),
  }));
}

function transcriptRunMoments(
  cues: ReadonlyArray<TranscriptCue>,
  predicate: (c: TranscriptCue) => boolean,
  type: MomentType,
  detector: MomentDetector,
  densityDivisor: number,
): DetectedMoment[] {
  const runs = collectRuns(cues, (c) => c.startMs, (c) => c.endMs, predicate, null);
  const out: DetectedMoment[] = [];
  for (const r of runs) {
    const dur = r.endMs - r.startMs;
    if (dur < detector.minDurationMs || dur > detector.maxDurationMs) continue;
    const confidence = clamp01(r.count / Math.max(1, dur / densityDivisor));
    if (confidence < detector.threshold) continue;
    out.push({
      type, startMs: r.startMs, endMs: r.endMs, confidence,
      audioLevelDb: MIN_DB, transcriptSnippet: buildCueSnippet(cues, r.startMs, r.endMs),
      score: clamp01(confidence * detector.weight),
    });
  }
  return out;
}

export function detectEmotionalPeaks(
  cues: ReadonlyArray<TranscriptCue>,
  detector: MomentDetector = DEFAULT_MOMENT_DETECTORS["emotional-peak"],
): DetectedMoment[] {
  return transcriptRunMoments(cues, (c) => c.isEmotional, "emotional-peak", detector, 5000);
}
export function detectKeyInsights(
  cues: ReadonlyArray<TranscriptCue>,
  detector: MomentDetector = DEFAULT_MOMENT_DETECTORS["key-insight"],
): DetectedMoment[] {
  const out: DetectedMoment[] = [];
  for (const c of cues) {
    if (!c.hasInsight) continue;
    if (c.endMs - c.startMs < detector.minDurationMs) continue;
    const confidence = 0.85;
    if (confidence < detector.threshold) continue;
    out.push({
      type: "key-insight", startMs: c.startMs, endMs: c.endMs, confidence,
      audioLevelDb: MIN_DB, transcriptSnippet: truncate(c.text, DEFAULT_MAX_SNIPPET_CHARS),
      score: clamp01(confidence * detector.weight),
    });
  }
  return out;
}
export function detectCallToActions(
  cues: ReadonlyArray<TranscriptCue>,
  detector: MomentDetector = DEFAULT_MOMENT_DETECTORS["call-to-action"],
): DetectedMoment[] {
  return transcriptRunMoments(cues, (c) => c.hasCallToAction, "call-to-action", detector, 4000);
}

// ---------- DETECT ALL + MERGE ---------------------------------------
function mergeOverlappingMoments(
  moments: DetectedMoment[],
  type: MomentType,
): DetectedMoment[] {
  const filtered = moments.filter((m) => m.type === type).sort((a, b) => a.startMs - b.startMs);
  if (filtered.length === 0) return [];
  const out: DetectedMoment[] = [];
  let cur = filtered[0];
  for (let i = 1; i < filtered.length; i++) {
    const next = filtered[i];
    if (next.startMs <= cur.endMs) {
      cur = {
        ...cur,
        endMs: Math.max(cur.endMs, next.endMs),
        score: Math.max(cur.score, next.score),
        confidence: Math.max(cur.confidence, next.confidence),
        audioLevelDb: Math.max(cur.audioLevelDb, next.audioLevelDb),
      };
    } else {
      out.push(cur);
      cur = next;
    }
  }
  out.push(cur);
  return out;
}

export interface MomentDetectionInput {
  readonly audio: ReadonlyArray<AudioSignal>;
  readonly attention: ReadonlyArray<AttentionSignal>;
  readonly transcript: ReadonlyArray<TranscriptCue>;
  readonly detectors?: Partial<Record<MomentType, MomentDetector>>;
}

function detectorFor(
  type: MomentType,
  overrides: Partial<Record<MomentType, MomentDetector>> | undefined,
): MomentDetector {
  return overrides?.[type] ?? DEFAULT_MOMENT_DETECTORS[type];
}

export function detectMoments(input: MomentDetectionInput): DetectedMoment[] {
  const audio = Array.isArray(input.audio) ? input.audio : [];
  const attention = Array.isArray(input.attention) ? input.attention : [];
  const transcript = Array.isArray(input.transcript) ? input.transcript : [];
  const tagged = tagCues(transcript);
  const out: DetectedMoment[] = [
    ...detectLaughterRuns(audio, detectorFor("laughter", input.detectors)),
    ...detectApplauseRuns(audio, detectorFor("applause", input.detectors)),
    ...detectVocalPeaks(audio, detectorFor("vocal-peak", input.detectors)),
    ...detectAttentionPeaks(attention, detectorFor("peak-attention", input.detectors)),
    ...detectEmotionalPeaks(tagged, detectorFor("emotional-peak", input.detectors)),
    ...detectKeyInsights(tagged, detectorFor("key-insight", input.detectors)),
    ...detectCallToActions(tagged, detectorFor("call-to-action", input.detectors)),
  ];
  return out.map((m) =>
    m.transcriptSnippet.length > 0
      ? m
      : { ...m, transcriptSnippet: buildCueSnippet(tagged, m.startMs, m.endMs) },
  );
}

// ---------- CLIP CANDIDATES -------------------------------------------
export interface ClipBuildOptions {
  readonly mergeWindowMs: number;
  readonly targetDurationMs: number;
  readonly minDurationMs: number;
  readonly maxDurationMs: number;
}

export const DEFAULT_CLIP_BUILD_OPTIONS: ClipBuildOptions = {
  mergeWindowMs: DEFAULT_MERGE_WINDOW_MS,
  targetDurationMs: DEFAULT_TARGET_CLIP_MS,
  minDurationMs: DEFAULT_MIN_CLIP_MS,
  maxDurationMs: DEFAULT_MAX_CLIP_MS,
};

function buildSuggestedTitle(tags: MomentType[]): string {
  if (tags.length === 0) return "Momento";
  const base = MOMENT_TITLES[tags[0]];
  return tags.length === 1 ? base : `${base} + ${tags.length - 1}`;
}

export function buildClipCandidates(
  moments: ReadonlyArray<DetectedMoment>,
  opts: ClipBuildOptions = DEFAULT_CLIP_BUILD_OPTIONS,
): ClipCandidate[] {
  if (moments.length === 0) return [];
  const sorted = [...moments].sort((a, b) => a.startMs - b.startMs);
  const groups: DetectedMoment[][] = [[sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    const m = sorted[i];
    const last = groups[groups.length - 1][groups[groups.length - 1].length - 1];
    if (m.startMs - last.endMs <= opts.mergeWindowMs) groups[groups.length - 1].push(m);
    else groups.push([m]);
  }
  const out: ClipCandidate[] = [];
  for (const group of groups) {
    const startMs = group[0].startMs;
    const endMs = group[group.length - 1].endMs;
    const naturalDur = endMs - startMs;
    const paddedDur = Math.min(
      opts.maxDurationMs,
      Math.max(opts.minDurationMs, Math.max(naturalDur, opts.targetDurationMs)),
    );
    const clipStart = Math.max(0, startMs - Math.max(0, (paddedDur - naturalDur) / 2));
    const tags = Array.from(new Set(group.map((m) => m.type))) as MomentType[];
    const totalScore = group.reduce((s, m) => s + m.score, 0);
    const combinedScore = clamp01(totalScore / Math.max(1, tags.length));
    out.push({
      moments: group, combinedScore,
      startMs: clipStart, endMs: clipStart + paddedDur,
      suggestedTitle: buildSuggestedTitle(tags), tags,
    });
  }
  return out;
}

// ---------- RANK + SUMMARIZE -----------------------------------------
export interface RankOptions {
  readonly minCombinedScore: number;
  readonly preferredTags: MomentType[];
  readonly preferDiversity: boolean;
}

export const DEFAULT_RANK_OPTIONS: RankOptions = {
  minCombinedScore: 0.1, preferredTags: [], preferDiversity: true,
};

export function rankClips(
  candidates: ReadonlyArray<ClipCandidate>,
  opts: RankOptions = DEFAULT_RANK_OPTIONS,
): ClipCandidate[] {
  if (candidates.length === 0) return [];
  const boostFor = new Set<MomentType>(opts.preferredTags);
  const scored = candidates.map((c) => {
    const boost = c.tags.some((t) => boostFor.has(t)) ? 0.1 : 0;
    return { c, adjusted: clamp01(c.combinedScore + boost) };
  });
  const filtered = scored.filter((s) => s.adjusted >= opts.minCombinedScore);
  filtered.sort((a, b) => b.adjusted - a.adjusted);
  if (!opts.preferDiversity) return filtered.map((s) => s.c);
  const used: ClipCandidate[] = [];
  const usedKeys = new Set<string>();
  for (const f of filtered) {
    const key = [...f.c.tags].sort().join("|");
    if (usedKeys.has(key)) continue;
    used.push(f.c);
    usedKeys.add(key);
  }
  for (const f of filtered) if (used.length < filtered.length && !used.includes(f.c)) used.push(f.c);
  return used;
}

export function summarizeMoments(moments: ReadonlyArray<DetectedMoment>): Readonly<Record<MomentType, number>> {
  const out: Record<MomentType, number> = { "laughter": 0, "applause": 0, "peak-attention": 0, "emotional-peak": 0, "key-insight": 0, "call-to-action": 0, "vocal-peak": 0 };
  for (const m of moments) out[m.type] += 1;
  return out;
}

export function summarizeCandidates(candidates: ReadonlyArray<ClipCandidate>): string {
  if (candidates.length === 0) return "candidates: none";
  const totalDur = candidates.reduce((s, c) => s + Math.max(0, c.endMs - c.startMs), 0);
  const avgScore = candidates.reduce((s, c) => s + c.combinedScore, 0) / candidates.length;
  const histogram = summarizeMoments(candidates.flatMap((c) => c.moments));
  const tagStr = ALL_MOMENT_TYPES.map((t) => `${t}=${histogram[t]}`).join(" ");
  return `candidates: n=${candidates.length} | total=${(totalDur / 1000).toFixed(0)}s | avg_score=${avgScore.toFixed(2)} | ${tagStr}`;
}

// ---------- VIRAL EXTRACTION ------------------------------------------
export interface ViralOptions {
  readonly minDurationMs: number;
  readonly maxDurationMs: number;
  readonly requireInsightOrEmotion: boolean;
}

export const DEFAULT_VIRAL_OPTIONS: ViralOptions = {
  minDurationMs: 8000, maxDurationMs: 60000, requireInsightOrEmotion: true,
};

export function extractViralSnippets(
  candidates: ReadonlyArray<ClipCandidate>,
  n: number,
  opts: ViralOptions = DEFAULT_VIRAL_OPTIONS,
): ClipCandidate[] {
  if (n <= 0 || candidates.length === 0) return [];
  const requireTags = new Set<MomentType>(opts.requireInsightOrEmotion ? VIRAL_REQUIRE_TAGS : []);
  const filtered = candidates.filter((c) => {
    const dur = c.endMs - c.startMs;
    if (dur < opts.minDurationMs || dur > opts.maxDurationMs) return false;
    if (opts.requireInsightOrEmotion && !c.tags.some((t) => requireTags.has(t))) return false;
    return c.combinedScore >= 0.3;
  });
  const ranked = [...filtered].sort((a, b) => {
    const aHas = a.tags.some((t) => VIRAL_TAGS.includes(t)) ? 1 : 0;
    const bHas = b.tags.some((t) => VIRAL_TAGS.includes(t)) ? 1 : 0;
    if (aHas !== bHas) return bHas - aHas;
    return b.combinedScore - a.combinedScore;
  });
  return ranked.slice(0, n);
}

// ---------- DURATION HELPERS -----------------------------------------
export const momentDurationMs = (m: DetectedMoment): number => Math.max(0, m.endMs - m.startMs);
export const clipDurationMs = (c: ClipCandidate): number => Math.max(0, c.endMs - c.startMs);
export const totalMomentDurationMs = (moments: ReadonlyArray<DetectedMoment>): number =>
  moments.reduce((s, m) => s + momentDurationMs(m), 0);