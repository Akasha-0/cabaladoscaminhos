// src/lib/w33/audio-video-recording.ts
// Cycle 33 worker E — audio/video posts recording flow + waveform + captions
// Composes w30/audio-video-posts + w24/audio-video-uploader
// Scope: recorder state machine, waveform bins, captions (VTT) helpers, transcoding presets
// Namespace: w33 — self-contained, type-only deps on other waves

export type RecorderPhase =
  | "idle"
  | "permission_pending"
  | "ready"
  | "recording"
  | "paused"
  | "review"
  | "uploading"
  | "transcoding"
  | "done"
  | "error";

export type MediaKind = "audio" | "video";
export type RecordingQuality = "draft" | "standard" | "high" | "broadcast";

export interface RecorderConfig {
  readonly kind: MediaKind;
  readonly quality: RecordingQuality;
  readonly maxDurationSeconds: number;
  readonly sampleRateHz: number;
  readonly videoWidth: number;
  readonly videoHeight: number;
  readonly videoFps: number;
  readonly videoBitrateKbps: number;
  readonly audioBitrateKbps: number;
}

export const PRESETS: Readonly<Record<RecordingQuality, RecorderConfig>> = {
  draft: {
    kind: "video",
    quality: "draft",
    maxDurationSeconds: 60,
    sampleRateHz: 22050,
    videoWidth: 480,
    videoHeight: 854,
    videoFps: 24,
    videoBitrateKbps: 500,
    audioBitrateKbps: 64,
  },
  standard: {
    kind: "video",
    quality: "standard",
    maxDurationSeconds: 300,
    sampleRateHz: 44100,
    videoWidth: 720,
    videoHeight: 1280,
    videoFps: 30,
    videoBitrateKbps: 1500,
    audioBitrateKbps: 128,
  },
  high: {
    kind: "video",
    quality: "high",
    maxDurationSeconds: 900,
    sampleRateHz: 48000,
    videoWidth: 1080,
    videoHeight: 1920,
    videoFps: 30,
    videoBitrateKbps: 4000,
    audioBitrateKbps: 192,
  },
  broadcast: {
    kind: "video",
    quality: "broadcast",
    maxDurationSeconds: 3600,
    sampleRateHz: 48000,
    videoWidth: 1920,
    videoHeight: 1080,
    videoFps: 60,
    videoBitrateKbps: 8000,
    audioBitrateKbps: 256,
  },
};

export interface RecorderState {
  readonly phase: RecorderPhase;
  readonly config: RecorderConfig;
  readonly startedAt: number | null;
  readonly pausedDurationMs: number;
  readonly elapsedSeconds: number;
  readonly errorMessage: string | null;
  readonly blobUrl: string | null;
  readonly fileSizeBytes: number | null;
}

export const INITIAL_RECORDER_STATE: RecorderState = {
  phase: "idle",
  config: PRESETS.standard,
  startedAt: null,
  pausedDurationMs: 0,
  elapsedSeconds: 0,
  errorMessage: null,
  blobUrl: null,
  fileSizeBytes: null,
};

export function transitionRecorder(
  state: RecorderState,
  target: RecorderPhase,
  now: number,
  payload?: { blobUrl?: string; fileSizeBytes?: number; errorMessage?: string },
): RecorderState {
  switch (target) {
    case "ready":
      return { ...state, phase: "ready", errorMessage: null };
    case "recording":
      return {
        ...state,
        phase: "recording",
        startedAt: now,
        pausedDurationMs: 0,
        elapsedSeconds: 0,
        errorMessage: null,
      };
    case "paused":
      return { ...state, phase: "paused" };
    case "review":
      return {
        ...state,
        phase: "review",
        blobUrl: payload?.blobUrl ?? state.blobUrl,
        fileSizeBytes: payload?.fileSizeBytes ?? state.fileSizeBytes,
      };
    case "uploading":
      return { ...state, phase: "uploading" };
    case "transcoding":
      return { ...state, phase: "transcoding" };
    case "done":
      return { ...state, phase: "done" };
    case "error":
      return { ...state, phase: "error", errorMessage: payload?.errorMessage ?? "unknown" };
    default:
      return state;
  }
}

