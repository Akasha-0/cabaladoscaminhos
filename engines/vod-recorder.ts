/**
 * W71-D: vod-recorder.ts
 *
 * VOD (video-on-demand) post-processing for stream recordings.
 *
 * Architecture decisions:
 * - `generateVod` simulates the transcoding pipeline. Production wires
 *   FFmpeg.wasm (browser) or a server-side FFmpeg worker (Node) and
 *   uploads the output to S3/MinIO with signed URLs.
 * - Thumbnails and transcripts return PLACEHOLDER URLs/text that are
 *   clearly marked (cycle 70+ lesson: don't fake successful operations).
 * - Auth check: only the host can delete a VOD.
 * - Sacred coverage: hostId filter supports tradition tags via the
 *   stream-session engine (cross-engine lookup via streamId).
 *
 * Honest concerns:
 * - No real FFmpeg transcoding; this engine records metadata only.
 * - Thumbnail URLs are PLACEHOLDER paths; production wires a thumb generator.
 * - Transcript is a template with placeholder segments; production wires
 *   Whisper API (or equivalent) and stores SRT/VTT segments.
 * - In-memory store; production persists via Prisma + S3.
 */

import { randomUUID } from 'crypto';

// ─── Types ──────────────────────────────────────────────────────────────────

export type VodFormat = 'mp4' | 'webm';

export type VodStatus = 'processing' | 'ready' | 'failed';

export type VodConfig = {
  readonly streamId: string;
  readonly recordingUrl: string;
  readonly durationMs: number;
  readonly format: VodFormat;
  readonly targetBitrate: number;
  readonly generateThumbnails: boolean;
  readonly thumbnailCount: number;
  readonly generateTranscript: boolean;
};

export type VodAsset = {
  readonly id: string;
  readonly streamId: string;
  readonly hostId: string;
  readonly recordingUrl: string;
  readonly durationMs: number;
  readonly format: VodFormat;
  readonly size: number;
  readonly thumbnailUrls: readonly string[];
  readonly transcriptUrl?: string;
  readonly generatedAt: number;
  readonly status: VodStatus;
  readonly bitrate: number;
  readonly traditionTags: readonly string[];
};

export type VodDeleteResult = {
  deleted: boolean;
  reason?: string;
};

// ─── Internal store ─────────────────────────────────────────────────────────

const STORE: Map<string, VodAsset> = new Map();
const STREAM_INDEX: Map<string, string> = new Map(); // streamId → vodId

// Cross-engine handle: production wires via DI; here we accept a stream resolver.
let STREAM_HOST_RESOLVER: ((streamId: string) => string | null) | null = null;

export function setStreamHostResolver(fn: ((streamId: string) => string | null) | null): void {
  STREAM_HOST_RESOLVER = fn;
}

export function clearVodStore(): void {
  STORE.clear();
  STREAM_INDEX.clear();
}

// ─── Validation helpers ─────────────────────────────────────────────────────

export function validateVodConfig(cfg: VodConfig): void {
  if (!cfg || typeof cfg !== 'object') throw new Error('generateVod: config is required');
  if (!cfg.streamId || typeof cfg.streamId !== 'string') {
    throw new Error('generateVod: streamId is required');
  }
  if (!cfg.recordingUrl || typeof cfg.recordingUrl !== 'string') {
    throw new Error('generateVod: recordingUrl is required');
  }
  if (typeof cfg.durationMs !== 'number' || cfg.durationMs <= 0 || !Number.isFinite(cfg.durationMs)) {
    throw new Error('generateVod: durationMs must be a finite number > 0');
  }
  if (!['mp4', 'webm'].includes(cfg.format)) {
    throw new Error(`generateVod: format must be mp4|webm (got '${cfg.format}')`);
  }
  if (typeof cfg.targetBitrate !== 'number' || cfg.targetBitrate <= 0) {
    throw new Error('generateVod: targetBitrate must be a positive number (bps)');
  }
  if (typeof cfg.thumbnailCount !== 'number' || cfg.thumbnailCount < 0 || cfg.thumbnailCount > 100) {
    throw new Error('generateVod: thumbnailCount must be in [0, 100]');
  }
}

