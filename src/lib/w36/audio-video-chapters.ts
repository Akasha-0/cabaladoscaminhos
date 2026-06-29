/**
 * w36/audio-video-chapters.ts
 *
 * Chapter marker extraction and generation from VTT cues.
 * Allows users to navigate audio/video recordings by semantic chapters,
 * auto-detected from transcript cues (e.g. topic shifts, speaker changes,
 * long pauses, explicit chapter markers).
 *
 * Composes:
 *   - w33/audio-video-recording (recorder state, VTT builder/parser)
 *   - w35/audio-video-live-transcription (rolling captions, cues)
 *   - w32/livestream-recording (recorded stream VTT)
 *
 * Pure TS, no runtime imports.
 */

// ============================================================================
// TYPES
// ============================================================================

export type ChapterDetectionStrategy =
  | "explicit-marker" // [CHAPTER 1] tokens
  | "topic-shift" // cosine sim of cue embeddings
  | "speaker-change" // different speaker detected
  | "long-pause" // gap > threshold between cues
  | "duration-based" // split every N minutes
  | "hybrid";

export type VTTCue = {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
  speaker: string | null;
  confidence: number; // 0-1
};

export type Chapter = {
  id: string;
  index: number; // 0-based
  title: string;
  startMs: number;
  endMs: number;
  startCueId: string;
  endCueId: string;
  strategy: ChapterDetectionStrategy;
  confidence: number; // 0-1
  cueCount: number;
  wordCount: number;
  topicLabel: string | null;
};

export type ChapterConfig = {
  strategy: ChapterDetectionStrategy;
  targetChapterMinutes: number; // target chapter length (default 5)
  minChapterMinutes: number; // avoid tiny chapters (default 1)
  longPauseMs: number; // gap threshold (default 2000)
  explicitMarkerPattern: RegExp;
  topicShiftThreshold: number; // 0-1 (default 0.6)
  speakerChangeTriggers: boolean;
  maxChapters: number; // safety cap (default 50)
};

export type ChapterList = {
  totalDurationMs: number;
  cueCount: number;
  chapters: Chapter[];
  strategy: ChapterDetectionStrategy;
  generatedAt: number;
};

export type ChapterSummary = {
  totalChapters: number;
  averageLengthMinutes: number;
  longestChapterMinutes: number;
  shortestChapterMinutes: number;
  strategyBreakdown: Record<ChapterDetectionStrategy, number>;
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_CHAPTER_CONFIG: ChapterConfig = {
  strategy: "hybrid",
  targetChapterMinutes: 5,
  minChapterMinutes: 1,
  longPauseMs: 2000,
  explicitMarkerPattern: /\[CHAPTER\s+(\d+)[:\s-]+(.+?)\]/i,
  topicShiftThreshold: 0.6,
  speakerChangeTriggers: true,
  maxChapters: 50,
};

export const STRATEGY_LABELS: Record<ChapterDetectionStrategy, string> = {
  "explicit-marker": "Marcador explícito",
  "topic-shift": "Mudança de tópico",
  "speaker-change": "Troca de falante",
  "long-pause": "Pausa longa",
  "duration-based": "Por duração",
  hybrid: "Híbrido",
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Parse a [CHAPTER N: Title] marker from cue text.
 */
export function parseExplicitMarker(
  text: string,
  pattern: RegExp = DEFAULT_CHAPTER_CONFIG.explicitMarkerPattern,
): { index: number; title: string } | null {
  const match = text.match(pattern);
  if (!match) return null;
  return {
    index: parseInt(match[1], 10) || 0,
    title: match[2].trim(),
  };
}

/**
 * Detect explicit chapter markers in a cue list.
 */
export function detectExplicitChapters(
  cues: VTTCue[],
  pattern: RegExp = DEFAULT_CHAPTER_CONFIG.explicitMarkerPattern,
): Chapter[] {
  const chapters: Chapter[] = [];
  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];
    const marker = parseExplicitMarker(cue.text, pattern);
    if (marker === null) continue;
    // End at next marker or end of stream
    const endCue = cues[i + 1] ?? cue;
    const wordCount = countWordsInRange(cues, i, i + 1);
    chapters.push({
      id: `ch-explicit-${marker.index}-${cue.id}`,
      index: marker.index - 1,
      title: marker.title,
      startMs: cue.startMs,
      endMs: endCue.startMs,
      startCueId: cue.id,
      endCueId: endCue.id,
      strategy: "explicit-marker",
      confidence: 1.0,
      cueCount: i + 1 - i,
      wordCount,
      topicLabel: null,
    });
  }
  return chapters;
}

