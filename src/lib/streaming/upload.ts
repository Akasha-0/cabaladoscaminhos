// ============================================================================
// Video Upload — Wave 39 (Video + Streaming 6/8)
// ============================================================================
// Multi-part upload for large pre-recorded videos (up to 4GB).
// Used by facilitators who want to pre-publish a workshop recording.
//
// Pipeline:
//   1. Client requests upload init  →  server returns presigned multipart URLs
//   2. Client uploads parts directly to storage (S3 / R2 / GCS)
//   3. Client signals "complete" →  server triggers background transcode
//   4. Transcoding creates HLS variants + thumbnail + Whisper captions
//   5. Webhook on completion publishes the video to /library/videos
//
// The endpoint here exposes the orchestrator interface — actual upload
// to S3 is sign-and-redirect so the large bytes never touch our backend.
// ============================================================================

/**
 * Upload status (server-side state machine).
 * Drives the progress UI on the client.
 */
export type UploadStatus =
  | 'INITIATED'
  | 'UPLOADING'
  | 'ASSEMBLING'
  | 'TRANSCODING'
  | 'CAPTIONING'
  | 'READY'
  | 'PUBLISHED'
  | 'FAILED';

export interface UploadInitRequest {
  readonly userId: string;
  readonly fileName: string;
  readonly contentType: string; // e.g. video/mp4
  readonly totalBytes: number;
  readonly tradicao?: string;
  readonly title: string;
  readonly description?: string;
  /** Allow LGPD-compliant progress tracking (watch time). */
  readonly lgpdConsent: true;
}

export interface UploadInitResponse {
  readonly uploadId: string;
  readonly videoId: string;
  /** Pre-signed URL for each part (5MB ≤ part ≤ 5GB). */
  readonly partUrls: readonly string[];
  readonly partSizeBytes: number;
  readonly totalParts: number;
}

export interface UploadPart {
  readonly partNumber: number; // 1-indexed
  readonly etag: string;       // ETag returned by S3
}

export interface UploadCompleteRequest {
  readonly uploadId: string;
  readonly parts: readonly UploadPart[];
}

export interface UploadProgress {
  readonly uploadId: string;
  readonly status: UploadStatus;
  readonly percentComplete: number;
  readonly bytesUploaded: number;
  readonly totalBytes: number;
  readonly etaSeconds?: number;
  readonly currentStage?: string;
}

export const MAX_VIDEO_BYTES = 4 * 1024 * 1024 * 1024; // 4 GB
export const MIN_PART_BYTES = 5 * 1024 * 1024;          // 5 MB
export const MAX_PART_BYTES = 5 * 1024 * 1024 * 1024;   // 5 GB
export const DEFAULT_PART_BYTES = 16 * 1024 * 1024;     // 16 MB

/**
 * Compute the number of parts required for a given file size and part size.
 * S3 caps at 10,000 parts per upload.
 */
export function computePartCount(totalBytes: number, partSizeBytes: number): number {
  const parts = Math.ceil(totalBytes / partSizeBytes);
  if (parts > 10_000) {
    throw new Error(
      `[upload] File too large for single multipart upload: ` +
        `${parts} parts would exceed S3 limit of 10,000. ` +
        `Use multipart composite (multiple uploadIds).`,
    );
  }
  return parts;
}

/**
 * Choose the optimal part size for a given file size.
 * S3 minimum is 5MB (except last part). We pick:
 *   • Files < 100MB  →  5MB parts (33-50 parts max)
 *   • Files < 1GB    →  16MB parts
 *   • Files < 10GB   →  64MB parts (capped at 10k parts)
 */
export function pickOptimalPartSize(totalBytes: number): number {
  if (totalBytes <= 100 * 1024 * 1024) return MIN_PART_BYTES;
  if (totalBytes <= 1024 * 1024 * 1024) return DEFAULT_PART_BYTES;
  // For > 1GB, pick part size large enough to stay under 10k parts.
  const minPartSize = Math.ceil(totalBytes / 10_000);
  const rounded = Math.ceil(minPartSize / (1024 * 1024)) * 1024 * 1024;
  return Math.min(MAX_PART_BYTES, Math.max(DEFAULT_PART_BYTES, rounded));
}

/**
 * Validate file metadata before issuing presigned URLs.
 * Returns the canonical part layout that the client must use.
 */
export function validateUploadInput(input: UploadInitRequest): {
  partSizeBytes: number;
  totalParts: number;
} {
  if (input.totalBytes <= 0) {
    throw new Error('[upload] totalBytes must be > 0');
  }
  if (input.totalBytes > MAX_VIDEO_BYTES) {
    throw new Error(
      `[upload] File exceeds 4GB limit (${input.totalBytes} bytes). ` +
        `Contact suporte@luminarias.app for enterprise upload quotas.`,
    );
  }
  if (!input.contentType.startsWith('video/')) {
    throw new Error(
      `[upload] Invalid contentType '${input.contentType}' — must be video/*`,
    );
  }
  if (!input.lgpdConsent) {
    throw new Error('[upload] LGPD consent required (Art. 7) before publishing.');
  }
  const partSize = pickOptimalPartSize(input.totalBytes);
  const totalParts = computePartCount(input.totalBytes, partSize);
  return { partSizeBytes: partSize, totalParts };
}

/**
 * Compute upload progress percentage from byte counters.
 */
export function computeUploadProgress(uploaded: number, total: number, startedAt: number): UploadProgress {
  const percent = Math.min(100, Math.round((uploaded / total) * 1000) / 10);
  const elapsedMs = Date.now() - startedAt;
  const etaSeconds = uploaded > 0
    ? Math.floor(((total - uploaded) / uploaded) * (elapsedMs / 1000))
    : undefined;
  const status: UploadStatus =
    uploaded >= total ? 'ASSEMBLING' :
    uploaded > 0 ? 'UPLOADING' :
    'INITIATED';
  return Object.freeze({
    uploadId: '',
    status,
    percentComplete: percent,
    bytesUploaded: uploaded,
    totalBytes: total,
    etaSeconds,
  });
}

/**
 * Supported source formats for transcoding to HLS.
 * Browsers support .mp4 / .mov / .webm natively; FFmpeg converts all to HLS.
 */
export const SUPPORTED_INPUT_FORMATS = Object.freeze([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-matroska',
]);

/**
 * Whisper auto-captions pipeline (PT-BR primary, EN secondary).
 * Background job — does not block upload completion.
 */
export interface CaptionJob {
  readonly videoId: string;
  readonly sourceUrl: string;
  readonly languages: readonly ('pt-BR' | 'en' | 'es')[];
  readonly model: 'whisper-large-v3' | 'whisper-medium';
  readonly status: 'queued' | 'running' | 'done' | 'failed';
}