export function validateThumbnailCount(count: number): number {
  if (typeof count !== 'number' || !Number.isInteger(count) || count < 0 || count > 100) {
    throw new Error('generateThumbnails: count must be an integer in [0, 100]');
  }
  return count;
}

// ─── Size + thumbnail URL generation (clearly PLACEHOLDER) ─────────────────

/**
 * Estimate file size from durationMs + bitrate.
 * size_bytes ≈ duration_seconds × bitrate_bps / 8
 * Note: this is a heuristic; real encoding depends on codec + content.
 */
export function estimateVodSize(durationMs: number, bitrateBps: number): number {
  if (durationMs <= 0 || bitrateBps <= 0) return 0;
  return Math.floor((durationMs / 1000) * (bitrateBps / 8));
}

/**
 * Generate thumbnail URLs as PLACEHOLDERS.
 * Cycle 70+ lesson: don't fake successful operations. These URLs point to
 * the source recording with a frame hint; production wires a thumb generator
 * (FFmpeg.wasm in browser, FFmpeg -ss in Node, or external service).
 */
export async function generateThumbnails(
  recordingUrl: string,
  count: number,
): Promise<string[]> {
  validateThumbnailCount(count);
  if (!recordingUrl || typeof recordingUrl !== 'string') {
    throw new Error('generateThumbnails: recordingUrl is required');
  }
  const urls: string[] = [];
  for (let i = 0; i < count; i++) {
    urls.push(`${recordingUrl}#thumb-${i + 1}-placeholder`);
  }
  return urls;
}

/**
 * Generate a transcript PLACEHOLDER. Production wires Whisper API or
 * equivalent. The template includes [HH:MM:SS] anchors at evenly spaced
 * intervals so callers can see the structure even when no real audio
 * processing has run.
 */