export interface RecordingLimits {
  readonly canStart: boolean;
  readonly willExceedMax: boolean;
  readonly remainingSeconds: number;
}

export function checkRecordingLimits(
  state: RecorderState,
  now: number,
): RecordingLimits {
  const max = state.config.maxDurationSeconds;
  const remaining = state.startedAt
    ? Math.max(0, max - state.elapsedSeconds)
    : max;
  return {
    canStart: state.phase === "ready" || state.phase === "paused",
    willExceedMax: state.elapsedSeconds >= max,
    remainingSeconds: remaining,
  };
}

export interface WaveformBin {
  readonly index: number;
  readonly amplitude: number; // 0-1
  readonly timestampMs: number;
}

export function bucketizeWaveform(
  samples: ReadonlyArray<number>,
  binCount: number,
  totalDurationMs: number,
): ReadonlyArray<WaveformBin> {
  if (samples.length === 0 || binCount <= 0) return [];
  const bucketSize = Math.max(1, Math.floor(samples.length / binCount));
  const out: WaveformBin[] = [];
  for (let i = 0; i < binCount; i++) {
    const start = i * bucketSize;
    const end = i === binCount - 1 ? samples.length : start + bucketSize;
    let peak = 0;
    for (let j = start; j < end; j++) {
      const v = Math.abs(samples[j]);
      if (v > peak) peak = v;
    }
    out.push({
      index: i,
      amplitude: Math.min(1, peak),
      timestampMs: Math.round((i / binCount) * totalDurationMs),
    });
  }
  return out;
}

export interface CaptionCue {
  readonly id: string;
  readonly startMs: number;
  readonly endMs: number;
  readonly text: string;
  readonly speaker: string | null;
}

export function formatVttTimestamp(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const tail = (ms % 1000).toString().padStart(3, "0");
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${tail}`;
}

export function buildVtt(cues: ReadonlyArray<CaptionCue>): string {
  const lines: string[] = ["WEBVTT", ""];
  for (const c of cues) {
    lines.push(String(c.id));
    lines.push(`${formatVttTimestamp(c.startMs)} --> ${formatVttTimestamp(c.endMs)}`);
    if (c.speaker) lines.push(`<v ${c.speaker}>${c.text}</v>`);
    else lines.push(c.text);
    lines.push("");
  }
  return lines.join("\n");
}

export function parseVtt(text: string): ReadonlyArray<CaptionCue> {
  const out: CaptionCue[] = [];
  const blocks = text.split(/\n\n+/);
  let autoId = 0;
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;
    if (lines[0] === "WEBVTT") continue;
    const id = /^\d+$/.test(lines[0]) ? lines[0] : String(++autoId);
    const timeLine = lines.find((l) => l.includes("-->")) ?? "";
    const match = timeLine.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/);
    if (!match) continue;
    const startMs = vttToMs(match[1]);
    const endMs = vttToMs(match[2]);
    const textLine = lines.filter((l) => l !== id && !l.includes("-->")).join(" ");
    const speakerMatch = textLine.match(/^<v\s+([^>]+)>(.*)<\/v>$/);
    const speaker = speakerMatch ? speakerMatch[1] : null;
    const cueText = speakerMatch ? speakerMatch[2] : textLine;
    out.push({ id, startMs, endMs, text: cueText, speaker });
  }
  return out;
}

function vttToMs(ts: string): number {
  const [hms, ms] = ts.split(".");
  const [h, m, s] = hms.split(":").map(Number);
  return h * 3600000 + m * 60000 + s * 1000 + Number(ms);
}

export function estimateFileSizeBytes(
  config: RecorderConfig,
  durationSeconds: number,
): number {
  const audioBytes = (config.audioBitrateKbps * 1000 / 8) * durationSeconds;
  const videoBytes = config.kind === "video"
    ? (config.videoBitrateKbps * 1000 / 8) * durationSeconds
    : 0;
  return Math.round(audioBytes + videoBytes);
}
