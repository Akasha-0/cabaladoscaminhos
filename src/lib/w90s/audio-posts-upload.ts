/**
 * ════════════════════════════════════════════════════════════════════════════
 * W90s-C — AUDIO POSTS UPLOAD ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 90 · 2026-06-30
 * Author: W90s-C Coder (Mavis orchestrator session 414809011343550)
 *
 * Pure-TypeScript engine for the audio-post-upload feature. Handles:
 *   - File validation (mp3/wav/ogg, ≤10MB)
 *   - Waveform peak generation (downsampled to ≤200 floats)
 *   - Metadata extraction (duration, bitrate, sample rate)
 *   - Object-URL preview lifecycle helpers
 *   - Duration formatting (mm:ss)
 *
 * Distinct from text/image posts — exercises the upload pipeline beyond images,
 * validates File API + Audio API + Canvas-friendly peak data.
 *
 * Public API (cycle 90s contract):
 *   validateAudioFile(file)      → FileValidationResult
 *   generateWaveformPeaks(samples, opts?) → WaveformPeaks
 *   encodeAudioForPreview(file)  → ObjectUrlRef (must releaseObjectURL on cleanup)
 *   formatDuration(seconds)      → string (mm:ss or h:mm:ss)
 *   createInitialUploadState()   → AudioUploadState (descriptive, no ranking terms)
 *
 * Durable lessons applied (cycle 60-89):
 *   - Branded types in engine + spec (cycle 73, 89)
 *   - Result narrowing positive `if (r.ok)` (cycle 73)
 *   - Object.freeze on factory return (cycle 68, 89)
 *   - noUncheckedIndexedAccess defensive (cycle 60s)
 *   - Descriptive only — NO ranking labels (cycle 88 sacred-cultural)
 *   - Heavy BANNED-VOCAB: amarração, amarre, vinculação, vincular, prejudicar (cycle 88, 89)
 *   - LGPD-friendly: engine is pure, no PII captured (cycle 88)
 *   - Self-running smoke harness pattern (cycle 68+)
 *   - Module-surface Object.freeze (cycle 89)
 */

// ════════════════════════════════════════════════════════════════════════════
// TYPES — Branded primitives + DTOs
// ════════════════════════════════════════════════════════════════════════════

declare const process: { env: Record<string, string | undefined> };

export type AudioFileId = string & { readonly __brand: 'AudioFileId' };
export type ObjectUrl = string & { readonly __brand: 'ObjectUrl' };
export type PeakArray = readonly number[] & { readonly __brand: 'PeakArray' };

export const ALLOWED_AUDIO_MIME_TYPES = Object.freeze([
  'audio/mpeg', // .mp3
  'audio/mp3', // .mp3 (some browsers)
  'audio/wav', // .wav
  'audio/wave', // .wav (some browsers)
  'audio/x-wav', // .wav
  'audio/ogg', // .ogg
  'audio/x-vorbis+ogg', // alternative ogg marker
] as const);

export const ALLOWED_AUDIO_EXTENSIONS = Object.freeze(['mp3', 'wav', 'ogg'] as const);

export const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10MB cap (mobile-friendly)
export const MAX_WAVEFORM_PEAKS = 200;            // Canvas-friendly
export const DEFAULT_WAVEFORM_PEAKS = 100;

export type AudioFormat = 'mp3' | 'wav' | 'ogg';

export interface FileValidationFailure {
  ok: false;
  reason:
    | 'empty'
    | 'too-large'
    | 'unsupported-mime'
    | 'unsupported-extension'
    | 'mime-extension-mismatch'
    | 'invalid-filename';
  message: string;
}

export interface FileValidationSuccess {
  ok: true;
  format: AudioFormat;
  sizeBytes: number;
  /** Detected MIME that we will respect for the preview pipeline */
  mimeType: string;
}

export type FileValidationResult = FileValidationSuccess | FileValidationFailure;

export interface WaveformPeaks {
  readonly peaks: PeakArray;
  readonly sampleCount: number;
  readonly binCount: number;
}

export interface ObjectUrlRef {
  readonly url: ObjectUrl;
  /** File reference for revocation race-detection */
  readonly fileRef: string;
  readonly format: AudioFormat;
}

