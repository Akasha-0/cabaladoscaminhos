// src/lib/w38/audio-video-chapter-clips-v2.ts
// Short shareable clips derived from chapter markers. Uses the corrected cueCount from w36-v2.
// Composes: w36/w36-audio-video-chapters-v2 (Chapter, ChapterMarker, detectExplicitChapters with cueCount fix),
//           w35/audio-video-live-transcription (TranscriptCue, TranscriptWord, exportVtt),
//           w33/audio-video-recording (RecordingMetadata, durationMs)

export type CueKind = "partial" | "final";

export interface TranscriptCue {
  cueId: string;
  startMs: number;
  endMs: number;
  text: string;
  kind: CueKind;
  speakerId: string | null;
  confidence: number; // 0..1
  words: TranscriptWord[];
}

export interface TranscriptWord {
  word: string;
  startMs: number;
  endMs: number;
  confidence: number;
}

export interface ChapterMarker {
  cueId: string;
  startMs: number;
  label: string;
}

export interface Chapter {
  chapterId: string;
  title: string;
  startMs: number;
  endMs: number;
  cueCount: number;
  markerCueId: string;
  summary: string;
}

export type ClipKind = "highlight" | "summary" | "quote" | "intro" | "outro" | "manual";

export interface ClipBounds {
  startMs: number;
  endMs: number;
}

export interface ClipMetadata {
  clipId: string;
  chapterId: string;
  kind: ClipKind;
  title: string;
  startMs: number;
  endMs: number;
  durationMs: number;
  thumbnailMs: number;
  shareUrl: string;
  transcriptSnippet: string;
  speakerIds: string[];
  averageConfidence: number;
}

export interface ClipExport {
  clipId: string;
  vtt: string;
  chapterTitle: string;
  clipTitle: string;
}

export interface ChapterClipConfig {
  defaultDurationMs: number;
  maxDurationMs: number;
  minDurationMs: number;
  preferCenterMs: number;
  maxTranscriptWords: number;
  includeWordTimestamps: boolean;
}

export const DEFAULT_CHAPTER_CLIP_CONFIG: ChapterClipConfig = {
  defaultDurationMs: 30000,
  maxDurationMs: 90000,
  minDurationMs: 5000,
  preferCenterMs: 15000,
  maxTranscriptWords: 30,
  includeWordTimestamps: true,
};

export const SHARE_URL_MAX_LENGTH = 256;
export const CLIP_TITLE_MAX_LENGTH = 80;

export function clipIdFor(chapterId: string, kind: ClipKind, startMs: number): string {
  return `clip-${chapterId}-${kind}-${Math.floor(startMs)}`;
}

export function clipBoundsForChapter(
  chapter: Chapter,
  cues: TranscriptCue[],
  config: ChapterClipConfig = DEFAULT_CHAPTER_CLIP_CONFIG,
): ClipBounds {
  if (chapter.endMs > chapter.startMs) {
    const chapDur = chapter.endMs - chapter.startMs;
    if (chapDur <= config.defaultDurationMs) {
      return { startMs: chapter.startMs, endMs: chapter.endMs };
    }
  }
  const startMs = chapter.startMs;
  const endMs = Math.min(
    chapter.endMs > chapter.startMs ? chapter.endMs : Number.MAX_SAFE_INTEGER,
    chapter.startMs + config.defaultDurationMs,
  );
  void cues;
  return { startMs, endMs };
}

export function clipCenterForChapter(
  chapter: Chapter,
  cues: TranscriptCue[],
  config: ChapterClipConfig = DEFAULT_CHAPTER_CLIP_CONFIG,
): ClipBounds {
  const chapDur = chapter.endMs - chapter.startMs;
  if (chapDur <= config.defaultDurationMs) {
    return { startMs: chapter.startMs, endMs: chapter.endMs };
  }
  const centerStart = chapter.startMs + Math.max(0, (chapDur - config.preferCenterMs) / 2);
  const startMs = Math.max(chapter.startMs, centerStart);
  const endMs = Math.min(chapter.endMs, startMs + config.preferCenterMs);
  void cues;
  return { startMs, endMs };
}

