/**
 * ════════════════════════════════════════════════════════════════════════════
 * W90s-C — AUDIO POSTS STORAGE (metadata only, blob URLs not persisted)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 90 · 2026-06-30
 *
 * localStorage-backed metadata registry for audio posts.
 *
 * Design notes:
 *   - The audio Blob itself is NEVER persisted (no IndexedDB blob support here).
 *   - Only metadata + the file reference token is stored.
 *   - On reload, the engine rehydrates with `objectUrl = null` and surfaces a
 *     "preview unavailable in this session" notice.
 *   - Keys are versioned under `__version` to allow safe schema migrations.
 *
 * LGPD:
 *   - We never write filenames that contain user-identifying info to logs.
 *   - `clearAllAudioPosts()` is a public API for the user's "delete my data" flow.
 *
 * Durable lessons applied (cycle 60-89):
 *   - Branded types for IDs (cycle 73)
 *   - Object.freeze factory return (cycle 68, 89)
 *   - Module-surface freeze (cycle 89)
 *   - JSON-safe serializer pattern (cycle 60s)
 *   - Defensive try/catch around storage I/O (cycle 75)
 */

import type { AudioFormat, AudioUploadState, FileValidationResult } from './audio-posts-upload';

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export type AudioPostId = string & { readonly __brand: 'AudioPostId' };

export interface StoredAudioPost {
  readonly id: AudioPostId;
  readonly title: string;
  readonly fileName: string;
  readonly sizeBytes: number;
  readonly format: AudioFormat;
  readonly durationSeconds: number;
  readonly peaksLength: number;
  readonly createdAt: string;
  readonly lgpdConsent: boolean;
  readonly lgpdVersion: string;
  /** Opaque token — clients use to resolve a fresh blob URL via FilePicker. */
  readonly fileRef: string;
  /** Always null in storage; resolves at runtime via FileList ref. */
  readonly objectUrl: null;
}

export interface CreateAudioPostInput {
  readonly title: string;
  readonly state: AudioUploadState;
  readonly validation: Extract<FileValidationResult, { ok: true }>;
  readonly durationSeconds: number;
  readonly peaksLength: number;
  readonly fileRef: string;
}

export interface StorageReadResult {
  readonly ok: boolean;
  readonly posts: readonly StoredAudioPost[];
  readonly error: string | null;
}

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

export const STORAGE_KEY = 'akasha.audio.posts.v1';
export const STORAGE_VERSION = 1;
export const MAX_STORED_POSTS = 50;

// ════════════════════════════════════════════════════════════════════════════
// BRAND CONSTRUCTORS
// ════════════════════════════════════════════════════════════════════════════

export function audioPostId(raw: string): AudioPostId {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    throw new Error('audioPostId requires non-empty string');
  }
  return raw as AudioPostId;
}

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

function generateId(): AudioPostId {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return audioPostId(`ap-${ts}-${rand}`);
}

function isStorageLike(thing: unknown): thing is Storage {
  return (
    typeof thing === 'object' &&
    thing !== null &&
    typeof (thing as { getItem?: unknown }).getItem === 'function' &&
    typeof (thing as { setItem?: unknown }).setItem === 'function' &&
    typeof (thing as { removeItem?: unknown }).removeItem === 'function'
  );
}

function getStorage(): Storage | null {
  const g = globalThis as { localStorage?: Storage };
  if (g.localStorage && isStorageLike(g.localStorage)) return g.localStorage;
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// SERIALIZE / DESERIALIZE
// ════════════════════════════════════════════════════════════════════════════

interface RawStorage {
  readonly __version: number;
  readonly posts: StoredAudioPost[];
}

function safeParse(raw: string | null): RawStorage | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const candidate = parsed as Partial<RawStorage>;
    if (candidate.__version !== STORAGE_VERSION) return null;
    if (!Array.isArray(candidate.posts)) return null;
    return {
      __version: STORAGE_VERSION,
      posts: candidate.posts.map((p) => normalizePost(p)),
    };
  } catch {
    return null;
  }
}

function normalizePost(p: unknown): StoredAudioPost {
  if (!p || typeof p !== 'object') {
    throw new Error('Malformed post entry');
  }
  const r = p as Partial<StoredAudioPost>;
  return Object.freeze({
    id: audioPostId(typeof r.id === 'string' ? r.id : generateId()),
    title: typeof r.title === 'string' ? r.title : '',
    fileName: typeof r.fileName === 'string' ? r.fileName : '',
    sizeBytes: typeof r.sizeBytes === 'number' ? r.sizeBytes : 0,
    format: r.format === 'wav' || r.format === 'ogg' ? r.format : 'mp3',
    durationSeconds: typeof r.durationSeconds === 'number' ? r.durationSeconds : 0,
    peaksLength: typeof r.peaksLength === 'number' ? r.peaksLength : 0,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date(0).toISOString(),
    lgpdConsent: r.lgpdConsent === true,
    lgpdVersion: typeof r.lgpdVersion === 'string' ? r.lgpdVersion : 'unknown',
    fileRef: typeof r.fileRef === 'string' ? r.fileRef : '',
    objectUrl: null,
  });
}