/**
 * Detect chapter boundaries based on long pauses between cues.
 */
export function detectLongPauseChapters(
  cues: VTTCue[],
  thresholdMs: number = DEFAULT_CHAPTER_CONFIG.longPauseMs,
  minChapterMs: number = DEFAULT_CHAPTER_CONFIG.minChapterMinutes * 60 * 1000,
): Chapter[] {
  if (cues.length === 0) return [];
  const chapters: Chapter[] = [];
  let chapterStartIdx = 0;
  let chapterIdx = 0;

  for (let i = 1; i < cues.length; i++) {
    const prev = cues[i - 1];
    const cur = cues[i];
    const gap = cur.startMs - prev.endMs;
    if (gap >= thresholdMs) {
      const startCue = cues[chapterStartIdx];
      const endCue = prev;
      const duration = endCue.endMs - startCue.startMs;
      if (duration >= minChapterMs) {
        chapters.push({
          id: `ch-pause-${chapterIdx}-${startCue.id}`,
          index: chapterIdx,
          title: `Capítulo ${chapterIdx + 1}`,
          startMs: startCue.startMs,
          endMs: endCue.endMs,
          startCueId: startCue.id,
          endCueId: endCue.id,
          strategy: "long-pause",
          confidence: Math.min(1, gap / (thresholdMs * 3)),
          cueCount: i - chapterStartIdx,
          wordCount: countWordsInRange(cues, chapterStartIdx, i),
          topicLabel: null,
        });
        chapterIdx++;
      }
      chapterStartIdx = i;
    }
  }

  // tail chapter
  const tailStart = cues[chapterStartIdx];
  const tailEnd = cues[cues.length - 1];
  chapters.push({
    id: `ch-pause-${chapterIdx}-${tailStart.id}`,
    index: chapterIdx,
    title: `Capítulo ${chapterIdx + 1}`,
    startMs: tailStart.startMs,
    endMs: tailEnd.endMs,
    startCueId: tailStart.id,
    endCueId: tailEnd.id,
    strategy: "long-pause",
    confidence: 0.5,
    cueCount: cues.length - chapterStartIdx,
    wordCount: countWordsInRange(cues, chapterStartIdx, cues.length),
    topicLabel: null,
  });

  return chapters;
}

/**
 * Detect chapters by speaker changes.
 */
export function detectSpeakerChangeChapters(cues: VTTCue[]): Chapter[] {
  if (cues.length === 0) return [];
  const chapters: Chapter[] = [];
  let chapterStartIdx = 0;
  let chapterIdx = 0;
  let prevSpeaker: string | null = cues[0].speaker;

  for (let i = 1; i < cues.length; i++) {
    const cur = cues[i];
    if (cur.speaker !== null && cur.speaker !== prevSpeaker) {
      const startCue = cues[chapterStartIdx];
      const endCue = cues[i - 1];
      chapters.push({
        id: `ch-speaker-${chapterIdx}-${startCue.id}`,
        index: chapterIdx,
        title: prevSpeaker
          ? `${prevSpeaker} → ${cur.speaker}`
          : `Fala de ${cur.speaker}`,
        startMs: startCue.startMs,
        endMs: endCue.endMs,
        startCueId: startCue.id,
        endCueId: endCue.id,
        strategy: "speaker-change",
        confidence: 0.85,
        cueCount: i - chapterStartIdx,
        wordCount: countWordsInRange(cues, chapterStartIdx, i),
        topicLabel: null,
      });
      chapterIdx++;
      chapterStartIdx = i;
      prevSpeaker = cur.speaker;
    }
  }
  return chapters;
}