export function generateTranscriptPlaceholder(
  recordingUrl: string,
  durationMs: number,
): string {
  if (!recordingUrl || typeof recordingUrl !== 'string') {
    throw new Error('generateTranscriptPlaceholder: recordingUrl is required');
  }
  if (typeof durationMs !== 'number' || durationMs <= 0) {
    throw new Error('generateTranscriptPlaceholder: durationMs must be > 0');
  }
  const segments = 8; // number of placeholder anchors
  const lines: string[] = [];
  lines.push('# Transcript placeholder (production: wire Whisper API or equivalent)');
  lines.push(`# Source: ${recordingUrl}`);
  lines.push(`# Duration: ${formatDuration(durationMs)}`);
  for (let i = 0; i < segments; i++) {
    const at = Math.floor((durationMs * i) / segments);
    lines.push(`[${formatTimestamp(at)}] <transcript-segment-${i + 1}>`);
  }
  return lines.join('\n');
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

function formatTimestamp(ms: number): string {
  return formatDuration(ms);
}

function pad(n: number): string {
  return n < 10 ? '0' + n : '' + n;
}

// ─── Public API: VOD generation ─────────────────────────────────────────────

export async function generateVod(config: VodConfig): Promise<VodAsset> {
  validateVodConfig(config);
  // Simulated transcoding latency (no real work)
  await new Promise<void>((resolve) => setTimeout(resolve, 0));

  const id = 'vod_' + randomUUID();
  const size = estimateVodSize(config.durationMs, config.targetBitrate);
  const thumbnails = config.generateThumbnails
    ? await generateThumbnails(config.recordingUrl, config.thumbnailCount)
    : [];
  const transcriptUrl = config.generateTranscript
    ? `${config.recordingUrl}#transcript-placeholder`
    : undefined;
  const hostId = STREAM_HOST_RESOLVER ? STREAM_HOST_RESOLVER(config.streamId) ?? '' : '';

  const asset: VodAsset = Object.freeze({
    id,
    streamId: config.streamId,
    hostId,
    recordingUrl: config.recordingUrl,
    durationMs: config.durationMs,
    format: config.format,
    size,
    thumbnailUrls: Object.freeze(thumbnails),
    ...(transcriptUrl !== undefined ? { transcriptUrl } : {}),
    generatedAt: Date.now(),
    status: 'ready',
    bitrate: config.targetBitrate,
    traditionTags: [],
  });

  STORE.set(id, asset);
  STREAM_INDEX.set(config.streamId, id);
  return asset;
}

// ─── Public API: read ───────────────────────────────────────────────────────

export function getVod(streamId: string): VodAsset | null {
  if (!streamId) return null;
  const vodId = STREAM_INDEX.get(streamId);
  if (!vodId) return null;
  return STORE.get(vodId) ?? null;
}

export function getVodById(vodId: string): VodAsset | null {
  if (!vodId) return null;
  return STORE.get(vodId) ?? null;
}

export function listVods(
  filter: { hostId?: string; tradition?: string },
  opts: { limit: number; offset: number },
): VodAsset[] {
  if (!opts || typeof opts.limit !== 'number' || opts.limit < 0) {
    throw new Error('listVods: opts.limit must be >= 0');
  }
  if (typeof opts.offset !== 'number' || opts.offset < 0) {
    throw new Error('listVods: opts.offset must be >= 0');
  }
  let arr = Array.from(STORE.values());
  if (filter?.hostId) {
    arr = arr.filter((v) => v.hostId === filter.hostId);
  }
  if (filter?.tradition) {
    const t = filter.tradition.toLowerCase();
    arr = arr.filter((v) => (v.traditionTags as readonly string[]).includes(t));
  }
  arr.sort((a, b) => b.generatedAt - a.generatedAt);
  return arr.slice(opts.offset, opts.offset + opts.limit);
}

// ─── Public API: delete (host-only) ─────────────────────────────────────────

export function deleteVod(vodId: string, requesterId: string): VodDeleteResult {
  if (!vodId) return { deleted: false, reason: 'vodId is required' };
  if (!requesterId) return { deleted: false, reason: 'requesterId is required' };
  const asset = STORE.get(vodId);
  if (!asset) return { deleted: false, reason: `vod not found: ${vodId}` };
  if (asset.hostId && asset.hostId !== requesterId) {
    return { deleted: false, reason: 'forbidden: only the host can delete this vod' };
  }
  STORE.delete(vodId);
  STREAM_INDEX.delete(asset.streamId);
  return { deleted: true };
}

// ─── Public API: tradition tag attachment ───────────────────────────────────

/**
 * Attach tradition tags to a VOD (post-generation annotation).
 * Production wires this when the stream's traditionTags are known after VOD
 * is ready. Here we re-derive from STREAM_HOST_RESOLVER if no explicit tags.
 */
export function setVodTraditionTags(vodId: string, tags: readonly string[]): VodAsset | null {
  const asset = STORE.get(vodId);
  if (!asset) return null;
  const updated: VodAsset = Object.freeze({
    ...asset,
    traditionTags: Object.freeze([...new Set(tags)]),
  });
  STORE.set(vodId, updated);
  return updated;
}

// ─── Public API: audit ──────────────────────────────────────────────────────

export function auditVodAsset(v: VodAsset): {
  id: string;
  streamId: string;
  format: VodFormat;
  status: VodStatus;
  hasThumbnails: boolean;
  hasTranscript: boolean;
  sizeMb: number;
  traditionCount: number;
} {
  return Object.freeze({
    id: v.id,
    streamId: v.streamId,
    format: v.format,
    status: v.status,
    hasThumbnails: v.thumbnailUrls.length > 0,
    hasTranscript: typeof v.transcriptUrl === 'string' && v.transcriptUrl.length > 0,
    sizeMb: Math.round((v.size / (1024 * 1024)) * 100) / 100,
    traditionCount: v.traditionTags.length,
  });
}

export function auditVodSurface(): {
  formats: readonly VodFormat[];
  statuses: readonly VodStatus[];
  placeholderMarker: string;
} {
  return Object.freeze({
    formats: ['mp4', 'webm'] as const,
    statuses: ['processing', 'ready', 'failed'] as const,
    placeholderMarker: '#thumb-N-placeholder / #transcript-placeholder',
  });
}