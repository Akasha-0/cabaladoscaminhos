// ============================================================================
// TTS audio cache (Wave 19 — 2026-06-28)
// ============================================================================
// File-system cache keyed by SHA-256(text|voiceId|locale). Each entry is a
// single .mp3 file. 7-day TTL via mtime check — lazy cleanup on read.
//
// Why file-system (not Redis):
//   - The Akashic response corpus is small (one cached file per response).
//   - Cheap to rebuild if cache dir is wiped (provider calls are idempotent).
//   - Zero infra — works on Vercel hobby tier, fly.io, self-hosted alike.
//   - In-memory L1 in `cache.ts` keeps hot hits out of the disk.
//
// Layout:
//   data/tts-cache/<sha256>.mp3     — audio bytes
//   data/tts-cache/<sha256>.meta.json — { provider, voiceId, locale, bytes, mtimeMs, ttlMs }
//
// Failures:
//   - Read errors → caller treats as cache miss and re-synthesizes.
//   - Write errors → log + return synthesized bytes anyway (no crash).
// ============================================================================

import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

// ----------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------

/** Cache root — relative to process.cwd() (project root). */
export const TTS_CACHE_DIR = path.join(process.cwd(), 'data', 'tts-cache');

/** Default TTL: 7 days in ms. */
export const TTS_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface TtsCacheKey {
  text: string;
  voiceId: string;
  locale: string;
}

export interface TtsCacheEntry {
  /** SHA-256 hex digest of the canonical key. */
  hash: string;
  /** Provider that produced these bytes. */
  provider: string;
  /** Voice identifier (provider-specific). */
  voiceId: string;
  /** BCP-47 locale tag. */
  locale: string;
  /** Size in bytes. */
  bytes: number;
  /** File mtime in ms (Date.now() at write). */
  mtimeMs: number;
  /** TTL applied at write time. */
  ttlMs: number;
}

// ----------------------------------------------------------------------------
// Hashing
// ----------------------------------------------------------------------------

/** Stable cache key: text + voiceId + locale, lowercased + trimmed text. */
export function hashTtsKey({ text, voiceId, locale }: TtsCacheKey): string {
  const normalized = JSON.stringify({
    t: text.trim().toLowerCase(),
    v: voiceId,
    l: locale,
  });
  return createHash('sha256').update(normalized).digest('hex');
}

// ----------------------------------------------------------------------------
// Read
// ----------------------------------------------------------------------------

/**
 * Look up a cached mp3. Returns the bytes + metadata if fresh, else null.
 * - Missing file → null (cache miss).
 * - Stale file (mtime > TTL) → best-effort delete + null.
 * - Corrupt meta → ignore meta, still try to return bytes (provider can re-derive).
 */
export async function readTtsCache(
  key: TtsCacheKey,
): Promise<{ audio: Buffer; entry: TtsCacheEntry } | null> {
  const hash = hashTtsKey(key);
  const audioPath = path.join(TTS_CACHE_DIR, `${hash}.mp3`);
  const metaPath = path.join(TTS_CACHE_DIR, `${hash}.meta.json`);

  let audioStat;
  try {
    audioStat = await fs.stat(audioPath);
  } catch {
    return null; // miss
  }

  // TTL check (lazy GC).
  const ageMs = Date.now() - audioStat.mtimeMs;
  if (ageMs > TTS_CACHE_TTL_MS) {
    await Promise.all([
      fs.unlink(audioPath).catch(() => undefined),
      fs.unlink(metaPath).catch(() => undefined),
    ]);
    return null;
  }

  let entry: TtsCacheEntry;
  try {
    const metaRaw = await fs.readFile(metaPath, 'utf8');
    const parsed = JSON.parse(metaRaw) as Omit<TtsCacheEntry, 'hash' | 'mtimeMs' | 'bytes'>;
    entry = {
      hash,
      provider: parsed.provider,
      voiceId: parsed.voiceId,
      locale: parsed.locale,
      bytes: audioStat.size,
      mtimeMs: audioStat.mtimeMs,
      ttlMs: parsed.ttlMs,
    };
  } catch {
    // Meta missing or corrupt — synthesize a best-effort entry.
    entry = {
      hash,
      provider: 'unknown',
      voiceId: key.voiceId,
      locale: key.locale,
      bytes: audioStat.size,
      mtimeMs: audioStat.mtimeMs,
      ttlMs: TTS_CACHE_TTL_MS,
    };
  }

  try {
    const audio = await fs.readFile(audioPath);
    return { audio, entry };
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// Write
// ----------------------------------------------------------------------------

/**
 * Persist synthesized audio. Idempotent — safe to call with the same hash.
 * Errors are swallowed: caller still has the in-memory bytes to return.
 */
export async function writeTtsCache(
  key: TtsCacheKey,
  provider: string,
  audio: Buffer,
  ttlMs: number = TTS_CACHE_TTL_MS,
): Promise<TtsCacheEntry> {
  const hash = hashTtsKey(key);
  const audioPath = path.join(TTS_CACHE_DIR, `${hash}.mp3`);
  const metaPath = path.join(TTS_CACHE_DIR, `${hash}.meta.json`);

  try {
    await fs.mkdir(TTS_CACHE_DIR, { recursive: true });
    // Atomic-ish write: tmp + rename.
    const tmpPath = `${audioPath}.tmp-${process.pid}-${Date.now()}`;
    await fs.writeFile(tmpPath, audio);
    await fs.rename(tmpPath, audioPath);

    const entry: TtsCacheEntry = {
      hash,
      provider,
      voiceId: key.voiceId,
      locale: key.locale,
      bytes: audio.length,
      mtimeMs: Date.now(),
      ttlMs,
    };
    await fs.writeFile(metaPath, JSON.stringify(entry), 'utf8');
    return entry;
  } catch (err) {
    // Cache write is best-effort. Log so we notice in dev, but don't fail the request.
    console.warn('[tts-cache] write failed:', (err as Error).message);
    return {
      hash,
      provider,
      voiceId: key.voiceId,
      locale: key.locale,
      bytes: audio.length,
      mtimeMs: Date.now(),
      ttlMs,
    };
  }
}

// ----------------------------------------------------------------------------
// Utilities
// ----------------------------------------------------------------------------

/** Best-effort GC: drop entries older than `ttlMs`. Used by /api/akashic/tts?purge=1. */
export async function purgeStaleTtsCache(ttlMs: number = TTS_CACHE_TTL_MS): Promise<number> {
  let removed = 0;
  try {
    await fs.mkdir(TTS_CACHE_DIR, { recursive: true });
    const files = await fs.readdir(TTS_CACHE_DIR);
    const cutoff = Date.now() - ttlMs;
    await Promise.all(
      files.map(async (name) => {
        const full = path.join(TTS_CACHE_DIR, name);
        try {
          const stat = await fs.stat(full);
          if (stat.isFile() && stat.mtimeMs < cutoff) {
            await fs.unlink(full);
            removed++;
          }
        } catch {
          /* ignore per-file errors */
        }
      }),
    );
  } catch {
    /* ignore */
  }
  return removed;
}