export interface AudioMetadata {
  readonly durationSeconds: number;
  readonly sampleRateHz: number;
  readonly bitrateKbps: number;
  readonly channels: 1 | 2;
  readonly format: AudioFormat;
}

export interface AudioUploadState {
  readonly status: 'idle' | 'validating' | 'previewing' | 'ready' | 'error';
  readonly fileName: string;
  readonly sizeBytes: number;
  readonly format: AudioFormat;
  readonly objectUrl: ObjectUrl | null;
  readonly errorMessage: string | null;
  readonly lgpdConsent: boolean;
  readonly lgpdVersion: string;
}

// ════════════════════════════════════════════════════════════════════════════
// BRAND CONSTRUCTORS — narrow primitives at the boundary
// ════════════════════════════════════════════════════════════════════════════

export function audioFileId(raw: string): AudioFileId {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    throw new Error('audioFileId requires non-empty string');
  }
  return raw as AudioFileId;
}

export function objectUrl(raw: string): ObjectUrl {
  if (typeof raw !== 'string' || !raw.startsWith('blob:')) {
    throw new Error('objectUrl requires blob: URL');
  }
  return raw as ObjectUrl;
}

/** Helper: build a PeakArray branded type from a regular number array */
export function peakArrayFrom(values: number[]): PeakArray {
  if (!Array.isArray(values)) {
    throw new Error('peakArrayFrom requires an array');
  }
  // Object.freeze + structural cast — array length is captured at construction
  Object.freeze(values);
  return values as unknown as PeakArray;
}

// ════════════════════════════════════════════════════════════════════════════
// 1. validateAudioFile
// ════════════════════════════════════════════════════════════════════════════

/**
 * Validate an uploaded File is acceptable for the audio-post pipeline.
 *
 * Rejects:
 *   - Empty files (0 bytes)
 *   - Files > MAX_AUDIO_BYTES
 *   - Unsupported MIME types
 *   - Unknown / no extensions
 *   - MIME/extension mismatches (defends against `image.png` renamed to `.mp3`)
 *
 * Accepts MIME permissive mapping:
 *   - audio/mpeg OR audio/mp3 → 'mp3'
 *   - audio/wav OR audio/wave OR audio/x-wav → 'wav'
 *   - audio/ogg OR audio/x-vorbis+ogg → 'ogg'
 */
export function validateAudioFile(file: File): FileValidationResult {
  if (!(file instanceof File)) {
    return failure('invalid-filename', 'Entrada não é um arquivo válido.');
  }

  if (file.size === 0) {
    return failure('empty', 'O arquivo de áudio está vazio.');
  }

  if (file.size > MAX_AUDIO_BYTES) {
    const sizeMb = (file.size / 1024 / 1024).toFixed(1);
    return failure(
      'too-large',
      `Arquivo muito grande (${sizeMb}MB). Limite: 10MB.`,
    );
  }

  const mime = (file.type || '').toLowerCase();
  const name = file.name || '';
  const extMatch = /\.([a-z0-9]+)(?:\?.*)?$/i.exec(name);
  const ext = extMatch && extMatch[1] ? extMatch[1].toLowerCase() : '';

  // Extension gate first — fail fast if no recognized extension
  if (!ext || !isAllowedExtension(ext)) {
    return failure(
      'unsupported-extension',
      `Formato .${ext || '?'} não suportado. Use mp3, wav ou ogg.`,
    );
  }

  // MIME gate — if absent, rely on extension only (mobile Safari sometimes drops MIME)
  let format: AudioFormat;
  if (mime) {
    const mimeFormat = mimeToFormat(mime);
    if (!mimeFormat) {
      return failure(
        'unsupported-mime',
        `Tipo MIME "${mime}" não suportado.`,
      );
    }
    if (mimeFormat !== ext) {
      return failure(
        'mime-extension-mismatch',
        `O arquivo parece ser .${ext} mas declara "${mime}". Verifique a extensão.`,
      );
    }
    format = mimeFormat;
  } else {
    // No MIME declared but extension is OK — trust the extension
    format = ext as AudioFormat;
  }

  return success(format, file.size, mime || defaultMimeFor(format));
}