function safeStringify(payload: RawStorage): string | null {
  try {
    return JSON.stringify(payload);
  } catch {
    return null;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ════════════════════════════════════════════════════════════════════════════

/**
 * Persist a new audio post. Returns the stored record (with assigned id) or
 * a failure shape if storage is unavailable / quota exceeded.
 */
export function saveAudioPost(input: CreateAudioPostInput): StorageReadResult {
  if (!input || typeof input !== 'object') {
    return { ok: false, posts: [], error: 'invalid input' };
  }
  if (!input.state.lgpdConsent) {
    return { ok: false, posts: [], error: 'lgpd_consent_required' };
  }
  if (!input.validation || input.validation.ok !== true) {
    return { ok: false, posts: [], error: 'invalid_file_validation' };
  }

  const storage = getStorage();
  if (!storage) {
    return { ok: false, posts: [], error: 'localStorage_unavailable' };
  }

  const existing = readAudioPosts();
  const newRecord: StoredAudioPost = Object.freeze({
    id: generateId(),
    title: input.title.trim().slice(0, 200),
    fileName: input.state.fileName || '',
    sizeBytes: input.validation.sizeBytes,
    format: input.validation.format,
    durationSeconds: input.durationSeconds,
    peaksLength: input.peaksLength,
    createdAt: new Date().toISOString(),
    lgpdConsent: true,
    lgpdVersion: input.state.lgpdVersion,
    fileRef: input.fileRef,
    objectUrl: null,
  });

  // Prepend + cap length
  const combined = [newRecord, ...existing.posts].slice(0, MAX_STORED_POSTS);
  const payload: RawStorage = { __version: STORAGE_VERSION, posts: combined };
  const serialized = safeStringify(payload);
  if (!serialized) {
    return { ok: false, posts: existing.posts, error: 'serialization_failed' };
  }
  try {
    storage.setItem(STORAGE_KEY, serialized);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return { ok: false, posts: existing.posts, error: `quota_or_io: ${msg}` };
  }
  return { ok: true, posts: combined, error: null };
}

/**
 * Read all stored audio posts (desc by createdAt). Returns an empty list
 * when storage is unavailable or the key is missing.
 */
export function readAudioPosts(): StorageReadResult {
  const storage = getStorage();
  if (!storage) return { ok: false, posts: [], error: 'localStorage_unavailable' };
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { ok: false, posts: [], error: 'read_failed' };
  }
  const parsed = safeParse(raw);
  if (!parsed) return { ok: true, posts: [], error: null };
  // sort desc by createdAt
  const sorted = [...parsed.posts].sort((a, b) =>
    a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0,
  );
  return { ok: true, posts: sorted, error: null };
}

/**
 * Delete a single post by id. No-op if not present.
 */
export function deleteAudioPost(id: AudioPostId): StorageReadResult {
  const existing = readAudioPosts();
  const remaining = existing.posts.filter((p) => p.id !== id);
  const storage = getStorage();
  if (storage) {
    try {
      const payload: RawStorage = { __version: STORAGE_VERSION, posts: [...remaining] };
      storage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // best-effort
    }
  }
  return { ok: true, posts: remaining, error: null };
}

/**
 * Clear all audio posts. Used by LGPD "right to erasure" flow.
 */
export function clearAllAudioPosts(): StorageReadResult {
  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      // best-effort
    }
  }
  return { ok: true, posts: [], error: null };
}

/**
 * Find a single post by id. Returns null when not found.
 */
export function findAudioPostById(id: string): StoredAudioPost | null {
  const { posts } = readAudioPosts();
  for (const p of posts) {
    if (p.id === id) return p;
  }
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// Module-surface metadata (cycle 89 lesson)
// ════════════════════════════════════════════════════════════════════════════

export const __positiveOnlyWitness = true as const;
export const __lgpdVersion = '2026-06-30';
export const __storageVersion = STORAGE_VERSION;
export const __moduleBanner = Object.freeze(
  'W90s-C audio-storage · metadata-only · 2026-06-30 · cycle 90 SIBLING',
);

Object.freeze(MAX_STORED_POSTS);
