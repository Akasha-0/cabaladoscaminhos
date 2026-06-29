// src/lib/w30/audio-video-posts.ts
// Audio/video posts upload UI types — extends w27 voice mode
// Akasha content creator: 90s audio whispers + 60s video búzios readings

export type MediaKind = "audio" | "video";

export interface MediaConstraints {
  readonly kind: MediaKind;
  /** Max duration in seconds (audio: 90s, video: 60s by default) */
  readonly maxDurationSec: number;
  /** Max file size in bytes (10MB audio / 50MB video) */
  readonly maxBytes: number;
  /** Accepted MIME types */
  readonly mimeTypes: readonly string[];
  /** Recommended codec */
  readonly codec: string;
}

export const MEDIA_CONSTRAINTS: Record<MediaKind, MediaConstraints> = {
  audio: {
    kind: "audio",
    maxDurationSec: 90,
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg"],
    codec: "opus",
  },
  video: {
    kind: "video",
    maxDurationSec: 60,
    maxBytes: 50 * 1024 * 1024,
    mimeTypes: ["video/webm", "video/mp4", "video/quicktime"],
    codec: "vp9",
  },
};

export interface UploadProgress {
  readonly bytesUploaded: number;
  readonly bytesTotal: number;
  readonly stage: "preparing" | "uploading" | "processing" | "done" | "error";
  readonly errorMessage?: string;
}

/** Validate upload against constraints */
export function validateMediaUpload(
  file: { size: number; type: string; durationSec?: number },
  kind: MediaKind,
): { valid: true } | { valid: false; reason: string } {
  const c = MEDIA_CONSTRAINTS[kind];
  if (file.size > c.maxBytes) {
    return { valid: false, reason: `Arquivo excede ${c.maxBytes / 1024 / 1024}MB` };
  }
  if (!c.mimeTypes.includes(file.type)) {
    return { valid: false, reason: `Tipo ${file.type} não suportado` };
  }
  if (file.durationSec != null && file.durationSec > c.maxDurationSec) {
    return { valid: false, reason: `Duração máxima ${c.maxDurationSec}s` };
  }
  return { valid: true };
}

/** Compute upload progress percentage (0-100) */
export function progressPercent(p: UploadProgress): number {
  if (p.bytesTotal === 0) return 0;
  return Math.min(100, Math.round((p.bytesUploaded / p.bytesTotal) * 100));
}

/** Format seconds as MM:SS for UI display */
export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