/**
 * Detect chapters by fixed duration.
 */
export function detectDurationChapters(
  cues: VTTCue[],
  targetMs: number = DEFAULT_CHAPTER_CONFIG.targetChapterMinutes * 60 * 1000,
  maxChapters: number = DEFAULT_CHAPTER_CONFIG.maxChapters,
): Chapter[] {
  if (cues.length === 0) return [];
  const chapters: Chapter[] = [];
  let chapterStartIdx = 0;
  let chapterIdx = 0;

  for (let i = 0; i < cues.length; i++) {
    const startCue = cues[chapterStartIdx];
    if (cues[i].endMs - startCue.startMs >= targetMs) {
      chapters.push({
        id: `ch-duration-${chapterIdx}-${startCue.id}`,
        index: chapterIdx,
        title: `Bloco ${chapterIdx + 1}`,
        startMs: startCue.startMs,
        endMs: cues[i].endMs,
        startCueId: startCue.id,
        endCueId: cues[i].id,
        strategy: "duration-based",
        confidence: 0.7,
        cueCount: i - chapterStartIdx + 1,
        wordCount: countWordsInRange(cues, chapterStartIdx, i + 1),
        topicLabel: null,
      });
      chapterIdx++;
      chapterStartIdx = i + 1;
      if (chapterIdx >= maxChapters) break;
    }
  }
  // tail
  if (chapterStartIdx < cues.length) {
    const startCue = cues[chapterStartIdx];
    const endCue = cues[cues.length - 1];
    chapters.push({
      id: `ch-duration-${chapterIdx}-${startCue.id}`,
      index: chapterIdx,
      title: `Bloco ${chapterIdx + 1}`,
      startMs: startCue.startMs,
      endMs: endCue.endMs,
      startCueId: startCue.id,
      endCueId: endCue.id,
      strategy: "duration-based",
      confidence: 0.7,
      cueCount: cues.length - chapterStartIdx,
      wordCount: countWordsInRange(cues, chapterStartIdx, cues.length),
      topicLabel: null,
    });
  }
  return chapters;
}

/**
 * Detect chapters using a hybrid of all strategies. Explicit markers win.
 */
export function detectHybridChapters(
  cues: VTTCue[],
  config: Partial<ChapterConfig> = {},
): Chapter[] {
  const cfg = { ...DEFAULT_CHAPTER_CONFIG, ...config };
  const explicit = detectExplicitChapters(cues, cfg.explicitMarkerPattern);
  if (explicit.length > 0) {
    return capChapters(renumberChapters(explicit), cfg.maxChapters);
  }
  if (cfg.speakerChangeTriggers) {
    const speaker = detectSpeakerChangeChapters(cues);
    if (speaker.length >= 2) {
      return capChapters(renumberChapters(speaker), cfg.maxChapters);
    }
  }
  const pause = detectLongPauseChapters(
    cues,
    cfg.longPauseMs,
    cfg.minChapterMinutes * 60 * 1000,
  );
  if (pause.length >= 2) {
    return capChapters(renumberChapters(pause), cfg.maxChapters);
  }
  return capChapters(
    renumberChapters(detectDurationChapters(cues, cfg.targetChapterMinutes * 60 * 1000, cfg.maxChapters)),
    cfg.maxChapters,
  );
}

/**
 * Renumber chapters to be 0-based sequential.
 */
export function renumberChapters(chapters: Chapter[]): Chapter[] {
  return chapters.map((c, i) => ({ ...c, index: i }));
}

/**
 * Cap chapters to a max number (drops tail chapters with lowest confidence).
 */
export function capChapters(chapters: Chapter[], max: number): Chapter[] {
  if (chapters.length <= max) return chapters;
  const sorted = [...chapters].sort((a, b) => b.confidence - a.confidence);
  const kept = sorted.slice(0, max);
  return renumberChapters(kept.sort((a, b) => a.startMs - b.startMs));
}

/**
 * Count words in a cue range.
 */
export function countWordsInRange(
  cues: VTTCue[],
  fromIdx: number,
  toIdx: number,
): number {
  let count = 0;
  for (let i = fromIdx; i < toIdx && i < cues.length; i++) {
    count += cues[i].text.split(/\s+/).filter(Boolean).length;
  }
  return count;
}