export function clipBoundsFromMarker(
  chapter: Chapter,
  beforeMs: number,
  afterMs: number,
  cues: TranscriptCue[],
  config: ChapterClipConfig = DEFAULT_CHAPTER_CLIP_CONFIG,
): ClipBounds {
  const startMs = Math.max(0, chapter.startMs - beforeMs);
  const rawEnd = chapter.startMs + afterMs;
  const endMs = chapter.endMs > 0 ? Math.min(chapter.endMs, rawEnd) : rawEnd;
  void cues;
  void config;
  return { startMs, endMs };
}

export function cuesInBounds(cues: TranscriptCue[], bounds: ClipBounds): TranscriptCue[] {
  return cues.filter((c) => c.endMs > bounds.startMs && c.startMs < bounds.endMs);
}

export function clipTranscriptSnippet(
  cues: TranscriptCue[],
  bounds: ClipBounds,
  config: ChapterClipConfig = DEFAULT_CHAPTER_CLIP_CONFIG,
): string {
  const inCues = cuesInBounds(cues, bounds);
  const words: string[] = [];
  for (const c of inCues) {
    const parts = c.text.split(/\s+/).filter((w) => w.length > 0);
    for (const p of parts) {
      if (words.length >= config.maxTranscriptWords) return words.join(" ");
      words.push(p);
    }
  }
  return words.join(" ");
}

export function clipSpeakers(cues: TranscriptCue[], bounds: ClipBounds): string[] {
  const set = new Set<string>();
  for (const c of cuesInBounds(cues, bounds)) {
    if (c.speakerId) set.add(c.speakerId);
  }
  return Array.from(set);
}

export function clipAverageConfidence(cues: TranscriptCue[], bounds: ClipBounds): number {
  const inCues = cuesInBounds(cues, bounds);
  if (inCues.length === 0) return 0;
  const sum = inCues.reduce((s, c) => s + c.confidence, 0);
  return sum / inCues.length;
}

export function clipThumbnailMs(bounds: ClipBounds): number {
  return Math.floor((bounds.startMs + bounds.endMs) / 2);
}

export function buildClipTitle(chapter: Chapter, kind: ClipKind): string {
  const suffix = kind === "highlight" ? " — highlight" : kind === "summary" ? " — summary" : "";
  const raw = `${chapter.title}${suffix}`;
  if (raw.length <= CLIP_TITLE_MAX_LENGTH) return raw;
  return raw.slice(0, CLIP_TITLE_MAX_LENGTH - 1) + "…";
}

export function buildShareUrl(clipId: string, baseUrl: string = "https://akasha.app"): string {
  const path = `/c/${clipId}`;
  const url = `${baseUrl}${path}`;
  return url.length > SHARE_URL_MAX_LENGTH ? url.slice(0, SHARE_URL_MAX_LENGTH) : url;
}

export function buildClip(
  chapter: Chapter,
  cues: TranscriptCue[],
  kind: ClipKind,
  config: ChapterClipConfig = DEFAULT_CHAPTER_CLIP_CONFIG,
  baseUrl: string = "https://akasha.app",
): ClipMetadata {
  const bounds = kind === "highlight" || kind === "quote"
    ? clipCenterForChapter(chapter, cues, config)
    : clipBoundsForChapter(chapter, cues, config);
  const startMs = Math.max(0, bounds.startMs);
  const endMs = Math.max(startMs + config.minDurationMs, bounds.endMs);
  const durationMs = endMs - startMs;
  const clipId = clipIdFor(chapter.chapterId, kind, startMs);
  return {
    clipId,
    chapterId: chapter.chapterId,
    kind,
    title: buildClipTitle(chapter, kind),
    startMs,
    endMs,
    durationMs,
    thumbnailMs: clipThumbnailMs(bounds),
    shareUrl: buildShareUrl(clipId, baseUrl),
    transcriptSnippet: clipTranscriptSnippet(cues, bounds, config),
    speakerIds: clipSpeakers(cues, bounds),
    averageConfidence: clipAverageConfidence(cues, bounds),
  };
}