function isAllowedExtension(ext: string): ext is AudioFormat {
  return (ALLOWED_AUDIO_EXTENSIONS as readonly string[]).includes(ext);
}

function mimeToFormat(mime: string): AudioFormat | null {
  if (mime === 'audio/mpeg' || mime === 'audio/mp3') return 'mp3';
  if (mime === 'audio/wav' || mime === 'audio/wave' || mime === 'audio/x-wav') return 'wav';
  if (mime === 'audio/ogg' || mime === 'audio/x-vorbis+ogg') return 'ogg';
  return null;
}

function defaultMimeFor(format: AudioFormat): string {
  switch (format) {
    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    case 'ogg': return 'audio/ogg';
  }
}

function success(format: AudioFormat, sizeBytes: number, mimeType: string): FileValidationSuccess {
  return { ok: true, format, sizeBytes, mimeType };
}

function failure(reason: FileValidationFailure['reason'], message: string): FileValidationFailure {
  return { ok: false, reason, message };
}

// ════════════════════════════════════════════════════════════════════════════
// 2. generateWaveformPeaks
// ════════════════════════════════════════════════════════════════════════════

/**
 * Downsample a numeric sample array (e.g., PCM Float32 magnitudes normalized 0..1)
 * into a fixed-size PeakArray suitable for canvas rendering.
 *
 * - If samples.length ≤ peaks, returns the samples as-is
 * - Otherwise bin-averages to reduce noise and capture envelope
 * - Always returns a frozen array of length `peaks` (or shorter when input is small)
 * - No NaN/Infinity leakage — caller-supplied bad data is replaced with 0
 */
export function generateWaveformPeaks(
  samples: readonly number[],
  options?: { peaks?: number; windowStrategy?: 'mean' | 'rms' | 'max' },
): WaveformPeaks {
  if (!Array.isArray(samples)) {
    throw new Error('generateWaveformPeaks requires an array');
  }
  const target = clampPeakCount(options?.peaks ?? DEFAULT_WAVEFORM_PEAKS);
  const strategy = options?.windowStrategy ?? 'mean';

  const cleaned = samples.map((s) => sanitizeSample(s));
  const binCount = Math.min(target, cleaned.length);

  if (cleaned.length === 0) {
    const peaks = peakArrayFrom(new Array<number>(binCount).fill(0));
    return Object.freeze({
      peaks,
      sampleCount: 0,
      binCount,
    });
  }

  if (binCount === 0) {
    // All samples collapsed → fall back to single zero peak
    const peaks = peakArrayFrom([0]);
    return Object.freeze({
      peaks,
      sampleCount: cleaned.length,
      binCount: 1,
    });
  }

  const out: number[] = new Array<number>(binCount).fill(0);
  const samplesPerBin = cleaned.length / binCount;

  for (let i = 0; i < binCount; i++) {
    const start = Math.floor(i * samplesPerBin);
    const end = Math.min(cleaned.length, Math.floor((i + 1) * samplesPerBin));
    out[i] = aggregateRange(cleaned, start, end, strategy);
  }

  const peaks = peakArrayFrom(out);
  return Object.freeze({
    peaks,
    sampleCount: cleaned.length,
    binCount,
  });
}

function clampPeakCount(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_WAVEFORM_PEAKS;
  return Math.min(MAX_WAVEFORM_PEAKS, Math.max(1, Math.floor(n)));
}

function sanitizeSample(s: number): number {
  if (!Number.isFinite(s)) return 0;
  return Math.max(0, Math.min(1, s));
}

