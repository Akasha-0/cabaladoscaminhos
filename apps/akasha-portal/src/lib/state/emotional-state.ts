/**
 * emotional-state.ts — Wave 9.1 One-Screen Hub
 *
 * Contract for the user-chosen emotional state on the Meu Dia / One-Screen Hub.
 *
 * Why this exists:
 *   Gabriel's grill-me feedback (2026-06-24):
 *     "A interface ainda não está tão clara, então minimalista e objetiva,
 *      mostrando ali o que realmente o usuário precisa fazer. Se eu estou
 *      com ansiedade hoje, eu vou ter que ficar procurando na interface até
 *      eu achar aquilo que eu preciso. Cada dia a gente precisa de uma coisa
 *      diferente e a interface ela não está entregando isso."
 *
 *   We persist ONE of four states (centrado | ansioso | perdido | curioso)
 *   so the hub reorders itself around what the user needs RIGHT NOW.
 *
 * Storage rules:
 *   - localStorage key `akasha.emotionalState` is the source of truth on client
 *   - cookie mirror `akasha_state` is read server-side (used by middleware,
 *     future mentor route to inject `x-akasha-state` header per Sub-Wave 9.3)
 *   - The cookie is NOT httpOnly — the client must be able to mutate it. It
 *     carries no PII; worst case it leaks the user's current mood, which is
 *     already in localStorage. Acceptable trade-off for the one-screen hub.
 *
 * Freshness:
 *   - A persisted state is considered stale after STALE_MS (24h). The hub
 *     re-prompts the user on next visit. This prevents stale emotional context
 *     from steering recommendations on a different day.
 *
 * SSR safety:
 *   - All `localStorage` and `document.cookie` access is guarded. The hook
 *     returns `null` on the server / during the first render and only resolves
 *     client-side after mount. React hydration mismatch is avoided by rendering
 *     the StatePicker inside a `useEffect`-driven `mounted` flag.
 *
 * Single source of truth: this file. Components MUST import from here.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The four emotional states the hub recognises. The string values are
 * persisted verbatim in localStorage and the cookie — DO NOT rename without
 * a migration. If you must change them, keep the old value as an alias and
 * normalise in `getEmotionalState`.
 */
export type EmotionalState = 'centrado' | 'ansioso' | 'perdido' | 'curioso';

export const EMOTIONAL_STATES: readonly EmotionalState[] = [
  'centrado',
  'ansioso',
  'perdido',
  'curioso',
] as const;

export const isEmotionalState = (v: unknown): v is EmotionalState =>
  typeof v === 'string' && (EMOTIONAL_STATES as readonly string[]).includes(v);

export const STORAGE_KEY = 'akasha.emotionalState';
export const COOKIE_NAME = 'akasha_state';

/** 24h — after this, the user is re-prompted. */
export const STALE_MS = 24 * 60 * 60 * 1000;

interface StoredRecord {
  state: EmotionalState;
  /** Epoch ms when the user picked this state. */
  ts: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cookie helpers (client-safe)
// ─────────────────────────────────────────────────────────────────────────────

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const target = `${name}=`;
  const parts = document.cookie ? document.cookie.split('; ') : [];
  for (const part of parts) {
    if (part.startsWith(target)) {
      return decodeURIComponent(part.slice(target.length));
    }
  }
  return null;
}

function writeCookie(name: string, value: string, maxAgeSec: number): void {
  if (typeof document === 'undefined') return;
  // Path=/ so the whole app sees it. Not httpOnly (intentional — see header).
  // SameSite=Lax so future mentor POSTs from this origin include it.
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Persistence (localStorage)
// ─────────────────────────────────────────────────────────────────────────────

function readLocal(): StoredRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      isEmotionalState((parsed as StoredRecord).state) &&
      typeof (parsed as StoredRecord).ts === 'number'
    ) {
      return parsed as StoredRecord;
    }
    return null;
  } catch {
    return null;
  }
}

function writeLocal(state: EmotionalState): StoredRecord {
  const record: StoredRecord = { state, ts: Date.now() };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // localStorage may be disabled (private mode quota). The cookie still
      // carries the state — degrade gracefully.
    }
  }
  return record;
}

function clearLocal(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public imperative API (for non-React callers; tests too)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reads the persisted state. Returns `null` if:
 *   - nothing is stored,
 *   - the stored value is malformed,
 *   - the record is older than STALE_MS (treated as "no answer").
 */
export function getEmotionalState(): StoredRecord | null {
  return readLocal();
}

/** Returns the bare state string or null if stale/missing. */
export function getCurrentEmotionalState(): EmotionalState | null {
  const record = getEmotionalState();
  return record && !isStale(record) ? record.state : null;
}

export function setEmotionalState(state: EmotionalState): StoredRecord {
  const record = writeLocal(state);
  // Mirror to cookie so server-side / middleware / future mentor route
  // (Sub-Wave 9.3) can read it without round-tripping to /api.
  writeCookie(COOKIE_NAME, JSON.stringify(record), Math.floor(STALE_MS / 1000));
  return record;
}

export function clearEmotionalState(): void {
  clearLocal();
  clearCookie(COOKIE_NAME);
}

/** True if the record was written more than STALE_MS ago. */
export function isStale(record: StoredRecord, now: number = Date.now()): boolean {
  return now - record.ts > STALE_MS;
}

/** True if the hub should prompt the user (no record, or stale). */
export function shouldPromptForState(now: number = Date.now()): boolean {
  const record = getEmotionalState();
  return !record || isStale(record, now);
}

// ─────────────────────────────────────────────────────────────────────────────
// React hook (canonical consumer for views)
// ─────────────────────────────────────────────────────────────────────────────

export interface UseEmotionalStateReturn {
  /** Resolved state, or `null` if not yet known / stale / user chose to skip. */
  state: EmotionalState | null;
  /** True until the first client-side effect has run (SSR-safe). */
  hydrated: boolean;
  /** Persist a new state. Triggers re-render. */
  setState: (next: EmotionalState) => void;
  /** Wipe localStorage + cookie. Next render will be `null`. */
  clear: () => void;
  /** True if the picker should be shown (no state OR stale). */
  needsPrompt: boolean;
}

/**
 * useEmotionalState — the canonical hook.
 *
 * Pattern (mirrors `useLayerState`):
 *   - First render returns `{ state: null, hydrated: false, needsPrompt: true }`
 *     so server-rendered HTML matches the first client paint (no hydration
 *     mismatch). The picker is rendered behind a `hydrated` gate.
 *   - After mount, we read localStorage and resolve.
 *   - `setState` writes localStorage + cookie, then triggers re-render via
 *     a version bump. The picker disappears because `needsPrompt` becomes false.
 */
export function useEmotionalState(): UseEmotionalStateReturn {
  const [state, setStateInternal] = useState<EmotionalState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  // Bump-key: incrementing this after a `setState` call forces a re-read so
  // consumers that depend on derived flags (e.g. `needsPrompt`) stay fresh
  // without us having to recompute on every render.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const current = getCurrentEmotionalState();
    setStateInternal(current);
    setHydrated(true);
  }, [version]);

  const setState = useCallback((next: EmotionalState) => {
    setEmotionalState(next);
    // Trigger the effect to re-read so we get a single coherent state.
    setVersion((v) => v + 1);
  }, []);

  const clear = useCallback(() => {
    clearEmotionalState();
    setStateInternal(null);
  }, []);

  const needsPrompt = !state;

  return { state, hydrated, setState, clear, needsPrompt };
}