export function buildClipsForChapter(
  chapter: Chapter,
  cues: TranscriptCue[],
  kinds: ClipKind[] = ["highlight", "summary"],
  config: ChapterClipConfig = DEFAULT_CHAPTER_CLIP_CONFIG,
  baseUrl: string = "https://akasha.app",
): ClipMetadata[] {
  return kinds.map((k) => buildClip(chapter, cues, k, config, baseUrl));
}

export function buildAllClips(
  chapters: Chapter[],
  cues: TranscriptCue[],
  kinds: ClipKind[] = ["highlight", "summary"],
  config: ChapterClipConfig = DEFAULT_CHAPTER_CLIP_CONFIG,
  baseUrl: string = "https://akasha.app",
): ClipMetadata[] {
  const out: ClipMetadata[] = [];
  for (const ch of chapters) {
    out.push(...buildClipsForChapter(ch, cues, kinds, config, baseUrl));
  }
  return out;
}

export function exportClipVtt(clip: ClipMetadata, cues: TranscriptCue[]): ClipExport {
  const inCues = cuesInBounds(cues, { startMs: clip.startMs, endMs: clip.endMs });
  const lines: string[] = ["WEBVTT", ""];
  for (const c of inCues) {
    lines.push(clip.chapterId);
    lines.push(`${formatVttMs(c.startMs)} --> ${formatVttMs(c.endMs)}`);
    let line = c.text;
    if (c.speakerId) line = `<v ${c.speakerId}>${line}`;
    lines.push(line);
    lines.push("");
  }
  return {
    clipId: clip.clipId,
    vtt: lines.join("\n"),
    chapterTitle: clip.title,
    clipTitle: clip.title,
  };
}

export function formatVttMs(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const milli = Math.floor(ms % 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(milli).padStart(3, "0")}`;
}

export function sortClipsByDuration(clips: ClipMetadata[]): ClipMetadata[] {
  return [...clips].sort((a, b) => a.durationMs - b.durationMs);
}

export function pickBestClips(clips: ClipMetadata[], limit: number): ClipMetadata[] {
  const sorted = [...clips].sort((a, b) => {
    if (a.averageConfidence !== b.averageConfidence) return b.averageConfidence - a.averageConfidence;
    return b.durationMs - a.durationMs;
  });
  return sorted.slice(0, limit);
}

export function totalClipDurationMs(clips: ClipMetadata[]): number {
  return clips.reduce((s, c) => s + c.durationMs, 0);
}

export function summarizeClips(clips: ClipMetadata[]): string {
  if (clips.length === 0) return "clips: none";
  const totalMs = totalClipDurationMs(clips);
  const avgConf = clips.reduce((s, c) => s + c.averageConfidence, 0) / clips.length;
  const kinds = clips.reduce<Record<ClipKind, number>>(
    (acc, c) => {
      acc[c.kind] = (acc[c.kind] || 0) + 1;
      return acc;
    },
    { highlight: 0, summary: 0, quote: 0, intro: 0, outro: 0, manual: 0 },
  );
  return [
    `clips: n=${clips.length}`,
    `total=${(totalMs / 1000).toFixed(0)}s`,
    `avg_conf=${avgConf.toFixed(2)}`,
    `kinds[H/S/Q/I/O/M]=${kinds.highlight}/${kinds.summary}/${kinds.quote}/${kinds.intro}/${kinds.outro}/${kinds.manual}`,
  ].join(" | ");
}