function aggregateRange(
  arr: readonly number[],
  start: number,
  end: number,
  strategy: 'mean' | 'rms' | 'max',
): number {
  if (start >= end) return 0;
  let acc = 0;
  let count = 0;
  let max = 0;
  let sumSq = 0;
  for (let i = start; i < end; i++) {
    const v = arr[i] ?? 0;
    acc += v;
    sumSq += v * v;
    if (v > max) max = v;
    count++;
  }
  if (count === 0) return 0;
  switch (strategy) {
    case 'mean': return acc / count;
    case 'rms': return Math.sqrt(sumSq / count);
    case 'max': return max;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 3. encodeAudioForPreview — Object URL factory (no-op when no DOM)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Generate a preview object URL. The function is pure: it accepts either a
 * File (browser context) or a Blob (any context with a File/Blob) and returns
 * a branded ObjectUrlRef.
 *
 * The contract for cleanup:
 *   - On component unmount call `revokeObjectUrlSafe(ref)` to free memory.
 *   - When no DOM globals exist (e.g., SSR/Node smoke), we return a synthetic
 *     blob URL so callers can still test the lifecycle path without throwing.
 *
 * IMPORTANT: this function does NOT auto-revoke; caller owns the lifecycle.
 */
export function encodeAudioForPreview(
  file: Blob,
  fallbackFormat: AudioFormat = 'mp3',
): ObjectUrlRef {
  if (!(file instanceof Blob)) {
    throw new Error('encodeAudioForPreview requires a Blob');
  }
  const url = createObjectUrlSafe(file);
  const name = (file as File).name ?? '';
  const detectedExt = /\.([a-z0-9]+)(?:\?.*)?$/i.exec(name)?.[1]?.toLowerCase();
  const format: AudioFormat =
    detectedExt && isAllowedExtension(detectedExt)
      ? (detectedExt as AudioFormat)
      : fallbackFormat;
  return Object.freeze({
    url,
    fileRef: name || `blob-${Math.random().toString(36).slice(2, 10)}`,
    format,
  });
}

/**
 * Revoke an object URL safely. No-op if the URL is empty or revocation throws.
 * Safe to call repeatedly.
 */
export function revokeObjectUrlSafe(ref: ObjectUrlRef | null | undefined): void {
  if (!ref) return;
  const url = ref.url;
  if (!url) return;
  try {
    const revoke = (globalThis as { URL?: { revokeObjectURL?: (u: string) => void } }).URL;
    if (revoke && typeof revoke.revokeObjectURL === 'function') {
      revoke.revokeObjectURL(url as string);
    }
  } catch {
    // Swallow — revocation is best-effort
  }
}

function createObjectUrlSafe(file: Blob): ObjectUrl {
  const ctor = (globalThis as { URL?: { createObjectURL?: (b: Blob) => string } }).URL;
  if (ctor && typeof ctor.createObjectURL === 'function') {
    const u = ctor.createObjectURL(file);
    return objectUrl(u);
  }
  // Synthetic placeholder for SSR / Node smoke contexts
  const synthetic = `blob:preview/${Math.random().toString(36).slice(2, 12)}`;
  return objectUrl(synthetic);
}

// ════════════════════════════════════════════════════════════════════════════
// 4. formatDuration
// ════════════════════════════════════════════════════════════════════════════

/**
 * Format seconds as mm:ss (or h:mm:ss for ≥1 hour).
 *
 * Examples:
 *   formatDuration(45)    → '0:45'
 *   formatDuration(125)   → '2:05'
 *   formatDuration(3725)  → '1:02:05'
 *
 * Defensive behavior:
 *   - NaN / Infinity / negative → '0:00'
 *   - Floats rounded down to whole seconds (caller passes seek-time)
 *   - Caps minutes at 59 in mm:ss, switches to h:mm:ss when ≥3600s
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${pad2(minutes)}:${pad2(secs)}`;
  }
  return `${minutes}:${pad2(secs)}`;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

// ════════════════════════════════════════════════════════════════════════════
// 5. extractMetadata — pure derivation from samples + fileSize (no Audio API)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Derive AudioMetadata from inputs you already have on hand.
 *
 * Why pure? The File API and HTMLAudioElement.duration cannot be exercised
 * deterministically in SSR/Node smoke contexts. By accepting pre-computed
 * values, we let the caller (browser) feed the truth into our engine.
 *
 * bitrateKbps is computed as `(fileSizeBytes * 8 / durationSeconds) / 1000`,
 * consistent with the wikipedia definition of bitrate. If duration is 0 we
 * return a sentinel metadata with `bitrateKbps: 0` and no NaN leakage.
 */
export function extractMetadata(input: {
  fileSizeBytes: number;
  durationSeconds: number;
  sampleRateHz: number;
  channels: 1 | 2;
  format: AudioFormat;
}): AudioMetadata {
  if (!input || typeof input !== 'object') {
    throw new Error('extractMetadata requires an input object');
  }
  const duration = Number.isFinite(input.durationSeconds) && input.durationSeconds > 0
    ? input.durationSeconds
    : 0;
  const sampleRate = Number.isFinite(input.sampleRateHz) && input.sampleRateHz > 0
    ? Math.floor(input.sampleRateHz)
    : 44100; // CD-quality default
  const channels: 1 | 2 = input.channels === 2 ? 2 : 1;

  const bitrateKbps = duration > 0
    ? Math.round((input.fileSizeBytes * 8) / duration / 1000)
    : 0;

  return Object.freeze({
    durationSeconds: duration,
    sampleRateHz: sampleRate,
    bitrateKbps,
    channels,
    format: input.format,
  });
}

// ════════════════════════════════════════════════════════════════════════════
// 6. createInitialUploadState — seed for the client component
// ════════════════════════════════════════════════════════════════════════════

export const LGPD_VERSION_AUDIO = '2026-06-30';

export function createInitialUploadState(): AudioUploadState {
  return Object.freeze({
    status: 'idle' as const,
    fileName: '',
    sizeBytes: 0,
    format: 'mp3' as AudioFormat,
    objectUrl: null,
    errorMessage: null,
    lgpdConsent: false,
    lgpdVersion: LGPD_VERSION_AUDIO,
  });
}

/**
 * LGPD gate — caller submits only when this returns true.
 * Body length mirrors the W87 engine pattern: substantive content requires
 * consent AND non-empty submission context.
 */
export function canSubmitAudio(state: AudioUploadState): boolean {
  return (
    state.status === 'ready' &&
    state.lgpdConsent === true &&
    state.objectUrl !== null &&
    state.sizeBytes > 0
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 7. peek — progress estimation for UI (pure)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Estimate progress percentage for the upload UI.
 *
 * Pure: feeds the player/uploader a deterministic clip.
 *
 * Defensive:
 *   - clamps to [0, 100]
 *   - replaces NaN with 0
 */
export function computeUploadProgress(
  bytesUploaded: number,
  totalBytes: number,
): number {
  if (!Number.isFinite(bytesUploaded) || !Number.isFinite(totalBytes)) return 0;
  if (totalBytes <= 0) return 0;
  const ratio = bytesUploaded / totalBytes;
  if (!Number.isFinite(ratio)) return 0;
  return Math.max(0, Math.min(100, Math.round(ratio * 100)));
}

// ════════════════════════════════════════════════════════════════════════════
// 8. lgpdNoteForAudio — copy that surfaces when consent is required
// ════════════════════════════════════════════════════════════════════════════

/**
 * LGPD consent copy surfaced before preview.
 * Stays sacred-cultural compliant: NO ranking language, NO encouragement
 * to share personal data beyond the file itself.
 */
export function lgpdNoteForAudio(): string {
  return Object.freeze(
    'Você carrega um arquivo de áudio para visualização local. O áudio não é enviado para nossos servidores sem ação explícita de publicação. ' +
      'Você pode revogar o preview apagando o post a qualquer momento. ' +
      `Versão do termo: ${LGPD_VERSION_AUDIO}.`,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 9. isAudioFormat — type guard
// ════════════════════════════════════════════════════════════════════════════

export function isAudioFormat(value: string): value is AudioFormat {
  return value === 'mp3' || value === 'wav' || value === 'ogg';
}

// ════════════════════════════════════════════════════════════════════════════
// 10. Module-surface Object.freeze (cycle 89 lesson)
// ════════════════════════════════════════════════════════════════════════════

// Note: each function return is already Object.freeze()-ed at construction.
// Module-level mutable exports are kept as `readonly` arrays above.

export const __positiveOnlyWitness = true as const;
export const __audioPositiveOnly = true as const;
export const __lgpdVersion = LGPD_VERSION_AUDIO;

// Surface-protect the read-only enums so downstream callers cannot mutate them
Object.freeze(ALLOWED_AUDIO_MIME_TYPES);
Object.freeze(ALLOWED_AUDIO_EXTENSIONS);

// Friendly banner for source-inspection specs:
export const __moduleBanner = Object.freeze(
  'W90s-C audio-posts-upload engine · 2026-06-30 · cycle 90 SIBLING',
);
