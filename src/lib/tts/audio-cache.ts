// ============================================================================
// audio-cache.ts — IndexedDB-backed TTS audio cache (W72-D)
// ============================================================================
// Wave-Spawner Cycle 72 — Worker D.
//
// Stores spoken audio as Blob (audio/mpeg) in IndexedDB. Keyed by the
// cache key from `platform-tts-adapter.buildCacheKey`, so server + client
// agree on the lookup.
//
// TTL: 7 days. Immutable — re-normalization changes the key, so a "fresh"
// version is a separate entry. On key-collision the new write wins
// (put-not-add).
//
// Why IndexedDB (not localStorage): audio blobs are 10-100KB per phrase;
// localStorage caps at 5MB total. IndexedDB handles 50MB+ per origin and
// stores binary natively (Blob is a first-class IDB type).
//
// SSR-safe: every method checks `typeof indexedDB` and no-ops gracefully.
// The `VoiceCache` instance is `null` on the server.
// ============================================================================

import { buildCacheKey } from './platform-tts-adapter.ts';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DB_NAME = 'akasha-tts-cache';
const DB_VERSION = 1;
const STORE_NAME = 'audio';
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_ENTRIES = 500; // hard cap; oldest evicted on insert

// ---------------------------------------------------------------------------
// Entry shape
// ---------------------------------------------------------------------------

export interface CacheEntry {
  key: string;
  voice_id: string;
  normalized_text: string;
  audio: Blob;
  mime: string;
  created_at: number;
  expires_at: number;
  bytes: number;
}

export interface CacheStats {
  entries: number;
  total_bytes: number;
  oldest_ms: number;
  newest_ms: number;
  expired: number;
}

// ---------------------------------------------------------------------------
// VoiceCache — singleton wrapper around the IDB connection.
// ---------------------------------------------------------------------------

export class VoiceCache {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private readonly ttlMs: number;

  constructor(opts: { ttlMs?: number } = {}) {
    this.ttlMs = opts.ttlMs ?? DEFAULT_TTL_MS;
  }

  /** Open the database; idempotent. */
  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    if (typeof indexedDB === 'undefined') {
      return Promise.reject(new Error('IndexedDB unavailable (SSR or non-browser)'));
    }
    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('by_voice', 'voice_id', { unique: false });
          store.createIndex('by_expiry', 'expires_at', { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error ?? new Error('IDB open failed'));
    });
    return this.dbPromise;
  }

  /** Build a key the same way the server does. */
  static makeKey(voice_id: string, normalizedText: string): string {
    return buildCacheKey(voice_id, normalizedText);
  }

  /** Get audio for a key. Returns null on miss / SSR / expired. */
  async get(voice_id: string, normalizedText: string): Promise<Blob | null> {
    if (typeof indexedDB === 'undefined') return null;
    const key = VoiceCache.makeKey(voice_id, normalizedText);
    try {
      const db = await this.open();
      return await new Promise<Blob | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => {
          const entry = req.result as CacheEntry | undefined;
          if (!entry) return resolve(null);
          if (entry.expires_at < Date.now()) {
            // Expired — best-effort delete, return null.
            void this.delete(key);
            return resolve(null);
          }
          resolve(entry.audio);
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /** Insert / overwrite. */
  async put(
    voice_id: string,
    normalizedText: string,
    audio: Blob
  ): Promise<boolean> {
    if (typeof indexedDB === 'undefined') return false;
    const key = VoiceCache.makeKey(voice_id, normalizedText);
    const now = Date.now();
    const entry: CacheEntry = {
      key,
      voice_id,
      normalized_text: normalizedText,
      audio,
      mime: audio.type || 'audio/mpeg',
      created_at: now,
      expires_at: now + this.ttlMs,
      bytes: audio.size,
    };
    try {
      const db = await this.open();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(entry);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error ?? new Error('IDB put failed'));
      });
      // Best-effort eviction. Not awaited — failure here is non-fatal.
      void this.evictIfFull();
      return true;
    } catch {
      return false;
    }
  }

  /** Delete one entry. */
  async delete(key: string): Promise<boolean> {
    if (typeof indexedDB === 'undefined') return false;
    try {
      const db = await this.open();
      return await new Promise<boolean>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  /** Evict oldest entries if we exceed MAX_ENTRIES. */
  private async evictIfFull(): Promise<void> {
    try {
      const db = await this.open();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const countReq = store.count();
      const overflow: Promise<void> = new Promise((resolve) => {
        countReq.onsuccess = () => {
          const count = countReq.result;
          if (count <= MAX_ENTRIES) return resolve();
          const toEvict = count - MAX_ENTRIES;
          const cursorReq = store.index('by_expiry').openCursor();
          let evicted = 0;
          cursorReq.onsuccess = () => {
            const cur = cursorReq.result;
            if (!cur || evicted >= toEvict) return resolve();
            cur.delete();
            evicted++;
            cur.continue();
          };
          cursorReq.onerror = () => resolve();
        };
        countReq.onerror = () => resolve();
      });
      await overflow;
    } catch {
      // non-fatal
    }
  }

  /** Stats for the smoke harness + UI badge. */
  async stats(): Promise<CacheStats> {
    if (typeof indexedDB === 'undefined') {
      return { entries: 0, total_bytes: 0, oldest_ms: 0, newest_ms: 0, expired: 0 };
    }
    try {
      const db = await this.open();
      return await new Promise<CacheStats>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const all = store.getAll();
        all.onsuccess = () => {
          const entries = (all.result as CacheEntry[]) ?? [];
          const now = Date.now();
          let total = 0;
          let oldest = Number.MAX_SAFE_INTEGER;
          let newest = 0;
          let expired = 0;
          for (const e of entries) {
            total += e.bytes;
            if (e.created_at < oldest) oldest = e.created_at;
            if (e.created_at > newest) newest = e.created_at;
            if (e.expires_at < now) expired++;
          }
          resolve({
            entries: entries.length,
            total_bytes: total,
            oldest_ms: oldest === Number.MAX_SAFE_INTEGER ? 0 : oldest,
            newest_ms: newest,
            expired,
          });
        };
        all.onerror = () =>
          resolve({ entries: 0, total_bytes: 0, oldest_ms: 0, newest_ms: 0, expired: 0 });
      });
    } catch {
      return { entries: 0, total_bytes: 0, oldest_ms: 0, newest_ms: 0, expired: 0 };
    }
  }

  /** Drop everything — for tests / "clear cache" UI. */
  async clear(): Promise<boolean> {
    if (typeof indexedDB === 'undefined') return false;
    try {
      const db = await this.open();
      await new Promise<void>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
      return true;
    } catch {
      return false;
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton — one per browser context. On the server it's `null`.
// ---------------------------------------------------------------------------

let _instance: VoiceCache | null = null;

export function getVoiceCache(): VoiceCache | null {
  if (typeof indexedDB === 'undefined') return null;
  if (!_instance) _instance = new VoiceCache();
  return _instance;
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export function auditAudioCache(): {
  ssr_safe: boolean;
  max_entries: number;
  default_ttl_days: number;
  db_name: string;
  store_name: string;
} {
  return {
    ssr_safe: typeof indexedDB === 'undefined' ? true : false,
    max_entries: MAX_ENTRIES,
    default_ttl_days: Math.round(DEFAULT_TTL_MS / (24 * 60 * 60 * 1000)),
    db_name: DB_NAME,
    store_name: STORE_NAME,
  };
}