/**
 * Build a chapter list from a cue list with the chosen strategy.
 */
export function buildChapterList(
  cues: VTTCue[],
  config: Partial<ChapterConfig> = {},
  now: number = Date.now(),
): ChapterList {
  const cfg = { ...DEFAULT_CHAPTER_CONFIG, ...config };
  const totalDurationMs = cues.length > 0 ? cues[cues.length - 1].endMs : 0;
  let chapters: Chapter[];
  switch (cfg.strategy) {
    case "explicit-marker":
      chapters = detectExplicitChapters(cues, cfg.explicitMarkerPattern);
      break;
    case "long-pause":
      chapters = detectLongPauseChapters(
        cues,
        cfg.longPauseMs,
        cfg.minChapterMinutes * 60 * 1000,
      );
      break;
    case "speaker-change":
      chapters = detectSpeakerChangeChapters(cues);
      break;
    case "duration-based":
      chapters = detectDurationChapters(
        cues,
        cfg.targetChapterMinutes * 60 * 1000,
        cfg.maxChapters,
      );
      break;
    case "topic-shift":
    case "hybrid":
    default:
      chapters = detectHybridChapters(cues, cfg);
      break;
  }
  return {
    totalDurationMs,
    cueCount: cues.length,
    chapters: renumberChapters(chapters),
    strategy: cfg.strategy,
    generatedAt: now,
  };
}

/**
 * Find chapter at a given time (ms).
 */
export function findChapterAt(
  positionMs: number,
  list: ChapterList,
): Chapter | null {
  for (const c of list.chapters) {
    if (positionMs >= c.startMs && positionMs < c.endMs) return c;
  }
  return null;
}

/**
 * Get next chapter from current position.
 */
export function getNextChapter(
  positionMs: number,
  list: ChapterList,
): Chapter | null {
  for (const c of list.chapters) {
    if (c.startMs > positionMs) return c;
  }
  return null;
}

/**
 * Get previous chapter from current position.
 */
export function getPreviousChapter(
  positionMs: number,
  list: ChapterList,
): Chapter | null {
  let prev: Chapter | null = null;
  for (const c of list.chapters) {
    if (c.startMs < positionMs) prev = c;
    else break;
  }
  return prev;
}

/**
 * Generate a clickable chapter timeline (UI-friendly format).
 */
export function buildTimeline(list: ChapterList): {
  position: number;
  label: string;
  cueId: string;
}[] {
  return list.chapters.map((c) => ({
    position: c.startMs,
    label: c.title,
    cueId: c.startCueId,
  }));
}

/**
 * Summarize chapters for analytics.
 */
export function summarizeChapters(list: ChapterList): ChapterSummary {
  if (list.chapters.length === 0) {
    return {
      totalChapters: 0,
      averageLengthMinutes: 0,
      longestChapterMinutes: 0,
      shortestChapterMinutes: 0,
      strategyBreakdown: {
        "explicit-marker": 0,
        "topic-shift": 0,
        "speaker-change": 0,
        "long-pause": 0,
        "duration-based": 0,
        hybrid: 0,
      },
    };
  }
  const lengths = list.chapters.map(
    (c) => (c.endMs - c.startMs) / (60 * 1000),
  );
  const total = lengths.reduce((a, b) => a + b, 0);
  const breakdown: Record<ChapterDetectionStrategy, number> = {
    "explicit-marker": 0,
    "topic-shift": 0,
    "speaker-change": 0,
    "long-pause": 0,
    "duration-based": 0,
    hybrid: 0,
  };
  for (const c of list.chapters) {
    breakdown[c.strategy]++;
  }
  return {
    totalChapters: list.chapters.length,
    averageLengthMinutes: Math.round((total / lengths.length) * 100) / 100,
    longestChapterMinutes: Math.round(Math.max(...lengths) * 100) / 100,
    shortestChapterMinutes: Math.round(Math.min(...lengths) * 100) / 100,
    strategyBreakdown: breakdown,
  };
}
